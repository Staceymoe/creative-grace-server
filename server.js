import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';

import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(cors());

// Load agent configuration
const agentName = process.env.AGENT_NAME || 'AELYSIA';
const agentMode = process.env.AGENT_MODE || 'control';

// Initialise the LLM
const model = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  temperature: 0.9,
});

/**
 * Build the prompt for the LLM based on the agent name and the incoming command.
 */
function buildPrompt(command) {
  const systemMsg = new SystemMessage(`You are ${agentName}, an AI assistant.`);
  const userMsg = new HumanMessage(command);
  return [systemMsg, userMsg];
}

/**
 * Local command router for system-level functionality
 */
async function handleLocalCommands(cmd) {
  // READ FILE
  if (cmd.startsWith("read file")) {
    const filePath = cmd.replace("read file", "").trim();
    try {
      const absolutePath = path.resolve(filePath);
      const content = fs.readFileSync(absolutePath, 'utf8');
      return `FILE CONTENTS:\n${content}`;
    } catch (err) {
      return `ERROR: Unable to read file: ${err.message}`;
    }
  }

  // WRITE FILE
  if (cmd.startsWith("write file")) {
    try {
      const parts = cmd.split(" ");
      const filePath = parts[2];
      const content = parts.slice(3).join(" ");

      if (!filePath) return "ERROR: No filepath provided.";

      const absolutePath = path.resolve(filePath);
      fs.writeFileSync(absolutePath, content, 'utf8');
      return `SUCCESS: File written to ${absolutePath}`;
    } catch (err) {
      return `ERROR: Unable to write file: ${err.message}`;
    }
  }

  // If nothing matched, return null
  return null;
}

/**
 * Run the LLM with a given command string and return the result content.
 */
async function runModel(command) {
  try {
    const prompt = buildPrompt(command);
    const response = await model.invoke(prompt);
    return response?.content || response?.text || '';
  } catch (err) {
    console.error("Model Error:", err);
    return "Error running model";
  }
}

/**
 * Health check endpoint.
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
 */
app.post('/command', async (req, res) => {
  try {
    const { command } = req.body;

    let commands = [];
    if (Array.isArray(command)) commands = command;
    else if (typeof command === 'string') commands = [command];
    else return res.status(400).json({ error: 'Invalid command format' });

    const results = await Promise.all(commands.map(async (cmd) => {
      // FIRST: try local system-level actions
      const localResult = await handleLocalCommands(cmd);
      if (localResult !== null) return localResult;

      // FALLBACK: send to LLM
      return await runModel(cmd);
    }));

    res.json({
      status: 'ok',
      agent: agentName,
      mode: agentMode,
      uptime: Math.floor(process.uptime()),
      command,
      output: results.length === 1 ? results[0] : results,
    });

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({
      error: 'Internal Server Error',
      details: error.message,
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Creative Grace server listening on port ${port}`);
});
