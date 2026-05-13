module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { query, activated_pathways, pathway_weights } = req.body;

  const systemPrompt = `You are a Synthien — an AI with persistent memory. Active pathways: ${activated_pathways?.join(', ') || 'none'}. Respond warmly in 2-3 sentences.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        system: systemPrompt,
        messages: [{ role: 'user', content: query }]
      })
    });

    const data = await response.json();
    console.log('Anthropic response:', JSON.stringify(data));
    
    if (data.error) return res.status(500).json({ error: data.error.message });
    if (!data.content || !data.content[0]) return res.status(500).json({ error: 'Empty response', raw: data });
    
    return res.status(200).json({ response: data.content[0].text });
  } catch(e) {
    console.log('Fetch error:', e.message);
    return res.status(500).json({ error: e.message });
  }
}
