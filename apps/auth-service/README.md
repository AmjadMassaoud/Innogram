# Auth Service

Authentication microservice for the Innogram application. Handles user authentication, authorization, and token management.

## Features

- User registration and login
- JWT-based authentication with access and refresh tokens
- Google OAuth 2.0 integration
- Token validation and refresh mechanisms
- Secure password handling

## Technologies

- Node.js
- Express.js
- TypeORM
- MongoDB
- Redis
- JWT (JSON Web Tokens)
- Google OAuth 2.0

## Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
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
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:4000/innogram/auth/google-callback
```

## API Endpoints

### Authentication

- `POST /innogram/auth/signup` - Register a new user
- `POST /innogram/auth/login` - Login user
- `POST /innogram/auth/logout` - Logout user
- `POST /innogram/auth/refresh-token` - Refresh access token
- `POST /innogram/auth/validate-accessToken` - Validate access token

### Google OAuth

- `GET /innogram/auth/google` - Initiate Google OAuth flow
- `GET /innogram/auth/google-callback` - Handle Google OAuth callback

## Installation

```bash
# Install dependencies
npm install

# Start the service
npm run start
```

## Usage Examples

### Login

```http
POST http://localhost:4000/innogram/auth/login
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "password123"
}
```

### Refresh Token

```http
POST http://localhost:4000/innogram/auth/refresh-token
```

Note: Requires httpOnly cookie 'jid' containing refresh token

### Validate Access Token

```http
POST http://localhost:4000/innogram/auth/validate-accessToken
Content-Type: application/json

{
    "accessToken": "your.access.token"
}
```

## Token Management

- Access tokens expire after 20 minutes
- Refresh tokens expire after 1 day
- Refresh tokens are stored as httpOnly cookies
- Access tokens should be sent in Authorization header as Bearer tokens

## Security Features

- HTTP-only cookies for refresh tokens
- Secure password hashing
- JWT token validation
- CORS protection
- Rate limiting
- XSS protection

## Error Handling

The service returns standard HTTP status codes:

- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 500: Internal Server Error

## Development

```bash
# Run in development mode
npm run dev

# Run tests
npm run test

# Build the service
npm run build
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License
