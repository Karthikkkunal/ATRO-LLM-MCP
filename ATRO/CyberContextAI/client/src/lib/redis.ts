import { apiRequest } from "./queryClient";

/**
 * Interface for MCP status
 */
export interface McpStatus {
  brokerStatus: string;
  redisCache: string;
  cacheSize: string;
  updateFrequency: string;
  lastUpdated: string;
}

/**
 * Interface for LLM status
 */
export interface LlmStatus {
  model: string;
  apiStatus: string;
  contextSize: string;
  queriesToday: number;
}

/**
 * Get the current MCP status
 */
export async function getMcpStatus(): Promise<McpStatus> {
  try {
    const response = await apiRequest("GET", "/api/mcp/status");
    return await response.json();
  } catch (error) {
    console.error("Error fetching MCP status:", error);
    return {
      brokerStatus: "error",
      redisCache: "disconnected",
      cacheSize: "0 MB",
      updateFrequency: "N/A",
      lastUpdated: new Date().toISOString()
    };
  }
}

/**
 * Get the current LLM status
 */
export async function getLlmStatus(): Promise<LlmStatus> {
  try {
    const response = await apiRequest("GET", "/api/llm-insights/status");
    return await response.json();
  } catch (error) {
    console.error("Error fetching LLM status:", error);
    return {
      model: "GPT-4o",
      apiStatus: "unavailable",
      contextSize: "16K tokens",
      queriesToday: 0
    };
  }
}

/**
 * Get all MCP contexts
 */
export async function getAllContexts(): Promise<Record<string, any>> {
  try {
    const response = await apiRequest("GET", "/api/mcp/contexts");
    return await response.json();
  } catch (error) {
    console.error("Error fetching MCP contexts:", error);
    return {};
  }
}

/**
 * Get all agent statuses from MCP
 */
export async function getAllAgentStatuses(): Promise<Record<string, string>> {
  try {
    const response = await apiRequest("GET", "/api/mcp/agent-statuses");
    return await response.json();
  } catch (error) {
    console.error("Error fetching agent statuses:", error);
    return {};
  }
}
