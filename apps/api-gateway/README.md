# INNOGRAM API Gateway

## Overview

Welcome to the INNOGRAM API Gateway! This service acts as the single entry point for all client requests to the INNOGRAM
microservices ecosystem. It is responsible for routing incoming requests to the appropriate downstream service, handling
cross-cutting concerns like authentication, rate limiting, and providing a unified and secure interface for our frontend
applications.

By abstracting the internal microservice architecture, the API Gateway simplifies client interactions and enhances
security. Currently, it integrates with the Authentication Service, with plans to add more downstream services like
Posts, Chats, and Notifications in the future.

---

## Getting Started

Follow these instructions to get the API Gateway up and running on your local machine for development and testing
purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [npm](https://www.npmjs.com/)
- [Docker](https://www.docker.com/) (for running dependent services like databases)

### Installation

1. **Clone the monorepo** if you haven't already.
2. Navigate to the **root directory** of the `INNOGRAM` monorepo.
3. Install all dependencies for the entire workspace by running:
   ```bash
   npm install
   ```

### Running the Application

1. Ensure you have a `.env` file configured in the `apps/api-gateway` directory (see Environment Variables section
   below).
2. From the **root of the monorepo**, run the following command to start the API Gateway in development mode with
   hot-reloading:
   ```bash
   # If using NestJS CLI commands defined in the root package.json
   npm run start:dev api-gateway
   ```
3. The API Gateway will be running on the port specified in your `.env` file (e.g., `http://localhost:3002`).

---

## Running Auth-service using Docker.

1. Install docker:
2. At the root of the project, run the following command:
   ```bash
   docker-compose up --build
   ```
   This would be enough to run build and run all containers.

#### Ensure all containers are on the same network:**

All services (API-Gateway, downstream services, MongoDB, Redis, etc.) must be attached to the same Docker network named
`innogram-net`.  
If the network does not exist, create it with:

   ```bash
      docker network create innogram-net
  ````

#### Running containers with variables

1. You could write environment variables in docker-compose.
2. You can also run your container with env files with the following command:
   ```bash
      docker run --name container-name --env-file ./apps/api-gateway/.env.example -p 3002:3002 --network innogram-net auth-service-image-name
   ```

## Environment Variables

The API Gateway requires environment variables to function correctly. Create a `.env` file in the `apps/api-gateway`
directory by copying the `.env.example` file.


---

## API Endpoints

This section documents the endpoints exposed by the API Gateway. The gateway forwards these requests to the appropriate
downstream microservice.

### Authentication Service

Handles all user authentication, session management, and password-related functionality.

- **Base Path:** `/api-gateway/auth`
- **Downstream Service:** `auth-service`

| Method | Endpoint           | Description                                                              | Protection |
|:-------|:-------------------|:-------------------------------------------------------------------------|:-----------|
| `POST` | `/register`        | Registers a new user.                                                    | Public     |
| `POST` | `/login`           | Logs in a user and returns an `accessToken` and a `refreshToken` cookie. | Public     |
| `POST` | `/logout`          | Logs out a user by invalidating their refresh token.                     | Protected  |
| `POST` | `/refresh-token`   | Issues a new `accessToken` using a valid refresh token cookie.           | Protected  |
| `POST` | `/google-callback` | Handles the callback from Google OAuth2 flow.                            | Public     |

---

- **Base Path:** `/api-gateway/password`
- **Downstream Service:** `auth-service`

| Method | Endpoint                  | Description                                                                  | Protection |
|:-------|:--------------------------|:-----------------------------------------------------------------------------|:-----------|
| `POST` | `/request-password-reset` | Initiates the password reset process by sending a token to the user's email. | Public     |
| `POST` | `/reset-password`         | Resets the user's password using a valid reset token.                        | Public     |

---

<!--
### Posts Service (Future Use)

This section will document endpoints related to creating, reading, updating, and deleting posts.

- **Base Path:** `/api-gateway/posts`
- **Downstream Service:** `posts-service`

| Method | Endpoint | Description | Protection |
| :----- | :------- | :---------- | :--------- |
| `GET`  | `/`      | Fetches all posts. | Protected |
| `POST` | `/`      | Creates a new post. | Protected |
-->

<!--
### Chats Service (Future Use)

This section will document endpoints and WebSocket events related to real-time chat.

- **Base Path:** `/api-gateway/chats`
- **Downstream Service:** `chats-service`

...
-->

---

## Architecture & Extensibility

The API Gateway uses a provider-based architecture to communicate with downstream services. Each downstream service has
a corresponding "HttpProvider" (e.g., `AuthHttpProvider`) within the gateway. This provider is responsible for all
`axios`/`HttpService` calls to that specific microservice.
