# Setup Guide

## Prerequisites

- **Node.js** 20+ (for frontend and API)
- **Flutter SDK** 3.22+ (for mobile)
- **Dart SDK** 3.4+
- **PostgreSQL** 15+
- **Redis** 7+
- **Rust** 1.74+ (for Soroban contracts)

## Frontend Setup

```bash
cd ignition-pay-frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:3000`.

## API Setup

```bash
cd ignition-api
npm install

# Set up PostgreSQL database
npx prisma migrate dev

# Start in development mode
npm run start:dev
```

The API runs on `http://localhost:3001`.

## Mobile Setup

```bash
cd ignition-mobile
flutter pub get
flutter run
```

## Environment Variables

### Frontend (`ignition-pay-frontend/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### API (`ignition-api/.env`)
```
DATABASE_URL=postgresql://user:password@localhost:5432/ignition_pay
REDIS_URL=redis://localhost:6379
HORIZON_URL=https://horizon-testnet.stellar.org
SOROBAN_RPC_URL=https://rpc-testnet.stellar.org
JWT_SECRET=your-secret-key
```

### Mobile (`ignition-mobile/.env`)
```
API_BASE_URL=http://localhost:3001
```
