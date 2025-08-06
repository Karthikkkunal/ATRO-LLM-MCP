import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

// Initialize OpenAI client
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "dummy-key-for-development"
});

export interface ThreatAnalysisResult {
  severity: string;
  analysis: string;
  recommendation: string;
  confidence: number;
}

/**
 * Analyze a potential security threat using OpenAI's GPT
 * @param text The log or alert text to analyze
 * @returns Analysis of the security threat
 */
export async function analyzeThreatWithLLM(text: string): Promise<ThreatAnalysisResult> {
  try {
    const systemPrompt = `You are an expert cybersecurity analyst. 
    Analyze the provided log entry or security event and identify potential security threats.
    Respond with JSON in the following format:
    {
      "severity": "low" | "medium" | "high" | "critical",
      "analysis": "detailed analysis of the threat",
      "recommendation": "recommended action to address the threat",
      "confidence": number between 0 and 1 indicating confidence level
    }`;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return {
      severity: result.severity || "medium",
      analysis: result.analysis || "No analysis provided",
      recommendation: result.recommendation || "No recommendation provided",
      confidence: Math.max(0, Math.min(1, result.confidence || 0.5))
    };
  } catch (error) {
    console.error("LLM analysis error:", error);
    return {
      severity: "medium",
      analysis: "Failed to analyze threat with LLM. API may be unavailable.",
      recommendation: "Please check API credentials and try again.",
      confidence: 0
    };
  }
}

/**
 * Generate a response action based on a security incident
 * @param incidentDescription The incident description
 * @returns Suggested response actions
 */
export async function generateResponseActions(incidentDescription: string): Promise<string[]> {
  try {
    const systemPrompt = `You are an expert in cybersecurity incident response.
    Based on the security incident description, suggest specific response actions that could be taken.
    Return a JSON array of strings, with each string being a specific actionable response.
    Limit your suggestions to 3-5 highly effective actions.`;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: incidentDescription }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return Array.isArray(result.actions) ? result.actions : [];
  } catch (error) {
    console.error("LLM response generation error:", error);
    return ["Block source IP address", "Isolate affected systems", "Update firewall rules"];
  }
}

/**
 * Analyze a set of logs together to find patterns
 * @param logs Array of log entries
 * @returns Analysis result with identified patterns
 */
export async function analyzeLogPatterns(logs: string[]): Promise<{
  patterns: string[];
  riskLevel: string;
  suggestedActions: string[];
}> {
  try {
    const combinedLogs = logs.join("\n");
    const systemPrompt = `You are an advanced security pattern recognition system.
    Analyze the following set of logs to identify patterns that might indicate security threats.
    Look for correlations between events, potential attack vectors, and suspicious activity patterns.
    Return your analysis as JSON with the following structure:
    {
      "patterns": [array of identified patterns],
      "riskLevel": "low" | "medium" | "high" | "critical",
      "suggestedActions": [array of suggested actions]
    }`;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: combinedLogs }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("LLM pattern analysis error:", error);
    return {
      patterns: ["Failed to analyze patterns"],
      riskLevel: "unknown",
      suggestedActions: ["Check system manually"]
    };
  }
}
