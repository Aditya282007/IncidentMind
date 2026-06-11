# IncidentMind Backend

This is the backend for the IncidentMind AI-powered incident response system.

## Features

- Node.js/Express server
- 5-agent AI orchestration system (Watcher, Diagnoser, Patcher, Communicator, Orchestrator)
- Local LLM integration via Ollama for intelligent analysis (no API costs)
- Server-Sent Events (SSE) for real-time streaming of agent thoughts to frontend
- Mock incident data for demonstration
- RESTful API endpoints

## Architecture

The backend implements a 5-agent chain where each agent has a specific role:

1. **Watcher** - Monitors metrics and logs for anomalies
2. **Diagnoser** - Analyzes anomalies to determine root cause
3. **Patcher** - Generates recommended fixes based on diagnosis
4. **Communicator** - Drafts notifications and reports for the team
5. **Orchestrator** - Sequences the agents and maintains incident context (implemented in the server logic)

Each agent makes an Ollama API call with a role-specific system prompt to produce structured JSON output.

## API Endpoints

### GET `/api/incidents`
Returns a list of mock incidents.

### GET `/api/incidents/:id`
Returns a specific incident by ID.

### GET `/api/incidents/:id/analyze`
SSE endpoint that streams the analysis process as each agent completes its work.
Returns events with types:
- `agent_start` - When an agent begins processing
- `agent_complete` - When an agent finishes with its result
- `analysis_complete` - When the full analysis is done
- `error` - If an error occurs during processing

### GET `/health`
Health check endpoint.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file with Ollama configuration:
   ```
   OLLAMA_HOST=http://localhost:11434
   OLLAMA_MODEL=llama3
   PORT=3001
   NODE_ENV=development
   ```
   Make sure you have Ollama running locally and have pulled the model (e.g., `ollama pull llama3`).

3. Start the server:
   ```bash
   npm start
   ```

   For development with auto-reload:
   ```bash
   npm run dev
   ```

## Dependencies

- express: Web framework
- cors: Cross-origin resource sharing
- dotenv: Environment variable management
- (Built-in fetch API used for Ollama calls, Node.js 18+)

## Notes

- The backend uses mock incident data for demonstration purposes
- In a production implementation, the Watcher would connect to real monitoring systems (Prometheus, Grafana, etc.)
- The Patcher would integrate with actual remediation systems (CI/CD pipelines, configuration management)
- The Communicator would connect to real notification systems (Slack, email, PagerDuty)
- Ensure Ollama is running and the specified model is available before starting the server.

## License

MIT