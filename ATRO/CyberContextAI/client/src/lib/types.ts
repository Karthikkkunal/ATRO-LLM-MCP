// Common interfaces used throughout the application

/**
 * Agent status types
 */
export type AgentStatus = "active" | "warning" | "error" | "stopped";

/**
 * Severity levels
 */
export type SeverityLevel = "critical" | "high" | "medium" | "low" | "info";

/**
 * Log level types
 */
export type LogLevel = "critical" | "warning" | "info" | "debug";

/**
 * Agent interface
 */
export interface Agent {
  id: number;
  name: string;
  type: string;
  status: AgentStatus;
  lastActive: string;
}

/**
 * Alert interface
 */
export interface Alert {
  id: number;
  severity: SeverityLevel;
  title: string;
  description: string;
  source: string;
  timestamp: string;
  status: "new" | "in_progress" | "resolved";
}

/**
 * Incident interface
 */
export interface Incident {
  id: number;
  incidentId: string;
  type: string;
  status: "open" | "in_progress" | "contained" | "closed";
  source: string;
  timestamp: string;
}

/**
 * Security log interface
 */
export interface SecurityLog {
  id: number;
  level: LogLevel;
  message: string;
  source: string;
  timestamp: string;
}

/**
 * Response action interface
 */
export interface ResponseAction {
  id: number;
  name: string;
  trigger: string;
  status: "enabled" | "disabled";
  lastExecuted: string | null;
}

/**
 * LLM insight interface
 */
export interface LlmInsight {
  id: number;
  analysis: string;
  timestamp: string;
  severity: SeverityLevel;
  recommendation: string;
}

/**
 * Memory usage data for visualizations
 */
export interface MemoryUsageData {
  timestamp: string;
  usage: number;
}

/**
 * MCP status interface
 */
export interface McpStatusData {
  brokerStatus: string;
  redisCache: string;
  cacheSize: string;
  updateFrequency: string;
  lastUpdated: string;
  llmModel: string;
  apiStatus: string;
  contextSize: string;
  queriesToday: number;
  memoryUsage: MemoryUsageData[];
}
