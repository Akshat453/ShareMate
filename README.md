# ShareMate — Community Resource & Task Sharing Platform

A full-stack community platform for collaborative activities, resource sharing, and direct assistance.

## Tech Stack

- **Frontend:** React (Vite), React Router v6, Zustand, Axios, Socket.io-client, Framer Motion, Leaflet.js, React Hook Form + Zod
- **Backend:** Node.js + Express.js, MongoDB + Mongoose
- **Auth:** JWT (access + refresh tokens), bcrypt, HTTP-only cookies
- **Real-time:** Socket.io
- **Design:** Custom warm dark theme with gold accents, Playfair Display + DM Sans typography

## Setup

### Prerequisites
- Node.js 18+
- MongoDB running locally on `mongodb://localhost:27017`

### Installation

```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### Environment

Copy `.env` to the project root and update values as needed. The default values work for local development with MongoDB on localhost.

### Seed Database

```bash
cd server
node utils/seed.js
```

This creates:
- 10 users (test login: `arjun@sharemate.com` / `password123`)
- 20 events across 8 categories
- 15 listings (share/give/take)

### Run

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api
- Health check: http://localhost:8000/api/health

## Features

- 🔐 JWT auth with refresh token rotation
- 📅 Events: Create, browse, filter by category, join/leave
- 📦 Listings: Share, give, take items with request system
- 🗺️ Interactive dark map with category markers
- 💬 Real-time chat via Socket.io
- 🏆 Leaderboard & impact tracking
- 📱 Mobile-first responsive design
- ✨ Framer Motion page transitions & staggered card reveals

## API

| Route | Methods |
|-------|---------|
| `/api/auth` | POST register, login, refresh, logout |
| `/api/users` | GET profile, leaderboard, PUT update |
| `/api/events` | GET list/nearby, POST create, PUT, DELETE, JOIN/LEAVE |
| `/api/listings` | GET list, POST create, PUT, DELETE, REQUEST |
| `/api/chat` | GET/POST conversations, messages |
| `/api/notifications` | GET, PUT read |
