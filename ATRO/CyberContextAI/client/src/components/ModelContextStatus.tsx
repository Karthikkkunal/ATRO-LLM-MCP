import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { getMcpStatus, getLlmStatus } from "@/lib/redis";

// Generate memory usage data for visualization
const generateMemoryData = () => {
  return Array.from({ length: 12 }, (_, i) => ({
    time: i,
    usage: Math.floor(Math.random() * 100)
  }));
};

export default function ModelContextStatus() {
  const chartRef = useRef<HTMLDivElement>(null);
  const memoryData = generateMemoryData();
  
  // Fetch MCP status
  const { data: mcpStatus, isLoading: isMcpLoading, refetch: refetchMcp } = useQuery({
    queryKey: ['/api/mcp/status'],
    queryFn: getMcpStatus
  });
  
  // Fetch LLM status (mock data since endpoint is not implemented)
  const llmStatus = {
    model: "GPT-4o",
    apiStatus: "operational",
    contextSize: "16K tokens",
    queriesToday: 142
  };
  
  const handleRefresh = () => {
    refetchMcp();
  };
  
  // Draw memory usage chart
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    
    // Clear chart
    chart.innerHTML = '';
    
    // Create bar chart
    const container = document.createElement('div');
    container.className = 'h-full w-full flex items-end';
    
    // Add bars
    memoryData.forEach(data => {
      const bar = document.createElement('div');
      const height = `${data.usage}%`;
      
      // Style based on height
      const isHighUsage = data.usage > 70;
      
      bar.className = `w-4 mx-0.5 ${isHighUsage ? 'bg-primary' : 'bg-primary bg-opacity-60'} rounded-t`;
      bar.style.height = height;
      
      container.appendChild(bar);
    });
    
    chart.appendChild(container);
  }, [memoryData]);

  return (
    <Card className="bg-background-paper border border-gray-800 col-span-full lg:col-span-2 h-80">
      <CardHeader className="p-4 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-medium">Model Context Protocol Status</CardTitle>
        <Button 
          variant="ghost"
          className="text-sm text-gray-400 hover:text-gray-300 flex items-center"
          onClick={handleRefresh}
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </CardHeader>
      
      <CardContent className="p-0 px-4 pb-4">
        <div className="h-64 overflow-hidden flex flex-col">
          <div className="bg-background-elevated rounded-md p-3 mb-3 flex-shrink-0">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Context Broker Status</span>
              <span className={`px-2 py-0.5 ${isMcpLoading || !mcpStatus || mcpStatus.brokerStatus !== 'healthy' 
                ? 'bg-error bg-opacity-20 text-error' 
                : 'bg-secondary bg-opacity-20 text-secondary'} text-xs rounded-full`}
              >
                {isMcpLoading ? 'Loading...' : (mcpStatus?.brokerStatus === 'healthy' ? 'Healthy' : 'Error')}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-400">Redis Cache:</span>
                <span className={`ml-2 ${isMcpLoading || !mcpStatus || mcpStatus.redisCache !== 'connected' 
                  ? 'text-error' 
                  : 'text-secondary'}`}
                >
                  {isMcpLoading ? 'Checking...' : (mcpStatus?.redisCache || 'Disconnected')}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Cache Size:</span>
                <span className="ml-2">{isMcpLoading ? '...' : (mcpStatus?.cacheSize || '0 MB')}</span>
              </div>
              <div>
                <span className="text-gray-400">Update Frequency:</span>
                <span className="ml-2">{isMcpLoading ? '...' : (mcpStatus?.updateFrequency || 'N/A')}</span>
              </div>
              <div>
                <span className="text-gray-400">Last Updated:</span>
                <span className="ml-2">
                  {isMcpLoading 
                    ? '...' 
                    : (mcpStatus?.lastUpdated 
                        ? new Date(mcpStatus.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                        : 'Never'
                      )
                  }
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-background-elevated rounded-md p-3 mb-3 flex-shrink-0">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">LLM Integration</span>
              <span className="px-2 py-0.5 bg-secondary bg-opacity-20 text-secondary text-xs rounded-full">
                Connected
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-400">Model:</span>
                <span className="ml-2">{llmStatus.model}</span>
              </div>
              <div>
                <span className="text-gray-400">API Status:</span>
                <span className="ml-2 text-secondary">{llmStatus.apiStatus}</span>
              </div>
              <div>
                <span className="text-gray-400">Context Size:</span>
                <span className="ml-2">{llmStatus.contextSize}</span>
              </div>
              <div>
                <span className="text-gray-400">Queries Today:</span>
                <span className="ml-2">{llmStatus.queriesToday}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-background-elevated rounded-md p-3 flex-1 overflow-hidden">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Contextual Memory</span>
              <span className="text-xs text-gray-400">Last 24 hours</span>
            </div>
            <div className="h-20 w-full relative" ref={chartRef}>
              {/* Memory usage chart is rendered here via useEffect */}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
