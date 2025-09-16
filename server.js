// server.js
// Simple WebSocket signaling server for 1-to-1 WebRTC
// Run: npm init -y && npm i express ws && node server.js

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, 'public')));

const rooms = {}; // roomName -> [ws, ws]

wss.on('connection', (ws) => {
  ws.room = null;

  ws.on('message', (msg) => {
    let data;
    try { data = JSON.parse(msg); } catch(e){ return; }

    if (data.cmd === 'join') {
      const room = String(data.room || 'default');
      ws.room = room;
      rooms[room] = rooms[room] || [];
      rooms[room].push(ws);
      // Keep only two participants for 1-to-1 (drop extras)
      if (rooms[room].length > 2) {
        // remove this ws and notify
        rooms[room].pop();
        ws.send(JSON.stringify({ cmd: 'room_full' }));
        ws.close();
        return;
      }
      // Notify peers about join
      rooms[room].forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ cmd: 'peer-joined' }));
        }
      });
      // Send back count
      ws.send(JSON.stringify({ cmd: 'joined', participants: rooms[room].length }));
      return;
    }

    // Relay signaling messages to other peer in room
    if (ws.room && (data.cmd === 'offer' || data.cmd === 'answer' || data.cmd === 'ice' || data.cmd === 'chat' || data.cmd === 'reaction')) {
      const peers = rooms[ws.room] || [];
      peers.forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    }
  });

  ws.on('close', () => {
    if (!ws.room) return;
    const room = ws.room;
    if (!rooms[room]) return;
    rooms[room] = rooms[room].filter(c => c !== ws);
    if (rooms[room].length === 0) delete rooms[room];
    else {
      // notify remaining peer
      rooms[room].forEach(client => {
        if (client.readyState === WebSocket.OPEN) client.send(JSON.stringify({ cmd: 'peer-left' }));
      });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Signaling server listening on http://localhost:${PORT}`));
