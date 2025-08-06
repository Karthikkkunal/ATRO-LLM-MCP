import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import { useEffect, useState } from "react";
import ThreatAnalysis from "@/pages/ThreatAnalysis";
import LogExplorer from "@/pages/LogExplorer";
import LlmInsights from "@/pages/LlmInsights";
import Configuration from "@/pages/Configuration";

// Component for cyber-themed loading screen
function CyberLoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Initializing security protocols...");
  const statusTexts = [
    "Initializing security protocols...",
    "Establishing secure connection...",
    "Loading threat database...",
    "Calibrating defense systems...",
    "Scanning network perimeter...",
    "Activating monitoring agents..."
  ];

  useEffect(() => {
    // Simulate loading sequence
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 15;
        if (newProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        return newProgress;
      });
      
      // Update status text
      const textIndex = Math.floor(progress / 20);
      if (textIndex < statusTexts.length) {
        setStatusText(statusTexts[textIndex]);
      }
    }, 500);
    
    return () => clearInterval(interval);
  }, [progress]);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="w-96 max-w-full px-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-glow-blue mb-2">ATRO-LITE</h1>
          <p className="text-glow-purple text-sm">ADVANCED THREAT RESPONSE SYSTEM</p>
        </div>
        
        <div className="mb-4">
          <div className="cyber-border rounded-md overflow-hidden bg-black/50 h-3">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 to-purple-500"
              style={{ width: `${progress}%`, transition: 'width 0.4s ease' }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-glow-blue mt-1">
            <span>System Boot: {Math.floor(progress)}%</span>
            <span className="font-mono">{progress < 100 ? "LOADING" : "COMPLETE"}</span>
          </div>
        </div>
        
        <div className="text-glow-teal text-xs font-mono">{'>'} {statusText}</div>
        
        {/* Terminal-like loading animation */}
        <div className="mt-4 h-32 cyber-bg p-2 font-mono text-xs text-glow-blue overflow-hidden">
          {Array.from({ length: Math.floor(progress / 10) }).map((_, i) => (
            <div key={i} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
              {`[${String(i).padStart(2, '0')}] Init subsystem: ${
                ["Network Shield", "Threat Analysis", "Log Parser", "Response Agent", "Encrypted Comms", 
                 "MCP Core", "Alert Manager", "Firewall Integration", "LLM Engine", "GUI Interface"][i % 10]
              }`}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/analysis" component={ThreatAnalysis} />
      <Route path="/logs" component={LogExplorer} />
      <Route path="/insights" component={LlmInsights} />
      <Route path="/config" component={Configuration} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate initial loading sequence
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 3500);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen relative overflow-hidden">
        {/* Dynamic grid background overlay */}
        <div className="fixed inset-0 pointer-events-none z-[-1]">
          {/* Additional visual elements can be added here */}
        </div>
        
        {isLoading ? (
          <CyberLoadingScreen />
        ) : (
          <Router />
        )}
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;
