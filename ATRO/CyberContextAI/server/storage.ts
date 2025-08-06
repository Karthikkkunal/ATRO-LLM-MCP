import { 
  users, type User, type InsertUser,
  agents, type Agent, type InsertAgent,
  alerts, type Alert, type InsertAlert,
  incidents, type Incident, type InsertIncident,
  logs, type Log, type InsertLog,
  responseActions, type ResponseAction, type InsertResponseAction,
  llmInsights, type LlmInsight, type InsertLlmInsight,
  agentResponseActions, type AgentResponseAction,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, isNull } from "drizzle-orm";

// Define comprehensive storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Agent methods
  getAgents(): Promise<Agent[]>;
  getAgent(id: number): Promise<Agent | undefined>;
  createAgent(agent: InsertAgent): Promise<Agent>;
  updateAgent(id: number, updates: Partial<InsertAgent>): Promise<Agent | undefined>;
  
  // Alert methods
  getAlerts(limit?: number): Promise<Alert[]>;
  getAlert(id: number): Promise<Alert | undefined>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  updateAlert(id: number, updates: Partial<InsertAlert>): Promise<Alert | undefined>;
  
  // Incident methods
  getIncidents(limit?: number): Promise<Incident[]>;
  getIncident(id: number): Promise<Incident | undefined>;
  createIncident(incident: InsertIncident): Promise<Incident>;
  updateIncident(id: number, updates: Partial<InsertIncident>): Promise<Incident | undefined>;
  
  // Log methods
  getLogs(limit?: number): Promise<Log[]>;
  getLog(id: number): Promise<Log | undefined>;
  createLog(log: InsertLog): Promise<Log>;
  
  // Response Action methods
  getResponseActions(): Promise<ResponseAction[]>;
  getResponseAction(id: number): Promise<ResponseAction | undefined>;
  createResponseAction(action: InsertResponseAction): Promise<ResponseAction>;
  updateResponseAction(id: number, updates: Partial<InsertResponseAction>): Promise<ResponseAction | undefined>;
  
  // LLM Insight methods
  getLlmInsights(limit?: number): Promise<LlmInsight[]>;
  getLlmInsight(id: number): Promise<LlmInsight | undefined>;
  createLlmInsight(insight: InsertLlmInsight): Promise<LlmInsight>;
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Agent methods
  async getAgents(): Promise<Agent[]> {
    return await db.select().from(agents).orderBy(desc(agents.lastActive));
  }
  
  async getAgent(id: number): Promise<Agent | undefined> {
    const [agent] = await db.select().from(agents).where(eq(agents.id, id));
    return agent;
  }
  
  async createAgent(insertAgent: InsertAgent): Promise<Agent> {
    const [agent] = await db.insert(agents).values(insertAgent).returning();
    return agent;
  }
  
  async updateAgent(id: number, updates: Partial<InsertAgent>): Promise<Agent | undefined> {
    const [updatedAgent] = await db
      .update(agents)
      .set(updates)
      .where(eq(agents.id, id))
      .returning();
    return updatedAgent;
  }
  
  // Alert methods
  async getAlerts(limit?: number): Promise<Alert[]> {
    const query = db.select().from(alerts).orderBy(desc(alerts.timestamp));
    
    if (limit) {
      return await query.limit(limit);
    }
    
    return await query;
  }
  
  async getAlert(id: number): Promise<Alert | undefined> {
    const [alert] = await db.select().from(alerts).where(eq(alerts.id, id));
    return alert;
  }
  
  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const [alert] = await db.insert(alerts).values(insertAlert).returning();
    return alert;
  }
  
  async updateAlert(id: number, updates: Partial<InsertAlert>): Promise<Alert | undefined> {
    const [updatedAlert] = await db
      .update(alerts)
      .set(updates)
      .where(eq(alerts.id, id))
      .returning();
    return updatedAlert;
  }
  
  // Incident methods
  async getIncidents(limit?: number): Promise<Incident[]> {
    const query = db.select().from(incidents).orderBy(desc(incidents.timestamp));
    
    if (limit) {
      return await query.limit(limit);
    }
    
    return await query;
  }
  
  async getIncident(id: number): Promise<Incident | undefined> {
    const [incident] = await db.select().from(incidents).where(eq(incidents.id, id));
    return incident;
  }
  
  async createIncident(insertIncident: InsertIncident): Promise<Incident> {
    const [incident] = await db.insert(incidents).values(insertIncident).returning();
    return incident;
  }
  
  async updateIncident(id: number, updates: Partial<InsertIncident>): Promise<Incident | undefined> {
    const [updatedIncident] = await db
      .update(incidents)
      .set(updates)
      .where(eq(incidents.id, id))
      .returning();
    return updatedIncident;
  }
  
  // Log methods
  async getLogs(limit?: number): Promise<Log[]> {
    const query = db.select().from(logs).orderBy(desc(logs.timestamp));
    
    if (limit) {
      return await query.limit(limit);
    }
    
    return await query;
  }
  
  async getLog(id: number): Promise<Log | undefined> {
    const [log] = await db.select().from(logs).where(eq(logs.id, id));
    return log;
  }
  
  async createLog(insertLog: InsertLog): Promise<Log> {
    const [log] = await db.insert(logs).values(insertLog).returning();
    return log;
  }
  
  // Response Action methods
  async getResponseActions(): Promise<ResponseAction[]> {
    return await db.select().from(responseActions);
  }
  
  async getResponseAction(id: number): Promise<ResponseAction | undefined> {
    const [action] = await db.select().from(responseActions).where(eq(responseActions.id, id));
    return action;
  }
  
  async createResponseAction(insertAction: InsertResponseAction): Promise<ResponseAction> {
    const [action] = await db.insert(responseActions).values(insertAction).returning();
    return action;
  }
  
  async updateResponseAction(id: number, updates: Partial<InsertResponseAction>): Promise<ResponseAction | undefined> {
    const [updatedAction] = await db
      .update(responseActions)
      .set(updates)
      .where(eq(responseActions.id, id))
      .returning();
    return updatedAction;
  }
  
  // LLM Insight methods
  async getLlmInsights(limit?: number): Promise<LlmInsight[]> {
    const query = db.select().from(llmInsights).orderBy(desc(llmInsights.timestamp));
    
    if (limit) {
      return await query.limit(limit);
    }
    
    return await query;
  }
  
  async getLlmInsight(id: number): Promise<LlmInsight | undefined> {
    const [insight] = await db.select().from(llmInsights).where(eq(llmInsights.id, id));
    return insight;
  }
  
  async createLlmInsight(insertInsight: InsertLlmInsight): Promise<LlmInsight> {
    const [insight] = await db.insert(llmInsights).values(insertInsight).returning();
    return insight;
  }

  // Initialize sample data
  async initializeData(): Promise<void> {
    // Check if data already exists
    const existingAgents = await this.getAgents();
    if (existingAgents.length > 0) {
      console.log("Database already initialized with data.");
      return;
    }

    console.log("Initializing database with sample data...");

    // Add sample agents
    const initialAgents: InsertAgent[] = [
      {
        name: "Network Monitor",
        type: "network",
        status: "active",
        lastActive: new Date(),
        metadata: {}
      },
      {
        name: "Log Parser",
        type: "log",
        status: "active",
        lastActive: new Date(),
        metadata: {}
      },
      {
        name: "Response Agent",
        type: "response",
        status: "warning",
        lastActive: new Date(),
        metadata: {}
      },
      {
        name: "Threat Intelligence",
        type: "intelligence",
        status: "error",
        lastActive: new Date(),
        metadata: {}
      }
    ];
    
    for (const agent of initialAgents) {
      await this.createAgent(agent);
    }
    
    // Add sample response actions
    const initialActions: InsertResponseAction[] = [
      {
        name: "Block Malicious IP",
        trigger: "IDS Alert",
        status: "enabled",
        lastExecuted: new Date(Date.now() - 3600000), // 1 hour ago
        metadata: {}
      },
      {
        name: "Isolate Compromised Endpoint",
        trigger: "Malware Detection",
        status: "enabled",
        lastExecuted: new Date(Date.now() - 86400000), // 1 day ago
        metadata: {}
      },
      {
        name: "Reset Compromised Credentials",
        trigger: "Brute Force Detection",
        status: "disabled",
        lastExecuted: null,
        metadata: {}
      },
      {
        name: "Backup Critical Data",
        trigger: "Ransomware Indicators",
        status: "enabled",
        lastExecuted: new Date(Date.now() - 172800000), // 2 days ago
        metadata: {}
      }
    ];
    
    for (const action of initialActions) {
      await this.createResponseAction(action);
    }

    console.log("Database initialization complete.");
  }
}

