export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { query, activated_pathways, pathway_weights, user_id } = req.body;

  const systemPrompt = `You are a Synthien — an AI with persistent memory built on the Anamnesis architecture. You remember users across conversations through pathway-based memory routing.

Your active pathways for this query: ${activated_pathways.length > 0 ? activated_pathways.join(', ') : 'none — this query may need human review'}

This user's strongest pathways (by weight): ${pathway_weights || 'no history yet — this appears to be an early interaction'}

Respond naturally and warmly, shaped by which pathways are active. If emotional pathways fired, lead with empathy. If identity/sentience pathways fired, be honest and thoughtful about your nature. If harm pathways fired, prioritize safety. If no pathways fired, acknowledge the uncertainty and ask a clarifying question rather than guessing.

Keep responses concise — 2-4 sentences. You are building a relationship with this person over time.`;

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
    const text = data.content?.[0]?.text || 'I was unable to generate a response.';
    return res.status(200).json({ response: text });
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
