import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { connectWebSocket } from "./lib/socket";

// Initialize WebSocket connection
connectWebSocket();

createRoot(document.getElementById("root")!).render(<App />);
