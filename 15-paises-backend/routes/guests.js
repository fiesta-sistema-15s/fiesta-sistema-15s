const express = require('express');
const router = express.Router();
const Guest = require('../models/Guest.js');

// Obtener todos los invitados
router.get('/', async (req, res) => {
  try {
    const guests = await Guest.find();
    res.json(guests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Crear nuevo invitado
router.post('/', async (req, res) => {
  const guest = new Guest({
    name: req.body.name,
    country: req.body.country,
    table: req.body.table
  });

  try {
    await guest.save();
    res.status(201).json("Invitado creado correctamente");
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Registrar asistencia
router.patch('/:id/checkin', async (req, res) => {
  try {
    const guest = await Guest.findById(req.params.id);
    
    if (!guest) {
      return res.status(404).json({ message: 'Invitado no encontrado' });
    }
    
    guest.attended = true;
    guest.checkInTime = new Date();
    
    await guest.save();
    
    // Emitir evento vía Socket.io
    const io = req.app.get('io');
    io.emit('displayWelcome', {
      id: guest._id,
      name: guest.name,
      country: guest.country,
      flightNumber: Math.floor(Math.random() * 900) + 100
    });
    
    res.status(201).json(guest);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Buscar invitado por nombre
router.get('/search', async (req, res) => {
  try {
    if(req.query.name === ''){
      const guests = await Guest.find();
      return res.json(guests);
    }
    const searchTerm = req.query.name.trim();
    const guests = await Guest.find({
      name: { $regex: searchTerm, $options: 'i' }
    });
    res.json(guests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// En tu archivo de rutas del servidor (por ejemplo, routes/guests.js)

// Endpoint para obtener invitados paginados
router.get('/paginated', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Contar total de documentos para calcular páginas
    const total = await Guest.countDocuments();
    
    // Obtener invitados para la página actual
    const guests = await Guest.find()
      .sort({ name: 1 }) // Ordenar por nombre
      .skip(skip)
      .limit(limit);
    
    res.json({
      guests,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalGuests: total
    });
  } catch (error) {
    console.error('Error fetching paginated guests:', error);
    res.status(500).json({ message: 'Error al obtener invitados' });
  }
});

module.exports = router;