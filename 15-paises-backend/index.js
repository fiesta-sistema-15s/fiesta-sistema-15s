const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const guestsRouter = require('./routes/guests');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ["GET", "POST", "PATCH"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Conexión a MongoDB Atlas (capa gratuita)
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Conectado a MongoDB Atlas'))
  .catch(err => console.log('Error conectando a MongoDB:', err));

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/guests', guestsRouter);

// Socket.io para comunicación en tiempo real
io.on('connection', (socket) => {
  console.log('Cliente conectado');
  
  socket.on('guestCheckedIn', (guestData) => {
    // Emitir a todas las pantallas de bienvenida
    io.emit('displayWelcome', guestData);
  });
  
  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

// Exportar io para usarlo en las rutas
app.set('io', io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));