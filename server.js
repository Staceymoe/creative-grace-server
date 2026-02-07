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
    agent: process.env.AGENT_NAME || "unknown",
    mode: process.env.AGENT_MODE || "unset",
    uptime: process.uptime()
  });
});

// Command intake endpoint (POST only)
app.post("/command", (req, res) => {
  const token = req.headers["x-control-token"];

  if (token !== process.env.CONTROL_TOKEN) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const { command } = req.body || {};

  if (!command) {
    return res.status(400).json({ error: "no command provided" });
  }

  if (command === "ping") {
    return res.json({
      status: "ack",
      agent: process.env.AGENT_NAME,
      mode: process.env.AGENT_MODE,
      received: "ping",
      time: new Date().toISOString()
    });
  }

  res.json({
    status: "received",
    command,
    time: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Control node running on port ${PORT}`);
});

