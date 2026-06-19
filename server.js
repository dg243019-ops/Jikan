const express = require('express');
const path = require('path');
const fetch = globalThis.fetch || require('node-fetch'); // For Node < 18, install node-fetch
const app = express();
const PORT = process.env.PORT || 3000;

// IMPORTANT: Set these as environment variables on your server. Do NOT commit API keys to the repo.
const API_KEY = process.env.GOOGLE_API_KEY; // Google Custom Search API key
const CSE_ID = process.env.CSE_ID;         // Custom Search Engine ID (cx)

if (!API_KEY || !CSE_ID) {
  console.warn('Warning: GOOGLE_API_KEY or CSE_ID not set. /api/search will return 500 until set.');
}

app.get('/api/search', async (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ error: { message: 'q parameter required' } });

  if (!API_KEY || !CSE_ID) {
    return res.status(500).json({ error: { message: 'server_api_keys_missing' } });
  }

  const url = `https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(API_KEY)}&cx=${encodeURIComponent(CSE_ID)}&q=${encodeURIComponent(q)}`;

  try {
    const r = await fetch(url);
    const json = await r.json();
    return res.status(r.ok ? 200 : r.status).json(json);
  } catch (err) {
    console.error('Search error:', err);
    return res.status(500).json({ error: { message: 'internal_server_error' } });
  }
});

// Serve static files (index.html is in repository root)
app.use(express.static(path.join(__dirname, '/')));

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
