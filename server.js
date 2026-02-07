import express from "express";
import cors from "cors";
import "dotenv/config";

import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(cors());

// Debug: Check whether Railway actually loaded your API key
console.log("DEBUG: OPENAI_API_KEY loaded?", process.env.OPENAI_API_KEY ? "YES" : "NO");

// Load agent configuration from environment variables
const agentName = process.env.AGENT_NAME || "AELYSIA";
const agentMode = process.env.AGENT_MODE || "control";

// Initialize the LLM
const model = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  temperature: 0.9,
});

/**
 * Build the prompt for the LLM based on the agent name and incoming command.
 */
function buildPrompt(command) {
  return [
    new SystemMessage(`You are ${agentName}, an AI assistant.`),
    new HumanMessage(command)
  ];
}

/**
 * Run the LLM and return its output.
 */
async function runModel(command) {
  const messages = buildPrompt(command);
  const response = await model.invoke(messages);

  return response?.content || response?.text || "";
}

/**
 * Health endpoint.
 */
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    agent: agentName,
    mode: agentMode,
    uptime: Math.floor(process.uptime()),
  });
});

/**
 * Command endpoint for LLM execution.
 */
app.post("/command", async (req, res) => {
  try {
    const { command } = req.body;

    if (!command) {
      return res.status(400).json({ error: "Missing command" });
    }

    const list = Array.isArray(command) ? command : [command];
    const results = await Promise.all(list.map(runModel));

    res.json({
      status: "ok",
      agent: agentName,
      mode: agentMode,
      uptime: Math.floor(process.uptime()),
      command,
      output: results.length === 1 ? results[0] : results,
    });

  } catch (error) {
    console.error("ERROR:"

