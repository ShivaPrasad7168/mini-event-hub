# Mini Event Hub Backend

A simple REST API for the Mini Event Hub application built with Node.js and Express.

## Features

- RESTful API with 3 main endpoints
- In-memory storage (no database required)
- CORS enabled for frontend integration
- Input validation
- Error handling

## API Endpoints

### GET /api/events
List all events with optional location filter.

**Query Parameters:**
- `location` (optional): Filter events by location

**Response:** Array of events

### GET /api/events/:id
Get details of a specific event.

**Parameters:**
- `id`: Event ID

**Response:** Event object or 404 if not found

### POST /api/events
Create a new event.

**Request Body:**
```json
{
  "title": "Event Title",
  "description": "Event Description",
  "location": "Event Location",
  "date": "2024-01-01T10:00:00Z",
  "maxParticipants": 50
}
```

**Response:** Created event object

### PUT /api/events/:id/join
Join an event (increment current participants).

**Parameters:**
- `id`: Event ID

**Response:** Updated event object

### PUT /api/events/:id
Update an event.

**Parameters:**
- `id`: Event ID

**Request Body:** Same as POST, all fields optional

**Response:** Updated event object

### DELETE /api/events/:id
Delete an event.

**Parameters:**
- `id`: Event ID

**Response:** 204 No Content

## Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

   For development with auto-restart:
   ```bash
   npm run dev
   ```

The server will run on http://localhost:3001

## Deployment

This backend can be deployed to any Node.js hosting service like:
- Vercel
- Render
- Railway
- Heroku
- DigitalOcean App Platform

Make sure to set the PORT environment variable if required by your hosting provider.
