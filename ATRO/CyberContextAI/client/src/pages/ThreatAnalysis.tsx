import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import SideNavigation from "@/components/SideNavigation";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import ThreatMap from "@/components/ThreatMap";

import type { Alert, Incident } from "@/lib/types";

export default function ThreatAnalysis() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Fetch alerts
  const { data: alerts, isLoading: alertsLoading } = useQuery<Alert[]>({
    queryKey: ['/api/alerts'],
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  // Fetch incidents
  const { data: incidents, isLoading: incidentsLoading } = useQuery<Incident[]>({
    queryKey: ['/api/incidents'],
    refetchInterval: 30000
  });
  
  // Calculate severity metrics
  const calculateSeverityMetrics = () => {
    if (!alerts) return { critical: 0, high: 0, medium: 0, low: 0, total: 0 };
    
    return alerts.reduce((acc, alert) => {
      acc.total++;
      acc[alert.severity as keyof typeof acc]++;
      return acc;
    }, { critical: 0, high: 0, medium: 0, low: 0, total: 0 });
  };
  
  const metrics = calculateSeverityMetrics();
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-error";
      case "high": return "bg-warning";
      case "medium": return "bg-accent";
      case "low": return "bg-info";
      default: return "bg-primary";
    }
  };
  
  const getSeverityPercentage = (severity: string) => {
    if (metrics.total === 0) return 0;
    return (metrics[severity as keyof typeof metrics] / metrics.total) * 100;
  };
  
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Side Navigation */}
      <SideNavigation isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto bg-background">
        {/* Header */}
        <Header title="Threat Analysis" />
        
        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pt-16 md:pt-6 custom-scrollbar">
          <div className="mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-glow-teal">Threat Surface Overview</CardTitle>
                <CardDescription>Visual representation of active threats in your environment</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ThreatMap fullSize />
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-glow-purple">Severity Distribution</CardTitle>
                <CardDescription>Breakdown of current alerts by severity level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Critical</span>
                      <span className="text-xs text-glow-red">{metrics.critical} alerts</span>
                    </div>
                    <Progress value={getSeverityPercentage("critical")} className="h-2 bg-gray-800" indicatorClassName="bg-error" />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">High</span>
                      <span className="text-xs text-glow-orange">{metrics.high} alerts</span>
                    </div>
                    <Progress value={getSeverityPercentage("high")} className="h-2 bg-gray-800" indicatorClassName="bg-warning" />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Medium</span>
                      <span className="text-xs text-glow-yellow">{metrics.medium} alerts</span>
                    </div>
                    <Progress value={getSeverityPercentage("medium")} className="h-2 bg-gray-800" indicatorClassName="bg-accent" />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Low</span>
                      <span className="text-xs text-glow-blue">{metrics.low} alerts</span>
                    </div>
                    <Progress value={getSeverityPercentage("low")} className="h-2 bg-gray-800" indicatorClassName="bg-info" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-glow-blue">Timeline Analysis</CardTitle>
                <CardDescription>Recent security events timeline view</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="alerts">
                  <TabsList className="mb-4">
                    <TabsTrigger value="alerts">Alerts</TabsTrigger>
                    <TabsTrigger value="incidents">Incidents</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="alerts" className="space-y-4 max-h-64 overflow-y-auto custom-scrollbar">
                    {alertsLoading ? (
                      <div className="text-center py-6 text-gray-400">Loading alerts...</div>
                    ) : alerts && alerts.length > 0 ? (
                      alerts.map(alert => (
                        <div key={alert.id} className="flex items-start p-3 border border-gray-800 rounded-md bg-background-elevated">
                          <div className={`w-2 h-2 rounded-full mt-1.5 ${getSeverityColor(alert.severity)} mr-3`}></div>
                          <div>
                            <h4 className="text-sm font-medium">{alert.title}</h4>
                            <p className="text-xs text-gray-400 mt-1">{new Date(alert.createdAt).toLocaleString()}</p>
                            <p className="text-xs mt-2">{alert.description}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-gray-400">No alerts detected</div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="incidents" className="space-y-4 max-h-64 overflow-y-auto custom-scrollbar">
                    {incidentsLoading ? (
                      <div className="text-center py-6 text-gray-400">Loading incidents...</div>
                    ) : incidents && incidents.length > 0 ? (
                      incidents.map(incident => (
                        <div key={incident.id} className="flex items-start p-3 border border-gray-800 rounded-md bg-background-elevated">
                          <div className={`w-2 h-2 rounded-full mt-1.5 ${getSeverityColor(incident.severity)} mr-3`}></div>
                          <div>
                            <h4 className="text-sm font-medium">{incident.title}</h4>
                            <p className="text-xs text-gray-400 mt-1">{new Date(incident.createdAt).toLocaleString()}</p>
                            <p className="text-xs mt-2">{incident.description}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-gray-400">No incidents found</div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          <div className="mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-glow-orange">MITRE ATT&CK Coverage</CardTitle>
                <CardDescription>Threat coverage based on MITRE ATT&CK framework</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border border-gray-800 rounded-md bg-background-elevated">
                    <h3 className="text-sm font-medium mb-2">Initial Access</h3>
                    <div className="flex items-center">
                      <Progress value={75} className="h-2 bg-gray-800 flex-grow" indicatorClassName="bg-blue-500" />
                      <span className="text-xs ml-2">75%</span>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-gray-800 rounded-md bg-background-elevated">
                    <h3 className="text-sm font-medium mb-2">Execution</h3>
                    <div className="flex items-center">
                      <Progress value={83} className="h-2 bg-gray-800 flex-grow" indicatorClassName="bg-purple-500" />
                      <span className="text-xs ml-2">83%</span>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-gray-800 rounded-md bg-background-elevated">
                    <h3 className="text-sm font-medium mb-2">Persistence</h3>
                    <div className="flex items-center">
                      <Progress value={60} className="h-2 bg-gray-800 flex-grow" indicatorClassName="bg-teal-500" />
                      <span className="text-xs ml-2">60%</span>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-gray-800 rounded-md bg-background-elevated">
                    <h3 className="text-sm font-medium mb-2">Privilege Escalation</h3>
                    <div className="flex items-center">
                      <Progress value={68} className="h-2 bg-gray-800 flex-grow" indicatorClassName="bg-red-500" />
                      <span className="text-xs ml-2">68%</span>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-gray-800 rounded-md bg-background-elevated">
                    <h3 className="text-sm font-medium mb-2">Defense Evasion</h3>
                    <div className="flex items-center">
                      <Progress value={72} className="h-2 bg-gray-800 flex-grow" indicatorClassName="bg-orange-500" />
                      <span className="text-xs ml-2">72%</span>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-gray-800 rounded-md bg-background-elevated">
                    <h3 className="text-sm font-medium mb-2">Exfiltration</h3>
                    <div className="flex items-center">
                      <Progress value={78} className="h-2 bg-gray-800 flex-grow" indicatorClassName="bg-pink-500" />
                      <span className="text-xs ml-2">78%</span>
                    </div>
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