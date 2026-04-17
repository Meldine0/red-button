export default function handler(req, res) {
  res.json({
    key: process.env.PUSHER_KEY,
    cluster: process.env.PUSHER_CLUSTER,
  });
}
