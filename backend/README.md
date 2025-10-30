# NestJS Backend

Backend API built with NestJS, TypeORM, and PostgreSQL.

## Features

- **Authentication**: JWT-based authentication
- **User Management**: CRUD operations for users
- **Database**: PostgreSQL with TypeORM
- **Validation**: class-validator for request validation
- **Documentation**: Swagger/OpenAPI
- **Security**: Password hashing with bcrypt

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file in the backend directory:

```env
DATABASE_URL=postgresql://postgres:Thehoa2604@db.kslaskzvzxlveqhgnaeh.supabase.co:5432/postgres
NEST_PORT=3001
NODE_ENV=development
JWT_SECRET=your-secret-key-change-this-in-production
```

## Running the app

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

## Test

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## API Endpoints

### Health
- `GET /` - Welcome message
- `GET /health` - Health check

### Authentication
- `POST /auth/login` - User login

### Users
- `POST /users` - Create user (public)
- `GET /users` - Get all users (protected)
- `GET /users/:id` - Get user by ID (protected)
- `PATCH /users/:id` - Update user (protected)
- `DELETE /users/:id` - Delete user (protected)

## Documentation

Swagger documentation available at: http://localhost:3001/api

## Project Structure

```
backend/
├── src/
│   ├── auth/              # Authentication module
│   │   ├── dto/           # Data transfer objects
│   │   ├── guards/        # Auth guards
│   │   └── strategies/    # Passport strategies
│   ├── users/             # Users module
│   │   ├── dto/           # User DTOs
│   │   └── entities/      # User entity
│   ├── app.module.ts      # Root module
│   └── main.ts            # Application entry point
├── test/                  # E2E tests
├── package.json
└── tsconfig.json
```

## Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `email` (String, Unique)
- `password` (String, Hashed)
- `firstName` (String, Optional)
- `lastName` (String, Optional)
- `isActive` (Boolean, Default: true)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)
