import { useEffect, useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Maximize, MoreVertical, Globe, Shield, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Alert } from "@/lib/types";

export default function ThreatMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRotating, setIsRotating] = useState(true);
  const animationRef = useRef<number>();
  const angle = useRef(0);
  
  // Fetch active alerts to display on map
  const { data: alerts = [] } = useQuery<Alert[]>({
    queryKey: ['/api/alerts'],
  });

  // Filter high severity alerts for map display
  const highSeverityAlerts = alerts.filter(
    alert => alert.severity === "critical" || alert.severity === "high"
  );
  
  // Mock data for visual appeal when no real alerts
  const mockThreatPoints = [
    { x: 120, y: 90, severity: "high" },
    { x: 350, y: 110, severity: "critical" },
    { x: 480, y: 160, severity: "high" },
    { x: 180, y: 180, severity: "high" },
    { x: 280, y: 220, severity: "critical" }
  ];
  
  // Draw the threat map with cyber aesthetics
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const drawMap = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid background
      const gridSize = 20;
      ctx.strokeStyle = "rgba(65, 105, 225, 0.1)";
      ctx.lineWidth = 0.5;
      
      // Draw horizontal grid lines
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      
      // Draw vertical grid lines
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      // Draw rotating circle in center for visual effect
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(canvas.width, canvas.height) * 0.35;
      
      // Draw outer circle
      ctx.strokeStyle = "rgba(25, 118, 210, 0.15)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
      
      // Draw rotating scan line
      if (isRotating) {
        ctx.strokeStyle = "rgba(25, 118, 210, 0.6)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        const scanX = centerX + Math.cos(angle.current) * radius;
        const scanY = centerY + Math.sin(angle.current) * radius;
        ctx.lineTo(scanX, scanY);
        ctx.stroke();
        
        // Draw scan arc
        ctx.strokeStyle = "rgba(25, 118, 210, 0.2)";
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, angle.current - 0.5, angle.current);
        ctx.stroke();
      }
      
      // Draw a cyber world map outline with glowing effect
      ctx.strokeStyle = "rgba(65, 105, 225, 0.7)";
      ctx.lineWidth = 1.5;
      ctx.shadowColor = "rgba(0, 150, 255, 0.5)";
      ctx.shadowBlur = 10;
      
      // Draw continents with glowing outlines
      ctx.beginPath();
      
      // North America
      ctx.moveTo(50, 80);
      ctx.bezierCurveTo(80, 85, 120, 90, 150, 100);
      ctx.bezierCurveTo(170, 120, 190, 140, 200, 150);
      
      // South America
      ctx.moveTo(150, 150);
      ctx.bezierCurveTo(160, 180, 170, 200, 180, 220);
      ctx.bezierCurveTo(170, 250, 160, 270, 150, 280);
      
      // Europe
      ctx.moveTo(250, 90);
      ctx.bezierCurveTo(270, 95, 290, 98, 300, 100);
      ctx.bezierCurveTo(310, 110, 320, 120, 330, 130);
      
      // Africa
      ctx.moveTo(270, 130);
      ctx.bezierCurveTo(280, 160, 290, 180, 300, 200);
      ctx.bezierCurveTo(310, 220, 320, 240, 330, 250);
      
      // Asia
      ctx.moveTo(330, 100);
      ctx.bezierCurveTo(370, 110, 410, 120, 450, 130);
      ctx.bezierCurveTo(470, 150, 490, 170, 500, 180);
      
      // Australia
      ctx.moveTo(500, 200);
      ctx.bezierCurveTo(520, 210, 530, 215, 550, 220);
      ctx.bezierCurveTo(540, 230, 530, 240, 520, 250);
      
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      // Add connection lines between nodes (simulated network)
      ctx.strokeStyle = "rgba(65, 105, 225, 0.15)";
      ctx.lineWidth = 0.5;
      
      // Draw attack indicators based on alerts (or mock data if none)
      const threatPoints = highSeverityAlerts.length > 0 
        ? highSeverityAlerts.map(alert => ({
            x: (alert.id * 10 % 520) + 80,
            y: ((alert.id * 3) % 180) + 60,
            severity: alert.severity
          })) 
        : mockThreatPoints;
      
      // Draw connection lines between points
      for (let i = 0; i < threatPoints.length; i++) {
        for (let j = i + 1; j < threatPoints.length; j++) {
          ctx.beginPath();
          ctx.moveTo(threatPoints[i].x, threatPoints[i].y);
          ctx.lineTo(threatPoints[j].x, threatPoints[j].y);
          ctx.stroke();
        }
      }
      
      // Draw attack indicators with cyber styling
      threatPoints.forEach((point) => {
        const isCritical = point.severity === "critical";
        
        // Glow effect
        ctx.shadowColor = isCritical ? "rgba(255, 0, 50, 0.7)" : "rgba(255, 165, 0, 0.7)";
        ctx.shadowBlur = 15;
        
        // Pulsing circle
        ctx.fillStyle = isCritical ? "rgba(255, 0, 50, 0.9)" : "rgba(255, 165, 0, 0.9)";
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Ripple effects
        ctx.shadowBlur = 0;
        ctx.strokeStyle = isCritical ? "rgba(255, 0, 50, 0.7)" : "rgba(255, 165, 0, 0.7)";
        ctx.lineWidth = 1.5;
        
        const rippleSize = (Date.now() % 2000) / 2000 * 15 + 8;
        ctx.beginPath();
        ctx.arc(point.x, point.y, rippleSize, 0, Math.PI * 2);
        ctx.stroke();
        
        const rippleSize2 = ((Date.now() + 1000) % 2000) / 2000 * 15 + 8;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(point.x, point.y, rippleSize2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      });
      
      // Draw enhanced semi-transparent legend
      const legendWidth = 140;
      const legendHeight = 90;
      const legendX = canvas.width - legendWidth - 10;
      const legendY = 10;
      
      // Draw legend background with cyber styling
      ctx.fillStyle = "rgba(10, 20, 40, 0.8)";
      ctx.strokeStyle = "rgba(65, 105, 225, 0.6)";
      ctx.lineWidth = 1;
      
      // Draw legend box with rounded corners
      ctx.beginPath();
      ctx.roundRect(legendX, legendY, legendWidth, legendHeight, 5);
      ctx.fill();
      ctx.stroke();
      
      // Add gradient highlight to legend
      const gradient = ctx.createLinearGradient(legendX, legendY, legendX + legendWidth, legendY);
      gradient.addColorStop(0, "rgba(65, 105, 225, 0)");
      gradient.addColorStop(0.5, "rgba(65, 105, 225, 0.3)");
      gradient.addColorStop(1, "rgba(65, 105, 225, 0)");
      
      ctx.fillStyle = gradient;
      ctx.fillRect(legendX, legendY, legendWidth, 3);
      
      // Draw legend title
      ctx.font = "bold 12px monospace";
      ctx.fillStyle = "rgba(150, 200, 255, 0.9)";
      ctx.fillText("THREAT INDICATORS", legendX + 10, legendY + 18);
      
      // Draw legend items
      ctx.shadowColor = "rgba(255, 0, 50, 0.7)";
      ctx.shadowBlur = 10;
      ctx.fillStyle = "rgba(255, 0, 50, 0.9)";
      ctx.beginPath();
      ctx.arc(legendX + 15, legendY + 35, 4, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.shadowBlur = 0;
      ctx.font = "11px monospace";
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.fillText("CRITICAL THREAT", legendX + 25, legendY + 39);
      
      ctx.shadowColor = "rgba(255, 165, 0, 0.7)";
      ctx.shadowBlur = 10;
      ctx.fillStyle = "rgba(255, 165, 0, 0.9)";
      ctx.beginPath();
      ctx.arc(legendX + 15, legendY + 55, 4, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.fillText("HIGH SEVERITY", legendX + 25, legendY + 59);
      
      // Add active scanner info
      ctx.fillStyle = "rgba(150, 200, 255, 0.6)";
      ctx.fillText("SCAN ACTIVE", legendX + 15, legendY + 79);
      
      // Update the scan angle for next frame
      angle.current += 0.01;
      if (angle.current > Math.PI * 2) {
        angle.current = 0;
      }
    };
    
    // Animation loop
    const animate = () => {
      drawMap();
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Cleanup animation on unmount
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [highSeverityAlerts, isRotating]);
  
  // Add window resize listener
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // Set canvas dimensions and redraw
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Toggle rotation
  const toggleRotation = () => {
    setIsRotating(prev => !prev);
  };

  return (
    <Card className="cyber-bg glass-effect col-span-full lg:col-span-2 h-80 cyber-border animate-fade-in">
      <CardHeader className="p-4 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-medium flex items-center text-glow-blue">
          <Globe className="h-5 w-5 mr-2 text-glow-blue" />
          Global Threat Map
          <span className="ml-3 text-xs px-2 py-0.5 bg-primary/20 text-glow-teal rounded-full data-flow">
            ACTIVE
          </span>
        </CardTitle>
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" 
            className="text-gray-400 hover:text-glow-blue h-8 w-8 hover:bg-blue-500/20"
            onClick={toggleRotation}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-glow-blue h-8 w-8 hover:bg-blue-500/20">
            <Maximize className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-glow-blue h-8 w-8 hover:bg-blue-500/20">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 px-4 pb-4">
        <div className="h-64 cyber-bg rounded-md relative overflow-hidden">
          <canvas 
            ref={canvasRef} 
            className="absolute inset-0 w-full h-full"
          ></canvas>
          
          {/* Bottom status bar */}
          <div className="absolute bottom-0 left-0 right-0 h-8 flex items-center justify-between px-3 bg-black/30 border-t border-blue-500/20">
            <div className="flex items-center text-xs text-glow-blue">
              <Shield className="h-3 w-3 mr-1" />
              <span>GLOBAL MONITORING ACTIVE</span>
            </div>
            
            <div className="flex items-center text-xs">
              {highSeverityAlerts.length === 0 ? (
                <span className="text-glow-teal flex items-center">
                  <span className="w-2 h-2 rounded-full bg-green-400 mr-1"></span>
                  ALL SYSTEMS SECURE
                </span>
              ) : (
                <span className="text-glow-red flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {highSeverityAlerts.length} ACTIVE THREATS DETECTED
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
