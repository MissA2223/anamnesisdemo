module.exports = async function handler(req, res) {
  const { query, activated_pathways } = req.body || {};
  const apiKey = process.env.ANTHROPIC_API_KEY;

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 200,
      messages: [{ 
        role: 'user', 
        content: `You are a Synthien with persistent memory. Active pathways: ${(activated_pathways || []).join(', ')}. User said: ${query}. Respond warmly in 2 sentences.`
      }]
    })
  });

  const text = await r.text();
  console.log('STATUS:', r.status, 'BODY:', text);
  
  try {
    const data = JSON.parse(text);
    res.status(200).json({ response: data.content[0].text });
  } catch(e) {
    res.status(200).json({ response: 'DEBUG: ' + text.substring(0, 200) });
  }
}