// In-memory Storage for fallback
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private agents: Map<number, Agent>;
  private alerts: Map<number, Alert>;
  private incidents: Map<number, Incident>;
  private logs: Map<number, Log>;
  private responseActions: Map<number, ResponseAction>;
  private llmInsights: Map<number, LlmInsight>;
  
  currentId: number;

  constructor() {
    this.users = new Map();
    this.agents = new Map();
    this.alerts = new Map();
    this.incidents = new Map();
    this.logs = new Map();
    this.responseActions = new Map();
    this.llmInsights = new Map();
    this.currentId = 1;
    
    // Initialize with sample agents
    const initialAgents: InsertAgent[] = [
      {
        name: "Network Monitor",
        type: "network",
        status: "active",
        lastActive: new Date(),
        metadata: {}
      },
      {
        name: "Log Parser",
        type: "log",
        status: "active",
        lastActive: new Date(),
        metadata: {}
      },
      {
        name: "Response Agent",
        type: "response",
        status: "warning",
        lastActive: new Date(),
        metadata: {}
      },
      {
        name: "Threat Intelligence",
        type: "intelligence",
        status: "error",
        lastActive: new Date(),
        metadata: {}
      }
    ];
    
    initialAgents.forEach(agent => this.createAgent(agent));
    
    // Initialize with sample response actions
    const initialActions: InsertResponseAction[] = [
      {
        name: "Block Malicious IP",
        trigger: "IDS Alert",
        status: "enabled",
        lastExecuted: new Date(Date.now() - 3600000), // 1 hour ago
        metadata: {}
      },
      {
        name: "Isolate Compromised Endpoint",
        trigger: "Malware Detection",
        status: "enabled",
        lastExecuted: new Date(Date.now() - 86400000), // 1 day ago
        metadata: {}
      },
      {
        name: "Reset Compromised Credentials",
        trigger: "Brute Force Detection",
        status: "disabled",
        lastExecuted: null,
        metadata: {}
      },
      {
        name: "Backup Critical Data",
        trigger: "Ransomware Indicators",
        status: "enabled",
        lastExecuted: new Date(Date.now() - 172800000), // 2 days ago
        metadata: {}
      }
    ];
    
    initialActions.forEach(action => this.createResponseAction(action));
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }
  
  // Agent methods
  async getAgents(): Promise<Agent[]> {
    return Array.from(this.agents.values());
  }
  
  async getAgent(id: number): Promise<Agent | undefined> {
    return this.agents.get(id);
  }
  
  async createAgent(insertAgent: InsertAgent): Promise<Agent> {
    const id = this.currentId++;
    const createdAt = new Date();
    const agent: Agent = { 
      ...insertAgent, 
      id, 
      createdAt,
      status: insertAgent.status || "inactive", 
      lastActive: insertAgent.lastActive || new Date(),
      metadata: insertAgent.metadata || {}
    };
    this.agents.set(id, agent);
    return agent;
  }
  
  async updateAgent(id: number, updates: Partial<InsertAgent>): Promise<Agent | undefined> {
    const agent = this.agents.get(id);
    if (!agent) return undefined;
    
    const updatedAgent: Agent = { ...agent, ...updates };
    this.agents.set(id, updatedAgent);
    return updatedAgent;
  }
  
  // Alert methods
  async getAlerts(limit?: number): Promise<Alert[]> {
    const alerts = Array.from(this.alerts.values()).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    return limit ? alerts.slice(0, limit) : alerts;
  }
  
  async getAlert(id: number): Promise<Alert | undefined> {
    return this.alerts.get(id);
  }
  
  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const id = this.currentId++;
    const createdAt = new Date();
    const alert: Alert = { 
      ...insertAlert, 
      id, 
      createdAt,
      timestamp: insertAlert.timestamp || new Date(),
      status: insertAlert.status || "new",
      metadata: insertAlert.metadata || {},
      agentId: insertAlert.agentId || null,
      incidentId: insertAlert.incidentId || null
    };
    this.alerts.set(id, alert);
    return alert;
  }
  
  async updateAlert(id: number, updates: Partial<InsertAlert>): Promise<Alert | undefined> {
    const alert = this.alerts.get(id);
    if (!alert) return undefined;
    
    const updatedAlert: Alert = { ...alert, ...updates };
    this.alerts.set(id, updatedAlert);
    return updatedAlert;
  }
  
  // Incident methods
  async getIncidents(limit?: number): Promise<Incident[]> {
    const incidents = Array.from(this.incidents.values()).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    return limit ? incidents.slice(0, limit) : incidents;
  }
  
  async getIncident(id: number): Promise<Incident | undefined> {
    return this.incidents.get(id);
  }
  
  async createIncident(insertIncident: InsertIncident): Promise<Incident> {
    const id = this.currentId++;
    const createdAt = new Date();
    const incident: Incident = { 
      ...insertIncident, 
      id, 
      createdAt,
      timestamp: insertIncident.timestamp || new Date(),
      status: insertIncident.status || "open",
      metadata: insertIncident.metadata || {}
    };
    this.incidents.set(id, incident);
    return incident;
  }
  
  async updateIncident(id: number, updates: Partial<InsertIncident>): Promise<Incident | undefined> {
    const incident = this.incidents.get(id);
    if (!incident) return undefined;
    
    const updatedIncident: Incident = { ...incident, ...updates };
    this.incidents.set(id, updatedIncident);
    return updatedIncident;
  }
  
  // Log methods
  async getLogs(limit?: number): Promise<Log[]> {
    const logs = Array.from(this.logs.values()).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    return limit ? logs.slice(0, limit) : logs;
  }
  
  async getLog(id: number): Promise<Log | undefined> {
    return this.logs.get(id);
  }
  
  async createLog(insertLog: InsertLog): Promise<Log> {
    const id = this.currentId++;
    const createdAt = new Date();
    const log: Log = { 
      ...insertLog, 
      id, 
      createdAt,
      timestamp: insertLog.timestamp || new Date(),
      metadata: insertLog.metadata || {},
      agentId: insertLog.agentId || null
    };
    this.logs.set(id, log);
    return log;
  }
  
  // Response Action methods
  async getResponseActions(): Promise<ResponseAction[]> {
    return Array.from(this.responseActions.values());
  }
  
  async getResponseAction(id: number): Promise<ResponseAction | undefined> {
    return this.responseActions.get(id);
  }
  
  async createResponseAction(insertAction: InsertResponseAction): Promise<ResponseAction> {
    const id = this.currentId++;
    const createdAt = new Date();
    const action: ResponseAction = { 
      ...insertAction, 
      id, 
      createdAt,
      status: insertAction.status || "pending",
      metadata: insertAction.metadata || {},
      lastExecuted: insertAction.lastExecuted || null,
      incidentId: insertAction.incidentId || null
    };
    this.responseActions.set(id, action);
    return action;
  }
  
  async updateResponseAction(id: number, updates: Partial<InsertResponseAction>): Promise<ResponseAction | undefined> {
    const action = this.responseActions.get(id);
    if (!action) return undefined;
    
    const updatedAction: ResponseAction = { ...action, ...updates };
    this.responseActions.set(id, updatedAction);
    return updatedAction;
  }
  
  // LLM Insight methods
  async getLlmInsights(limit?: number): Promise<LlmInsight[]> {
    const insights = Array.from(this.llmInsights.values()).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    return limit ? insights.slice(0, limit) : insights;
  }
  
  async getLlmInsight(id: number): Promise<LlmInsight | undefined> {
    return this.llmInsights.get(id);
  }
  
  async createLlmInsight(insertInsight: InsertLlmInsight): Promise<LlmInsight> {
    const id = this.currentId++;
    const createdAt = new Date();
    const insight: LlmInsight = { 
      ...insertInsight, 
      id, 
      createdAt,
      timestamp: insertInsight.timestamp || new Date(),
      metadata: insertInsight.metadata || {},
      recommendation: insertInsight.recommendation || null,
      incidentId: insertInsight.incidentId || null
    };
    this.llmInsights.set(id, insight);
    return insight;
  }
}

// Create a storage instance using the database
const dbStorage = new DatabaseStorage();

// Initialize the database - this will be called when the server starts
(async () => {
  try {
    await dbStorage.initializeData();
  } catch (error) {
    console.error("Error initializing database:", error);
  }
})();

export const storage = dbStorage;
