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
    agent: process.env.AGENT_NAME,
    mode: process.env.AGENT_MODE,
    uptime: process.uptime()
  });
});

// Protected status endpoint
app.get("/status", (req, res) => {
  const token = req.headers["x-control-token"];

  if (token !== process.env.CONTROL_TOKEN) {
    return res.status(401).json({ error: "unauthorized" });
  }

  res.json({
    status: "ready",
    agent: process.env.AGENT_NAME,
    mode: process.env.AGENT_MODE,
    uptime: process.uptime()
  });
});

// Command intake endpoint
app.post("/command", (req, res) => {
  const token = req.headers["x-control-token"];

  if (token !== process.env.CONTROL_TOKEN) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const { command } = req.body;

  res.json({
    received: command,
    timestamp: new Date().toISOString(),
    agent: process.env.AGENT_NAME
  });
});

app.listen(PORT, () => {
  console.log(`Control node running on port ${PORT}`);
});
