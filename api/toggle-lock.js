import { getState, broadcast } from '../lib/game.js';

export default async function handler(req, res) {
  const state = await getState();
  state.locked = !state.locked;
  await broadcast(state);
  res.json({ ok: true });
}
