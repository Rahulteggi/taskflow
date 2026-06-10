# 📋 TaskFlow — Full Stack Task Manager SaaS

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)

> A production-ready task management app with team collaboration, real-time updates, and role-based access control.

## 🚀 Live Demo
[https://taskflow-demo.vercel.app](https://taskflow-demo.vercel.app) · [API Docs](https://taskflow-demo.vercel.app/api/docs)

> **Demo credentials:** `demo@taskflow.app` / `password123`

---

## ✨ Features

- **Authentication** — JWT-based login/register with refresh tokens
- **CRUD Tasks** — Create, update, delete, and reorder tasks with drag-and-drop
- **Boards & Projects** — Organize tasks into Kanban boards
- **Team Collaboration** — Invite members, assign tasks, leave comments
- **Role-Based Access** — Admin, Member, Viewer roles per project
- **Real-time Updates** — WebSocket-powered live sync across users
- **Search & Filter** — Filter by status, priority, assignee, due date
- **Dark Mode** — Full dark/light theme support

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Query, Tailwind CSS, DnD Kit |
| Backend | Node.js, Express.js, REST API |
| Database | MongoDB + Mongoose |
| Auth | JWT (access + refresh tokens), bcrypt |
| Real-time | Socket.io |
| Deployment | Vercel (frontend) + Railway (backend) |

---

## 📂 Project Structure

```
taskflow/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route pages
│   │   ├── hooks/          # Custom React hooks
│   │   ├── context/        # Auth & theme context
│   │   └── api/            # API client functions
│   └── package.json
├── server/                 # Express backend
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API routes
│   │   ├── middleware/      # Auth, error handling
│   │   └── utils/          # Helpers
│   └── package.json
└── README.md
```

---

## 🏃 Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas)

### Installation

```bash
# Clone the repo
git clone https://github.com/Rahulteggi/taskflow.git
cd taskflow

# Install backend dependencies
cd server && npm install

# Install frontend dependencies
cd ../client && npm install
```

### Environment Variables

Create `server/.env`:
```env
MONGO_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=your_super_secret_key
JWT_REFRESH_SECRET=your_refresh_secret
PORT=5000
CLIENT_URL=http://localhost:3000
```

Create `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### Run Locally

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

App runs at `http://localhost:3000`

---

## 🔌 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/projects` | Get all user projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id/tasks` | Get tasks for project |
| POST | `/api/tasks` | Create task |
| PATCH | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |

Full API docs: [Swagger UI →](https://taskflow-demo.vercel.app/api/docs)

---

## 📸 Screenshots

| Board View | Task Detail | Team Settings |
|-----------|-------------|--------------|
| ![board](./docs/board.png) | ![detail](./docs/detail.png) | ![team](./docs/team.png) |

---

## 🤝 Contributing

1. Fork the repo
2. Create your branch: `git checkout -b feature/your-feature`
3. Commit: `git commit -m 'Add some feature'`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

MIT © [Rahul Teggi](https://github.com/Rahulteggi)
