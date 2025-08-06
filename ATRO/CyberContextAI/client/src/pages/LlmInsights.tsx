import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import SideNavigation from "@/components/SideNavigation";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import type { LlmInsight } from "@/lib/types";

export default function LlmInsights() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [promptInput, setPromptInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Fetch LLM insights
  const { data: insights, isLoading } = useQuery<LlmInsight[]>({
    queryKey: ['/api/llm-insights'],
    refetchInterval: 30000 // Refetch every 30 seconds
  });
  
  // Function to handle AI analysis submission
  const handleAnalysisSubmit = () => {
    if (!promptInput.trim()) return;
    
    // Simulate analysis process
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setPromptInput("");
      // In a real implementation, this would submit to the backend
    }, 3000);
  };
  
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Side Navigation */}
      <SideNavigation isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto bg-background">
        {/* Header */}
        <Header title="LLM Insights" />
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pt-16 md:pt-6 custom-scrollbar">
          {/* AI Query Interface */}
          <Card className="mb-6 border-primary/40 shadow-glow-sm">
            <CardHeader>
              <CardTitle className="text-glow-blue">Security Intelligence Query</CardTitle>
              <CardDescription>
                Ask the LLM about security patterns, insights, or recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  placeholder="E.g., 'Analyze recent failed authentication patterns' or 'Recommend mitigation for recent network scan attempts'"
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  className="min-h-[100px] bg-background-paper border-gray-700"
                />
                
                <div className="flex justify-end">
                  <Button 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    onClick={handleAnalysisSubmit}
                    disabled={isAnalyzing || !promptInput.trim()}
                  >
                    {isAnalyzing ? (
                      <>
                        <span className="mr-2">Analyzing</span>
                        <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                      </>
                    ) : "Generate Insight"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Recent Insights Tab Interface */}
          <Card>
            <CardHeader>
              <CardTitle className="text-glow-purple">AI-Generated Security Insights</CardTitle>
              <CardDescription>
                LLM analysis of security events and patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="insights" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="insights">Recent Insights</TabsTrigger>
                  <TabsTrigger value="patterns">Detected Patterns</TabsTrigger>
                  <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                </TabsList>
                
                {/* Recent Insights Tab */}
                <TabsContent value="insights">
                  {isLoading ? (
                    <div className="text-center py-8 text-gray-400">
                      Loading insights...
                    </div>
                  ) : insights && insights.length > 0 ? (
                    <div className="space-y-4">
                      {insights.map(insight => (
                        <div key={insight.id} className="p-4 border border-gray-800 rounded-md bg-background-elevated">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="font-medium">{insight.title}</h3>
                            <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30">
                              {insight.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-300 mb-3">{insight.content}</p>
                          <div className="flex justify-between items-center text-xs text-gray-400">
                            <span>Generated: {new Date(insight.createdAt).toLocaleString()}</span>
                            <div className="flex items-center">
                              <span className="mr-2">Confidence:</span>
                              <Progress value={insight.confidence * 100} className="w-24 h-2 bg-gray-800" />
                              <span className="ml-2">{Math.round(insight.confidence * 100)}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 border border-dashed border-gray-800 rounded-md">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-background-paper flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-400 mb-2">No insights yet</h3>
                      <p className="text-sm text-gray-500 max-w-md mx-auto">
                        Use the query interface above to generate new security insights from your data
                      </p>
                    </div>
                  )}
                </TabsContent>
                
                {/* Detected Patterns Tab */}
                <TabsContent value="patterns">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border border-gray-800 rounded-md bg-background-elevated">
                      <h3 className="font-medium mb-2 text-glow-orange">Reconnaissance Activity</h3>
                      <p className="text-sm text-gray-300 mb-3">
                        Pattern of port scanning from multiple IPs originating from same ASN, suggesting coordinated probing.
                      </p>
                      <div className="flex justify-between items-center text-xs text-gray-400">
                        <span>First observed: 2 days ago</span>
                        <Badge variant="outline" className="bg-warning/20 text-warning border-warning/30">
                          Medium confidence
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="p-4 border border-gray-800 rounded-md bg-background-elevated">
                      <h3 className="font-medium mb-2 text-glow-red">Credential Stuffing</h3>
                      <p className="text-sm text-gray-300 mb-3">
                        Multiple failed login attempts with various usernames following a similar pattern across authentication endpoints.
                      </p>
                      <div className="flex justify-between items-center text-xs text-gray-400">
                        <span>First observed: 6 hours ago</span>
                        <Badge variant="outline" className="bg-error/20 text-error border-error/30">
                          High confidence
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="p-4 border border-gray-800 rounded-md bg-background-elevated">
                      <h3 className="font-medium mb-2 text-glow-blue">Data Exfiltration Attempt</h3>
                      <p className="text-sm text-gray-300 mb-3">
                        Unusual outbound traffic patterns consistent with staged data transfer to external untrusted domains.
                      </p>
                      <div className="flex justify-between items-center text-xs text-gray-400">
                        <span>First observed: 3 days ago</span>
                        <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30">
                          Medium confidence
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="p-4 border border-gray-800 rounded-md bg-background-elevated">
                      <h3 className="font-medium mb-2 text-glow-teal">Lateral Movement</h3>
                      <p className="text-sm text-gray-300 mb-3">
                        Sequential login patterns suggest potential compromised credential being used across multiple systems.
                      </p>
                      <div className="flex justify-between items-center text-xs text-gray-400">
                        <span>First observed: 1 day ago</span>
                        <Badge variant="outline" className="bg-secondary/20 text-secondary border-secondary/30">
                          Low confidence
                        </Badge>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Recommendations Tab */}
                <TabsContent value="recommendations">
                  <div className="space-y-4">
                    <div className="p-4 border border-gray-800 rounded-md bg-background-elevated">
                      <h3 className="font-medium mb-2 text-glow-teal">Update Authentication Policy</h3>
                      <p className="text-sm text-gray-300 mb-3">
                        Implement multi-factor authentication for all admin accounts and enforce stronger password requirements based on observed breach patterns.
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30">
                          Priority: High
                        </Badge>
                        <Button variant="outline" size="sm">Implement</Button>
                      </div>
                    </div>
                    
                    <div className="p-4 border border-gray-800 rounded-md bg-background-elevated">
                      <h3 className="font-medium mb-2 text-glow-blue">Improve Network Segmentation</h3>
                      <p className="text-sm text-gray-300 mb-3">
                        Create additional network segments to isolate critical assets and prevent lateral movement based on recent threat activity.
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30">
                          Priority: Medium
                        </Badge>
                        <Button variant="outline" size="sm">Implement</Button>
                      </div>
                    </div>
                    
                    <div className="p-4 border border-gray-800 rounded-md bg-background-elevated">
                      <h3 className="font-medium mb-2 text-glow-purple">Enhance Endpoint Detection</h3>
                      <p className="text-sm text-gray-300 mb-3">
                        Deploy additional endpoint detection rules targeting the specific malware variants identified in recent threat intelligence.
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30">
                          Priority: High
                        </Badge>
                        <Button variant="outline" size="sm">Implement</Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}