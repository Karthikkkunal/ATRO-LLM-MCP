import { storage } from "../storage";
import { generateResponseActions } from "../services/llm";
import { redis } from "../services/redisMcp";

/**
 * Simulate a response agent that takes automated actions based on alerts
 * In production, this would implement actual mitigation actions
 */
export async function simulateResponseAgent(): Promise<void> {
  try {
    console.log("Starting simulated response agent...");
    
    // Get recent alerts that haven't been handled
    const recentAlerts = await storage.getAlerts(10);
    const unhandledAlerts = recentAlerts.filter(alert => 
      alert.status === "new" && ["high", "critical"].includes(alert.severity)
    );
    
    if (unhandledAlerts.length === 0) {
      console.log("No alerts requiring response");
      return;
    }
    
    // Process the first unhandled alert
    const alert = unhandledAlerts[0];
    
    // Log the alert being processed
    await storage.createLog({
      level: "info",
      message: `Processing alert #${alert.id}: ${alert.title}`,
      source: "Response Agent",
      timestamp: new Date(),
      metadata: { alertId: alert.id }
    });
    
    // Generate response actions using LLM
    const actionDescriptions = await generateResponseActions(
      `Alert: ${alert.title}. Description: ${alert.description}. Severity: ${alert.severity}`
    );
    
    // Mark alert as in progress
    await storage.updateAlert(alert.id, { status: "in_progress" });
    
    // Process each suggested action
    for (const actionDesc of actionDescriptions) {
      // Create a log for the action being taken
      await storage.createLog({
        level: "info",
        message: `Taking action: ${actionDesc}`,
        source: "Response Agent",
        timestamp: new Date(),
        metadata: { alertId: alert.id, action: actionDesc }
      });
      
      // Simulate action execution delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update a response action record or create a new one
      const actionType = getActionType(actionDesc);
      const existingActions = await storage.getResponseActions();
      const matchingAction = existingActions.find(a => a.name.includes(actionType));
      
      if (matchingAction) {
        // Update existing action
        await storage.updateResponseAction(matchingAction.id, {
          lastExecuted: new Date()
        });
      } else {
        // Create new response action
        await storage.createResponseAction({
          name: actionDesc,
          trigger: alert.title,
          status: "enabled",
          lastExecuted: new Date(),
          metadata: { alertId: alert.id }
        });
      }
    }
    
    // Mark alert as resolved
    await storage.updateAlert(alert.id, { status: "resolved" });
    
    // Share response context via Redis MCP
    await redis.storeContext("response_actions", {
      alertId: alert.id,
      actions: actionDescriptions,
      timestamp: new Date()
    });
    
    // Create a success log
    await storage.createLog({
      level: "info",
      message: `Successfully responded to alert #${alert.id}`,
      source: "Response Agent",
      timestamp: new Date(),
      metadata: { 
        alertId: alert.id, 
        actions: actionDescriptions
      }
    });
    
    console.log("Response agent simulation completed");
  } catch (error) {
    console.error("Error in response agent simulation:", error);
  }
}

/**
 * Extract the general type of action from the description
 */
function getActionType(actionDesc: string): string {
  if (actionDesc.toLowerCase().includes("block") && actionDesc.toLowerCase().includes("ip")) {
    return "Block IP";
  } else if (actionDesc.toLowerCase().includes("isolate") || actionDesc.toLowerCase().includes("quarantine")) {
    return "Isolate Endpoint";
  } else if (actionDesc.toLowerCase().includes("reset") && actionDesc.toLowerCase().includes("password")) {
    return "Reset Credentials";
  } else if (actionDesc.toLowerCase().includes("backup")) {
    return "Backup Data";
  } else if (actionDesc.toLowerCase().includes("firewall")) {
    return "Update Firewall";
  } else {
    return actionDesc.split(' ').slice(0, 3).join(' ');
  }
}
