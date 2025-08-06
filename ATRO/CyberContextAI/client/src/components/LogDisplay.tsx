import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  RefreshCw, 
  Filter,
  ChevronDown
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addEventListener, removeEventListener } from "@/lib/socket";
import type { SecurityLog } from "@/lib/types";

export default function LogDisplay() {
  const [logSource, setLogSource] = useState("all");
  const logsEndRef = useRef<HTMLDivElement>(null);
  
  // Fetch logs
  const { data: logs = [], refetch } = useQuery<SecurityLog[]>({
    queryKey: ['/api/logs'],
  });
  
  // Filter logs by source if selected
  const filteredLogs = logSource === "all" 
    ? logs 
    : logs.filter(log => log.source.toLowerCase().includes(logSource.toLowerCase()));
  
  // Auto-scroll to bottom of logs when new logs arrive
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [filteredLogs.length]);
  
  // Listen for new logs via WebSocket
  useEffect(() => {
    const handleNewLog = () => {
      refetch();
    };
    
    addEventListener("new_log", handleNewLog);
    
    return () => {
      removeEventListener("new_log", handleNewLog);
    };
  }, [refetch]);
  
  // Function to get color based on log level
  const getLevelColor = (level: string) => {
    switch (level) {
      case "critical":
        return "text-error";
      case "warning":
        return "text-accent";
      case "info":
        return "text-primary";
      case "success":
        return "text-secondary";
      default:
        return "text-gray-400";
    }
  };

  return (
    <Card className="bg-background-paper border border-gray-800 col-span-full h-96">
      <CardHeader className="p-4 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-medium">Security Logs</CardTitle>
        <div className="flex space-x-2">
          <div className="relative">
            <Select value={logSource} onValueChange={setLogSource}>
              <SelectTrigger className="bg-background-elevated border border-gray-700 text-sm rounded-md px-3 py-1 h-8 w-32">
                <SelectValue placeholder="All Sources" />
                <ChevronDown className="h-4 w-4 opacity-50" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="firewall">Firewall</SelectItem>
                <SelectItem value="ids">IDS</SelectItem>
                <SelectItem value="auth">Authentication</SelectItem>
                <SelectItem value="network">Network</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-gray-400 hover:text-gray-300 h-8 w-8"
            onClick={() => refetch()}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-300 h-8 w-8">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 px-4 pb-4">
        <div className="h-80 overflow-y-auto custom-scrollbar bg-background-elevated rounded-md font-mono text-sm p-4">
          {filteredLogs.length === 0 ? (
            <div className="flex justify-center items-center h-full text-gray-400">
              No logs to display
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="mb-1.5 flex">
                <span className={`${getLevelColor(log.level)} mr-2`}>
                  [{log.level.toUpperCase()}]
                </span>
                <span className="text-gray-400 mr-2">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
                <span>{log.message}</span>
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      </CardContent>
    </Card>
  );
}
