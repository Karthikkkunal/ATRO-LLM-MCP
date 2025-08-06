import { storage } from "../storage";
import { PythonAgent, IPythonAgent } from "./pythonRunner";

// Map to store active agents
const activeAgents: Map<number, IPythonAgent> = new Map();

/**
 * Initialize agent instances based on configured agents in the database
 */
export async function initializeAgents(): Promise<Map<number, IPythonAgent>> {
  try {
    // Clear existing agents
    activeAgents.clear();
    
    // Get all agents from the database
    const agents = await storage.getAgents();
    
    // Create Python agent instances
    for (const agent of agents) {
      let scriptName: string;
      
      // Determine the appropriate Python script based on agent type
      switch (agent.type) {
        case 'network':
          scriptName = 'network_monitor.py';
          break;
        case 'log':
          scriptName = 'log_parser.py';
          break;
        case 'response':
          scriptName = 'response_agent.py';
          break;
        case 'intelligence':
          scriptName = 'threat_intelligence.py';
          break;
        default:
          console.warn(`Unknown agent type: ${agent.type}, skipping...`);
          continue;
      }
      
      // Create agent instance
      const pythonAgent = new PythonAgent(agent.id, agent.name, scriptName);
      activeAgents.set(agent.id, pythonAgent);
    }
    
    return activeAgents;
  } catch (error) {
    console.error('Error initializing agents:', error);
    return new Map();
  }
}

/**
 * Start all agents
 */
export async function startAgents(): Promise<void> {
  try {
    // Make sure agents are initialized
    if (activeAgents.size === 0) {
      await initializeAgents();
    }
    
    // Start each agent
    for (const [id, agent] of activeAgents.entries()) {
      console.log(`Starting agent ${agent.agentName}...`);
      await agent.start();
    }
    
    console.log('All agents started');
  } catch (error) {
    console.error('Error starting agents:', error);
    throw error;
  }
}

/**
 * Stop all agents
 */
export async function stopAgents(): Promise<void> {
  try {
    for (const [id, agent] of activeAgents.entries()) {
      console.log(`Stopping agent ${agent.agentName}...`);
      await agent.stop();
    }
    
    console.log('All agents stopped');
  } catch (error) {
    console.error('Error stopping agents:', error);
    throw error;
  }
}

/**
 * Get the status of all agents
 */
export async function getAgentStatus(): Promise<Record<string, any>> {
  const status: Record<string, any> = {};
  
  for (const [id, agent] of activeAgents.entries()) {
    status[id] = {
      name: agent.agentName,
      isRunning: agent.isRunning,
      pid: agent.process?.pid
    };
  }
  
  return status;
}

/**
 * Get a specific agent by ID
 */
export function getAgent(agentId: number): IPythonAgent | undefined {
  return activeAgents.get(agentId);
}

// Initialize agents when the module is loaded
initializeAgents().catch(error => {
  console.error('Failed to initialize agents:', error);
});
