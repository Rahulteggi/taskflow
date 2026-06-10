const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173', methods: ['GET', 'POST'] }
});

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

// Socket.io — real-time task updates
io.on('connection', (socket) => {
  socket.on('join-project', (projectId) => socket.join(projectId));
  socket.on('task-updated', (data) => socket.to(data.projectId).emit('task-updated', data));
  socket.on('task-created', (data) => socket.to(data.projectId).emit('task-created', data));
  socket.on('task-deleted', (data) => socket.to(data.projectId).emit('task-deleted', data));
});

// Make io accessible in routes
app.set('io', io);

const PORT = process.env.PORT || 8080;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => console.error('DB connection error:', err));
