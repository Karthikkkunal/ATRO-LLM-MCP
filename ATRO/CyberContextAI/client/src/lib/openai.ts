import { apiRequest } from "./queryClient";

/**
 * Interface for threat analysis result
 */
export interface ThreatAnalysisResult {
  severity: "low" | "medium" | "high" | "critical";
  analysis: string;
  recommendation: string;
  confidence: number;
}

/**
 * Interface for pattern analysis result
 */
export interface PatternAnalysisResult {
  patterns: string[];
  riskLevel: string;
  suggestedActions: string[];
}

/**
 * Analyze a log entry for potential threats
 */
export async function analyzeThreat(logMessage: string): Promise<ThreatAnalysisResult> {
  try {
    const response = await apiRequest(
      "POST", 
      "/api/llm-insights/analyze", 
      { logMessage }
    );
    
    return await response.json();
  } catch (error) {
    console.error("Error analyzing threat:", error);
    return {
      severity: "medium",
      analysis: "Failed to analyze threat. API may be unavailable.",
      recommendation: "Please check API credentials and try again.",
      confidence: 0
    };
  }
}

/**
 * Generate response actions for an incident
 */
export async function generateResponseActions(incidentDescription: string): Promise<string[]> {
  try {
    const response = await apiRequest(
      "POST", 
      "/api/llm-insights/generate-actions", 
      { incidentDescription }
    );
    
    const result = await response.json();
    return result.actions;
  } catch (error) {
    console.error("Error generating response actions:", error);
    return [
      "Block source IP address", 
      "Isolate affected systems", 
      "Update firewall rules"
    ];
  }
}

/**
 * Analyze patterns in multiple logs
 */
export async function analyzeLogPatterns(logs: string[]): Promise<PatternAnalysisResult> {
  try {
    const response = await apiRequest(
      "POST", 
      "/api/llm-insights/analyze-patterns", 
      { logs }
    );
    
    return await response.json();
  } catch (error) {
    console.error("Error analyzing log patterns:", error);
    return {
      patterns: ["Failed to analyze patterns"],
      riskLevel: "unknown",
      suggestedActions: ["Check system manually"]
    };
  }
}
