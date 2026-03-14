# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TimeWise-back — бэкенд для приложения отслеживания времени пользователя в браузере (сколько времени проводит на каждом сайте). NestJS 11, TypeScript, Prisma 7, PostgreSQL.

## Common Commands

- `npm run start:dev` — run in watch mode (development)
- `npm run build` — compile with `nest build`
- `npm run start:prod` — run compiled output (`node dist/main`)
- `npm run test` — run unit tests (Jest, rootDir: `src/`, matches `*.spec.ts`)
- `npm run test -- --testPathPattern=<pattern>` — run a single test file
- `npm run test:e2e` — run e2e tests (config: `test/jest-e2e.json`, matches `*.e2e-spec.ts`)
- `npm run lint` — ESLint with auto-fix
- `npm run format` — Prettier formatting
- `npx prisma generate` — regenerate Prisma client after schema changes
- `npx prisma migrate dev` — create and apply migrations

## Architecture

- **Entry point**: `src/main.ts` — bootstraps app, sets up ValidationPipe and Swagger (`/docs`)
- **Database**: Prisma 7 with `@prisma/adapter-pg`, schema in `prisma/schema.prisma`, generated client in `generated/prisma/client`
- **Auth**: API token via `Authorization: Bearer <token>` header, validated by `ApiTokenGuard`
- **Modules**: PrismaModule (global), AuthModule (token CRUD), ActivityModule (site tracking)
- Prisma imports use `../../generated/prisma/client` (not `@prisma/client`)

## Code Style

- Prettier: single quotes, trailing commas (`all`)
- ESLint: flat config with `typescript-eslint` recommended + prettier
- `@typescript-eslint/no-explicit-any` is disabled
- `no-floating-promises` and `no-unsafe-argument` are warnings
- TypeScript: `strictNullChecks` enabled, `noImplicitAny` disabled

Сохранение сессий приложений на виндовс

```ts
interface AppActivitySession {
appName: string;
windowTitle: string;
startTime: number; // epoch ms
endTime: number;
duration: number; // ms
}
```