const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Root heartbeat
app.get("/", (req, res) => {
  res.send("AELYSIA online");
});

// Health endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    agent: process.env.AGENT_NAME || "AELYSIA",
    mode: process.env.AGENT_MODE || "control",
    uptime: process.uptime()
  });
});

// Protected status endpoint
app.get("/status", (req, res) => {
  const token = req.headers["x-control-token"];

  if (!process.env.CONTROL_TOKEN) {
    return res.status(500).json
