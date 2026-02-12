# 🏥 Smart Hospital System - Microservices Architecture

A complete healthcare management system refactored from a monolithic MERN stack into a microservices architecture using Docker and Docker Compose.

## 📋 Architecture Overview

This project consists of **8 Docker containers**:

| Container | Service | Port | Description |
|-----------|---------|------|-------------|
| 1 | **Nginx Gateway** | 80, 443 (host) | API Gateway & Reverse Proxy |
| 2 | **Frontend** | 80 (internal) | React + Vite Application |
| 3 | **Auth Service** | 4001 | Login, Registration, JWT |
| 4 | **Core Service** | 4002 | Staff & Patients CRUD |
| 5 | **IoT Service** | 4003 | Sensor Readings |
| 6 | **Chat Service** | 4004 | Real-time Messaging (Socket.io) |
| 7 | **Medical ChatBot** | 9090 | RAG-based Medical Assistant (LangChain + Groq) |
| 8 | **MongoDB** | 27017 | Database |

## 🗂️ Project Structure

```
/
├── docker-compose.microservices.yml    # Main Docker Compose file
├── .env.example                        # Required environment variables
├── nginx/
│   ├── Dockerfile
│   └── nginx.conf                      # Reverse proxy configuration
├── frontend/
│   ├── Dockerfile.microservices
│   ├── nginx.conf
│   └── ... (React app)
├── Medical-ChatBot-main/               # RAG-based Medical Chatbot
│   ├── Dockerfile
│   ├── app.py                          # Flask server
│   ├── requirements.txt
│   └── src/                            # LangChain helpers & prompts
└── services/
    ├── auth-service/
    │   ├── Dockerfile
    │   ├── index.js
    │   ├── package.json
    │   ├── controllers/
    │   ├── middleware/
    │   ├── models/
    │   └── routes/
    ├── core-service/
    │   ├── Dockerfile
    │   ├── index.js
    │   ├── package.json
    │   ├── controllers/
    │   ├── middleware/
    │   ├── models/
    │   └── routes/
    ├── iot-service/
    │   ├── Dockerfile
    │   ├── index.js
    │   ├── package.json
    │   ├── controllers/
    │   ├── middleware/
    │   ├── models/
    │   └── routes/
    └── chat-service/
        ├── Dockerfile
        ├── index.js
        ├── package.json
        ├── controllers/
        ├── middleware/
        ├── models/
        ├── routes/
        └── sockets/
```

## 🚀 Getting Started

### Prerequisites

- Docker Desktop installed
- Docker Compose v2+
- Pinecone API key (for medical chatbot vector store)
- Groq API key (for medical chatbot LLM)

### Environment Variables

Copy `.env.example` to `.env` and configure the required variables:

```bash
cp .env.example .env
```

Required variables:
- `PINECONE_API_KEY` - For vector database
- `GROQ_API_KEY` - For LLM inference
- `JWT_SECRET_KEY` - For authentication

### Running the Application

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Graduation-Project-main
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Build and start all services**
   ```bash
   docker-compose -f docker-compose.microservices.yml up --build
   ```

4. **Access the application**
   - Frontend: https://localhost (or http://localhost:80)
   - API Gateway: https://localhost/api/*
   - Medical ChatBot API: POST https://localhost/api/chatbot
   - MongoDB: localhost:27017

5. **Stop all services**
   ```bash
   docker-compose -f docker-compose.microservices.yml down
   ```

6. **Stop and remove volumes (clean start)**
   ```bash
   docker-compose -f docker-compose.microservices.yml down -v
   ```

## 🔌 API Routes

All API routes are accessed through the Nginx gateway on port **8080**.

### Authentication Service (`/api/auth` or `/api/login`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/login` | Authenticate user |
| POST | `/api/login/add` | Register new user |
| GET | `/api/login/verify` | Verify JWT token |

