# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack poetry management and exploration platform called "Poetry". It's a monorepo built with Turborepo that includes multiple applications and shared packages. The application features vector similarity search for poems using text embeddings.

## Technology Stack

- **Frontend**: Next.js 15.3.8 (React 19, TypeScript, TailwindCSS, Radix UI)
- **Backend**: NestJS (TypeScript, Prisma ORM, PostgreSQL with pgvector)
- **Embedding Service**: FastAPI (Python) with Sentence Transformers (BGE-small-zh Chinese model)
- **Database**: PostgreSQL 16+ with pgvector extension for vector similarity
- **Package Manager**: pnpm 9.0.0 with workspace configuration
- **Monorepo Tooling**: Turborepo for task orchestration
- **Containerization**: Docker Compose for multi-service deployment

## Development Commands

### Root-Level Commands (run from repository root)
- `pnpm dev` - Start all apps in development mode (Next.js on :3000, NestJS on :4000)
- `pnpm dev:embed` - Start the Python embedding service on port 4001
- `pnpm build` - Build all apps for production
- `pnpm lint` - Run ESLint across all packages
- `pnpm format` - Format code with Prettier
- `pnpm test` - Run tests across all packages
- `pnpm check-types` - Type checking across all packages
- `pnpm clean` - Clean build artifacts

### Database Operations
- `docker compose up -d` - Start PostgreSQL database with pgvector extension
- `pnpm run db:generate` (in `apps/server`) - Generate Prisma client
- `pnpm run db:push` (in `apps/server`) - Push schema to database
- `pnpm run db:init` (in `apps/server`) - Initialize database with seed data

#### Data Migrations
Data migration scripts are located in `apps/server/scripts/migrations/` and follow these conventions:

**Naming Convention:**
- Format: `YYYYMMDDHHMMSS_descriptive_name.ts`
- Example: `20260115053000_add_dynasty_to_authors.ts`
- Files are executed in alphabetical order (which matches timestamp order)

**Available Commands:**
- `pnpm run data:migrate` - Execute all data migration scripts

**Migration Script Structure:**
Each migration script should:
1. Export a `run()` function that contains the migration logic
2. Be idempotent (safe to run multiple times)
3. Handle errors appropriately
4. Clean up database connections

**Workflow:**
1. Implement logic in the generated file
2. Run migration: `pnpm run data:migrate`
3. Verify migration completed successfully

### Application-Specific Commands
- **Web (Next.js)**: `cd apps/web` then `pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm check-types`
- **Server (NestJS)**: `cd apps/server` then `pnpm dev`, `pnpm build`, `pnpm test`, `pnpm test:watch`, `pnpm test:e2e`
- **Embedding Service**: `cd apps/embedding-server` then `make run` (requires Python virtual environment)

## Architecture

### Monorepo Structure
```
apps/
  server/        # NestJS backend API (port 4000)
  web/           # Next.js frontend (port 3000)
  docs/          # Documentation site (Next.js)
  embedding-server/ # FastAPI embedding service (port 4001)
packages/
  ui/            # Shared React component library
  types/         # Shared TypeScript type definitions
  common/        # Common utilities
  eslint-config/ # ESLint configurations
  typescript-config/ # TypeScript configurations
```

### Service Interactions
1. **Frontend** (Next.js) → **Backend API** (NestJS) for all CRUD operations
2. **Backend API** → **Embedding Service** (FastAPI) for generating text embeddings
3. **Backend API** → **PostgreSQL with pgvector** for storing and similarity searching poem embeddings
4. All services are containerized with Docker and can be run via `docker compose up`

### Key Data Flow
- Poems are stored in PostgreSQL with vector embeddings (generated via BGE-small-zh model)
- Similarity search uses pgvector's cosine distance on embeddings
- User authentication uses JWT with role-based access control (RBAC)
- Admin dashboard for content management

### Database Schema Highlights
- `User` with roles (admin, user)
- `Poem` with `embedding` vector field (stored as `vector(384)` for BGE-small-zh)
- `Author`, `Collection`, `Like`, `Bookmark`, `Comment` models
- Prisma ORM used for type-safe database access

## Development Notes

- Environment variables are managed via `.env` files at root and app levels
- The embedding service requires a HuggingFace model (BGE-small-zh) which is cached in Docker volume
- For production deployment, images are built and pushed to GitHub Container Registry
- PM2 is used for process management in production (see README for deployment commands)
- The project uses Chinese-focused text embeddings but can be adapted for other languages