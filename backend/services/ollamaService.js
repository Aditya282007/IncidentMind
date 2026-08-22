const { parseAgentJsonResponse } = require('../utils/agentParser');
const { AGENTS } = require('../config/agents');
require('dotenv').config();

const ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';
const ollamaModel = process.env.OLLAMA_MODEL || 'qwen3:latest';

/**
 * Calls the Ollama API with the given agent and prompt.
 * @param {string} agentName - The agent name (e.g., 'DIAGNOSER', 'PATCHER')
 * @param {string} prompt - The prompt to send to the agent.
 * @returns {Promise<Object>} Parsed JSON response from the agent.
 */
async function callLLM(agentName, prompt) {
  const agent = AGENTS[agentName];
  if (!agent) {
    throw new Error(`Unknown agent: ${agentName}`);
  }
  const fullPrompt = `${agent.systemPrompt}\n\n${prompt}`;
  const maxRetries = 3;
  const baseDelay = 1000; // 1 second base delay

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(`${ollamaHost}/api/generate`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: ollamaModel,
          prompt: fullPrompt,
          stream: false,
          format: 'json'
        })
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Ollama request failed (${response.status}): ${errorBody}`);
      }

      const data = await response.json();
      if (!data || typeof data.response !== 'string') {
        throw new Error('Invalid Ollama response payload');
      }

      return parseAgentJsonResponse(data.response, agent.name);
    } catch (error) {
      if (attempt === maxRetries - 1) {
        throw error;
      }

      if (!(error.name === 'AbortError' && error.message.includes('timeout'))) {
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
}

module.exports = { callLLM, callOllamaAPI: callLLM };
