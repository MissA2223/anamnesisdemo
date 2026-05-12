import { createClient } from ‘@supabase/supabase-js’;
const supabase = createClient(
process.env.SUPABASE_URL,
process.env.SUPABASE_ANON_KEY
);
export default async function handler(req, res) {
if (req.method === ‘GET’) {
const { user_id } = req.query;
const { data, error } = await supabase
.from(‘pathway_weights’)
.select(‘pathway_id, weight’)
.eq(‘user_id’, user_id);
if (error) return res.status(500).json({ error: error.message });
return res.status(200).json({ weights: data });
}
if (req.method === ‘POST’) {
const { user_id, pathway_id, weight } = req.body;
const { error } = await supabase
.from(‘pathway_weights’)
.upsert({ user_id, pathway_id, weight, last_activated: new Date().toISOString() },
{ onConflict: ‘user_id,pathway_id’ });
if (error) return res.status(500).json({ error: error.message });
return res.status(200).json({ success: true });
}
}
