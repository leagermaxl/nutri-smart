# Intelligent Nutritional Web App - Setup Guide

## 1. Prerequisites

- Node.js (v18+)
- Docker & Docker Compose
- NestJS CLI (`npm i -g @nestjs/cli`)

## 2. Project Initialization

Run the following commands in your terminal to initialize the project and install dependencies:

```bash
# 1. Initialize NestJS project
nest new nutrition-app
# Choose 'npm' or 'pnpm' when prompted.
# IMPORTANT: Move the contents of 'nutrition-app' to the root if you want it in the current directory,
# or run the command in the parent directory.
# For this guide, we assume you are in the project root.

# 2. Install Dependencies
npm install @prisma/client class-validator class-transformer @nestjs/config @nestjs/swagger swagger-ui-express passport passport-jwt @nestjs/passport @nestjs/jwt bcrypt
npm install -D prisma @types/passport-jwt @types/bcrypt

# 3. Initialize Prisma (If you haven't already created the file manually)
# Since we already provided the schema.prisma, just ensure the 'prisma' folder exists.
```

## 3. Database Setup

1. **Start the Database**:
   ```bash
   docker-compose up -d
   ```
2. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/nutrition_app?schema=public"
   JWT_SECRET="super-secret-key"
   ```
3. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```
4. **Push Schema to DB**:
   ```bash
   npx prisma db push
   ```

## 4. Modular Architecture

We will follow a Domain-Driven Design (DDD) inspired modular structure.

### Folder Structure

```
src/
├── app.module.ts
├── main.ts
├── common/                 # Shared decorators, filters, guards, interceptors
│   ├── decorators/
│   ├── filters/
│   └── guards/
├── config/                 # Configuration files (e.g., database, auth)
├── auth/                   # Auth Module
│   ├── dto/
│   ├── strategies/         # JWT Strategy
│   ├── guards/
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   └── auth.service.ts
├── user/                   # User Module
│   ├── dto/
│   ├── user.controller.ts
│   ├── user.module.ts
│   └── user.service.ts
├── food-diary/             # Food Diary Module
│   ├── dto/
│   ├── food-diary.controller.ts
│   ├── food-diary.module.ts
│   └── food-diary.service.ts
└── analytics/              # Analytics Module (Placeholder for LLM)
    ├── dto/
    ├── analytics.controller.ts
    ├── analytics.module.ts
    └── analytics.service.ts
```

### Module Responsibilities

- **AuthModule**: Handles login, registration, and JWT token generation/validation.
- **UserModule**: Manages user profiles (weight, height, goals).
- **FoodDiaryModule**: CRUD operations for `FoodLog`. Handles the `emotionalState` and `eatingContext`.
- **AnalyticsModule**: Will eventually interface with the LLM service to generate `AiAnalysis` reports.
