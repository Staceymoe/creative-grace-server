const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { ChatOpenAI } = require('langchain/chat_models/openai');
const { SystemMessage, HumanMessage } = require('langchain/schema');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// Load agent configuration from environment variables
const agentName = process.env.AGENT_NAME || 'AELYSIA';
const agentMode = process.env.AGENT_MODE || 'control';

// Initialise the LLM
const model = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  temperature: 0.9,
});

/**
 * Build the prompt for the LLM based on the agent name and the incoming command.
 * You can customise the system message here to change the behaviour of the agent.
 */
function buildPrompt(command) {
  const systemMsg = new SystemMessage(
    `You are ${agentName}, an AI assistant.`
  );
  const userMsg = new HumanMessage(command);
  return [systemMsg, userMsg];
}

/**
 * Run the LLM with a given command string and return the result content.
 */
async function runModel(command) {
  const prompt = buildPrompt(command);
  const response = await model.call(prompt);
  return response.content || response.text;
}

/**
 * Health check endpoint.
 * Returns status, agent name, mode and process uptime in seconds.
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    agent: agentName,
    mode: agentMode,
    uptime: Math.floor(process.uptime()),
  });
});

/**
 * Command endpoint.
 * Accepts JSON with a `command` property.
 * The `command` can be a single string or an array of strings.
 * The endpoint runs all commands concurrently and returns their outputs.
 */
app.post('/command', async (req, res) => {
  try {
    const { command } = req.body;

    // Ensure we always have an array of commands
    let commands = [];
    if (Array.isArray(command)) {
      commands = command;
    } else if (typeof command === 'string') {
      commands = [command];
    } else {
      return res.status(400).json({ error: 'Invalid command format' });
    }

    // Run all commands concurrently
    const results = await Promise.all(commands.map(cmd => runModel(cmd)));

    // If only one result, return a single string; otherwise return an array
    const output = results.length === 1 ? results[0] : results;

    res.json({
      status: 'ok',
      agent: agentName,
      mode: agentMode,
      uptime: Math.floor(process.uptime()),
      command: command,
      output,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      details: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Creative Grace server listening on port ${port}`);
});

