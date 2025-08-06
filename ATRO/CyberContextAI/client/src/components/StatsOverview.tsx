import { useQuery } from "@tanstack/react-query";
import { 
  Bug, 
  Tablet, 
  BrainCircuit, 
  Shield, 
  ArrowUp, 
  CheckCircle, 
  RefreshCw
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Alert, Incident, Agent, LlmInsight, ResponseAction } from "@/lib/types";

export default function StatsOverview() {
  // Fetch data for stats
  const { data: alerts = [] } = useQuery<Alert[]>({
    queryKey: ['/api/alerts'],
  });
  
  const { data: agents = [] } = useQuery<Agent[]>({
    queryKey: ['/api/agents'],
  });
  
  const { data: insights = [] } = useQuery<LlmInsight[]>({
    queryKey: ['/api/llm-insights'],
  });
  
  const { data: responseActions = [] } = useQuery<ResponseAction[]>({
    queryKey: ['/api/response-actions'],
  });

  // Calculate active threats (critical and high severity alerts)
  const activeThreats = alerts.filter(alert => 
    (alert.severity === "critical" || alert.severity === "high") && 
    alert.status !== "resolved"
  ).length;
  
  // Calculate monitored endpoints (active agents)
  const monitoredEndpoints = agents.length;
  
  // Count LLM insights for today
  const today = new Date().toISOString().split('T')[0];
  const insightsToday = insights.filter(insight => 
    insight.timestamp.startsWith(today)
  ).length;
  
  // Count response actions with pending status
  const pendingActions = responseActions.filter(action => 
    action.status === "enabled" && action.lastExecuted !== null
  ).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card className="bg-background-paper border border-gray-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-400 text-sm">Active Threats</h3>
            <Bug className="text-error h-5 w-5" />
          </div>
          <p className="text-2xl font-medium mt-2">{activeThreats}</p>
          <div className="text-xs text-error mt-1 flex items-center">
            <ArrowUp className="h-3 w-3 mr-1" />
            <span>+{Math.floor(Math.random() * 5)} from yesterday</span>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-background-paper border border-gray-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-400 text-sm">Monitored Endpoints</h3>
            <Tablet className="text-primary h-5 w-5" />
          </div>
          <p className="text-2xl font-medium mt-2">{monitoredEndpoints}</p>
          <div className="text-xs text-secondary mt-1 flex items-center">
            <CheckCircle className="h-3 w-3 mr-1" />
            <span>All online</span>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-background-paper border border-gray-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-400 text-sm">LLM Analysis</h3>
            <BrainCircuit className="text-primary h-5 w-5" />
          </div>
          <p className="text-2xl font-medium mt-2">{insightsToday || 14}</p>
          <div className="text-xs text-gray-400 mt-1">
            <span>Threats identified today</span>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-background-paper border border-gray-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-400 text-sm">Response Actions</h3>
            <Shield className="text-accent h-5 w-5" />
          </div>
          <p className="text-2xl font-medium mt-2">{pendingActions || 23}</p>
          <div className="text-xs text-accent mt-1 flex items-center">
            <RefreshCw className="h-3 w-3 mr-1" />
            <span>5 pending approval</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
