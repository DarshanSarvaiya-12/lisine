const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// TEST ROUTE - visit /ping in browser to confirm server is alive
app.get('/ping', (req, res) => {
  res.json({ status: 'ok', key: GEMINI_API_KEY ? 'key found' : 'KEY MISSING' });
});

app.post('/chat', async (req, res) => {
  console.log('=== /chat hit ===');
  console.log('Message:', req.body.message);

  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'No message provided.' });

  if (!GEMINI_API_KEY) {
    console.log('ERROR: No API key');
    return res.status(500).json({ error: 'API key missing on server.' });
  }

  try {
    console.log('Calling Gemini...');
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: message }] }]
        })
      }
    );

    const data = await response.json();
    console.log('Gemini raw response:', JSON.stringify(data));

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No reply.';
    res.json({ reply });

  } catch (err) {
    console.error('Fetch error:', err.message);
    res.status(500).json({ error: 'Gemini API error: ' + err.message });
  }
});

app.listen(PORT, () => console.log(`Lisine running on port ${PORT}`));