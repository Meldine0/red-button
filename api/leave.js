import { getState, broadcast } from '../lib/game.js';

export default async function handler(req, res) {
  const { playerId } = req.body;
  if (!playerId) return res.status(400).json({ error: 'missing playerId' });
  const state = await getState();
  delete state.players[playerId];
  state.presses = state.presses.filter(p => p.id !== playerId);
  await broadcast(state);
  res.json({ ok: true });
}
