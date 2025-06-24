# Innogram

Innogram is a modular, microservices-based application built with Node.js, NestJS, and TypeScript. It consists of
several services, including an API Gateway, Auth Service, orchestrated for scalable and maintainable development.

## Project Structure

```
Innogram/
│
├── apps/
│   ├── api-gateway/      # API Gateway service
│   ├── auth-service/     # Authentication service
│
├── libs/                 # Shared libraries
│
├── docker-compose.yml    # Docker Compose configuration
├── Dockerfile            # Root Dockerfile
├── package.json
└── README.md
```

---

## Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- Docker & Docker Compose (for containerized setup)
- MongoDB (for local development)
- Redis (for local development)

---

## Setting up MongoDB and Redis Locally on Docker

### MongoDB

You can run MongoDB locally using Docker:

```bash
  docker run -d --name mongo -p 27017:27017 --network innogram-net mongo:latest
```

Or install MongoDB Community Edition from [mongodb.com](https://www.mongodb.com/try/download/community) and start the
service:

```bash
  mongod  
```

By default, the services expect MongoDB to be available at `mongodb://localhost:27017`.

### Redis

You can run Redis locally using Docker:

```bash
  docker run -d --name redis -p 6379:6379 --network innogram-net redis:latest
```

Or install Redis from [redis.io](https://redis.io/download) and start the service:

```bash
  redis-server
```

By default, the services expect Redis to be available at `redis://localhost:6379`.

---

## Local Development

### 1. Install Dependencies

From the project root:

```bash
  npm install
```

### 2. Build the Project

```bash
  npm run build
```

### 3. Start Services Individually

Each service can be started from its directory:

#### API Gateway

```bash
  npm install
  npm run start:dev:api-gateway
```

#### Auth Service

```bash
    npm install
    npm run start:dev:auth-service
```

### 4. Start All Services (Monorepo)

From the root, you can use:

```bash
  npm run start:dev
```

This will start all services in development mode

---

## Running with Docker

### 1. Build and Start All Services

From the project root:

```bash
    docker-compose --build
```

This will build and start all services as defined in `docker-compose.yml`.

### 2. Stopping Services

```bash
    docker-compose down
```

---

## Useful Commands

- **Build all:** `npm run build`
- **Start all (dev):** `npm run start:dev`

---

## Notes

- Configuration files for each service are located in their respective `configs/` directories.
- Shared code is located in the `libs/` directory.
- For more details on each service, see their individual `README.md` files.
