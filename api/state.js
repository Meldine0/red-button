import { getState } from '../lib/game.js';

export default async function handler(req, res) {
  res.json(await getState());
}
