# IncidentMind

> "When your production system breaks at 3 AM, IncidentMind's agents detect it, diagnose it, draft a fix, and notify your team — before a human even wakes up."

## 📋 Overview

IncidentMind is an autonomous incident response system that uses a multi-agent AI architecture to detect, analyze, and resolve system incidents. The system simulates a "war room" where specialized AI agents work in sequence to handle incidents without human intervention.

This implementation fulfills the MVP specifications for the online round, using **Ollama's local LLM** as requested, with real-time streaming visualization of the agent workflow.

## 🏗️ Architecture

### The 5-Agent System
Each agent has a distinct role and communicates only with the next agent in the chain (no shared global state):

1. **Orchestrator** (Controller) - Receives trigger, sequences agents, maintains context
2. **Watcher** (Sensor) - Polls metrics/logs, detects anomalies, fires alerts
3. **Diagnoser** (Analyst) - Gets anomaly context, finds root cause via LLM
4. **Patcher** (Fixer) - Takes diagnosis, generates recommended fixes
5. **Communicator** (Notifier) - Drafts Slack messages, incident reports, runbook entries

### Tech Stack (MVP)
- **Frontend**: React + Tailwind CSS (war-room dashboard with live agent feed)
- **Backend**: Node.js/Express (orchestrator, agent runner, SSE stream)
- **LLM**: Ollama (local) - one call per agent with role-specific prompts
- **Transport**: Server-Sent Events (SSE) for live streaming agent thoughts
- **Data**: Hardcoded mock incidents + JSON metrics (no real monitoring needed)

## ⚡ Features

- **Real-time Agent Visualization**: Watch agents activate and "think" in sequence
- **Live Streaming Thoughts**: See each agent's reasoning process as it happens
- **Interactive War Room**: Click scenarios to trigger autonomous incident resolution
- **Dual Mode Operation**:
  - **Backend Mode**: Real Ollama LLM calls (when Ollama is running)
  - **Simulation Mode**: Fully functional demo with timed steps (offline/presentation ready)
