import { getState, broadcast } from '../lib/game.js';

export default async function handler(req, res) {
  const { playerId } = req.body;
  const state = await getState();
  if (state.locked) return res.status(403).json({ error: 'locked' });
  const player = state.players[playerId];
  if (!player) return res.status(404).json({ error: 'player not found' });
  if (state.presses.find(p => p.id === playerId)) return res.json({ ok: true });
  state.presses.push({ id: playerId, name: player.name, time: Date.now() });
  await broadcast(state);
  res.json({ ok: true });
}
