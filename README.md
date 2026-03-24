# Urja Command Centre

This project uses Next.js 16, Prisma 6, and SQLite.

## Prisma 6 setup

This repo now uses the Prisma 6 default client flow:

- `@prisma/client` is generated into `node_modules`
- the schema uses `provider = "prisma-client-js"`
- the datasource URL is read directly from `env("DATABASE_URL")`
- `src/lib/db.ts` imports `PrismaClient` from `@prisma/client`
- local SQLite setup is bootstrapped from the checked-in SQL migration script

## Step-by-step setup

1. Install dependencies.

```bash
npm install
```

2. Make sure `.env` contains the local SQLite connection string.

```env
DATABASE_URL="file:./dev.db"
```

3. Generate the Prisma 6 client.

```bash
npm run prisma:generate
```

4. Apply the local SQLite schema bootstrap.

```bash
npm run prisma:migrate
```

5. Start the app.

```bash
npm run dev
```

`npm run dev` already runs `db:setup` first, so steps 3 and 4 are automatic for normal local development.

## Useful commands

```bash
npm run db:setup
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio
npm run dev
```

## Troubleshooting

### `Cannot find module '@prisma/client'`

Run:

```bash
npm run prisma:generate
```

### `PrismaClientInitializationError`

Run:

```bash
npm run prisma:migrate
```

Then confirm:

```env
DATABASE_URL="file:./dev.db"
```

### Database location

With `DATABASE_URL="file:./dev.db"`, the SQLite file lives at the project root as `dev.db`.

## Prisma files

- `prisma/schema.prisma`
- `scripts/prisma-bootstrap.cjs`
- `src/lib/db.ts`
- `.env`
