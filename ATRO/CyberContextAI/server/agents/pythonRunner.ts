import { spawn, type ChildProcess } from "child_process";
import { storage } from "../storage";
import path from "path";
import { redis } from "../services/redisMcp";

/**
 * Interface for Python agent runner
 */
export interface IPythonAgent {
  agentId: number;
  agentName: string;
  pythonScript: string;
  process: ChildProcess | null;
  isRunning: boolean;
  start(): Promise<boolean>;
  stop(): Promise<boolean>;
  status(): { isRunning: boolean; pid?: number };
}

/**
 * Class to run and manage Python agents
 */
export class PythonAgent implements IPythonAgent {
  agentId: number;
  agentName: string;
  pythonScript: string;
  process: ChildProcess | null = null;
  isRunning: boolean = false;
  
  constructor(agentId: number, agentName: string, pythonScript: string) {
    this.agentId = agentId;
    this.agentName = agentName;
    this.pythonScript = pythonScript;
  }
  
  /**
   * Start the Python agent process
   */
  async start(): Promise<boolean> {
    if (this.isRunning) {
      console.log(`Agent ${this.agentName} is already running`);
      return true;
    }
    
    try {
      const scriptPath = path.join(process.cwd(), 'server', 'python', this.pythonScript);
      
      // Set environment variables for the Python process
      const env = {
        ...process.env,
        AGENT_ID: this.agentId.toString(),
        AGENT_NAME: this.agentName,
        REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
        OPENAI_API_KEY: process.env.OPENAI_API_KEY || "dummy-key-for-development",
      };
      
      // Spawn Python process
      this.process = spawn('python3', [scriptPath], { 
        env, 
        stdio: ['pipe', 'pipe', 'pipe'] 
      });
      
      // Handle process output
      this.process.stdout?.on('data', (data) => {
        console.log(`[${this.agentName}] ${data.toString().trim()}`);
        this.handleAgentOutput(data.toString());
      });
      
      this.process.stderr?.on('data', (data) => {
        console.error(`[${this.agentName} ERROR] ${data.toString().trim()}`);
      });
      
      // Handle process exit
      this.process.on('close', (code) => {
        console.log(`Agent ${this.agentName} exited with code ${code}`);
        this.isRunning = false;
        this.updateAgentStatus('error');
      });
      
      // Handle process error
      this.process.on('error', (err) => {
        console.error(`Failed to start agent ${this.agentName}:`, err);
        this.isRunning = false;
        this.updateAgentStatus('error');
      });
      
      this.isRunning = true;
      await this.updateAgentStatus('active');
      
      return true;
    } catch (error) {
      console.error(`Error starting agent ${this.agentName}:`, error);
      this.isRunning = false;
      await this.updateAgentStatus('error');
      return false;
    }
  }
  
  /**
   * Stop the Python agent process
   */
  async stop(): Promise<boolean> {
    if (!this.isRunning || !this.process) {
      console.log(`Agent ${this.agentName} is not running`);
      return true;
    }
    
    try {
      // Try to gracefully terminate the process
      this.process.kill('SIGTERM');
      
      // Give it some time to shut down properly
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Force kill if still running
      if (this.process.pid) {
        try {
          process.kill(this.process.pid, 0); // Check if process exists
          this.process.kill('SIGKILL'); // Force kill
        } catch (e) {
          // Process no longer exists, already terminated
        }
      }
      
      this.isRunning = false;
      this.process = null;
      await this.updateAgentStatus('stopped');
      
      return true;
    } catch (error) {
      console.error(`Error stopping agent ${this.agentName}:`, error);
      return false;
    }
  }
  
  /**
   * Get the current status of the agent
   */
  status(): { isRunning: boolean; pid?: number } {
    return {
      isRunning: this.isRunning,
      pid: this.process?.pid
    };
  }
  
  /**
   * Update agent status in the database
   */
  private async updateAgentStatus(status: string): Promise<void> {
    try {
      await storage.updateAgent(this.agentId, { 
        status, 
        lastActive: new Date() 
      });
      
      // Update status in Redis MCP
      await redis.updateAgentStatus(this.agentId.toString(), status);
    } catch (error) {
      console.error(`Error updating agent status for ${this.agentName}:`, error);
    }
  }
  
  /**
   * Handle agent output and potentially create logs/alerts
   */
  private async handleAgentOutput(output: string): Promise<void> {
    if (!output.trim()) return;
    
    try {
      // Check if output is JSON
      if (output.trim().startsWith('{')) {
        try {
          const data = JSON.parse(output);
          
          // Handle log entry
          if (data.type === 'log') {
            await storage.createLog({
              level: data.level || 'info',
              message: data.message,
              source: this.agentName,
              timestamp: new Date(),
              metadata: data.metadata || {}
            });
          }
          
          // Handle alert
          else if (data.type === 'alert') {
            await storage.createAlert({
              severity: data.severity || 'medium',
              title: data.title,
              description: data.description,
              source: this.agentName,
              timestamp: new Date(),
              status: 'new',
              metadata: data.metadata || {}
            });
          }
          
          // Handle incident
          else if (data.type === 'incident') {
            await storage.createIncident({
              incidentId: `INC-${Math.floor(1000 + Math.random() * 9000)}`,
              type: data.incidentType,
              status: 'open',
              source: this.agentName,
              timestamp: new Date(),
              metadata: data.metadata || {}
            });
          }
        } catch (parseError) {
          console.error(`Error parsing agent output:`, parseError);
        }
      } else {
        // Regular log output
        await storage.createLog({
          level: 'info',
          message: output,
          source: this.agentName,
          timestamp: new Date(),
          metadata: {}
        });
      }
    } catch (error) {
      console.error(`Error handling agent output:`, error);
    }
  }
}
