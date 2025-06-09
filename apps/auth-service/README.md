# Auth Service

Authentication microservice for the Innogram application, responsible for user authentication, authorization, token management, and OAuth integration.

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
- Bcrypt
- Joi (validation)
- Redis

## API Endpoints

### Authentication
- `POST /innogram/auth/signup` — Register new user
- `POST /innogram/auth/login` — User login
- `POST /innogram/auth/logout` — User logout
- `POST /innogram/auth/refresh-token` — Refresh access token

### Google OAuth
- `GET /innogram/auth/google-callback` — Google OAuth callback handler

### Password Management
- `POST /innogram/password/request-reset` — Request password reset
- `POST /innogram/password/reset` — Reset password with token

## Environment Variables

See `.env` for all configuration options. Example:

```env
NODE_ENV=development
PORT=4000
SERVER_URL=http://localhost:3001
INTERNAL_API_SECRET=your_internal_api_secret
CORS_ORIGIN=*
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRE=20m
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRE=1d
REFRESH_TOKEN_COOKIE_NAME=jid
MONGODB_URI=mongodb://localhost:27017
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:4000/innogram/auth/google-callback
GOOGLE_AUTH_INIT_REDIRECT_URL=http://localhost:3500/auth/google/initiate
```

## Project Structure

```
auth-service/
├── configs/                # Configuration files
├── controllers/            # Route controllers
├── custom-errors/          # Custom error classes
├── entities/               # Database entities
├── enums/                  # Enums
├── interfaces/             # TypeScript interfaces
├── middlewares/            # Express middlewares
├── providers/              # Business logic
├── schema-validations/     # Joi validation schemas
├── types/                  # TypeScript types
├── utils/                  # Utility functions
├── app.ts                  # Express app setup
├── main.ts                 # Entry point
├── swagger.ts              # Swagger docs setup
```

## Running the Service

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up your `.env` file (see example above).
3. Start MongoDB and Redis locally.
4. Start the service:
   ```bash
   npm run start
   ```
5. API docs available at: `http://localhost:4000/api-docs`

## Security
- All endpoints require the `x-internal-api-secret` header for internal API validation.
- Refresh tokens are stored in HTTP-only cookies.
- Passwords are hashed with bcrypt.
- Rate limiting for password reset requests.

## License


