import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Bell, 
  Search,
  User,
  Shield,
  Lock,
  Activity,
  Code
} from "lucide-react";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="cyber-bg glass-effect p-4 hidden md:flex items-center justify-between sticky top-0 z-10 animate-fade-in">
      <div className="flex items-center">
        <div className="flex items-center mr-6">
          <Shield className="h-8 w-8 mr-2 text-glow-blue" />
          <div>
            <h1 className="text-2xl font-bold tracking-wider text-glow-blue">ATRO-LITE</h1>
            <div className="text-xs text-glow-purple opacity-80">ADVANCED THREAT RESPONSE SYSTEM</div>
          </div>
        </div>
        
        <div className="flex items-center ml-4 cyber-border rounded px-3 py-1 data-flow">
          <h2 className="text-xl font-medium mr-2">Dashboard</h2>
          <span className="flex items-center space-x-1 text-xs px-2 py-1 bg-primary/20 text-glow-blue rounded pulse-alert">
            <Activity className="w-3 h-3" />
            <span>ACTIVE</span>
          </span>
        </div>
      </div>
      
      <div className="flex items-center space-x-6">
        <div className="flex flex-col items-end text-glow-teal">
          <div className="text-sm font-mono">{currentTime.toLocaleTimeString()}</div>
          <div className="text-xs opacity-60">{currentTime.toLocaleDateString()}</div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-glow-blue w-4 h-4" />
          <Input
            type="text"
            placeholder="Search logs, incidents, threats..."
            className="pl-10 pr-4 py-2 rounded-md cyber-bg glass-effect w-64 text-gray-100 focus:outline-none focus:border-primary border-2 border-blue-500/30"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Button variant="ghost" size="icon" className="rounded-full cyber-bg cyber-border text-glow-purple hover:bg-blue-500/20">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 pulse-alert"></span>
        </Button>
        
        <div className="flex items-center pl-4 border-l border-blue-500/30">
          <Avatar className="w-10 h-10 cyber-bg cyber-border flex items-center justify-center">
            <AvatarFallback className="bg-transparent">
              <Lock className="text-glow-blue h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div className="ml-2">
            <p className="text-sm font-medium text-glow-purple">Security Analyst</p>
            <p className="text-xs flex items-center">
              <Code className="h-3 w-3 mr-1 text-glow-blue" />
              <span className="text-glow-blue opacity-80">Admin Access</span>
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
