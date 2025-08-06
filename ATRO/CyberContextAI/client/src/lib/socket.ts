import { queryClient } from "./queryClient";

// WebSocket connection
let socket: WebSocket | null = null;

// Event callbacks
const eventListeners: Record<string, Array<(data: any) => void>> = {};

/**
 * Connect to WebSocket server
 */
export function connectWebSocket(): WebSocket {
  if (socket && socket.readyState === WebSocket.OPEN) {
    return socket;
  }
  
  // Determine WebSocket URL
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${protocol}//${window.location.host}/ws`;
  
  // Create new WebSocket connection
  socket = new WebSocket(wsUrl);
  
  // Connection opened
  socket.addEventListener("open", () => {
    console.log("WebSocket connection established");
  });
  
  // Listen for messages
  socket.addEventListener("message", (event) => {
    try {
      const message = JSON.parse(event.data);
      const { type, data } = message;
      
      // Process received message
      processWebSocketMessage(type, data);
      
      // Trigger event listeners for this message type
      if (eventListeners[type]) {
        eventListeners[type].forEach(callback => callback(data));
      }
    } catch (error) {
      console.error("Error processing WebSocket message:", error);
    }
  });
  
  // Handle errors
  socket.addEventListener("error", (error) => {
    console.error("WebSocket error:", error);
  });
  
  // Handle connection close
  socket.addEventListener("close", () => {
    console.log("WebSocket connection closed, attempting to reconnect in 3 seconds...");
    setTimeout(connectWebSocket, 3000);
  });
  
  return socket;
}

/**
 * Process WebSocket messages and update queryClient cache
 */
function processWebSocketMessage(type: string, data: any) {
  switch (type) {
    case "initial_data":
      // Initial data load - invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/agents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/incidents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/logs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/response-actions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/llm-insights'] });
      break;
      
    case "agents_status":
      queryClient.setQueryData(['/api/agents'], data);
      break;
      
    case "new_alert":
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
      break;
      
    case "new_incident":
      queryClient.invalidateQueries({ queryKey: ['/api/incidents'] });
      break;
      
    case "incident_updated":
      queryClient.invalidateQueries({ queryKey: ['/api/incidents'] });
      break;
      
    case "new_log":
      queryClient.invalidateQueries({ queryKey: ['/api/logs'] });
      break;
      
    case "new_insight":
      queryClient.invalidateQueries({ queryKey: ['/api/llm-insights'] });
      break;
      
    case "response_action_updated":
    case "new_response_action":
      queryClient.invalidateQueries({ queryKey: ['/api/response-actions'] });
      break;
  }
}

/**
 * Send message to WebSocket server
 */
export function sendWebSocketMessage(type: string, data: any = {}): boolean {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.error("WebSocket is not connected");
    return false;
  }
  
  socket.send(JSON.stringify({ type, ...data }));
  return true;
}

/**
 * Add event listener for WebSocket message type
 */
export function addEventListener(type: string, callback: (data: any) => void): void {
  if (!eventListeners[type]) {
    eventListeners[type] = [];
  }
  
  eventListeners[type].push(callback);
}

/**
 * Remove event listener
 */
export function removeEventListener(type: string, callback: (data: any) => void): void {
  if (!eventListeners[type]) return;
  
  eventListeners[type] = eventListeners[type].filter(cb => cb !== callback);
}
