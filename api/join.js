import { getState, broadcast } from '../lib/game.js';

export default async function handler(req, res) {
  const { playerId, name } = req.body;
  if (!playerId || !name) return res.status(400).json({ error: 'missing fields' });
  const state = await getState();
  state.players[playerId] = { id: playerId, name: name.trim().slice(0, 20) || 'Joueur' };
  await broadcast(state);
  res.json({ ok: true });
}
