/**
 * Parses the JSON response from an agent, extracting JSON from text if necessary.
 * @param {string} rawResponse - The raw response string from the agent.
 * @param {string} agentName - The name of the agent (for error messages).
 * @returns {Object} Parsed JSON object.
 * @throws {Error} If the response cannot be parsed as JSON after multiple attempts.
 */
function parseAgentJsonResponse(rawResponse, agentName) {
  // Try to parse the response as JSON directly
  try {
    return JSON.parse(rawResponse);
  } catch (directParseError) {
    // If direct parsing fails, try to extract JSON from the response
    // Look for JSON object patterns in the string
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (extractError) {
        // If extraction fails, fall through to throw a detailed error
      }
    }

    // If we still can't parse, throw an informative error
    throw new Error(
      `${agentName} returned non-JSON output. Raw response: ${rawResponse.substring(
        0,
        200
      )}${rawResponse.length > 200 ? '...' : ''}`
    );
  }
}

module.exports = { parseAgentJsonResponse };
