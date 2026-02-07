import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

// Root heartbeat
app.get("/", (req, res) => {
  res.send("AELYSIA online");
});

// Health and control status endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    agent: process.env.AGENT_NAME || "unknown",
    mode: process.env.AGENT_MODE || "unset",
    uptime: process.uptime()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Control node running on port ${PORT}`);
});