- **Responsive Design**: Works on desktop and tablet screens
- **Agent-specific UI**: Custom cards showing each agent's output and confidence metrics

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- npm or yarn
- [Ollama](https://ollama.ai/) (for backend mode with real LLM calls)

### Demo Video
- https://drive.google.com/drive/folders/1aSrS6b8E8iLq8nU3DerQeHccDmRIJABU?usp=sharing

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd IncidentMind
```

2. Install backend dependencies
```bash
# Backend dependencies are already included
# (Express, CORS, Dotenv)
```

3. Install frontend dependencies
```bash
cd Frontend
npm install
```

### Environment Setup

Create a `.env` file in the root directory (optional - defaults provided):

```env
# Ollama Configuration
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=qwen3:latest

# Server Configuration
PORT=3001
NODE_ENV=development
```

### Running the Application

#### Option 1: Backend Mode (Real Ollama LLM)
1. Start Ollama service:
```bash
ollama serve
```

2. Pull the recommended model (or set your own in .env):
```bash
ollama pull qwen3:latest
```

3. Start the backend server:
```bash
# From root directory
node server.js
```
Backend will run on `http://localhost:3001`

4. Start the frontend development server:
```bash
# From Frontend directory
npm run dev
```
Frontend will be available at `http://localhost:5173`

#### Option 2: Simulation Mode (No Ollama Required)
If Ollama is not available or you want an instant demo:
1. Just start the frontend:
```bash
cd Frontend
npm run dev
```
2. The application will automatically detect that the backend is unavailable and switch to simulation mode
3. All agent interactions are simulated with realistic timing and placeholder LLM responses

## 🎯 How to Use

1. Open the application in your browser (`http://localhost:5173`)
2. Select an incident scenario from the grid (CPU spike, database connection pool, or memory leak)
3. Click "Simulate" to trigger the autonomous agent resolution
4. Watch the agent pipeline activate in real-time:
   - Orchestrator → Watcher → Diagnoser → Patcher → Communicator
5. View each agent's streaming thoughts and final results in the war-room interface
6. Click "View Report" or "Full Report" to see the detailed incident analysis

## 🔧 Implementation Details

### Backend (server.js)
- Implements all 5 agents with role-specific system prompts
- Orchestrator makes a real LLM call to determine agent sequence (or uses default)
- SSE endpoint streams `agent_start`, `agent_complete`, and `analysis_complete` events
- Falls back to simulation responses if Ollama is unavailable
- Environment variable validation with appropriate defaults

### Frontend (Frontend/src/)
- **Typescript** with strict typing for all agent results and events
- **React** functional components with hooks for state management
- **Tailwind CSS** for responsive, modern UI
- **EventSource** for SSE connection to backend
- **Simulation fallback** with realistic delays and streaming text
- **Agent-specific cards** displaying confidence bars, severity indicators, fix recommendations, etc.
- **Connection mode indicator** showing "BACKEND SSE" or "SIMULATION"

### Key Files
- `server.js` - Backend implementation with Ollama integration
- `Frontend/src/types/incident.ts` - TypeScript interfaces for all agent results and events
- `Frontend/src/pages/ActiveIncident.tsx` - Main incident simulation and agent visualization
- `Frontend/src/data/scenarios.ts` - Predefined incident scenarios with simulated agent outputs
- `.env.example` - Template for environment variables

## ✅ Verification Status

This implementation **fully satisfies** the MVP requirements from IncidentMind.md:

| Requirement | Status | Details |
|-------------|--------|---------|
| **Tech Stack** | ✅ | React+Tailwind frontend, Node/Express backend, Ollama LLM, SSE transport |
| **Trigger Mechanism** | ✅ | UI button triggers "fake incident" simulation |
| **Orchestrator Chain** | ✅ | Orchestrator initiates agent sequence (with LLM call for sequencing) |
| **Agent Timing** | ✅ | Each agent shows 1-2s "thinking" with visible output |
| **War-room UI** | ✅ | Real-time agent activation visualization with streaming thoughts |
| **Ollama Integration** | ✅ | All 5 agents make real LLM calls via Ollama API |
| **MVP Deliverable** | ✅ | Functional demo with 2-3 scenario demonstrations |

## 📁 Project Structure

```
IncidentMind/
├── server.js                 # Backend Express server with Ollama integration
├── .env.example              # Environment variable template
├── VERIFICATION_SUMMARY.md   # Detailed verification document
├── Frontend/                 # React frontend application
│   ├── src/
│   │   ├── pages/            # Page components (Dashboard, ActiveIncident, etc.)
│   │   ├── components/       # Reusable components (Header, Agent cards, etc.)
│   │   ├── data/             # Scenario definitions
│   │   ├── types/            # TypeScript interfaces
│   │   ├── App.tsx           # Main application router
│   │   └── main.tsx          # Entry point
│   ├── public/               # Static assets
│   ├── package.json          # Frontend dependencies
│   └── vite.config.ts        # Vite configuration
└── README.md                 # This file
```

## 💡 Notes for Submission

- The system is ready for immediate demonstration
- No external dependencies beyond Node.js, Ollama (optional), and standard web technologies
- All agent prompts are role-specific as required
- Structured JSON output is enforced for all agent communications
- The "war room" UI makes AI reasoning visible in real-time - extremely demo-friendly
- Environment variables provide flexibility for different deployment scenarios
- Simulation mode ensures the presentation works reliably without Ollama setup

## 🛠️ Troubleshooting

- **Backend connection failed**: The frontend automatically switches to simulation mode
- **Ollama not running**: Start with `ollama serve` and ensure model is pulled
- **Port conflicts**: Adjust PORT in .env or change the port in server.js
- **Dependency issues**: Run `npm install` in both root and Frontend directories

## 🙏 Acknowledgements

- Inspired by autonomous agent architectures and incident response best practices
- Built for demonstration of multi-agent LLM systems in operational contexts
- Uses [Ollama](https://ollama.ai/) for accessible local LLM experimentation
- UI components inspired by modern dashboard and monitoring interfaces

---

**IncidentMind - Autonomous Incident Response with Local LLM Agents**  
*Transforming how teams respond to production incidents, one AI agent at a time.*