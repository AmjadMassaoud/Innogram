# Auth Service

Authentication microservice for Innogram, handling user authentication, authorization, and token management.

## Features

- JWT-based authentication with access and refresh tokens
- OAuth 2.0 integration with Google
- Password reset functionality
- Token validation and refresh mechanisms
- Secure cookie-based refresh token storage

## Tech Stack

- Node.js & Express.js
- TypeORM with MongoDB
- JWT (JSON Web Tokens)
- Google OAuth 2.0
- Bcrypt for password hashing

## API Endpoints

### Authentication

```http
POST /innogram/auth/signup
POST /innogram/auth/login
POST /innogram/auth/logout
POST /innogram/auth/refresh-token
POST /innogram/auth/validate-accessToken
```

### OAuth

```http
GET /innogram/auth/google
GET /innogram/auth/google-callback
```

### Password Management

```http
POST /innogram/auth/request-reset
POST /innogram/auth/reset
```

## Environment Variables

```env
# Server Configuration
NODE_ENV=development
PORT=4000
SERVER_URL=http://localhost:4000
CORS_ORIGIN=*

# JWT Configuration
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRE=20m
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRE=1d
REFRESH_TOKEN_COOKIE_NAME=jid

# Database Configuration
MONGODB_URI=mongodb://localhost:27017

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:4000/innogram/auth/google-callback
```

## API Usage Examples

### User Registration

```http
POST /innogram/auth/signup
Content-Type: application/json

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

{
    "email": "user@example.com",
    "password": "securePassword123"
}
```

### Password Reset Request

```http
POST /innogram/auth/request-reset
Content-Type: application/json

{
    "email": "user@example.com"
}
```

### Password Reset

```http
POST /innogram/auth/reset
Content-Type: application/json

{
    "email": "user@example.com",
    "resetToken": "token_from_email",
    "newPassword": "newSecurePassword123"
}
```

## Installation

1. Install dependencies:

```bash
npm install
```

2. Create .env file with required environment variables.

3. Start the service:

```bash
npm run start
```

## Token Management

### Access Token

- Short-lived (20 minutes by default)
- Sent in response body during login
- Must be included in Authorization header for protected routes

### Refresh Token

- Long-lived (1 day by default)
- Stored as HTTP-only cookie
- Used to obtain new access tokens
- Automatically rotated on refresh

## Security Features

- HTTP-only cookies for refresh tokens
- Password hashing using bcrypt
- Token rotation on refresh
- CORS protection
- Rate limiting
- XSS protection through cookie security flags

## Error Handling

The service uses standard HTTP status codes:

- 200: Success
- 400: Bad Request (invalid input)
- 401: Unauthorized (invalid credentials)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 409: Conflict (email already exists)
- 500: Internal Server Error

## Integration with API Gateway

The auth service is designed to work with the API Gateway for:

- Token validation
- User authentication
- Session management
- OAuth flow handling

## Development

```bash
# Run in development mode
npm run dev

# Build the service
npm run build

# Run tests
npm run test
```

## Directory Structure

```
auth-service/
├── configs/           # Configuration files
├── controllers/       # Route controllers
├── entities/         # Database entities
├── providers/        # Business logic
├── schema-validations/ # Input validation schemas
├── utils/           # Utility functions
├── app.ts           # Express application setup
└── main.ts          # Application entry point
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT
