const express = require("express");

const app = express();
const PORT = process.env.PORT || 8080;

// Root route
app.get("/", (req, res) => {
  res.send("Creative Grace server is running.");
});

// Health check
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Ping test
app.get("/ping", (req, res) => {
  res.json({ status: "alive" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
