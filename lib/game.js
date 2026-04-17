import { kv } from '@vercel/kv';
import Pusher from 'pusher';

export const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

const DEFAULT_STATE = { locked: false, round: 1, presses: [], players: {} };

export async function getState() {
  return (await kv.get('game:state')) || DEFAULT_STATE;
}

export async function broadcast(state) {
  await kv.set('game:state', state);
  await pusher.trigger('game', 'state', state);
  return state;
}
