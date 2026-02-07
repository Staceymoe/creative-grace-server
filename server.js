const express = require("express")
const app = express()

const PORT = process.env.PORT || 8080

app.get("/", (req, res) => {
  res.send("ÆLYSIA online")
})

app.get("/health", (req, res) => {
  res.json({ status: "ok" })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})


// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
