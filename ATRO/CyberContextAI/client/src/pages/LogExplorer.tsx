import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import SideNavigation from "@/components/SideNavigation";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { Log } from "@/lib/types";

// Helper function to get the log level color
const getLogLevelColor = (level: string) => {
  switch (level.toLowerCase()) {
    case "error": return "bg-error text-error-foreground";
    case "warning": return "bg-warning text-warning-foreground";
    case "info": return "bg-info text-info-foreground";
    case "debug": return "bg-gray-500 text-gray-100";
    default: return "bg-gray-400 text-gray-900";
  }
};

export default function LogExplorer() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  
  // Fetch logs
  const { data: logs, isLoading } = useQuery<Log[]>({
    queryKey: ['/api/logs'],
    refetchInterval: 30000 // Refetch every 30 seconds
  });
  
  // Filter logs based on search term and filters
  const filteredLogs = logs?.filter(log => {
    const matchesSearch = searchTerm === "" || 
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.source.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesType = typeFilter === "all" || log.level.toLowerCase() === typeFilter.toLowerCase();
    const matchesSource = sourceFilter === "all" || log.source.toLowerCase() === sourceFilter.toLowerCase();
    
    return matchesSearch && matchesType && matchesSource;
  });
  
  // Extract unique sources for filtering
  const uniqueSources = [...new Set(logs?.map(log => log.source) || [])];
  
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Side Navigation */}
      <SideNavigation isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto bg-background">
        {/* Header */}
        <Header title="Log Explorer" />
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pt-16 md:pt-6 custom-scrollbar">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-glow-blue">Log Search & Analysis</CardTitle>
              <CardDescription>
                Search, filter and analyze system logs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-grow bg-background-paper border-gray-700"
                />
                
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full md:w-36 bg-background-paper border-gray-700">
                    <SelectValue placeholder="Log Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="debug">Debug</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={sourceFilter} onValueChange={setSourceFilter}>
                  <SelectTrigger className="w-full md:w-48 bg-background-paper border-gray-700">
                    <SelectValue placeholder="Source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    {uniqueSources.map(source => (
                      <SelectItem key={source} value={source.toLowerCase()}>
                        {source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button variant="outline" onClick={() => {
                  setSearchTerm("");
                  setTypeFilter("all");
                  setSourceFilter("all");
                }}>
                  Reset Filters
                </Button>
              </div>
              
              <div className="border border-gray-800 rounded-md bg-background-paper">
                <div className="grid grid-cols-12 gap-4 p-3 border-b border-gray-800 bg-background-elevated text-xs font-medium">
                  <div className="col-span-2">Timestamp</div>
                  <div className="col-span-1">Level</div>
                  <div className="col-span-2">Source</div>
                  <div className="col-span-7">Message</div>
                </div>
                
                <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                  {isLoading ? (
                    <div className="p-8 text-center text-gray-400">
                      Loading logs...
                    </div>
                  ) : filteredLogs && filteredLogs.length > 0 ? (
                    filteredLogs.map(log => (
                      <div 
                        key={log.id} 
                        className="grid grid-cols-12 gap-4 p-3 border-b border-gray-800 text-xs hover:bg-background-elevated transition-colors"
                      >
                        <div className="col-span-2 font-mono text-gray-400">
                          {new Date(log.createdAt).toLocaleString()}
                        </div>
                        <div className="col-span-1">
                          <Badge variant="outline" className={`${getLogLevelColor(log.level)}`}>
                            {log.level}
                          </Badge>
                        </div>
                        <div className="col-span-2 font-medium">{log.source}</div>
                        <div className="col-span-7 break-words">{log.message}</div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-400">
                      No logs found matching your search criteria
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-4 text-xs text-gray-400">
                <span>
                  Showing {filteredLogs?.length || 0} of {logs?.length || 0} logs
                </span>
                <Button variant="ghost" size="sm">
                  Export Logs
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-glow-teal">Log Trends</CardTitle>
                <CardDescription>
                  Distribution of log entries over time
                </CardDescription>
              </CardHeader>
              <CardContent className="h-64 flex items-center justify-center bg-background-elevated rounded-md">
                <div className="text-center text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p>Trend analysis visualization would appear here</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-glow-purple">Common Patterns</CardTitle>
                <CardDescription>
                  Frequently occurring log patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 border border-gray-800 rounded-md bg-background-elevated">
                    <div className="flex justify-between">
                      <h4 className="text-sm font-medium">Authentication Failures</h4>
                      <Badge variant="outline" className="bg-warning/20 text-warning border-warning/30">
                        12 occurrences
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Pattern: "Failed login attempt" in authentication logs
                    </p>
                  </div>
                  
                  <div className="p-3 border border-gray-800 rounded-md bg-background-elevated">
                    <div className="flex justify-between">
                      <h4 className="text-sm font-medium">Network Timeouts</h4>
                      <Badge variant="outline" className="bg-info/20 text-info border-info/30">
                        8 occurrences
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Pattern: "Connection timeout" in network service logs
                    </p>
                  </div>
                  
                  <div className="p-3 border border-gray-800 rounded-md bg-background-elevated">
                    <div className="flex justify-between">
                      <h4 className="text-sm font-medium">Permission Denials</h4>
                      <Badge variant="outline" className="bg-error/20 text-error border-error/30">
                        5 occurrences
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Pattern: "Permission denied" across system logs
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}