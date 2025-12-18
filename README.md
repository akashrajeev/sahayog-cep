

---

## Table of contents

- Project overview
- Architecture & file structure
- Key technologies and tools
- Local setup (dev environment)
- Running & debugging# Integrated Disaster Management and Response System (IDMRS)

Full-stack web app for disaster alerts, incident reporting, interactive maps, SOS, hospital locator, and NGO collaboration.

## Structure
- `client/`: React (Vite) + TypeScript + Tailwind + shadcn-ui + i18next + Leaflet
- `server/`: Express + Mongoose + REST API

## Setup

### Prerequisites
- Node.js 
- MongoDB (local or Atlas)

# Integrated Disaster Management & Response System (IDMRS)

This repository contains a full-stack demo application for disaster alerts, incident reporting, mapping of disaster zones, hospital/NGO directories, and an SOS flow. It is built as a developer-friendly monorepo with two main packages:

- `client/` — React + TypeScript frontend (Vite) with Tailwind CSS and Leaflet maps
- `server/` — Node.js + Express backend with Mongoose models for MongoDB

This README explains how the project is organized, how it works, how to run it locally, and useful troubleshooting steps.
- API reference
- How the map & data flow work
- Common issues & troubleshooting (CORS, duplicate React, map blank)
- Development workflow & testing
- Contributing

---

## Project overview

IDMRS is a small integrated system that lets users view disaster alerts, report incidents, view disaster-prone zones and resources on a map, request emergency SOS, and browse or register NGOs and hospitals. It's meant as a working prototype and developer exercise for integrating mapping, real-time-ish data flows, and CRUD APIs.

Core user-facing features
- Browse an interactive Leaflet map with disaster zones, incident markers and hospital locations
- Report an incident which will appear on the map
- Send an SOS request (uses browser geolocation) and post to backend
- Simple NGO & hospital directory pages

---

## Architecture & important files

Top-level layout

- `client/` — frontend app
	- `src/main.tsx` — bootstraps the React app
	- `src/App.tsx` — routes and providers (React Query, Context, Router)
	- `src/context/DisasterContext.tsx` — central client-side data source & fetches API data
	- `src/pages/DisasterMap.tsx` — map page using `react-leaflet`
	- `src/components/` — UI components (shadcn-style primitives)
	- `public/` — static assets

- `server/` — backend API
	- `server.js` — Express app and route wiring
	- `routes/*.js` — express routes (alerts, incidents, hospitals, ngos, sos)
	- `controllers/*.js` — request handlers (business logic)
	- `models/*.js` — Mongoose schemas
	- `seed/seed.js` — script to create demo data

---

## Key technologies and tools used

- Frontend
	- React 18 + TypeScript
	- Vite (dev server & build)
	- Tailwind CSS (utility-first styling)
	- shadcn/ui style components (Radix + Tailwind primitives)
	- react-leaflet + leaflet for interactive maps
	- react-i18next for localization
	- TanStack React Query (optional)

- Backend
	- Node.js + Express
	- Mongoose (MongoDB ODM)
	- cors middleware for cross-origin requests

- Tooling
	- npm for package management
	- nodemon for backend development
	- curl / Invoke-RestMethod for API checks

---

## Local setup (development)

Prerequisites
- Node.js (>= 18 recommended)
- MongoDB (local or Atlas) or set `MONGO_URI` to your cluster

Install dependencies

1. From the repository root (monorepo):

```powershell
cd C:\Users\Akash\sahayog\sahayog
npm install
```

2. (Optional) Install subpackages separately if needed:

```powershell
npm --prefix server install
npm --prefix client install
```

Environment configuration

