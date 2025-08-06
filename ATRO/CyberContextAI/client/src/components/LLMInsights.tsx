import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  RefreshCw, 
  Maximize, 
  BrainCircuit,
  PlayCircle,
  FullscreenIcon
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { LlmInsight } from "@/lib/types";

export default function LLMInsights() {
  const { toast } = useToast();
  const [isImplementingAction, setIsImplementingAction] = useState<number | null>(null);
  
  // Fetch LLM insights
  const { data: insights = [], isLoading, refetch } = useQuery<LlmInsight[]>({
    queryKey: ['/api/llm-insights'],
  });
  
  const handleImplement = async (insightId: number, recommendation: string) => {
    setIsImplementingAction(insightId);
    
    try {
      // Create a response action based on the recommendation
      await apiRequest("POST", "/api/response-actions", {
        name: recommendation.substring(0, 50) + (recommendation.length > 50 ? "..." : ""),
        trigger: "LLM Insight",
        status: "enabled",
        lastExecuted: new Date().toISOString(),
        metadata: { insightId }
      });
      
      toast({
        title: "Response Action Created",
        description: "The recommended action has been implemented",
        variant: "default"
      });
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['/api/response-actions'] });
    } catch (error) {
      console.error("Error implementing recommendation:", error);
      toast({
        title: "Implementation Failed",
        description: "Failed to implement the recommended action",
        variant: "destructive"
      });
    } finally {
      setIsImplementingAction(null);
    }
  };
  
  const handleRefresh = () => {
    refetch();
  };
  
  const getBorderColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "border-error";
      case "high":
        return "border-error";
      case "medium":
        return "border-accent";
      default:
        return "border-gray-600";
    }
  };

  return (
    <Card className="bg-background-paper border border-gray-800 col-span-full lg:col-span-2 h-80">
      <CardHeader className="p-4 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-medium">LLM Insights</CardTitle>
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-gray-400 hover:text-gray-300 h-8 w-8"
            onClick={handleRefresh}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-300 h-8 w-8">
            <Maximize className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 px-4 pb-4">
        <div className="h-64 overflow-y-auto custom-scrollbar pr-2">
          {isLoading ? (
            <div className="flex justify-center items-center h-full text-gray-400">
              Loading insights...
            </div>
          ) : insights.length === 0 ? (
            <div className="flex justify-center items-center h-full text-gray-400">
              No LLM insights available
            </div>
          ) : (
            insights.map((insight) => (
              <div 
                key={insight.id}
                className={`border-l-4 ${getBorderColor(insight.severity)} rounded-r p-3 mb-3 bg-background-elevated`}
              >
                <div className="flex items-center text-xs text-gray-400 mb-1">
                  <BrainCircuit className="h-3 w-3 mr-1" />
                  <span>GPT-4o Analysis - {new Date(insight.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-sm">{insight.analysis}</p>
                <div className="mt-2 flex">
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="text-xs text-primary hover:underline mr-4 flex items-center p-0 h-auto"
                    onClick={() => handleImplement(insight.id, insight.recommendation)}
                    disabled={isImplementingAction === insight.id}
                  >
                    <PlayCircle className="h-3 w-3 mr-1" />
                    Implement Recommendation
                  </Button>
                  <Button 
                    variant="link"
                    size="sm"
                    className="text-xs text-gray-400 hover:underline flex items-center p-0 h-auto"
                  >
                    <FullscreenIcon className="h-3 w-3 mr-1" />
                    View Full Analysis
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
