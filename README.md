
# TaskFlow 🚀
**A real-time, collaborative task management platform for modern teams.**

![TaskFlow Banner](./screenshots/screenshot.png) <!-- Add your best dashboard screenshot here -->

[![Live Demo](https://img.shields.io/badge/Live%20Demo-TaskFlow-blue?style=for-the-badge)](https://taskflow-ivory-nu.vercel.app/)
[![Backend API](https://img.shields.io/badge/API-Render-green?style=for-the-badge)](https://taskflow-api-847i.onrender.com/graphql)

<br />

## 📖 Overview
TaskFlow is a full-stack, single-page application designed for real-time team collaboration. It features a drag-and-drop Kanban board, instant multi-client synchronization, and a protected dashboard. 

This project was built to demonstrate enterprise-grade architecture, combining relational and document databases with GraphQL, WebSockets, and a modern React frontend.

<br />

## ✨ Key Features
- **Real-Time Collaboration:** Create, update, or delete tasks in one browser tab and watch them update instantly in another (powered by GraphQL Subscriptions and Redis Pub/Sub).
- **Drag-and-Drop Kanban:** Seamlessly move tasks between columns with optimistic UI updates.
- **Secure Authentication:** JWT-based auth with access and refresh tokens.
- **Protected Routes:** Dashboard and board are secure; users can only see their own data.
- **Hybrid Database Architecture:** 
  - *PostgreSQL* for highly relational data (Users, Tasks, Task Assignments).
  - *MongoDB* for flexible document storage (Notifications).
  - *Redis* for WebSocket Pub/Sub and real-time event broadcasting.

<br />

## 🛠️ Tech Stack

**Frontend (Deployed on Vercel):**
- **Next.js 16 (App Router):** React framework for server and client components.
- **TypeScript:** End-to-end type safety.
- **Apollo Client:** State management and GraphQL caching (Optimistic UI).
- **Tailwind CSS & Radix UI:** Custom, accessible component design.
- **shadcn/ui:** High-quality UI primitives.

**Backend (Deployed on Render):**
- **NestJS:** Modular, enterprise-grade Node.js framework.
- **GraphQL (Apollo Server):** Flexible API layer.
- **TypeORM:** PostgreSQL Object Relational Mapper.
- **Mongoose:** MongoDB object modeling.
- **Passport.js & JWT:** Authentication and authorization.
- **Docker:** Containerized backend deployment.

**Infrastructure & Databases:**
- **PostgreSQL (Neon):** Serverless SQL database.
- **MongoDB Atlas:** Cloud NoSQL database.
- **Upstash Redis:** Serverless Redis for Pub/Sub and caching.

<br />

## 🏗️ Architecture

```text
[ Next.js Frontend (Vercel) ]
      │
      ├── REST/WebSocket (Apollo Client)
      ▼
[ NestJS Backend (Render/Docker) ]
      │
      ├── GraphQL API
      │
      ├── [ PostgreSQL ] (Neon)   ── Users, Tasks, Assignments
      ├── [ MongoDB ]    (Atlas)  ── Notifications
      └── [ Redis ]      (Upstash)── Pub/Sub for Real-time Subscriptions
```

<br />

## 🚀 Getting Started Locally

### 1. Clone the repository
```bash
git clone https://github.com/tolkensak/TaskFlow.git
cd TaskFlow
```

### 2. Environment Variables
You will need to set up environment variables for both the frontend and backend. 

**Frontend (`frontend/.env.local`):**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

**Backend (`backend/.env`):**
```env
# (Copy the contents of backend/.env.example and fill in your local values)
DATABASE_URL=postgresql://user:pass@localhost:5432/taskflow
MONGODB_URI=mongodb://user:pass@localhost:27017/taskflow
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-key
# ...see .env.example
```

### 3. Start the Databases (Docker)
```bash
docker-compose up -d
```

### 4. Run the Backend
```bash
cd backend
npm install
npm run start:dev
```

### 5. Run the Frontend
```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:3000`.

<br />

## 🧠 Challenges & Learnings
- **Cache Synchronization:** Mastered Apollo's normalized cache to ensure the Dashboard and Kanban Board stayed perfectly in sync without manual refetches.
- **Real-time WebSockets:** Overcame CORS and connection issues to successfully deploy Redis Pub/Sub across a serverless architecture.
- **Cloud Deployment:** Navigated the complexities of deploying a NestJS backend via Docker to Render, and a Next.js frontend to Vercel, managing cross-origin resources securely.

<br />

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
