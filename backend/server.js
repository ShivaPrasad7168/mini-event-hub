const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for events
let events = [];

// Routes

// GET /api/events - List all events (with optional location filter)
app.get('/api/events', (req, res) => {
  const { location } = req.query;

  let filteredEvents = events;

  if (location) {
    filteredEvents = events.filter(event =>
      event.location.toLowerCase().includes(location.toLowerCase())
    );
  }

  res.json(filteredEvents);
});

// GET /api/events/:id - Get event details
app.get('/api/events/:id', (req, res) => {
  const { id } = req.params;
  const event = events.find(e => e.id === id);

  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  res.json(event);
});

// POST /api/events - Create an event
app.post('/api/events', (req, res) => {
  const { title, description, location, date, maxParticipants, category } = req.body;

  // Validation
  if (!title || !description || !location || !date || !maxParticipants) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (maxParticipants < 1) {
    return res.status(400).json({ error: 'maxParticipants must be at least 1' });
  }

  const newEvent = {
    id: uuidv4(),
    title,
    description,
    location,
    date,
    maxParticipants: parseInt(maxParticipants),
    currentParticipants: 0,
    category,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  events.push(newEvent);
  res.status(201).json(newEvent);
});

// PUT /api/events/:id/join - Join an event (increment currentParticipants)
app.put('/api/events/:id/join', (req, res) => {
  const { id } = req.params;
  const event = events.find(e => e.id === id);

  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  if (event.currentParticipants >= event.maxParticipants) {
    return res.status(400).json({ error: 'Event is full' });
  }

  event.currentParticipants += 1;
  event.updated_at = new Date().toISOString();

  res.json(event);
});

// PUT /api/events/:id - Update an event
app.put('/api/events/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, location, date, maxParticipants, category } = req.body;

  const eventIndex = events.findIndex(e => e.id === id);

  if (eventIndex === -1) {
    return res.status(404).json({ error: 'Event not found' });
  }

  const event = events[eventIndex];

  // Validation
  if (maxParticipants && maxParticipants < event.currentParticipants) {
    return res.status(400).json({ error: 'maxParticipants cannot be less than current participants' });
  }

  if (title) event.title = title;
  if (description) event.description = description;
  if (location) event.location = location;
  if (date) event.date = date;
  if (maxParticipants) event.maxParticipants = parseInt(maxParticipants);
  if (category !== undefined) event.category = category;

  event.updated_at = new Date().toISOString();

  res.json(event);
});

// DELETE /api/events/:id - Delete an event
app.delete('/api/events/:id', (req, res) => {
  const { id } = req.params;
  const eventIndex = events.findIndex(e => e.id === id);

  if (eventIndex === -1) {
    return res.status(404).json({ error: 'Event not found' });
  }

  events.splice(eventIndex, 1);
  res.status(204).send();
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