- Server: copy `server/env.example` to `server/.env` and set `MONGO_URI` (if you use Atlas) npm --prefix client run dev
```f your frontend cannot reach the backend, ensure the backend process is running and check CORS settings (server uses a CORS middleware allowing `localhost:8080`).

---

## API reference (summary)

All endpoints are mounted under `/api`

- GET /api/alerts — list available alerts
- GET /api/incidents — list incidents
- POST /api/incidents — create incident { type, description, location: { lat, lng } }
- GET /api/hospitals — list hospitals
- GET /api/ngos — list NGOs
- POST /api/ngos — create NGO
- POST /api/sos — send an SOS request (expects userLocation)
and optionally `PORT`.
- Client: copy `client/env.example` to `client/.env` and set `VITE_API_BASE_URL` if your backend uses a non-default URL.

Seed demo data (optional)

```powershell
npm --prefix server run seed
```

Run the app in development

```powershell
# from repository root
npm run dev
# or run packages individually
npm --prefix server run dev

Use `curl` or `Invoke-RestMethod` for quick checks:

```powershell
curl http://localhost:5001/api/hospitals
```


Default dev URLs

- Frontend (Vite): http://localhost:8080 (or port printed by Vite)
- Backend (Express): http://localhost:5001 (default in server.js)

Note: I
---

## How the map & data flow works (frontend)

1. `client/src/context/DisasterContext.tsx` fetches initial data from the API when the app mounts (alerts, incidents, hospitals, ngos). It exposes this data through a React Context (`useDisaster`) used by pages and components.
2. `DisasterMap.tsx` uses `react-leaflet` components (MapContainer, TileLayer, Marker, Circle) to render:
	 - Tile layer from OpenStreetMap
	 - Circles for disaster zones (static example data)
	 - Markers for incidents and hospitals from `DisasterContext`
3. When the user reports an incident (Report page), the client posts to `/api/incidents`, and the returned incident is added to the context so it immediately appears on the map.
4. SOS uses `navigator.geolocation.getCurrentPosition()` and posts to `/api/sos` with the coordinates.

Styling & CSS notes
- Leaflet requires its CSS to be loaded before the map mounts (imported in `main.tsx`). The project includes `.leaflet-container { height: 100%; }` and ensures `html, body, #root { height: 100%; }` to avoid zero-height map containers.

---

## How the backend works

1. `server/server.js` creates an Express app, connects to MongoDB using `Mongoose`, and wires routes under `/api`.
2. Routes delegate to controllers that use Mongoose models (e.g., `models/Hospital.js`) to query and send JSON responses.
3. A `seed/seed.js` helper can populate example hospitals/incidents to test the UI.

---

## Common issues & troubleshooting

- Map is blank but page loads
	- Check browser console for React errors. A common server-side cause is **duplicate React** installs in a monorepo (context provider/consumer runtime mismatch). Run `npm ls react` at the repo root and ensure only one version is installed. If duplicates exist, remove local `file:` dependencies or dedupe.
	- Ensure Leaflet CSS is loaded and `.leaflet-container` has height. Inspect DOM → `.leaflet-container` computed height.

- API requests failing with status 0 or blocked (CORS)
	- Confirm the backend is running and reachable at the URL configured in `VITE_API_BASE_URL` or the default `http://localhost:5001`.
	- Check server logs and confirm CORS middleware is active (server includes explicit CORS configuration to allow `localhost:8080` during development).

- Tile images not loading
	- Inspect Network tab for requests to `tile.openstreetmap.org`. If blocked or returning 403, try a different tile provider or check network restrictions.

---

## Development workflow & testing

- Use the monorepo scripts to install and run both packages:

```powershell
npm install
npm run dev
```

- Recommended iterative workflow
	1. Run backend with `npm --prefix server run dev` and confirm `Server running on port 5001`.
	2. Run frontend with `npm --prefix client run dev` and open the map page.
	3. Use the browser DevTools Network & Console tabs for real-time debugging.

Automated tests
- There are no automated unit tests included in the template. For production-grade projects add Jest/React Testing Library and backend tests.

---

## Contributing

- Fork and create feature branches. Open a PR with a clear description and tests for behavior changes.
- Follow the existing code style: TypeScript on the client, JSDoc or comments on server controllers, Tailwind utility classes for styles.

---

## Where to look next (developer pointers)

- Frontend map code: `client/src/pages/DisasterMap.tsx`
- Data provider: `client/src/context/DisasterContext.tsx`
- Backend routes: `server/routes/*.js`
- Controllers: `server/controllers/*.js`
- Seed data: `server/seed/seed.js`



