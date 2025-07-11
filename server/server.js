const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
require('dotenv').config({ debug: false });
// const io = new Server(server); // ✅ Now io is defined!

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Import Socket setup
require('./socket')(io);

// Routes
const { messages } = require('./controllers/chatEvents');
const { users } = require('./controllers/userEvents');

app.get('/api/messages', (req, res) => res.json(messages));
app.get('/api/users', (req, res) => res.json(Object.values(users)));
app.get('/', (req, res) => res.send('Socket.io Chat Server is running'));

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
