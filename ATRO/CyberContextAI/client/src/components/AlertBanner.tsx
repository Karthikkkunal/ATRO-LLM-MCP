import { useState } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { sendWebSocketMessage } from "@/lib/socket";
import { queryClient } from "@/lib/queryClient";
import type { Alert as AlertType } from "@/lib/types";

interface AlertBannerProps {
  alert: AlertType;
  onDismiss: () => void;
}

export default function AlertBanner({ alert, onDismiss }: AlertBannerProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBlockIP = async () => {
    setIsProcessing(true);
    try {
      // Create a response action for blocking IP
      const ipAddress = getIPFromDescription(alert.description);
      if (ipAddress) {
        await apiRequest("POST", "/api/response-actions", {
          name: `Block IP ${ipAddress}`,
          trigger: alert.title,
          status: "enabled",
          lastExecuted: new Date().toISOString(),
          metadata: { alertId: alert.id, ipAddress }
        });
        
        // Update alert status to in_progress
        await apiRequest("PATCH", `/api/alerts/${alert.id}`, {
          status: "in_progress"
        });
        
        // Send WebSocket message
        sendWebSocketMessage("toggle_response_action", { id: alert.id, status: "in_progress" });
        
        // Invalidate queries
        queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
        queryClient.invalidateQueries({ queryKey: ['/api/response-actions'] });
        
        // Dismiss the alert banner
        onDismiss();
      }
    } catch (error) {
      console.error("Error blocking IP:", error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleInvestigate = () => {
    // This would typically navigate to a detailed view or open a dialog
    // For now, just dismiss the alert banner
    onDismiss();
  };
  
  // Extract IP address from alert description (if present)
  const getIPFromDescription = (description: string): string | null => {
    const ipRegex = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/;
    const match = description.match(ipRegex);
    return match ? match[0] : null;
  };

  return (
    <Alert className="mb-6 bg-error bg-opacity-10 border-l-4 border-error">
      <div className="flex items-start">
        <AlertTriangle className="h-5 w-5 text-error mr-3 mt-0.5" />
        <div className="flex-1">
          <AlertTitle className="font-medium text-error">{alert.title}</AlertTitle>
          <AlertDescription className="text-sm text-gray-300">{alert.description}</AlertDescription>
          <div className="mt-2 flex items-center">
            <Button 
              className="px-4 py-1 bg-error text-white text-sm rounded mr-2"
              onClick={handleBlockIP}
              disabled={isProcessing}
            >
              Block IP
            </Button>
            <Button 
              variant="secondary"
              className="px-4 py-1 bg-background-elevated text-gray-300 text-sm rounded"
              onClick={handleInvestigate}
            >
              Investigate
            </Button>
          </div>
        </div>
      </div>
    </Alert>
  );
}
