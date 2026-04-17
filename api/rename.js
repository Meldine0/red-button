import { getState, broadcast } from '../lib/game.js';

export default async function handler(req, res) {
  const { playerId, name } = req.body;
  const state = await getState();
  if (!state.players[playerId]) return res.status(404).json({ error: 'not found' });
  state.players[playerId].name = name.trim().slice(0, 20) || state.players[playerId].name;
  state.presses = state.presses.map(p =>
    p.id === playerId ? { ...p, name: state.players[playerId].name } : p
  );
  await broadcast(state);
  res.json({ ok: true });
}
