#!/usr/bin/env python3
"""
Network Monitoring Agent for ATRO-Lite

This agent monitors network traffic for suspicious activity.
In a production environment, this would integrate with tools like
Zeek or Suricata for actual network monitoring.
"""

import json
import os
import random
import redis
import signal
import sys
import time
from datetime import datetime

# Configuration from environment
AGENT_ID = os.environ.get('AGENT_ID', '0')
AGENT_NAME = os.environ.get('AGENT_NAME', 'Network Monitor')
REDIS_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379')

# Sample network events to simulate monitoring
SAMPLE_NETWORK_EVENTS = [
    {
        "type": "connection",
        "source": "192.168.1.45",
        "destination": "208.118.235.174",
        "port": 22,
        "protocol": "SSH",
        "details": "Multiple failed authentication attempts"
    },
    {
        "type": "scan",
        "source": "192.168.1.35",
        "destination": "192.168.1.0/24",
        "ports": [80, 443, 22, 21],
        "protocol": "TCP",
        "details": "Port scanning activity detected"
    },
    {
        "type": "traffic",
        "source": "192.168.1.10",
        "destination": "45.63.82.91",
        "port": 4444,
        "protocol": "TCP",
        "details": "Suspicious outbound connection to uncommon port"
    },
    {
        "type": "dns",
        "source": "192.168.1.20",
        "destination": "evil-malware.example.com",
        "protocol": "DNS",
        "details": "Query to known malicious domain"
    },
    {
        "type": "traffic",
        "source": "10.0.0.15",
        "destination": "192.168.1.1",
        "port": 445,
        "protocol": "SMB",
        "details": "Large volume of SMB traffic - possible lateral movement"
    }
]

# Connect to Redis for MCP
try:
    redis_client = redis.Redis.from_url(REDIS_URL)
    redis_client.ping()  # Test connection
    print(f"Connected to Redis MCP at {REDIS_URL}")
except Exception as e:
    print(f"Error connecting to Redis: {e}")
    redis_client = None

# Signal handlers for graceful shutdown
def handle_signal(signum, frame):
    print(f"Received signal {signum}, shutting down...")
    sys.exit(0)

signal.signal(signal.SIGTERM, handle_signal)
signal.signal(signal.SIGINT, handle_signal)

def log_event(level, message, metadata=None):
    """
    Log an event to stdout in JSON format for the Node.js process to capture
    """
    log_data = {
        "type": "log",
        "level": level,
        "message": message,
        "metadata": metadata or {}
    }
    print(json.dumps(log_data))

def detect_threat(event):
    """
    Simple threat detection logic
    In a real implementation, this would use ML models or rule-based systems
    """
    threat_level = "low"
    
    # Simulate threat detection based on event characteristics
    if event["type"] == "connection" and "failed" in event["details"].lower():
        # Failed connection attempts
        threat_level = "medium"
        if random.random() < 0.3:  # 30% chance of high severity
            threat_level = "high"
    
    elif event["type"] == "scan":
        # Port scanning
        threat_level = "medium"
        if len(event.get("ports", [])) > 10:  # Scanning many ports
            threat_level = "high"
    
    elif event["type"] == "traffic" and event.get("port") in [4444, 8888, 9999]:
        # Suspicious ports often used by malware
        threat_level = "high"
        if random.random() < 0.5:  # 50% chance of critical severity
            threat_level = "critical"
    
    elif event["type"] == "dns" and "malware" in event.get("destination", "").lower():
        # DNS queries to malicious domains
        threat_level = "critical"
    
    # Share context with MCP
    if redis_client and threat_level in ["high", "critical"]:
        try:
            context_data = {
                "event": event,
                "threat_level": threat_level,
                "timestamp": datetime.now().isoformat()
            }
            redis_client.set(f"mcp:context:network:{event['type']}", json.dumps(context_data))
            redis_client.publish("mcp:network:threats", json.dumps(context_data))
        except Exception as e:
            print(f"Error sharing context with MCP: {e}")
    
    return threat_level

def create_alert(event, threat_level):
    """
    Create an alert for the monitoring system
    """
    if threat_level in ["medium", "high", "critical"]:
        alert_data = {
            "type": "alert",
            "severity": threat_level,
            "title": f"Network {event['type'].upper()} Alert",
            "description": f"{event['details']} from {event['source']} to {event['destination']}",
            "metadata": event
        }
        print(json.dumps(alert_data))
        
        # For high severity threats, create an incident
        if threat_level in ["high", "critical"]:
            incident_data = {
                "type": "incident",
                "incidentType": f"Network {event['type'].upper()}",
                "metadata": {
                    "event": event,
                    "threat_level": threat_level
                }
            }
            print(json.dumps(incident_data))

def monitor_network():
    """
    Main monitoring function that simulates network monitoring
    """
    log_event("info", f"Network monitoring started - Agent {AGENT_NAME} (ID: {AGENT_ID})")
    
    try:
        while True:
            # In a real implementation, this would analyze actual network traffic
            # For simulation, we randomly select a network event
            event = random.choice(SAMPLE_NETWORK_EVENTS)
            
            # Add current timestamp
            event["timestamp"] = datetime.now().isoformat()
            
            # Log the detected event
            event_desc = f"{event['type']} from {event['source']} to {event['destination']}"
            if "port" in event:
                event_desc += f" on port {event['port']}"
            event_desc += f" ({event['protocol']})"
            
            log_event("info", event_desc, event)
            
            # Detect threat level
            threat_level = detect_threat(event)
            
            # Create alert if needed
            if threat_level != "low":
                create_alert(event, threat_level)
            
            # Sleep between 30-60 seconds to simulate monitoring interval
            wait_time = random.randint(30, 60)
            time.sleep(wait_time)
            
    except Exception as e:
        log_event("critical", f"Error in network monitoring: {str(e)}")
        raise

if __name__ == "__main__":
    try:
        monitor_network()
    except KeyboardInterrupt:
        print("Network monitoring stopped")
    except Exception as e:
        print(f"Fatal error: {e}")
        sys.exit(1)
