# Auth Service

Authentication microservice for the Innogram application, responsible for user authentication, authorization, token
management, and OAuth integration.

## Features

- JWT-based authentication (access & refresh tokens)
- Google OAuth 2.0 integration
- Password reset with token-based verification
- MongoDB for user and token storage
- Secure cookie-based refresh token handling
- Redis for token management (reset tokens, blacklisting, etc.)
- Internal API secret validation for all endpoints

## Tech Stack

- Node.js (Express.js)
- TypeORM (MongoDB)
- JWT
- Google OAuth 2.0
- Joi (validation)
- Redis

## API Endpoints

### Authentication

- `POST /innogram/v1/auth/users` — Register new user
- `POST /innogram/v1/auth/tokens` — User login
- `POST /innogram/v1/auth/tokens` — User logout
- `POST /innogram/v1/auth/tokens/refresh` — Refresh access token

### Google OAuth

- `GET /innogram/v1/auth/google` — Google OAuth callback handler

### Password Management

- `POST /innogram/v1/passwords` — Request password reset
- `POST /innogram/v1/passwords` — Reset password with token

## Project Structure.

```
/apps/auth-service
│
├── common/             # Shared utilities, interfaces, or constants for this service.
├── configs/            # Configuration files (e.g., database, environment, CORS).
├── controllers/        # Handles incoming API requests, validates input, and sends responses.
├── custom-errors/      # Custom error classes for specific application failures.
├── entities/           # TypeORM entity definitions that map to database tables/collections.
├── middlewares/        # Express middleware functions (e.g., for logging, authentication checks).
├── services/           # Contains the core business logic of the application.
├── utils/              # Utility functions and helpers (e.g., token generation, error handling).
│
├── .env                # Local environment variables (should be in .gitignore).
├── .env.example        # Example environment variables for setting up the project.
├── .gitignore          # Specifies files and folders to be ignored by Git.
├── app.ts              # Express application setup (middleware, routes, etc.).
├── Dockerfile          # Instructions for building the production Docker container.
├── main.ts             # The entry point of the application; starts the server.
├── package.json        # Project metadata and list of dependencies.
├── README.md           # This documentation file.
├── swagger.ts          # Swagger/OpenAPI documentation setup.
└── tsconfig.json       # TypeScript compiler configuration for this service.
```

## Running the Service

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up your `.env` file (see example above).
3. Start MongoDB and Redis locally.
4. Start the service at the root of the project:
   ```bash
   npm run start:dev:auth-service
   ```
5. API docs available at: `http://localhost:4000/api-docs`

---

## Running Auth-service on Docker.

1. Install docker:
2. At the root of the project, run the following command:
   ```bash
   docker-compose up --build
   ```
   This would be enough to run build and run all containers.

#### Ensure all containers are on the same network:**

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

## Security

- Make sure your `.env` file is properly configured for both local and Docker environments.
- All endpoints require the `x-internal-api-secret` header for internal API validation.
    - This header is used to authenticate internal requests, ensuring only authorized services can access the API.
    - You must add `x-internal-api-secret` to your request headers.
    - If you're targeting auth-service from API-Gateway, you don't have to add `x-internal-api-secret` to your request
      headers.
- Refresh tokens are stored in HTTP-only cookies.
- Passwords are hashed.
- Rate limiting for password reset requests.

