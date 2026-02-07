const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

// Root heartbeat
app.get("/", (req, res) => {
  res.send("AELYSIA online");
});

// Health endpoint (public)
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    agent: process.env.AGENT_NAME || "unknown",
    mode: process.env.AGENT_MODE || "unset",
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
    time: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Control node running on port ${PORT}`);
});
