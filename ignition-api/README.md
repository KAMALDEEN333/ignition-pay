# Ignition Pay API

The NestJS backend API for the Ignition Pay Stellar wallet ecosystem.

## Stack

- **Framework**: NestJS 11
- **Language**: TypeScript 5.7
- **Database**: PostgreSQL via Prisma ORM
- **Caching**: Redis via Keyv / cache-manager
- **Queue**: Bull (Redis-backed job queues)
- **Blockchain**: Stellar SDK + Soroban RPC
- **Auth**: JWT + Stellar SEP-10 Web Authentication

## Getting Started

```bash
npm install
npx prisma migrate dev
npm run start:dev
```

## API Modules

| Module | Description |
|--------|-------------|
| Auth | Stellar SEP-10 web auth, JWT sessions |
| Users | User registration and profile management |
| Wallets | Keypair generation, balance queries |
| Transactions | Build, sign, submit Stellar transactions |
| Addresses | Address validation and routing |
| Anchors | SEP-6/24/31 anchor integrations |
| Queue | Background job processing |
| Health | Service health checks |

## Environment

See `.env.example` for required environment variables.
