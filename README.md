# Nexora AI

**AI-powered Career Intelligence Platform for Developers**

Nexora AI is a full-stack AI assistant built for developers and tech professionals. It combines multi-mode AI workspaces, automatic memory, document intelligence, and realtime streaming — with deep personalization based on your skills, goals, and tech stack.

---

## Tech Stack

**Frontend** — React.js · Vite · Tailwind CSS · Socket.io Client

**Backend** — Node.js · Express.js · MongoDB · Redis · Socket.io · Multer · PDF Parse

**AI Layer** — Groq API (LLaMA 3.3 70B) · Prompt Engineering · AI Memory Engine

---

## Features

### ✅ Authentication & User System
- User Registration & Login
- JWT Authentication & Protected Routes
- Guest User Support + Guest Chat Migration

### ✅ Realtime Chat System
- Socket.io Integration with AI Streaming Responses
- AI Typing Effect & Conversation History
- Edit Message & Regenerate Response
- Share Conversations & Realtime Messaging

### ✅ AI Workspace System (27 Specialized Modes)

| Category | Modes |
|---|---|
| Backend | Node.js · Python/FastAPI · Java/Spring · Go · PHP/Laravel · Ruby on Rails |
| Frontend | React/Next.js · Vue/Nuxt · Angular · Svelte · Vanilla JS · Three.js/WebGL |
| DevOps | Docker/K8s · CI/CD · AWS Cloud · Infrastructure as Code |
| Mobile | React Native/Expo · Flutter/Dart |
| Fullstack | Next.js + Node · T3 Stack |
| AI Engineering | RAG Systems · AI Agents · LLM Fine-tuning |
| Career | Resume · System Design · Tech Intelligence · Market Learning |

### ✅ Resume Intelligence
- ATS Resume Analysis · Summary Generation · Strength & Weakness Detection
- Missing Skills Detection · ATS Keyword Suggestions · Improvement Suggestions
- JD Match Engine — Resume vs JD Match Score · Interview Focus Areas
- Resume Bullet Optimizer — ATS-friendly Bullet Generation

### ✅ AI Memory Engine
- Automatic Memory Detection from Conversations
- Personalized AI Responses via Memory Context Injection
- Memory Storage, APIs, and Management

### ✅ Document Intelligence
- PDF Upload (Multer) · PDF Text Extraction
- AI Document Chat · Document APIs · Temporary File Processing

### ✅ Frontend Features
- Dark / Light Theme
- AI Workspace Sidebar · Resume Intelligence UI
- Scrollable Streaming Chat Interface
- Authentication UI · File Upload UI

---

### ❌ Pending Features

**Career Intelligence**
- Career Roadmap Generator · AI Mock Interviews · LinkedIn Optimizer
- Career Progress Tracking · Skill Gap Analysis · Learning Recommendations

**Advanced AI**
- Real RAG System · Embeddings · Vector Database · Semantic Search
- AI Research Mode · Multi-Agent AI System · Tool Calling

**Product**
- Admin & Analytics Dashboard · AI Usage Tracking
- Subscription / Billing · Notifications · Team Workspaces

---

## Architecture

```
Frontend (React + Vite)
        ↓ WebSocket + REST
Express.js Backend
        ↓
AI Orchestrator
  ├── Memory Context
  ├── RAG Context
  ├── Live Search Context
  └── Mode Prompt (27 roles)
        ↓
Groq API — LLaMA 3.3 70B (streaming)
        ↓
Socket.io → Browser
```

```
MongoDB  →  Users · Conversations · Messages · Documents · Memories
Redis    →  Guest sessions · Caching
```

---

## Quick Start

**Prerequisites:** Node.js 18+ · MongoDB · Redis · [Groq API key](https://console.groq.com) (free)

```bash
# Clone
git clone https://github.com/girraj12/Nexora-AI
cd nexora-ai

# Backend
cd backend && npm install && cp .env.example .env
npm run dev

# Frontend (new terminal)
cd frontend && npm install
npm run dev
```

Frontend → `http://localhost:5173` · Backend → `http://localhost:5000`

---

## Environment Variables

**Backend `.env`**
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/nexora-ai
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
REDIS_URL=redis://localhost:6379
FRONTEND_URL=http://localhost:5173
```

**Frontend `.env`**
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login → JWT |
| POST | `/api/conversations/create` | New conversation |
| GET | `/api/conversations` | List conversations |
| GET | `/api/conversations/:id/messages` | Get messages |
| DELETE | `/api/conversations/:id` | Delete conversation |
| POST | `/api/conversations/:id/share` | Share link |
| POST | `/api/documents/upload` | Upload PDF |
| POST | `/api/documents/:id/ask` | Ask document |
| GET | `/api/memories` | Get memories |
| DELETE | `/api/memories/:id` | Delete memory |
| POST | `/api/resume/analyze` | ATS resume analysis |
| POST | `/api/resume/match-jd` | Resume vs JD match score |
| POST | `/api/resume/generate-bullets` | Resume bullet optimizer |

---

## Socket Events

**Client → Server:** `send_message` · `edit_message` · `guest_load_messages`

**Server → Client:** `ai_stream_start` · `ai_stream_chunk` · `ai_stream_end` · `receive_message` · `ai_typing` · `messages_updated` · `conversation_updated`

---

## Deployment

| Service | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB Atlas |
| Redis | Upstash |

---

## Author

**Girraj Singhal** — Backend Engineer · Realtime Systems · AI-integrated Applications