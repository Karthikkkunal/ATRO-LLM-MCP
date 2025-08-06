import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { sendWebSocketMessage } from "@/lib/socket";
import type { ResponseAction } from "@/lib/types";

export default function ResponseActions() {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState<number | null>(null);
  const [isCreatingAction, setIsCreatingAction] = useState(false);
  
  // Fetch response actions
  const { data: actions = [], isLoading } = useQuery<ResponseAction[]>({
    queryKey: ['/api/response-actions'],
  });
  
  const handleToggleAction = async (id: number, currentStatus: string) => {
    setIsProcessing(id);
    
    try {
      const newStatus = currentStatus === "enabled" ? "disabled" : "enabled";
      
      // Update action via API
      await apiRequest("PATCH", `/api/response-actions/${id}`, {
        status: newStatus
      });
      
      // Send WebSocket message
      sendWebSocketMessage("toggle_response_action", { id, status: newStatus });
      
      // Invalidate query
      queryClient.invalidateQueries({ queryKey: ['/api/response-actions'] });
      
      toast({
        title: `Action ${newStatus === "enabled" ? "Enabled" : "Disabled"}`,
        description: `The response action has been ${newStatus}`,
        variant: "default"
      });
    } catch (error) {
      console.error("Error toggling action:", error);
      toast({
        title: "Operation Failed",
        description: "Failed to update response action status",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(null);
    }
  };
  
  const handleNewAction = () => {
    setIsCreatingAction(true);
    
    // In a real app, this would open a form modal
    // For this demo, just show a toast
    toast({
      title: "Feature Not Implemented",
      description: "The 'New Response Action' feature would open a form to create a custom response action.",
      variant: "default"
    });
    
    setIsCreatingAction(false);
  };

  return (
    <Card className="bg-background-paper rounded-md border border-gray-800 mb-6">
      <CardHeader className="p-4 border-b border-gray-800">
        <CardTitle className="text-base font-medium">Automated Response Actions</CardTitle>
      </CardHeader>
      
      <CardContent className="p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-32 text-gray-400">
            Loading response actions...
          </div>
        ) : actions.length === 0 ? (
          <div className="flex justify-center items-center h-32 text-gray-400">
            No response actions configured
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left text-gray-400">
                <th className="pb-3">Action</th>
                <th className="pb-3 hidden md:table-cell">Trigger</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 hidden sm:table-cell">Last Executed</th>
                <th className="pb-3 text-right">Control</th>
              </tr>
            </thead>
            <tbody>
              {actions.map((action) => (
                <tr key={action.id} className="border-b border-gray-800">
                  <td className="py-3">
                    <div className="font-medium">{action.name}</div>
                    <div className="text-xs text-gray-400 hidden sm:block md:hidden">
                      Triggered by: {action.trigger}
                    </div>
                  </td>
                  <td className="hidden md:table-cell">{action.trigger}</td>
                  <td>
                    <span className={`px-2 py-0.5 ${action.status === "enabled" 
                      ? "bg-secondary bg-opacity-20 text-secondary" 
                      : "bg-gray-600 bg-opacity-30 text-gray-300"} text-xs rounded-full`}
                    >
                      {action.status === "enabled" ? "Enabled" : "Disabled"}
                    </span>
                  </td>
                  <td className="hidden sm:table-cell text-gray-400">
                    {action.lastExecuted 
                      ? new Date(action.lastExecuted).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : "Never"}
                  </td>
                  <td className="text-right">
                    <Button
                      className={`px-3 py-1 ${action.status === "enabled" 
                        ? "bg-background-elevated text-gray-300" 
                        : "bg-primary text-white"} text-xs rounded`}
                      disabled={isProcessing === action.id}
                      onClick={() => handleToggleAction(action.id, action.status)}
                    >
                      {action.status === "enabled" ? "Disable" : "Enable"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
      
      <div className="p-4 border-t border-gray-800 flex justify-between items-center">
        <div className="text-sm">
          <span className="text-gray-400">Automated Response Status:</span>
          <span className="text-secondary ml-2">Active</span>
        </div>
        <Button 
          className="px-4 py-2 bg-primary text-white text-sm rounded flex items-center"
          onClick={handleNewAction}
          disabled={isCreatingAction}
        >
          <Plus className="h-4 w-4 mr-1" />
          New Response Action
        </Button>
      </div>
    </Card>
  );
}
