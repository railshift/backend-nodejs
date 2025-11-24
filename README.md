# 🚂 Railway Shift Management System

A high-performance, production-grade backend system for managing and tracking shifts of loco pilots and train managers for Indian Railways goods trains.

## 🏗️ Architecture

### Technology Stack
- **Runtime**: Node.js 20+ with ES Modules
- **Framework**: Express.js
- **Database**: PostgreSQL 16
- **ORM**: Prisma
- **Cache**: Redis 7
- **Real-time**: Socket.io
- **Monitoring**: Prometheus + Grafana
- **Containerization**: Docker
- **Orchestration**: Kubernetes
- **Security**: Helmet, JWT, bcrypt, Rate Limiting

### Key Features
- ✅ Real-time duty hours tracking
- ✅ Automated notifications at 8, 9, 11, 12, 14 hour marks
- ✅ Relief planning workflow
- ✅ Role-based access control (SuperAdmin, Admin, User)
- ✅ Auto-creation of staff and locomotive records
- ✅ Comprehensive audit logging
- ✅ High availability with horizontal scaling
- ✅ Prometheus metrics for monitoring
- ✅ Secure WebSocket connections

## 📋 Prerequisites

- Node.js >= 20.x
- PostgreSQL >= 16.x
- Redis >= 7.x
- Docker & Docker Compose (optional)
- Kubernetes cluster (optional, for production)

## 🚀 Quick Start

### 1. Clone and Install

\`\`\`bash
cd /home/ranap/Documents/RailwayProject
npm install
\`\`\`

### 2. Environment Setup

\`\`\`bash
# Copy example env file
cp .env.example .env

# Edit .env with your configuration
nano .env
\`\`\`

### 3. Database Setup

\`\`\`bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Seed database
npx prisma db seed
\`\`\`

### 4. Start Development Server

\`\`\`bash
npm run dev
\`\`\`

Server will be available at:
- API: http://localhost:8000/api/v1
- Health: http://localhost:8000/health
- Metrics: http://localhost:8000/metrics

## 🐳 Docker Deployment

### Using Docker Compose

\`\`\`bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
\`\`\`

Services:
- App: http://localhost:8000
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- Prometheus: http://localhost:9091
- Grafana: http://localhost:3001 (admin/admin)

## ☸️ Kubernetes Deployment

### 1. Build Docker Image

\`\`\`bash
docker build -t railway-app:latest .
\`\`\`

### 2. Deploy to Kubernetes

\`\`\`bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Create secrets (update with real values first!)
kubectl apply -f k8s/secret.yaml

# Deploy ConfigMap
kubectl apply -f k8s/configmap.yaml

# Deploy PostgreSQL
kubectl apply -f k8s/postgres.yaml

# Deploy Redis
kubectl apply -f k8s/redis.yaml

# Deploy Application
kubectl apply -f k8s/deployment.yaml
\`\`\`

### 3. Verify Deployment

\`\`\`bash
# Check pods
kubectl get pods -n railway-system

# Check services
kubectl get svc -n railway-system

# View logs
kubectl logs -f deployment/railway-app -n railway-system
\`\`\`

## 📊 Monitoring

### Prometheus Metrics
Access metrics at: http://localhost:8000/metrics

Available metrics:
- HTTP request duration and count
- Active shifts count
- Current duty hours per shift
- Notifications sent
- Database query counts
- Redis operation counts
- Active socket connections

### Grafana Dashboards
Access Grafana at: http://localhost:3001
- Default credentials: admin/admin
- Import dashboards from Prometheus datasource

## 🔒 Security Features

1. **Authentication & Authorization**
   - JWT-based authentication
   - Role-based access control
   - Token blacklisting on logout
   - Secure password hashing with bcrypt

2. **API Security**
   - Helmet.js for HTTP headers
   - Rate limiting per IP
   - CORS configuration
   - Input validation
   - SQL injection prevention (Prisma)

3. **Data Security**
   - Encrypted connections
   - Secure environment variables
   - Audit logging
   - Non-root Docker containers

## 📡 Socket.io Events

### Client → Server
- `join:shift` - Join shift room
- `leave:shift` - Leave shift room
- `subscribe:staff` - Subscribe to staff updates
- `unsubscribe:staff` - Unsubscribe from staff updates
- `notification:ack` - Acknowledge notification
- `relief:decision` - Send relief decision

### Server → Client
- `connected` - Connection established
- `duty:update` - Duty hours update
- `notification:new` - New notification
- `relief:update` - Relief status update
- `shift:completed` - Shift completed

## 🏗️ Project Structure

\`\`\`
RailwayProject/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Express middleware
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── socket/          # Socket.io handlers
│   ├── utils/           # Utility functions
│   ├── validators/      # Input validation
│   ├── app.js           # Express app setup
│   └── index.js         # Server entry point
├── prisma/
│   └── schema.prisma    # Database schema
├── k8s/                 # Kubernetes manifests
├── logs/                # Application logs
├── Dockerfile           # Docker configuration
├── docker-compose.yml   # Docker Compose setup
└── package.json         # Dependencies
\`\`\`

## 🔧 Scripts

\`\`\`bash
npm run dev          # Start development server
npm start            # Start production server
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio
\`\`\`

## 🌐 API Endpoints (To be implemented)

\`\`\`
POST   /api/v1/auth/login         # Login
POST   /api/v1/auth/logout        # Logout
POST   /api/v1/auth/refresh       # Refresh token

GET    /api/v1/shifts             # List shifts
POST   /api/v1/shifts             # Create shift
GET    /api/v1/shifts/:id         # Get shift details
PATCH  /api/v1/shifts/:id         # Update shift
DELETE /api/v1/shifts/:id         # Delete shift

GET    /api/v1/staff              # List staff
POST   /api/v1/staff              # Create staff
GET    /api/v1/staff/:id          # Get staff details

GET    /api/v1/notifications      # List notifications
PATCH  /api/v1/notifications/:id  # Update notification
\`\`\`

## 🤝 Contributing

1. Create feature branch
2. Commit changes
3. Push to branch
4. Create Pull Request

## 📝 License

ISC

## 👨‍💻 Author

Rana Poddar

---

**Built with ❤️ for Indian Railways**
