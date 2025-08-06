import Redis from "ioredis";

// Implement fallback mechanism for when Redis isn't available
// Define event handlers for memory store to be compatible with Redis
type EventCallback = (channel: string, message: string) => void;

class MemoryStore {
  private store: Map<string, string> = new Map();
  private eventHandlers: Map<string, EventCallback[]> = new Map();
  
  async get(key: string): Promise<string | null> {
    return this.store.get(key) || null;
  }
  
  async set(key: string, value: string): Promise<void> {
    this.store.set(key, value);
  }
  
  async expire(key: string, seconds: number): Promise<void> {
    // Simple expiration mechanism
    setTimeout(() => {
      this.store.delete(key);
    }, seconds * 1000);
  }
  
  async keys(pattern: string): Promise<string[]> {
    // Very basic pattern matching (just prefix)
    const prefix = pattern.replace("*", "");
    return Array.from(this.store.keys()).filter(key => key.startsWith(prefix));
  }
  
  async publish(channel: string, message: string): Promise<void> {
    // In-memory publish - call any registered handlers
    const handlers = this.eventHandlers.get("message") || [];
    for (const handler of handlers) {
      handler(channel, message);
    }
  }
  
  async subscribe(channel: string): Promise<void> {
    // No-op in memory mode - just record that we subscribed
    // Real subscriptions are handled via on("message") handlers
  }
  
  on(event: string, callback: EventCallback): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    const handlers = this.eventHandlers.get(event) || [];
    handlers.push(callback);
    this.eventHandlers.set(event, handlers);
  }
  
  async ping(): Promise<string> {
    return "PONG";
  }
}

class RedisMCP {
  private client: Redis | MemoryStore;
  private connected: boolean = false;
  private useMemoryFallback: boolean = false;
  private contextPrefix: string = "mcp:context:";
  private agentStatusPrefix: string = "mcp:agent:";
  
