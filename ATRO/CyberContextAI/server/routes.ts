import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { WebSocketServer, WebSocket } from "ws";
import { z } from "zod";
import { 
  insertAlertSchema, insertIncidentSchema, insertLogSchema, 
  insertLlmInsightSchema, insertResponseActionSchema 
} from "@shared/schema";
import { startAgents, stopAgents } from "./agents/agentManager";
import { analyzeThreatWithLLM } from "./services/llm";
import { redis } from "./services/redisMcp";

// Clients connected via WebSocket
let wsClients: WebSocket[] = [];

// Broadcast to all connected clients
function broadcast(type: string, data: any) {
  const message = JSON.stringify({ type, data });
  wsClients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Create WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // WebSocket connection handling
  wss.on('connection', (ws) => {
    wsClients.push(ws);
    
    // Send initial data on connection
    const sendInitialData = async () => {
      try {
        const agents = await storage.getAgents();
        const alerts = await storage.getAlerts(10);
        const incidents = await storage.getIncidents(10);
        const logs = await storage.getLogs(20);
        const responseActions = await storage.getResponseActions();
        const llmInsights = await storage.getLlmInsights(10);
        
        ws.send(JSON.stringify({ 
          type: 'initial_data', 
          data: { 
            agents, 
            alerts, 
            incidents, 
            logs, 
            responseActions, 
            llmInsights,
            mcpStatus: {
              brokerStatus: 'healthy',
              redisCache: 'connected',
              cacheSize: '245 MB',
              updateFrequency: '30 seconds',
              lastUpdated: new Date().toISOString()
            },
            llmStatus: {
              model: 'GPT-4o',
              apiStatus: 'operational',
              contextSize: '16K tokens',
              queriesToday: 142
            }
          } 
        }));
      } catch (error) {
        console.error('Error sending initial data:', error);
        ws.send(JSON.stringify({ type: 'error', message: 'Failed to load initial data' }));
      }
    };
    
    sendInitialData();
    
    ws.on('message', async (message) => {
      try {
        const parsed = JSON.parse(message.toString());
        console.log('Received message:', parsed);
        
        // Handle different message types
        switch(parsed.type) {
          case 'start_agents':
            await startAgents();
            broadcast('agents_status', await storage.getAgents());
            break;
            
          case 'stop_agents':
            await stopAgents();
            broadcast('agents_status', await storage.getAgents());
            break;
            
          case 'toggle_response_action':
            if (parsed.id && parsed.status) {
              const action = await storage.getResponseAction(parsed.id);
              if (action) {
                const updated = await storage.updateResponseAction(parsed.id, { status: parsed.status });
                broadcast('response_action_updated', updated);
              }
            }
            break;
            
          case 'analyze_log':
            if (parsed.logId) {
              const log = await storage.getLog(parsed.logId);
              if (log) {
                const analysis = await analyzeThreatWithLLM(log.message);
                const insight = await storage.createLlmInsight({
                  analysis: analysis.analysis,
                  timestamp: new Date(),
                  severity: analysis.severity,
                  recommendation: analysis.recommendation,
                  metadata: { logId: log.id }
                });
                broadcast('new_insight', insight);
              }
            }
            break;
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      wsClients = wsClients.filter(client => client !== ws);
    });
  });
  
  // API Routes
  // Agents API
  app.get('/api/agents', async (req, res) => {
    try {
      const agents = await storage.getAgents();
      res.json(agents);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch agents' });
    }
  });
  
  app.post('/api/agents/start', async (req, res) => {
    try {
      await startAgents();
      const agents = await storage.getAgents();
      broadcast('agents_status', agents);
      res.json({ success: true, agents });
    } catch (error) {
      res.status(500).json({ message: 'Failed to start agents' });
    }
  });
  
  app.post('/api/agents/stop', async (req, res) => {
    try {
      await stopAgents();
      const agents = await storage.getAgents();
      broadcast('agents_status', agents);
      res.json({ success: true, agents });
    } catch (error) {
      res.status(500).json({ message: 'Failed to stop agents' });
    }
  });
  
  // Alerts API
  app.get('/api/alerts', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const alerts = await storage.getAlerts(limit);
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch alerts' });
    }
  });
  
  app.post('/api/alerts', async (req, res) => {
    try {
      const validation = insertAlertSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: 'Invalid alert data' });
      }
      
      const alert = await storage.createAlert(validation.data);
      broadcast('new_alert', alert);
      res.json(alert);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create alert' });
    }
  });
  
  // Incidents API
  app.get('/api/incidents', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const incidents = await storage.getIncidents(limit);
      res.json(incidents);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch incidents' });
    }
  });
  
  app.post('/api/incidents', async (req, res) => {
    try {
      const validation = insertIncidentSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: 'Invalid incident data' });
      }
      
      const incident = await storage.createIncident(validation.data);
      broadcast('new_incident', incident);
      res.json(incident);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create incident' });
    }
  });
  
  app.patch('/api/incidents/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const incident = await storage.getIncident(id);
      
      if (!incident) {
        return res.status(404).json({ message: 'Incident not found' });
      }
      
      const updated = await storage.updateIncident(id, req.body);
      broadcast('incident_updated', updated);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update incident' });
    }
  });
  
  // Logs API
  app.get('/api/logs', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const logs = await storage.getLogs(limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch logs' });
    }
  });
  
  app.post('/api/logs', async (req, res) => {
    try {
      const validation = insertLogSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: 'Invalid log data' });
      }
      
      const log = await storage.createLog(validation.data);
      broadcast('new_log', log);
      res.json(log);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create log' });
    }
  });
  
  // Response Actions API
  app.get('/api/response-actions', async (req, res) => {
    try {
      const actions = await storage.getResponseActions();
      res.json(actions);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch response actions' });
    }
  });
  
  app.post('/api/response-actions', async (req, res) => {
    try {
      const validation = insertResponseActionSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: 'Invalid response action data' });
      }
      
      const action = await storage.createResponseAction(validation.data);
      broadcast('new_response_action', action);
      res.json(action);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create response action' });
    }
  });
  
  app.patch('/api/response-actions/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const action = await storage.getResponseAction(id);
      
      if (!action) {
        return res.status(404).json({ message: 'Response action not found' });
      }
      
      const updated = await storage.updateResponseAction(id, req.body);
      broadcast('response_action_updated', updated);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update response action' });
    }
  });
  
  // LLM Insights API
  app.get('/api/llm-insights', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const insights = await storage.getLlmInsights(limit);
      res.json(insights);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch LLM insights' });
    }
  });
  
  app.post('/api/llm-insights', async (req, res) => {
    try {
      const validation = insertLlmInsightSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: 'Invalid LLM insight data' });
      }
      
      const insight = await storage.createLlmInsight(validation.data);
      broadcast('new_insight', insight);
      res.json(insight);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create LLM insight' });
    }
  });
  
  // MCP API - simple status endpoint
  app.get('/api/mcp/status', async (req, res) => {
    try {
      // Check Redis connection
      const isConnected = await redis.isConnected();
      
      res.json({
        brokerStatus: isConnected ? 'healthy' : 'error',
        redisCache: process.env.USE_MEMORY_FALLBACK === 'true' ? 'in-memory (fallback)' : (isConnected ? 'connected' : 'disconnected'),
        cacheSize: process.env.USE_MEMORY_FALLBACK === 'true' ? '0 MB' : '245 MB',
        updateFrequency: '30 seconds',
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch MCP status' });
    }
  });
  
  return httpServer;
}
