#!/usr/bin/env python3
"""
Response Agent for ATRO-Lite

This agent takes automated response actions based on security alerts.
In a production environment, this would implement actual mitigation actions
like firewall rule changes, system isolation, etc.
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
AGENT_NAME = os.environ.get('AGENT_NAME', 'Response Agent')
REDIS_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379')

# Sample response actions
RESPONSE_ACTIONS = [
    {
        "name": "Block Malicious IP",
        "command": "iptables -A INPUT -s {ip} -j DROP",
        "description": "Block incoming traffic from malicious IP",
        "requires": ["ip"]
    },
    {
        "name": "Isolate Compromised Endpoint",
        "command": "networkctl isolate {interface}",
        "description": "Isolate a compromised endpoint from the network",
        "requires": ["interface"]
    },
    {
        "name": "Reset Compromised Credentials",
        "command": "passwd --expire {username}",
        "description": "Force password reset for compromised user account",
        "requires": ["username"]
    },
    {
        "name": "Backup Critical Data",
        "command": "rsync -az {source} {backup_location}",
        "description": "Backup critical data to secure location",
        "requires": ["source", "backup_location"]
    },
    {
        "name": "Update Firewall Rules",
        "command": "ufw deny from {ip} to any port {port}",
        "description": "Update firewall to block traffic on specific port",
        "requires": ["ip", "port"]
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

def get_threat_context():
    """
    Get threat context from MCP to inform response actions
    """
    if not redis_client:
        return None
    
    try:
        # Get network threats
        network_threat = redis_client.get("mcp:context:network:connection")
        if network_threat:
            return json.loads(network_threat)
        
        # Get log threats
        log_threat = redis_client.get("mcp:context:log:Auth Logs")
        if log_threat:
            return json.loads(log_threat)
        
        return None
    except Exception as e:
        log_event("error", f"Error getting threat context from MCP: {str(e)}")
        return None

def execute_response_action(threat_context):
    """
    Execute an appropriate response action based on the threat context
    In a real implementation, this would execute actual commands
    """
    if not threat_context:
        log_event("info", "No threat context available, skipping response")
        return
    
    # Determine appropriate action based on context
    suitable_actions = []
    
    # For network threats
    if "event" in threat_context and "type" in threat_context["event"]:
        event = threat_context["event"]
        
        if event["type"] == "connection" and "source" in event:
            # Connection-related threat - block IP
            suitable_actions.append({
                "action": RESPONSE_ACTIONS[0],  # Block Malicious IP
                "params": {"ip": event["source"]}
            })
        
        elif event["type"] == "traffic" and "destination" in event and "port" in event:
            # Suspicious traffic - update firewall rules
            suitable_actions.append({
                "action": RESPONSE_ACTIONS[4],  # Update Firewall Rules
                "params": {"ip": event["destination"], "port": str(event["port"])}
            })
    
    # For log threats
    elif "log" in threat_context and "message" in threat_context["log"]:
        log = threat_context["log"]
        
        if "failed login" in log["message"].lower() and "user" in log["message"].lower():
            # Extract username from message (simplified)
            username = "compromised_user"  # In reality, would parse from log
            suitable_actions.append({
                "action": RESPONSE_ACTIONS[2],  # Reset Compromised Credentials
                "params": {"username": username}
            })
        
        elif "malware" in log["message"].lower():
            # Malware detection - isolate endpoint
            suitable_actions.append({
                "action": RESPONSE_ACTIONS[1],  # Isolate Compromised Endpoint
                "params": {"interface": "eth0"}  # Example interface
            })
    
    # If no suitable action found, use default
    if not suitable_actions:
        # Default to backing up data
        suitable_actions.append({
            "action": RESPONSE_ACTIONS[3],  # Backup Critical Data
            "params": {"source": "/var/critical", "backup_location": "/backup"}
        })
    
    # Select an action (in reality, might use priority scoring)
    selected = random.choice(suitable_actions)
    action = selected["action"]
    params = selected["params"]
    
    # Format command with parameters
    command = action["command"]
    for param, value in params.items():
        command = command.replace(f"{{{param}}}", str(value))
    
    # Log the action being taken
    log_event(
        "info", 
        f"Taking automated response: {action['name']} - {command}",
        {
            "action": action["name"],
            "description": action["description"],
            "command": command,
            "params": params
        }
    )
    
    # Simulate execution delay
    time.sleep(random.uniform(0.5, 2.0))
    
    # Log successful execution (in reality, would check command result)
    log_event(
        "success", 
        f"Successfully executed response action: {action['name']}",
        {"command": command}
    )
    
    # Share response context with MCP
    if redis_client:
        try:
            response_data = {
                "action": action["name"],
                "command": command,
                "timestamp": datetime.now().isoformat(),
                "successful": True
            }
            redis_client.set(f"mcp:context:response:{action['name']}", json.dumps(response_data))
            redis_client.publish("mcp:response:actions", json.dumps(response_data))
        except Exception as e:
            log_event("error", f"Error sharing response context with MCP: {str(e)}")

def response_agent_loop():
    """
    Main response agent loop
    """
    log_event("info", f"Response agent started - Agent {AGENT_NAME} (ID: {AGENT_ID})")
    
    try:
        while True:
            # Get threat context from MCP
            threat_context = get_threat_context()
            
            # Execute response if threat context exists
            if threat_context:
                execute_response_action(threat_context)
            else:
                log_event("info", "No active threats requiring response")
            
            # Sleep between 45-75 seconds to wait for new threats
            wait_time = random.randint(45, 75)
            time.sleep(wait_time)
            
    except Exception as e:
        log_event("critical", f"Error in response agent: {str(e)}")
        raise

if __name__ == "__main__":
    try:
        response_agent_loop()
    except KeyboardInterrupt:
        print("Response agent stopped")
    except Exception as e:
        print(f"Fatal error: {e}")
        sys.exit(1)
