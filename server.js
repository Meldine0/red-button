const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  transports: ['websocket'],
  perMessageDeflate: false,
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Game state
let state = {
  locked: false,
  round: 1,
  presses: [],      // [{id, name, time}] ordered by press time
  players: {},      // {socketId: {name}}
};

function broadcastState() {
  const payload = {
    locked: state.locked,
    round: state.round,
    presses: state.presses,
    players: Object.values(state.players),
  };
  io.emit('state', payload);
}

io.on('connection', (socket) => {
  // Player joins
  socket.on('join', (name) => {
    state.players[socket.id] = { id: socket.id, name: name.trim() || 'Joueur' };
    broadcastState();
  });

  // Player presses button
  socket.on('press', () => {
    if (state.locked) return;
    const player = state.players[socket.id];
    if (!player) return;
    const alreadyPressed = state.presses.find(p => p.id === socket.id);
    if (alreadyPressed) return;
    state.presses.push({ id: socket.id, name: player.name, time: Date.now() });
    broadcastState();
  });

  // Admin: reset presses for new question
  socket.on('reset', () => {
    state.presses = [];
    state.locked = false;
    broadcastState();
  });

  // Admin: next round
  socket.on('next_round', () => {
    state.round += 1;
    state.presses = [];
    state.locked = false;
    broadcastState();
  });

  // Admin: toggle lock
  socket.on('toggle_lock', () => {
    state.locked = !state.locked;
    broadcastState();
  });

  // Admin: update player name
  socket.on('rename', ({ id, name }) => {
    if (state.players[id]) {
      state.players[id].name = name.trim() || state.players[id].name;
      state.presses = state.presses.map(p => p.id === id ? { ...p, name: state.players[id].name } : p);
      broadcastState();
    }
  });

  socket.on('disconnect', () => {
    delete state.players[socket.id];
    state.presses = state.presses.filter(p => p.id !== socket.id);
    broadcastState();
  });

  // Send current state on connect
  socket.emit('state', {
    locked: state.locked,
    round: state.round,
    presses: state.presses,
    players: Object.values(state.players),
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Red Button running on http://localhost:${PORT}`));
