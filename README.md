
# TaskFlow 🚀
**A real-time, collaborative task management platform for modern teams.**

[![Live Demo](https://img.shields.io/badge/Live_Demo-View_App-4CAF50)](https://taskflow-ivory-nu.vercel.app/)
[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E)](https://nestjs.com/)
[![GraphQL](https://img.shields.io/badge/GraphQL-Apollo_Server-E10098)](https://graphql.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.3-000000)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6)](https://www.typescriptlang.org/)
[![Apollo Client](https://img.shields.io/badge/Apollo_Client-Caching-311C87)](https://www.apollographql.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791)](https://neon.tech/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248)](https://www.mongodb.com/atlas)
[![Redis](https://img.shields.io/badge/Redis-Upstash-DC382D)](https://upstash.com/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED)](https://www.docker.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-Latest-000000)](https://ui.shadcn.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4)](https://tailwindcss.com/)
[![Radix UI](https://img.shields.io/badge/Radix_UI-Accessible-161618)](https://www.radix-ui.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Status](https://img.shields.io/badge/Status-Active-brightgreen)](https://github.com/tolkensak/TaskFlow)

<br />

## 📖 Overview

TaskFlow is a full-stack, real-time collaborative task management platform. It combines a drag-and-drop Kanban board with instant multi-client synchronization, JWT authentication, and a protected dashboard.

Built as a deep dive into modern full-stack architecture: GraphQL subscriptions, Redis Pub/Sub, hybrid relational + document databases, and a production deployment on Vercel and Render.

> 🚀 **[Try TaskFlow live →](https://taskflow-ivory-nu.vercel.app/)**
>
> Use the demo account: `demo@taskflow.app` / `demo1234`

<br />

## 📸 Screenshots

### Kanban Board

![Kanban Board](./screenshots/kanban.png)

### Real-time Sync (two browser tabs)

![Real-time sync](./screenshots/real-time-sync.gif)

<br />

## ✨ Key Features

- **Real-Time Collaboration** — Create, update, or delete tasks in one browser tab and watch them update instantly in another (powered by GraphQL Subscriptions and Redis Pub/Sub).
- **Drag-and-Drop Kanban** — Move tasks between columns with **optimistic UI updates** via Apollo's `optimisticResponse`.
- **Secure Authentication** — JWT-based auth with access and refresh tokens.
- **Protected Routes** — Dashboard and board are secure; users can only see their own data.
- **Hybrid Database Architecture** —
  - *PostgreSQL* for highly relational data (Users, Tasks, Task Assignments).
  - *MongoDB* for flexible document storage (Notifications).
  - *Redis* for WebSocket Pub/Sub and real-time event broadcasting.

<br />

## 🛠️ Tech Stack

**Frontend (Deployed on Vercel):**
- **Next.js 16 (App Router)** — React framework for server and client components
- **TypeScript** — End-to-end type safety
- **Apollo Client** — State management and GraphQL caching (Optimistic UI)
- **Tailwind CSS & Radix UI** — Custom, accessible component design
- **shadcn/ui** — High-quality UI primitives

**Backend (Deployed on Render):**
- **NestJS** — Modular, enterprise-grade Node.js framework
- **GraphQL (Apollo Server)** — Flexible API layer
- **TypeORM** — PostgreSQL Object Relational Mapper
- **Mongoose** — MongoDB object modeling
- **Passport.js & JWT** — Authentication and authorization
- **Docker** — Containerized backend deployment

**Infrastructure & Databases:**
- **PostgreSQL (Neon)** — Serverless SQL database
- **MongoDB Atlas** — Cloud NoSQL database
- **Upstash Redis** — Serverless Redis for Pub/Sub and caching

<br />

## 🏗️ Architecture

```text
[ Next.js Frontend (Vercel) ]
      │
      ├── HTTP + WebSocket (Apollo Client)
      ▼
[ NestJS Backend (Render / Docker) ]
      │
      ├── GraphQL API + Subscriptions
      │
      ├── [ PostgreSQL ] (Neon)   ── Users, Tasks, Assignments
      ├── [ MongoDB ]    (Atlas)  ── Notifications
      └── [ Redis ]      (Upstash)── Pub/Sub for Real-time Subscriptions
```

**Data flow for real-time updates:**

1. Client A updates a task → GraphQL mutation
2. NestJS updates PostgreSQL
3. NestJS publishes an event to Redis Pub/Sub
4. Redis broadcasts the event to all NestJS instances
5. Each instance pushes the update through GraphQL Subscriptions
6. Client B receives the update via WebSocket → Apollo cache updates → UI re-renders

<br />

## 🗺️ Roadmap

- [x] JWT authentication with refresh tokens
- [x] GraphQL API with subscriptions
- [x] Drag-and-drop Kanban board with optimistic UI
- [x] Real-time updates via Redis Pub/Sub
- [x] Deployment on Vercel (frontend) + Render (backend)
- [ ] Projects module (multi-project support)
- [ ] User roles (admin, member, viewer)
- [ ] File attachments
- [ ] Activity log
- [ ] Test suite (Vitest + Playwright)
- [ ] CI/CD via GitHub Actions

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
# Copy from backend/.env.example and fill in your local values
DATABASE_URL=postgresql://user:pass@localhost:5432/taskflow
MONGODB_URI=mongodb://user:pass@localhost:27017/taskflow
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-key
# ...see .env.example for the full list
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

- **Cache Synchronization** — Mastered Apollo's normalized cache to ensure the Dashboard and Kanban Board stayed perfectly in sync without manual refetches. Combined with `optimisticResponse` for instantaneous drag-and-drop feedback.
- **Real-time WebSockets** — Overcame CORS and connection issues to successfully deploy Redis Pub/Sub across a serverless architecture. Handled authentication for WebSocket connections via `connectionParams`.
- **Cloud Deployment** — Navigated the complexities of deploying a NestJS backend via Docker to Render, and a Next.js frontend to Vercel, managing cross-origin resources securely.
- **Hybrid Database Design** — Decided what belongs in PostgreSQL (relational, transactional) vs. MongoDB (documents, notifications) — and how to keep them consistent.

<!--
<br />

## 🧪 Testing

- **Unit tests:** Vitest (coming soon)
- **E2E tests:** Playwright (coming soon)

The project currently has manual testing for real-time sync across two browser tabs.
-->

<br />

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
