# Poetry

A poetry app built with Turborepo + React + NestJS + NextJS + PostgreSQL + Prisma + Docker + TailwindCSS + TypeScript + ESLint + Prettier

[Live demo](https://poetry.codefe.cn/)

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `server`: a [NestJS](https://nestjs.com/) app
- `web`: another [Next.js](https://nextjs.org/) app
- `docs`: a [Next.js](https://nextjs.org/) app
- `embedding-server`: a [FastAPI](https://fastapi.tiangolo.com/) app
- `@repo/ui`: a stub React component library shared by both `web` and `docs` applications
- `@repo/types`: a stub TypeScript library shared by both `server`, `web`, `docs`, and `ui` applications
- `@repo/common`: a stub TypeScript library shared by both `server`, `web`, `docs`, and `ui` applications
- `@repo/eslint-config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `@repo/typescript-config`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting
- [Prisma](https://prisma.io) for database
- [PostgreSQL](https://www.postgresql.org) for database

## Project setup

### Environment

- Node.js >= 20
- Python >= 3.10
- TypeScript >= 5
- PostgreSQL >= 16
- Docker >= 25

### Database

```bash
docker compose up -d

# watch logs
docker logs -f pg

# psql
docker exec -it pg psql -U postgres -d poetry
# or
psql -h localhost -p 5432 -U postgres -d poetry
```

### Prisma

```bash
cd apps/server

pnpm run db:generate

pnpm run db:push

pnpm run db:init
```

## Develop

To develop all apps and packages, run the following command:

```bash
pnpm install
```

```bash
pnpm dev
```

or

### NestJS

```bash
cd apps/server
pnpm run dev
```

### NextJS

```bash
cd apps/web
pnpm run dev
```

### FastAPI

```bash
cd apps/chat
make run
```

## Build

To build all apps and packages, run the following command:

```bash
pnpm build
```

or

### NestJS

```bash
cd apps/server
pnpm run build
```

### NextJS

```bash
cd apps/web
pnpm run build
```

### FastAPI

```bash
cd apps/chat
make build
```

## Deploy

```bash
# build
docker-compose up -d --build

# images
docker images | grep poetry

# save images
docker load -i poetry-apps.tar

# status
docker-compose ps

# logs
docker-compose logs -f

# stop
docker-compose down
```