### Core Service
#### Staff (`/api/staff`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/staff` | Get all staff (Admin) |
| POST | `/api/staff/add` | Add new staff member |
| GET | `/api/staff/doctors` | Get all doctors |
| GET | `/api/staff/nurses` | Get all nurses |
| GET | `/api/staff/receptionists` | Get all receptionists |
| GET | `/api/staff/:id` | Get staff by ID |
| PATCH | `/api/staff/:id` | Update staff |
| DELETE | `/api/staff/:id` | Delete staff |

#### Patients (`/api/patients`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/patients` | Get all patients |
| POST | `/api/patients/add` | Add new patient |
| GET | `/api/patients/:id` | Get patient by ID |
| PATCH | `/api/patients/:id` | Update patient |
| DELETE | `/api/patients/:id` | Delete patient |

#### Other (`/api/other`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/other/doc/pats/:id` | Get doctor's patients |

### IoT Service (`/api/readings`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/readings` | Get all readings (Admin) |
| POST | `/api/readings/add` | Add new reading (IoT devices) |
| GET | `/api/readings/:id` | Get readings by device ID |

### Chat Service
#### Conversations (`/api/conversations`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/conversations/:doc_id` | Get doctor's conversations |

#### Messages (`/api/messages`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/messages/send` | Send a message |
| GET | `/api/messages/:conv_id` | Get messages in conversation |
| POST | `/api/messages/read` | Mark messages as read |

### WebSocket (Socket.io)
Connect to `ws://localhost:8080/socket.io` for real-time chat.

**Events:**
- `online` - Mark user as online
- `joinConversation` - Join a conversation room
- `sendMessage` - Send a message
- `receiveMessage` - Receive a message
- `errorMessage` - Error notification

## 🔐 Environment Variables

Each service uses the following environment variables (configured in docker-compose):

| Variable | Description |
|----------|-------------|
| `PORT` | Service port |
| `DATABASE_URL` | MongoDB connection string |
| `JWT_SECRET_KEY` | Secret key for JWT tokens |

**⚠️ Important:** Change `JWT_SECRET_KEY` in production!

## 🏗️ Development

### Running Individual Services

```bash
# Auth Service
cd services/auth-service
npm install
npm run dev

# Core Service
cd services/core-service
npm install
npm run dev

# IoT Service
cd services/iot-service
npm install
npm run dev

# Chat Service
cd services/chat-service
npm install
npm run dev
```

### Rebuilding a Single Service

```bash
docker-compose -f docker-compose.microservices.yml up --build <service-name>
# Example: docker-compose -f docker-compose.microservices.yml up --build auth-service
```

## 📊 Service Communication

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (Browser)                         │
└─────────────────────────┬───────────────────────────────────┘
                          │ Port 8080
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   Nginx API Gateway                          │
│   /api/auth → Auth    /api/staff,patients → Core            │
│   /api/readings → IoT  /socket.io → Chat                    │
│   / → Frontend                                               │
└────┬────────┬────────┬────────┬────────┬───────────────────┘
     │        │        │        │        │
     ▼        ▼        ▼        ▼        ▼
┌────────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────────┐
│Frontend│ │ Auth │ │ Core │ │ IoT  │ │   Chat   │
│ :80    │ │:4001 │ │:4002 │ │:4003 │ │  :4004   │
└────────┘ └──┬───┘ └──┬───┘ └──┬───┘ └────┬─────┘
              │        │        │          │
              └────────┴────────┴──────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │    MongoDB      │
                    │    :27017       │
                    └─────────────────┘
```

## 🔧 Troubleshooting

### Common Issues

1. **Services can't connect to MongoDB**
   - Ensure MongoDB container is healthy: `docker ps`
   - Check logs: `docker-compose logs mongo`

2. **Socket.io not connecting**
   - Verify WebSocket upgrade headers in nginx.conf
   - Check browser console for connection errors

3. **CORS errors**
   - All services have CORS enabled with `origin: "*"`
   - For production, configure specific origins

### Viewing Logs

```bash
# All services
docker-compose -f docker-compose.microservices.yml logs

# Specific service
docker-compose -f docker-compose.microservices.yml logs auth-service

# Follow logs
docker-compose -f docker-compose.microservices.yml logs -f
```

## 📝 License

ISC License

## 👥 Authors

Smart Hospital System Development Team
