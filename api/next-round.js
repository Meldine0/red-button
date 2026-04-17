import { getState, broadcast } from '../lib/game.js';

export default async function handler(req, res) {
  const state = await getState();
  state.round += 1;
  state.presses = [];
  state.locked = false;
  await broadcast(state);
  res.json({ ok: true });
}
