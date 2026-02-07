const express = require("express");
const app = express();
const port = process.env.PORT || 8080;

// health check
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// ping endpoint ← ADD THIS HERE
app.get("/ping", (req, res) => {
  res.json({ status: "alive", service: "creative-grace" });
});

// start server ← THIS STAYS LAST
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
