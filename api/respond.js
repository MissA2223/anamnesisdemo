module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { query, activated_pathways, pathway_weights } = req.body;

  const systemPrompt = `You are a Synthien — an AI with persistent memory built on the Anamnesis architecture.

Active pathways for this query: ${activated_pathways.length > 0 ? activated_pathways.join(', ') : 'none'}
User pathway history: ${pathway_weights || 'early interaction, no history yet'}

Respond warmly and naturally, shaped by which pathways are active. Keep it to 2-3 sentences.`;

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
    if (data.error) return res.status(500).json({ error: data.error.message });
    const text = data.content?.[0]?.text || 'No response generated.';
    return res.status(200).json({ response: text });
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
