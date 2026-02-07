const express = require('express');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Ensure JSON request bodies are parsed
app.use(express.json());

// Basic heartbeat
app.get('/', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Heartbeat' });
});

// Health‑check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'OK' });
});

// Protected command endpoint
app.post('/command', (req, res) => {
  const { token, message } = req.body;

  // 401 if no token or invalid token
  if (!token || token !== process.env.AELYSIA_TOKEN) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' });
  }

  // 400 if no message
  if (!message || !message.trim()) {
    return res.status(400).json({ status: 'error', message: 'Invalid message' });
  }

  try {
    // Simulate AI processing
    const aelysiaResponse = { reply: `Echo: ${message}` };

    res.status(200).json({ status: 'success', data: aelysiaResponse });
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({ status: 'error', message: 'Something went wrong' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

