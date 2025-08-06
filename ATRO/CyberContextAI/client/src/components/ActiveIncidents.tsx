import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { Incident } from "@/lib/types";

export default function ActiveIncidents() {
  const { toast } = useToast();
  const [isCreatingIncident, setIsCreatingIncident] = useState(false);
  
  // Fetch incidents
  const { data: incidents = [], isLoading } = useQuery<Incident[]>({
    queryKey: ['/api/incidents'],
  });
  
  const handleNewIncident = () => {
    setIsCreatingIncident(true);
    
    // In a real app, this would open a form modal
    // For this demo, just show a toast
    toast({
      title: "Feature Not Implemented",
      description: "The 'New Incident' feature would open a form to create a manual incident.",
      variant: "default"
    });
    
    setIsCreatingIncident(false);
  };
  
  const handleViewDetails = (incidentId: string) => {
    // In a real app, this would navigate to incident details page
    // For this demo, just show a toast
    toast({
      title: "Viewing Incident Details",
      description: `Navigating to details for incident ${incidentId}`,
      variant: "default"
    });
  };
  
  const handleInvestigate = (incidentId: string) => {
    // In a real app, this would navigate to investigation page
    // For this demo, just show a toast
    toast({
      title: "Investigating Incident",
      description: `Starting investigation for incident ${incidentId}`,
      variant: "default"
    });
  };
  
  // Function to get status badge style
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return "bg-error bg-opacity-20 text-error";
      case "in_progress":
        return "bg-accent bg-opacity-20 text-accent";
      case "contained":
        return "bg-secondary bg-opacity-20 text-secondary";
      case "closed":
        return "bg-gray-600 bg-opacity-30 text-gray-300";
      default:
        return "bg-gray-600 bg-opacity-30 text-gray-300";
    }
  };
  
  // Function to get severity indicator style
  const getSeverityIndicator = (type: string) => {
    if (type.toLowerCase().includes("data exfiltration") || 
        type.toLowerCase().includes("breach") ||
        type.toLowerCase().includes("ransomware")) {
      return "bg-error";
    } else if (type.toLowerCase().includes("brute force") || 
               type.toLowerCase().includes("malware")) {
      return "bg-accent";
    } else {
      return "bg-primary";
    }
  };

  return (
    <Card className="bg-background-paper border border-gray-800 col-span-full lg:col-span-2 h-80">
      <CardHeader className="p-4 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-medium">Active Incidents</CardTitle>
        <Button 
          className="bg-primary text-white text-sm rounded-md flex items-center h-8"
          onClick={handleNewIncident}
          disabled={isCreatingIncident}
        >
          <Plus className="h-4 w-4 mr-1" />
          New Incident
        </Button>
      </CardHeader>
      
      <CardContent className="p-0 px-4 pb-4">
        <div className="h-64 overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="flex justify-center items-center h-full text-gray-400">
              Loading incidents...
            </div>
          ) : incidents.length === 0 ? (
            <div className="flex justify-center items-center h-full text-gray-400">
              No active incidents
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-left text-gray-400">
                  <th className="pb-2">ID</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2 hidden sm:table-cell">Source</th>
                  <th className="pb-2 hidden md:table-cell">Time</th>
                  <th className="pb-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((incident) => (
                  <tr key={incident.id} className="border-b border-gray-800">
                    <td className="py-3 font-medium">{incident.incidentId}</td>
                    <td>
                      <span className="flex items-center">
                        <span className={`severity-indicator inline-block w-3 h-3 rounded-full mr-2 ${getSeverityIndicator(incident.type)}`}></span>
                        {incident.type}
                      </span>
                    </td>
                    <td>
                      <span className={`px-2 py-0.5 ${getStatusBadge(incident.status)} text-xs rounded-full`}>
                        {incident.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="hidden sm:table-cell">{incident.source}</td>
                    <td className="hidden md:table-cell text-gray-400">
                      {new Date(incident.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="text-right">
                      <Button 
                        variant="link"
                        className="text-primary hover:underline text-xs p-0 h-auto" 
                        onClick={() => 
                          incident.status === "closed" || incident.status === "contained" 
                            ? handleViewDetails(incident.incidentId)
                            : handleInvestigate(incident.incidentId)
                        }
                      >
                        {incident.status === "closed" || incident.status === "contained" 
                          ? "View Details" 
                          : "Investigate"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
