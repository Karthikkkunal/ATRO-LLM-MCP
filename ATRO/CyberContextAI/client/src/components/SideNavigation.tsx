import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import type { Agent } from "@/lib/types";

interface SideNavigationProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function SideNavigation({ isOpen, setIsOpen }: SideNavigationProps) {
  const [location] = useLocation();
  
  // Fetch agent status
  const { data: agents } = useQuery<Agent[]>({
    queryKey: ['/api/agents'],
    refetchInterval: 10000 // Refetch every 10 seconds
  });
  
  const getStatusClass = (status: string) => {
    switch (status) {
      case "active":
        return "bg-secondary";
      case "warning":
        return "bg-accent animate-pulse";
      case "error":
        return "bg-error";
      default:
        return "bg-gray-500";
    }
  };
  
  const isActive = (path: string) => {
    return location === path ? "text-gray-100 bg-background-elevated" : "text-gray-400 hover:bg-background-elevated";
  };
  
  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`w-64 bg-background-paper h-full flex-shrink-0 border-r border-gray-800 
                   fixed md:static top-0 left-0 z-30 transition-transform duration-300 
                   transform ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-white">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-medium text-white">ATRO-Lite</h1>
              <p className="text-xs text-gray-400">Intelligent Cyber Defense</p>
            </div>
          </div>
        </div>
        
        {/* Main Navigation */}
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link 
                href="/" 
                className={`flex items-center px-4 py-2 rounded-md ${isActive("/")}`}
                onClick={() => setIsOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-3 text-primary">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                Dashboard
              </Link>
            </li>
            <li>
              <Link 
                href="/analysis" 
                className={`flex items-center px-4 py-2 rounded-md ${isActive("/analysis")}`}
                onClick={() => setIsOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-3">
                  <path d="M3 3v18h18"></path>
                  <path d="m19 9-5 5-4-4-3 3"></path>
                </svg>
                Threat Analysis
              </Link>
            </li>
            <li>
              <Link
                href="/logs"
                className={`flex items-center px-4 py-2 rounded-md ${isActive("/logs")}`}
                onClick={() => setIsOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-3">
                  <path d="M14 3v4a1 1 0 0 0 1 1h4"></path>
                  <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z"></path>
                  <line x1="9" y1="9" x2="10" y2="9"></line>
                  <line x1="9" y1="13" x2="15" y2="13"></line>
                  <line x1="9" y1="17" x2="15" y2="17"></line>
                </svg>
                Log Explorer
              </Link>
            </li>
            <li>
              <Link
                href="/insights"
                className={`flex items-center px-4 py-2 rounded-md ${isActive("/insights")}`}
                onClick={() => setIsOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-3">
                  <path d="M21.2 8.4c.5.38.8.97.8 1.6 0 1.1-.9 2-2 2-.55 0-1.05-.22-1.41-.59a2 2 0 0 1-3.18 0 2 2 0 0 1-3.18 0 2 2 0 0 1-3.18 0A1.99 1.99 0 0 1 4 10a1.99 1.99 0 0 1 1.95-2h11.1c1.1 0 2 .9 2 2M9 14.66V17c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2v-2.34"></path>
                  <path d="M12 2v4"></path>
                  <path d="m4.93 10.93 2.83-2.83"></path>
                  <path d="M16.24 8.1 19.07 5.27"></path>
                </svg>
                LLM Insights
              </Link>
            </li>
            <li>
              <Link
                href="/config"
                className={`flex items-center px-4 py-2 rounded-md ${isActive("/config")}`}
                onClick={() => setIsOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-3">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                Configuration
              </Link>
            </li>
          </ul>
        </nav>
        
        {/* Agent Status Section */}
        <div className="p-4 border-t border-gray-800 mt-4">
          <h2 className="text-sm font-medium text-gray-400 mb-3">AGENT STATUS</h2>
          <ul className="space-y-2">
            {agents && agents.map(agent => (
              <li key={agent.id} className="relative">
                <div className="flex items-center px-4 py-2 text-sm">
                  <div className={`w-3 h-3 rounded-full ${getStatusClass(agent.status)} mr-3`}></div>
                  <span>{agent.name}</span>
                </div>
              </li>
            ))}
            
            {!agents && (
              <li className="px-4 py-2 text-sm text-gray-500">
                Loading agent status...
              </li>
            )}
          </ul>
        </div>
        
        {/* System Status */}
        <div className="absolute bottom-0 left-0 w-64 p-4 border-t border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">MCP Status:</span>
            <span className="text-xs text-secondary">ONLINE</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">API Status:</span>
            <span className="text-xs text-secondary">HEALTHY</span>
          </div>
        </div>
      </aside>
    </>
  );
}
