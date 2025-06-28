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

## Running Innogram on Docker

1. Install docker:
2. At the root of the project, run the following command:
   ```bash
   docker-compose up --build
   ```
   This would be enough to run build and run all containers.

#### Ensure all containers are on the same network: if any problem occurred**

All services (auth-service, MongoDB, Redis, etc.) must be attached to the same Docker network named `innogram-net`.  
If the network does not exist, create it with:

   ```bash
      docker network create innogram-net
  ````

#### Running containers with variables

1. You could write environment variables in docker-compose.
2. You can also run your container with env files with the following command:
   ```bash
      docker run --name container-name --env-file ./apps/auth-service/.env.example -p 3002:3002 --network innogram-net auth-service-image-name
   ```

## Notes

- Configuration files for each service are located in their respective `configs/` directories.
- Shared code is located in the `libs/` directory.
- For more details on each service, see their individual `README.md` files.
