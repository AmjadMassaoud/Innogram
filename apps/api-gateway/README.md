# INNOGRAM API Gateway

## Overview

Welcome to the INNOGRAM API Gateway! This service acts as the single entry point for all client requests to the INNOGRAM microservices ecosystem. It is responsible for routing incoming requests to the appropriate downstream service, handling cross-cutting concerns like authentication, rate limiting, and providing a unified and secure interface for our frontend applications.

By abstracting the internal microservice architecture, the API Gateway simplifies client interactions and enhances security. Currently, it integrates with the Authentication Service, with plans to add more downstream services like Posts, Chats, and Notifications in the future.

---

## Getting Started

Follow these instructions to get the API Gateway up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [npm](https://www.npmjs.com/)
- [Docker](https://www.docker.com/) (for running dependent services like databases)
- Access to the monorepo root.

### Installation

1.  **Clone the monorepo** if you haven't already.
2.  Navigate to the **root directory** of the `INNOGRAM` monorepo.
3.  Install all dependencies for the entire workspace by running:
    ```bash
    npm install
    ```

### Running the Application

1.  Ensure you have a `.env` file configured in the `apps/api-gateway` directory (see Environment Variables section below).
2.  From the **root of the monorepo**, run the following command to start the API Gateway in development mode with hot-reloading:
    ```bash
    # If using NestJS CLI commands defined in the root package.json
    npm run start:dev api-gateway
    ```
3.  The API Gateway will be running on the port specified in your `.env` file (e.g., `http://localhost:3002`).

---

## Environment Variables

The API Gateway requires several environment variables to function correctly. Create a `.env` file in the `apps/api-gateway` directory by copying the `.env.example` file.

| Variable                     | Description                                                                                                | Example Value                         |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| `PORT`                       | The port on which the API Gateway server will run.                                                         | `3002`                                |
| `NODE_ENV`                   | The application environment.                                                                               | `development`                         |
| `AUTH_SERVICE_BASEURL`       | The base URL for the downstream `auth-service`. The gateway will proxy requests to this service.           | `http://localhost:4000/innogram/`     |
| `POSTS_SERVICE_HOST`         | The hostname for the downstream `posts-service`. _(For future use)_                                        | `localhost`                           |
| `POSTS_SERVICE_PORT`         | The port for the downstream `posts-service`. _(For future use)_                                            | `3011`                                |
| `CHATS_SERVICE_HOST`         | The hostname for the downstream `chats-service`. _(For future use)_                                        | `localhost`                           |
| `CHATS_SERVICE_PORT`         | The port for the downstream `chats-service`. _(For future use)_                                            | `3012`                                |
| `NOTIFICATIONS_SERVICE_HOST` | The hostname for the downstream `notifications-service`. _(For future use)_                                | `localhost`                           |
| `NOTIFICATIONS_SERVICE_PORT` | The port for the downstream `notifications-service`. _(For future use)_                                    | `3013`                                |
| `USERS_MICROSERVICE_HOST`    | The hostname for the downstream `users-service`. _(For future use)_                                        | `localhost`                           |
| `USERS_MICROSERVICE_PORT`    | The port for the downstream `users-service`. _(For future use)_                                            | `3014`                                |
| `INTERNAL_API_SECRET`        | A shared secret key to verify that requests to downstream services are coming from the API Gateway itself. | `a_very_long_and_random_secret`       |
| `ACCESS_TOKEN_SECRET`        | The secret or public key used to verify JWT access tokens locally within the gateway.                      | `your_jwt_access_token_secret_or_key` |

---

## API Endpoints

This section documents the endpoints exposed by the API Gateway. The gateway forwards these requests to the appropriate downstream microservice.

### Authentication Service

Handles all user authentication, session management, and password-related functionality.

- **Base Path:** `/api-gateway/auth`
- **Downstream Service:** `auth-service`

| Method | Endpoint           | Description                                                              | Protection |
| :----- | :----------------- | :----------------------------------------------------------------------- | :--------- |
| `POST` | `/register`        | Registers a new user.                                                    | Public     |
| `POST` | `/login`           | Logs in a user and returns an `accessToken` and a `refreshToken` cookie. | Public     |
| `POST` | `/logout`          | Logs out a user by invalidating their refresh token.                     | Protected  |
| `POST` | `/refresh-token`   | Issues a new `accessToken` using a valid refresh token cookie.           | Protected  |
| `POST` | `/google-callback` | Handles the callback from Google OAuth2 flow.                            | Public     |

---

- **Base Path:** `/api-gateway/password`
- **Downstream Service:** `auth-service`

| Method | Endpoint                  | Description                                                                  | Protection |
| :----- | :------------------------ | :--------------------------------------------------------------------------- | :--------- |
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

The API Gateway uses a provider-based architecture to communicate with downstream services. Each downstream service has a corresponding "HttpProvider" (e.g., `AuthHttpProvider`) within the gateway. This provider is responsible for all `axios`/`HttpService` calls to that specific microservice.

### How to Add a New Service (e.g., `posts-service`)

1.  **Add Environment Variables:** Add variables for the new service's host and port to the `.env` file (e.g., `POSTS_SERVICE_HOST`, `POSTS_SERVICE_PORT`).
2.  **Create DTOs and Interfaces:** In a shared location (e.g., `services-dtos/`), define the Data Transfer Objects (DTOs) and response interfaces for the new service's API contract.
3.  **Create an HttpProvider:** Create a new provider file (e.g., `posts.http.provider.ts`) responsible for making all HTTP calls to the `posts-service`.
4.  **Create a Gateway Controller:** Create a new controller (e.g., `posts.gateway.controller.ts`) that defines the public-facing routes. This controller will inject and use the new `PostsHttpProvider`.
5.  **Register in a Module:** Create a new module for the service (e.g., `posts.module.ts`) or add the new controller and provider to an existing module to make them available to the application.