  constructor() {
    // Check if we should use in-memory fallback
    const useFallback = process.env.USE_MEMORY_FALLBACK === 'true';
    
    if (useFallback) {
      console.log("Using in-memory store as Redis fallback");
      this.client = new MemoryStore();
      this.useMemoryFallback = true;
      this.connected = true;
      return;
    }
    
    // Initialize Redis client
    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
    
    // Parse URL to get components
    let redisOptions = {
      maxRetriesPerRequest: 3,
      retryStrategy: (times: number) => {
        if (times > 10) {
          // After 10 retries, fall back to in-memory storage
          if (!this.useMemoryFallback) {
            console.log("Switching to in-memory fallback after failed Redis connection attempts");
            this.useMemoryFallback = true;
            this.client = new MemoryStore();
            this.connected = true;
          }
          return null; // stop retrying - use null instead of false for compatibility
        }
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    };
    
    try {
      this.client = new Redis(redisUrl, redisOptions);
    } catch (error) {
      console.error("Error initializing Redis client:", error);
      this.client = new MemoryStore();
      this.useMemoryFallback = true;
      this.connected = true;
    }
    
    // Setup Redis events if not using fallback
    if (!this.useMemoryFallback) {
      (this.client as Redis).on("connect", () => {
        console.log("Connected to Redis");
        this.connected = true;
      });
      
      (this.client as Redis).on("error", (err) => {
        console.error("Redis connection error:", err);
        if (!this.useMemoryFallback) {
          console.log("Switching to in-memory fallback after Redis connection error");
          this.useMemoryFallback = true;
          this.client = new MemoryStore();
          this.connected = true;
        }
      });
    }
  }
  
  // Check if connected to Redis
  async isConnected(): Promise<boolean> {
    if (!this.connected) return false;
    
    try {
      // Try a simple ping command to verify connection
      await this.client.ping();
      return true;
    } catch (error) {
      console.error("Redis connection check failed:", error);
      return false;
    }
  }
  
  // Store context information in Redis
  async storeContext(type: string, data: any): Promise<void> {
    if (!this.connected) {
      console.warn("Cannot store context - Redis not connected");
      return;
    }
    
    try {
      const key = `${this.contextPrefix}${type}`;
      await this.client.set(key, JSON.stringify(data));
      // Set expiration to avoid indefinite storage
      await this.client.expire(key, 86400); // 24 hours
    } catch (error) {
      console.error(`Error storing ${type} context:`, error);
    }
  }
  
  // Retrieve context information from Redis
  async getContext(type: string): Promise<any> {
    if (!this.connected) {
      console.warn("Cannot get context - Redis not connected");
      return null;
    }
    
    try {
      const key = `${this.contextPrefix}${type}`;
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error retrieving ${type} context:`, error);
      return null;
    }
  }
  
  // Store agent status in Redis
  async updateAgentStatus(agentId: string, status: string): Promise<void> {
    if (!this.connected) {
      console.warn("Cannot update agent status - Redis not connected");
      return;
    }
    
    try {
      const key = `${this.agentStatusPrefix}${agentId}`;
      await this.client.set(key, status);
    } catch (error) {
      console.error(`Error updating agent status for ${agentId}:`, error);
    }
  }
  
  // Get agent status from Redis
  async getAgentStatus(agentId: string): Promise<string | null> {
    if (!this.connected) {
      console.warn("Cannot get agent status - Redis not connected");
      return null;
    }
    
    try {
      const key = `${this.agentStatusPrefix}${agentId}`;
      return await this.client.get(key);
    } catch (error) {
      console.error(`Error getting agent status for ${agentId}:`, error);
      return null;
    }
  }
  
  // Publish message to MCP channel
  async publish(channel: string, message: any): Promise<void> {
    if (!this.connected) {
      console.warn("Cannot publish message - Redis not connected");
      return;
    }
    
    try {
      await this.client.publish(channel, JSON.stringify(message));
    } catch (error) {
      console.error(`Error publishing to channel ${channel}:`, error);
    }
  }
  
  // Subscribe to MCP channel
  async subscribe(channel: string, callback: (message: any) => void): Promise<void> {
    if (!this.connected) {
      console.warn("Cannot subscribe to channel - Redis not connected");
      return;
    }
    
    try {
      await this.client.subscribe(channel);
      
      // Handle message subscriptions based on client type
      if (this.useMemoryFallback) {
        (this.client as MemoryStore).on("message", (chan: string, message: string) => {
          if (chan === channel) {
            try {
              const parsedMessage = JSON.parse(message);
              callback(parsedMessage);
            } catch (error) {
              console.error("Error parsing message:", error);
            }
          }
        });
      } else {
        (this.client as Redis).on("message", (chan: string, message: string) => {
          if (chan === channel) {
            try {
              const parsedMessage = JSON.parse(message);
              callback(parsedMessage);
            } catch (error) {
              console.error("Error parsing message:", error);
            }
          }
        });
      }
    } catch (error) {
      console.error(`Error subscribing to channel ${channel}:`, error);
    }
  }
  
  // Get all stored contexts
  async getAllContexts(): Promise<Record<string, any>> {
    if (!this.connected) {
      console.warn("Cannot get contexts - Redis not connected");
      return {};
    }
    
    try {
      const keys = await this.client.keys(`${this.contextPrefix}*`);
      const result: Record<string, any> = {};
      
      for (const key of keys) {
        const value = await this.client.get(key);
        if (value) {
          const contextName = key.replace(this.contextPrefix, "");
          result[contextName] = JSON.parse(value);
        }
      }
      
      return result;
    } catch (error) {
      console.error("Error getting all contexts:", error);
      return {};
    }
  }
  
  // Get all agent statuses
  async getAllAgentStatuses(): Promise<Record<string, string>> {
    if (!this.connected) {
      console.warn("Cannot get agent statuses - Redis not connected");
      return {};
    }
    
    try {
      const keys = await this.client.keys(`${this.agentStatusPrefix}*`);
      const result: Record<string, string> = {};
      
      for (const key of keys) {
        const value = await this.client.get(key);
        if (value) {
          const agentId = key.replace(this.agentStatusPrefix, "");
          result[agentId] = value;
        }
      }
      
      return result;
    } catch (error) {
      console.error("Error getting all agent statuses:", error);
      return {};
    }
  }
}

// Export singleton instance
export const redis = new RedisMCP();
