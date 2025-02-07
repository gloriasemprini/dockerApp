const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const homeRoutes = require('./routes/homeRoutes');
const profileRoutes = require('./routes/profileRoutes');
const groupRoutes = require('./routes/groupRoutes');
const adminRoutes = require('./routes/adminRoutes');
const mongoose = require('mongoose');
const notificationService = require('./services/notificationService');
const WebSocket = require('ws');

const User = require('./models/user');

require('./utils/wsUtils');
require('./db');
require('./docPing');

const http = require("http");

const app = express();
const port = 3000;

app.use(cors({
  origin: 'http://localhost:4200',
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
}));

app.use(bodyParser.json());

// Rotte
app.use('/auth', authRoutes);
app.use('/home', homeRoutes);
app.use('/api', profileRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/groups/admin', adminRoutes);

app.get('/debug-users', async (req, res) => {
  try {
    const users = await User.find(); // Recupera tutti gli utenti
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Errore durante il recupero degli utenti.' });
  }
});

app.get('/test-db', async (req, res) => {
  try {
    const connectionState = mongoose.connection.readyState;
    res.json({
      message: 'Connessione al database riuscita',
      state: connectionState
    });
  } catch (error) {
    res.status(500).json({
      message: 'Errore di connessione al database',
      error: error.message
    });
  }
});

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
  const origin = req.headers.origin;
  console.log(`Received ${origin}`);
  if (origin !== 'http://localhost:4200') {
    ws.close();
    return;
  }
  console.log('Client socket connesso');

  ws.send(JSON.stringify({ event: 'connection', message: 'Connessione stabilita con successo!' }));
});

notificationService.on('containerevent', (data) => {
  console.log(`Evento: ${data.event} - Messaggio: ${data.message}`);

  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
});

server.listen(port, () => {
  console.log(`Server in esecuzione su http://localhost:${port}`);
});
