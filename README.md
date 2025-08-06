# ATRO-Lite: Advanced Threat Response System

A modular, multi-agent cyber defense system that leverages LLMs to analyze logs, detect threats, and automate incident responses.

# 🚀 Features
Multi-agent Architecture: Lightweight Python agents for network monitoring, log parsing, and automated response actions
LLM Integration: Utilizes OpenAI's GPT models for threat analysis and response recommendations
Model Context Protocol (MCP): Redis-based context broker to maintain threat environment awareness across components
Real-time Dashboard: Interactive cybersecurity interface with threat visualization and metrics
PostgreSQL Integration: Persistent storage for security events, alerts, and configuration
Automated Response: Configurable response actions for security incidents

# 📋 Requirements
Node.js v18 or higher
PostgreSQL v14 or higher
OpenAI API key
Redis (optional, falls back to in-memory storage)
🔧 Installation
Clone the repository

git clone https://github.com/your-username/atro-lite.git
cd atro-lite
Install dependencies

npm install
Set up environment variables
Create a .env file in the project root:

DATABASE_URL=postgresql://username:password@localhost:5432/atrodb
OPENAI_API_KEY=your_openai_api_key
Initialize the database

npm run db:push
Start the application

npm run dev
The application will be available at http://localhost:5000

# 🏗️ Architecture

# Frontend
React.js with TypeScript
TanStack Query for data fetching
Tailwind CSS and Shadcn/UI for styling
Recharts for data visualization
WebSocket for real-time updates

# Backend
Express.js API server
Drizzle ORM with PostgreSQL
Redis for Model Context Protocol
OpenAI API integration for LLM capabilities
Agent System
Python-based monitoring agents
WebSocket communication with main server
Event-driven architecture for real-time response
# 📊 Project Structure
├── client/              # Frontend React application
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utility functions and TypeScript types
│   │   ├── pages/       # Page components
│   │   └── App.tsx      # Main application component
├── server/              # Backend Express application
│   ├── agents/          # Agent management code
│   ├── python/          # Python agent scripts
│   ├── services/        # Core services (LLM, Redis MCP)
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API routes
│   ├── storage.ts       # Storage interface
│   └── db.ts            # Database connection
├── shared/              # Shared code between frontend and backend
│   └── schema.ts        # Database schema definitions
└── drizzle.config.ts    # Database configuration

# 🔒 Security Features
Real-time network monitoring
Log analysis with pattern detection
Threat intelligence integration
Automated incident response
LLM-powered security insights

# 🌐 Dashboard Interface
Main Dashboard: Overview of security posture with key metrics
Threat Analysis: Detailed threat assessment with severity breakdowns
Log Explorer: Advanced log filtering and analysis tools
LLM Insights: AI-generated security insights and recommendations
Configuration: System settings and agent management

# 🐛 Troubleshooting
Common Issues
Database Connection Errors

Verify PostgreSQL is running and accessible
Check DATABASE_URL in your .env file
Ensure database user has proper permissions
Redis Connection Warnings

ATRO-Lite will use in-memory fallback if Redis is unavailable
To use Redis, install and configure it locally
OpenAI API Issues

Verify your API key is valid and has sufficient quota
Check OPENAI_API_KEY in your .env file
WebSocket Connection Issues

# For local development, ensure PORT environment variable is set
🧪 Development
Running in Development Mode
npm run dev
Building for Production
npm run build
npm start
Database Migration
npm run db:push

# 📝 License
This project is licensed under the MIT License - see the LICENSE file for details.

# 🙏 Acknowledgements
OpenAI for GPT models
Shadcn/UI for UI components
Drizzle ORM for database operations
Express.js for the backend framework
React for the frontend library
