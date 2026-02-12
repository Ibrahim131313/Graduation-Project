# 🏥 Smart Hospital System

A comprehensive healthcare management platform built with a **microservices architecture**. The system provides real-time patient monitoring, AI-powered medical assistance, and seamless communication between healthcare professionals.

![Architecture](Architecture%20Diagram.png)

---

## 📋 Architecture Overview

The system consists of **7 Docker containers** working together:

| Service | Technology | Port | Description |
|---------|------------|------|-------------|
| **API Gateway** | Nginx | 80, 443 | Reverse proxy, SSL termination, request routing |
| **Frontend** | React + Vite | 80 (internal) | Patient/Doctor/Admin dashboards |
| **Auth Service** | Node.js + Express | 4001 | JWT authentication, user registration |
| **Core Service** | Node.js + Express | 4002 | Staff & patient management (CRUD) |
| **IoT Service** | Node.js + Express | 4003 | Medical device sensor readings |
| **Chat Service** | Node.js + Socket.io | 4004 | Real-time messaging between users |
| **Medical ChatBot** | Python Flask + LangChain | 9090 | RAG-based AI medical assistant |
| **Database** | MongoDB | 27017 | Persistent data storage |

---

## ✨ Features

- **🤖 AI Medical Assistant (RAG)** — Intelligent chatbot powered by LangChain, Pinecone vector database, and Groq LLM for medical Q&A
- **💬 Real-time Chat** — Socket.io powered messaging between doctors, nurses, and patients
- **📊 IoT Dashboard** — Live monitoring of patient vitals from connected medical devices
- **🔐 Secure Authentication** — JWT-based auth with role-based access control (Admin, Doctor, Nurse, Patient, Receptionist)
- **📱 Responsive UI** — Modern React frontend with dark/light theme support

---

## 🛠️ Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (v20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2.0+)

That's it! No need to install Node.js, Python, or MongoDB locally.

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Ibrahim131313/Graduation-Project.git
cd Graduation-Project
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` with your API keys:

```env
# Medical ChatBot Configuration
PINECONE_API_KEY=your_pinecone_api_key_here
GROQ_API_KEY=your_groq_api_key_here

# JWT Authentication (generate a secure random string)
JWT_SECRET_KEY=your_super_secret_jwt_key_here
```

> **Note:** Get your API keys from:
> - [Pinecone](https://www.pinecone.io/) — Vector database for RAG
> - [Groq](https://console.groq.com/) — LLM inference API

### 3. Build and Run

```bash
docker-compose -f docker-compose.microservices.yml up --build
```

### 4. Access the Application

| Service | URL |
|---------|-----|
| Frontend | http://localhost |
| API Gateway | http://localhost/api/* |
| MongoDB | localhost:27017 |

### 5. Stop the System

```bash
docker-compose -f docker-compose.microservices.yml down
```

To remove all data (clean start):

```bash
docker-compose -f docker-compose.microservices.yml down -v
```

---

## 📁 Project Structure

```
├── docker-compose.microservices.yml   # Main orchestration file
├── docker-compose.prod.yml            # Production deployment
├── .env.example                       # Environment variables template
├── nginx/                             # API Gateway configuration
├── frontend/                          # React + Vite application
├── Medical-ChatBot-main/              # Python RAG chatbot service
└── services/
    ├── auth-service/                  # Authentication microservice
    ├── core-service/                  # Staff & patients microservice
    ├── iot-service/                   # IoT readings microservice
    └── chat-service/                  # Real-time chat microservice
```

---

## 🔧 API Endpoints

| Endpoint | Service | Description |
|----------|---------|-------------|
| `POST /api/auth/login` | Auth | User login |
| `POST /api/auth/register` | Auth | User registration |
| `GET /api/staff` | Core | Get all staff members |
| `GET /api/patients` | Core | Get all patients |
| `GET /api/readings/:patientId` | IoT | Get patient vitals |
| `POST /api/chatbot` | Medical Bot | AI medical assistant |
| `/socket.io` | Chat | WebSocket connection |

---

## 👥 Authors

- **Ibrahim** — [GitHub](https://github.com/Ibrahim131313)

---

## 📄 License

This project is developed as a graduation project for Electronics and Communication Engineering.
