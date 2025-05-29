/# Auth Service

Authentication microservice for Innogram application, handling user authentication, authorization, token management, and OAuth integration.

## Features

- JWT-based authentication with access and refresh tokens
- Google OAuth 2.0 integration
- Password reset functionality with token-based verification
- MongoDB for user and token storage
- Secure cookie-based refresh token handling
- Internal API secret validation

## Tech Stack

- Node.js with Express.js
- TypeORM with MongoDB
- JWT for token management
- Google OAuth 2.0
- Bcrypt for password hashing
- Joi for request validation

## API Endpoints

### Authentication Routes

```http
POST /innogram/auth/signup      # Register new user
POST /innogram/auth/login       # User login
POST /innogram/auth/logout      # User logout
POST /innogram/auth/refresh-token    # Refresh access token
POST /innogram/auth/validate-accessToken   # Validate access token
```

### Google OAuth Routes

```http
GET /innogram/auth/google-callback    # Google OAuth callback handler
```

### Password Management Routes

```http
POST /innogram/password/request-reset  # Request password reset
POST /innogram/password/reset         # Reset password with token
```

## Environment Variables

```env
NODE_ENV=
PORT=4000
SERVER_URL=
INTERNAL_API_SECRET=your_internal_api_secret
CORS_ORIGIN=

# JWT Configuration
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRE=20m
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRE=1d
REFRESH_TOKEN_COOKIE_NAME=jid

# Database Configuration
MONGODB_URI=
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=
```

## API Usage Examples

### User Registration

```http
POST /innogram/auth/signup
Content-Type: application/json
x-internal-api-secret: your_internal_api_secret

{
    "email": "user@example.com",
    "password": "securePassword123",
    "username": "user123"
}
```

### User Login

```http
POST /innogram/auth/login
Content-Type: application/json
x-internal-api-secret: your_internal_api_secret

{
    "email": "user@example.com",
    "password": "securePassword123"
}
```

### Password Reset Request

```http
POST /innogram/password/request-reset
Content-Type: application/json
x-internal-api-secret: your_internal_api_secret

{
    "email": "user@example.com"
}
```

## Security Features

- Internal API secret validation for all routes
- HTTP-only cookies for refresh tokens
- Password hashing with bcrypt
- Token rotation on refresh
- Request validation using Joi schemas
- CORS protection
- MongoDB for secure token storage

## Project Structure

```
auth-service/
├── configs/                # Configuration files
│   ├── config.ts          # Environment configuration
│   ├── cookie.config.ts   # Cookie settings
│   ├── cors.config.ts     # CORS settings
│   └── orm.config.ts      # Database configuration
├── controllers/           # Route controllers
├── entities/             # Database entities
│   ├── token-entity.ts
│   └── password-reset-token.entity.ts
├── middlewares/          # Custom middlewares
│   └── verify-internal-request.ts
├── providers/            # Business logic
│   ├── auth.provider.ts
│   ├── google.auth.provider.ts
│   └── password.provider.ts
├── schema-validations/   # Request validation schemas
├── utils/               # Utility functions
└── app.ts              # Application setup
```

## Installation & Setup

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

- Copy `.env.example` to `.env`
- Fill in required values

3. Start MongoDB:

```bash
# Make sure MongoDB is running on localhost:27017
```

4. Start the service:

```bash
npm run start
```

## Error Handling

The service uses standard HTTP status codes:

- 200: Success
- 400: Bad Request (validation errors)
- 401: Unauthorized
- 403: Forbidden (invalid internal API secret)
- 500: Internal Server Error

## Development

```bash
# Run in development mode
npm run start

# Run tests (when implemented)
npm run test
```

## License

MIT
