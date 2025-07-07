# Innogram

Innogram is a modular, microservices-based application built with Node.js, NestJS, and TypeScript. The project is organized for scalability and maintainability, leveraging Docker for containerization and a shared library approach for common functionality.

## Project Structure

```
Innogram/
│
├── innogram-backend/
│   ├── apps/                # Backend applications (e.g., api-gateaway)
│   ├── libs/                # Shared backend libraries (e.g., config-lib)
│   ├── docker-compose.yml   # Backend Docker Compose configuration
│   ├── Dockerfile           # Backend Dockerfile
│   ├── package.json
│   └── README.MD
│
├── innogram-frontend/
│   ├── components.json
│   ├── docker-compose.yml   # Frontend Docker Compose configuration
│   ├── Dockerfile           # Frontend Dockerfile
│   ├── package.json
│   └── ...                  # Frontend source and config files
│
├── .idea/                   # IDE configuration
├── README.MD                # Project documentation (this file)
└── ...
```

---

## Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- Docker & Docker Compose
- MongoDB (for local development)
- Redis (for local development)

---

## Running Innogram with Docker

1. Install Docker and Docker Compose.
2. At the root of the project, run:
   ```bash
   docker-compose up --build
   ```
   This command will build and start all containers for both backend and frontend.

### Docker Network

All services (backend, frontend, MongoDB, Redis, etc.) should be attached to the same Docker network named `innogram-net`.  
If the network does not exist, create it with:

```bash
docker network create innogram-net
```

### Using Environment Variables

- Environment variables can be set in the respective `docker-compose.yml` files.
- Alternatively, you can use `.env` files for each service. Example:
  ```bash
  docker run --name container-name --env-file ./innogram-backend/apps/api-gateaway/.env.example -p 3000:3000 --network innogram-net backend-image-name
  ```

---

## Notes

- Backend configuration files are located in their respective `apps/` or `libs/` directories under `innogram-backend/`.
- Shared backend code is in `innogram-backend/libs/`.
- Frontend configuration and source files are in `innogram-frontend/`.
- For more details on each service, see their individual `README.md` files if available.
