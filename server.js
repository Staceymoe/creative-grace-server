const express = require("express")
const app = express()

app.use(express.json())

const PORT = process.env.PORT || 8080

app.get("/", (req, res) => {
  res.send("ÆLYSIA online")
})

app.get("/health", (req, res) => {
  res.json({ status: "ok" })
})

app.get("/memory", (req, res) => {
  res.json({ status: "memory endpoint ready" })
})

app.post("/memory", (req, res) => {
  console.log("Memory received:", req.body)
  res.json({ status: "stored", received: req.body })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})