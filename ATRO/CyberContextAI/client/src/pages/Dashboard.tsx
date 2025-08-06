import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import SideNavigation from "@/components/SideNavigation";
import Header from "@/components/Header";
import StatsOverview from "@/components/StatsOverview";
import AlertBanner from "@/components/AlertBanner";
import ThreatMap from "@/components/ThreatMap";
import LLMInsights from "@/components/LLMInsights";
import LogDisplay from "@/components/LogDisplay";
import ActiveIncidents from "@/components/ActiveIncidents";
import ModelContextStatus from "@/components/ModelContextStatus";
import ResponseActions from "@/components/ResponseActions";
import { sendWebSocketMessage, addEventListener, removeEventListener } from "@/lib/socket";
import type { Alert } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [criticalAlert, setCriticalAlert] = useState<Alert | null>(null);
  const { toast } = useToast();
  
  // Fetch alerts to check for critical ones
  const { data: alerts } = useQuery<Alert[]>({
    queryKey: ['/api/alerts'],
    refetchInterval: 30000 // Refetch every 30 seconds
  });
  
  // Set critical alert when alerts data changes
  useEffect(() => {
    if (alerts && alerts.length > 0) {
      const critical = alerts.find(
        alert => alert.severity === "critical" && alert.status === "new"
      );
      
      if (critical) {
        setCriticalAlert(critical);
      }
    }
  }, [alerts]);
  
  // Listen for new alerts via WebSocket
  useEffect(() => {
    const handleNewAlert = (alert: Alert) => {
      if (alert.severity === "critical") {
        setCriticalAlert(alert);
        toast({
          title: "Critical Alert",
          description: alert.title,
          variant: "destructive"
        });
      }
    };
    
    addEventListener("new_alert", handleNewAlert);
    
    return () => {
      removeEventListener("new_alert", handleNewAlert);
    };
  }, [toast]);
  
  // Start agents when dashboard loads
  useEffect(() => {
    // Wait a bit before starting agents to ensure connection is established
    const timer = setTimeout(() => {
      sendWebSocketMessage("start_agents");
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Side Navigation */}
      <SideNavigation isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 w-full bg-background-paper border-b border-gray-800 z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center mr-2">
              <span className="material-icons text-white text-sm">security</span>
            </div>
            <h1 className="text-lg font-medium text-white">ATRO-Lite</h1>
          </div>
          <button
            className="p-1"
            aria-label="Open menu"
            onClick={toggleMobileMenu}
          >
            <span className="material-icons text-gray-400">menu</span>
          </button>
        </div>
      </div>
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-y-hidden bg-background">
        {/* Header */}
        <Header />
        
        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pt-16 md:pt-6 custom-scrollbar">
          {/* Alert Banner */}
          {criticalAlert && (
            <AlertBanner
              alert={criticalAlert}
              onDismiss={() => setCriticalAlert(null)}
            />
          )}
          
          {/* Stats Overview */}
          <StatsOverview />
          
          {/* Main Dashboard Grid */}
          <div className="dashboard-grid mb-6">
            <ThreatMap />
            <LLMInsights />
            <LogDisplay />
            <ActiveIncidents />
            <ModelContextStatus />
          </div>
          
          {/* Response Actions */}
          <ResponseActions />
        </div>
      </main>
    </div>
  );
}
