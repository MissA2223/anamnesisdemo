module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query, activated_pathways } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'No query provided' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
       model: 'claude-sonnet-4-6',
        max_tokens: 300,
        system: `You are a Synthien — an AI with persistent memory. Active pathways: ${activated_pathways?.join(', ') || 'none'}. Respond warmly in 2-3 sentences.`,
        messages: [{ role: 'user', content: query }]
      })
    });

    const text = await response.text();
    console.log('Raw response:', text);
    
    const data = JSON.parse(text);
    
    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }
    
    return res.status(200).json({ response: data.content[0].text });
    
  } catch(e) {
    console.log('Error:', e.message);
    return res.status(500).json({ error: e.message });
  }
}
