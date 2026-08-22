# GlobeTrotter — Empowering Personalized Travel Planning

A modern, full-stack MERN (MongoDB, Express.js, React + Vite, Node.js) web application designed for hackathons and production travel planning.

## 🚀 Features Scaffolding
- **Frontend**: React 19, Vite, Tailwind CSS v4, React Router v6, Axios
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT Auth middleware
- **Styling**: Responsive, mobile-first design with curated dark themes and custom utilities
- **API Health Check**: Built-in backend operational verification

## 📁 Repository Structure
```
globetrotter/
├── client/          # React + Vite frontend SPA
│   ├── src/
│   │   ├── api/     # Centralized Axios HTTP client
│   │   ├── pages/   # Application pages (Home, etc.)
│   │   └── ...
│   ├── .env.example
│   └── package.json
│
└── server/          # Express.js REST API backend
    ├── src/
    │   ├── config/  # MongoDB database connection
    │   └── index.js # Express server & routes
    ├── .env.example
    └── package.json
```

## 🛠️ Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MongoDB](https://www.mongodb.com/) (running locally or MongoDB Atlas connection string)

## 💻 Quick Start

### 1. Setup & Start Backend Server
```bash
cd server
npm install
npm run dev
```
Server runs on: `http://localhost:5000`  
Health check: `http://localhost:5000/api/health`

### 2. Setup & Start Frontend Client
In a separate terminal:
```bash
cd client
npm install
npm run dev
```
Client runs on: `http://localhost:5173`

---
*Created for the GlobeTrotter Hackathon Project.*
