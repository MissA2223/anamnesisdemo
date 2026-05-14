module.exports = async function handler(req, res) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    return res.status(200).json({ response: 'NO API KEY FOUND' });
  }
  
  return res.status(200).json({ 
    response: 'API key found, starts with: ' + apiKey.substring(0, 10) + '...'
  });
}
