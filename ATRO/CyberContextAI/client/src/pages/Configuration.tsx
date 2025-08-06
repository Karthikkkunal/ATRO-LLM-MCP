import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import SideNavigation from "@/components/SideNavigation";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { Agent, ResponseAction } from "@/lib/types";

export default function Configuration() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toast } = useToast();
  
  // Fetch agents
  const { data: agents, isLoading: agentsLoading } = useQuery<Agent[]>({
    queryKey: ['/api/agents']
  });
  
  // Fetch response actions
  const { data: responseActions, isLoading: actionsLoading } = useQuery<ResponseAction[]>({
    queryKey: ['/api/response-actions']
  });
  
  // Mutation for updating agent
  const updateAgentMutation = useMutation({
    mutationFn: async (agent: Partial<Agent>) => {
      return fetch(`/api/agents/${agent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agent)
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agents'] });
      toast({
        title: "Agent updated",
        description: "Agent configuration has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "There was an error updating the agent configuration.",
        variant: "destructive"
      });
    }
  });
  
  // Mutation for updating response action
  const updateActionMutation = useMutation({
    mutationFn: async (action: Partial<ResponseAction>) => {
      return fetch(`/api/response-actions/${action.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action)
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/response-actions'] });
      toast({
        title: "Response action updated",
        description: "Response action configuration has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "There was an error updating the response action.",
        variant: "destructive"
      });
    }
  });
  
  const handleAgentToggle = (agent: Agent) => {
    updateAgentMutation.mutate({
      id: agent.id,
      isActive: !agent.isActive
    });
  };
  
  const handleActionToggle = (action: ResponseAction) => {
    updateActionMutation.mutate({
      id: action.id,
      isAutomated: !action.isAutomated
    });
  };
  
  const getAgentStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-secondary text-secondary-foreground">Active</Badge>;
      case "warning":
        return <Badge className="bg-warning text-warning-foreground">Warning</Badge>;
      case "error":
        return <Badge className="bg-error text-error-foreground">Error</Badge>;
      default:
        return <Badge className="bg-gray-500">Inactive</Badge>;
    }
  };
  
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Side Navigation */}
      <SideNavigation isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto bg-background">
        {/* Header */}
        <Header title="System Configuration" />
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pt-16 md:pt-6 custom-scrollbar">
          <Tabs defaultValue="agents" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="agents">Agent Configuration</TabsTrigger>
              <TabsTrigger value="responses">Response Actions</TabsTrigger>
              <TabsTrigger value="integration">API & Integration</TabsTrigger>
              <TabsTrigger value="system">System Settings</TabsTrigger>
            </TabsList>
            
            {/* Agent Configuration Tab */}
            <TabsContent value="agents">
              <Card>
                <CardHeader>
                  <CardTitle className="text-glow-blue">Security Agent Management</CardTitle>
                  <CardDescription>
                    Configure and control security monitoring agents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {agentsLoading ? (
                    <div className="text-center py-8 text-gray-400">
                      Loading agent configurations...
                    </div>
                  ) : agents && agents.length > 0 ? (
                    <div className="space-y-6">
                      {agents.map(agent => (
                        <div key={agent.id} className="p-4 border border-gray-800 rounded-md bg-background-elevated">
                          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">{agent.name}</h3>
                                {getAgentStatusBadge(agent.status)}
                              </div>
                              <p className="text-sm text-gray-400 mt-1">{agent.description}</p>
                            </div>
                            <div className="flex items-center mt-4 md:mt-0">
                              <Switch 
                                checked={agent.isActive}
                                onCheckedChange={() => handleAgentToggle(agent)}
                                className="mr-2"
                              />
                              <Label>{agent.isActive ? 'Enabled' : 'Disabled'}</Label>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`refreshInterval-${agent.id}`} className="text-sm mb-2 block">
                                Refresh Interval (seconds)
                              </Label>
                              <Input
                                id={`refreshInterval-${agent.id}`}
                                type="number"
                                defaultValue={agent.refreshInterval || 60}
                                min={10}
                                className="bg-background-paper border-gray-700"
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor={`threshold-${agent.id}`} className="text-sm mb-2 block">
                                Alert Threshold
                              </Label>
                              <Input
                                id={`threshold-${agent.id}`}
                                type="number"
                                defaultValue={agent.threshold || 80}
                                min={0}
                                max={100}
                                className="bg-background-paper border-gray-700"
                              />
                            </div>
                          </div>
                          
                          <div className="flex justify-end mt-4">
                            <Button 
                              variant="outline" 
                              className="mr-2"
                              onClick={() => {
                                // Reset configuration
                                toast({
                                  title: "Configuration reset",
                                  description: `${agent.name} settings have been reset to defaults.`
                                });
                              }}
                            >
                              Reset
                            </Button>
                            <Button
                              onClick={() => {
                                // Save configuration
                                toast({
                                  title: "Configuration saved",
                                  description: `${agent.name} settings have been updated.`
                                });
                              }}
                            >
                              Save Changes
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 border border-dashed border-gray-800 rounded-md">
                      <h3 className="text-lg font-medium text-gray-400 mb-2">No agents configured</h3>
                      <p className="text-sm text-gray-500 max-w-md mx-auto mb-4">
                        No security monitoring agents have been configured yet
                      </p>
                      <Button>Add New Agent</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Response Actions Tab */}
            <TabsContent value="responses">
              <Card>
                <CardHeader>
                  <CardTitle className="text-glow-teal">Response Action Configuration</CardTitle>
                  <CardDescription>
                    Configure automated response actions for security incidents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {actionsLoading ? (
                    <div className="text-center py-8 text-gray-400">
                      Loading response actions...
                    </div>
                  ) : responseActions && responseActions.length > 0 ? (
                    <div className="space-y-4">
                      {responseActions.map(action => (
                        <div key={action.id} className="p-4 border border-gray-800 rounded-md bg-background-elevated">
                          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                            <div>
                              <h3 className="font-medium">{action.name}</h3>
                              <p className="text-sm text-gray-400 mt-1">{action.description}</p>
                            </div>
                            <div className="flex items-center mt-4 md:mt-0">
                              <Switch 
                                checked={action.isAutomated}
                                onCheckedChange={() => handleActionToggle(action)}
                                className="mr-2"
                              />
                              <Label>{action.isAutomated ? 'Automated' : 'Manual'}</Label>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                              <Label htmlFor={`triggerThreshold-${action.id}`} className="text-sm mb-2 block">
                                Trigger Threshold (severity)
                              </Label>
                              <select 
                                id={`triggerThreshold-${action.id}`}
                                className="w-full bg-background-paper border border-gray-700 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                defaultValue={action.triggerThreshold || "high"}
                              >
                                <option value="critical">Critical</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                              </select>
                            </div>
                            
                            <div>
                              <Label htmlFor={`cooldown-${action.id}`} className="text-sm mb-2 block">
                                Cooldown Period (minutes)
                              </Label>
                              <Input
                                id={`cooldown-${action.id}`}
                                type="number"
                                defaultValue={action.cooldownPeriod || 30}
                                min={1}
                                className="bg-background-paper border-gray-700"
                              />
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <Label htmlFor={`command-${action.id}`} className="text-sm mb-2 block">
                              Action Command/Script
                            </Label>
                            <Textarea
                              id={`command-${action.id}`}
                              defaultValue={action.command || ""}
                              className="font-mono text-xs bg-background-paper border-gray-700 h-24"
                            />
                          </div>
                          
                          <div className="flex justify-end mt-4">
                            <Button variant="outline" className="mr-2">Test Action</Button>
                            <Button>Save Changes</Button>
                          </div>
                        </div>
                      ))}
                      
                      <div className="flex justify-end mt-6">
                        <Button>
                          Add New Response Action
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 border border-dashed border-gray-800 rounded-md">
                      <h3 className="text-lg font-medium text-gray-400 mb-2">No response actions configured</h3>
                      <p className="text-sm text-gray-500 max-w-md mx-auto mb-4">
                        Configure automated or manual response actions to security incidents
                      </p>
                      <Button>Add Response Action</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* API & Integration Tab */}
            <TabsContent value="integration">
              <Card>
                <CardHeader>
                  <CardTitle className="text-glow-purple">API & External Integrations</CardTitle>
                  <CardDescription>
                    Configure API settings and external service integrations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* OpenAI API Configuration */}
                    <div className="p-4 border border-gray-800 rounded-md bg-background-elevated">
                      <h3 className="font-medium mb-4">OpenAI API Configuration</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="openai-api-key" className="text-sm mb-2 block">
                            API Key
                          </Label>
                          <div className="flex">
                            <Input
                              id="openai-api-key"
                              type="password"
                              placeholder="••••••••••••••••••••••"
                              className="bg-background-paper border-gray-700 flex-grow"
                            />
                            <Button variant="outline" className="ml-2">Update</Button>
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="openai-model" className="text-sm mb-2 block">
                            Default Model
                          </Label>
                          <select 
                            id="openai-model"
                            className="w-full bg-background-paper border border-gray-700 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            defaultValue="gpt-4o"
                          >
                            <option value="gpt-4o">GPT-4o (Latest)</option>
                            <option value="gpt-4-turbo">GPT-4 Turbo</option>
                            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                          </select>
                        </div>
                        
                        <div className="flex items-center">
                          <Switch id="enable-llm" defaultChecked className="mr-2" />
                          <Label htmlFor="enable-llm">Enable LLM analysis</Label>
                        </div>
                      </div>
                    </div>
                    
                    {/* MCP Configuration */}
                    <div className="p-4 border border-gray-800 rounded-md bg-background-elevated">
                      <h3 className="font-medium mb-4">Model Context Protocol (MCP)</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="redis-url" className="text-sm mb-2 block">
                            Redis Connection URL
                          </Label>
                          <Input
                            id="redis-url"
                            placeholder="redis://localhost:6379"
                            className="bg-background-paper border-gray-700"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="context-ttl" className="text-sm mb-2 block">
                            Context TTL (hours)
                          </Label>
                          <Input
                            id="context-ttl"
                            type="number"
                            defaultValue={24}
                            min={1}
                            className="bg-background-paper border-gray-700"
                          />
                        </div>
                        
                        <div className="flex items-center">
                          <Switch id="enable-mcp" defaultChecked className="mr-2" />
                          <Label htmlFor="enable-mcp">Enable MCP</Label>
                        </div>
                      </div>
                    </div>
                    
                    {/* External Integrations */}
                    <div className="p-4 border border-gray-800 rounded-md bg-background-elevated">
                      <h3 className="font-medium mb-4">External Integrations</h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 border border-gray-700 rounded-md">
                          <div>
                            <h4 className="font-medium">Slack Integration</h4>
                            <p className="text-xs text-gray-400">Send alerts to Slack channels</p>
                          </div>
                          <Switch defaultChecked={false} />
                        </div>
                        
                        <div className="flex items-center justify-between p-3 border border-gray-700 rounded-md">
                          <div>
                            <h4 className="font-medium">Email Notifications</h4>
                            <p className="text-xs text-gray-400">Send critical alerts via email</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between p-3 border border-gray-700 rounded-md">
                          <div>
                            <h4 className="font-medium">SIEM Integration</h4>
                            <p className="text-xs text-gray-400">Forward logs to external SIEM</p>
                          </div>
                          <Switch defaultChecked={false} />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button variant="outline" className="mr-2">
                        Test Connections
                      </Button>
                      <Button>
                        Save Integration Settings
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* System Settings Tab */}
            <TabsContent value="system">
              <Card>
                <CardHeader>
                  <CardTitle className="text-glow-orange">System Settings</CardTitle>
                  <CardDescription>
                    Configure general system settings and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Log Settings */}
                    <div className="p-4 border border-gray-800 rounded-md bg-background-elevated">
                      <h3 className="font-medium mb-4">Log Configuration</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="log-retention" className="text-sm mb-2 block">
                            Log Retention Period (days)
                          </Label>
                          <Input
                            id="log-retention"
                            type="number"
                            defaultValue={30}
                            min={1}
                            className="bg-background-paper border-gray-700"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="log-level" className="text-sm mb-2 block">
                            Default Log Level
                          </Label>
                          <select 
                            id="log-level"
                            className="w-full bg-background-paper border border-gray-700 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            defaultValue="info"
                          >
                            <option value="error">Error</option>
                            <option value="warning">Warning</option>
                            <option value="info">Info</option>
                            <option value="debug">Debug</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <div className="flex items-center">
                          <Switch id="enable-verbose" defaultChecked={false} className="mr-2" />
                          <Label htmlFor="enable-verbose">Enable verbose logging</Label>
                        </div>
                      </div>
                    </div>
                    
                    {/* Incident Settings */}
                    <div className="p-4 border border-gray-800 rounded-md bg-background-elevated">
                      <h3 className="font-medium mb-4">Incident Management</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="auto-incident" className="text-sm mb-2 block">
                            Auto-create incidents from
                          </Label>
                          <select 
                            id="auto-incident"
                            className="w-full bg-background-paper border border-gray-700 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            defaultValue="critical"
                          >
                            <option value="critical">Critical alerts only</option>
                            <option value="high">High and Critical alerts</option>
                            <option value="all">All alerts</option>
                            <option value="none">Never (manual only)</option>
                          </select>
                        </div>
                        
                        <div className="flex items-center">
                          <Switch id="auto-assign" defaultChecked className="mr-2" />
                          <Label htmlFor="auto-assign">Auto-assign incidents</Label>
                        </div>
                      </div>
                    </div>
                    
                    {/* UI Settings */}
                    <div className="p-4 border border-gray-800 rounded-md bg-background-elevated">
                      <h3 className="font-medium mb-4">Interface Settings</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="refresh-interval" className="text-sm mb-2 block">
                            Dashboard Refresh Interval (seconds)
                          </Label>
                          <Input
                            id="refresh-interval"
                            type="number"
                            defaultValue={30}
                            min={5}
                            className="bg-background-paper border-gray-700"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="theme-mode" className="text-sm mb-2 block">
                            Theme Mode
                          </Label>
                          <select 
                            id="theme-mode"
                            className="w-full bg-background-paper border border-gray-700 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            defaultValue="dark"
                          >
                            <option value="dark">Dark (Cyber)</option>
                            <option value="light">Light</option>
                            <option value="system">System Default</option>
                          </select>
                        </div>
                        
                        <div className="flex items-center">
                          <Switch id="enable-animations" defaultChecked className="mr-2" />
                          <Label htmlFor="enable-animations">Enable animations</Label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end mt-6">
                      <Button variant="outline" className="mr-2">Reset to Defaults</Button>
                      <Button>Save System Settings</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}