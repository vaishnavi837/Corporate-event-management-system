POST /api/auth/register → Registers a new user.
POST /api/auth/login → Logs in a user and returns a JWT.
GET /api/auth/me → Fetches the current user (requires Authorization header with Bearer <token>)