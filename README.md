# Lucky Marketplace — Frontend

## Prerequisites

- Node.js v18+
- npm
- Backend API running on `http://localhost:5000`

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=Lucky Marketplace
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_RAZORPAY_KEY_ID=your-razorpay-key
```

> `NEXT_PUBLIC_API_URL` must point to the running backend.

### 3. Start the dev server

```bash
npm run dev
```

Frontend runs at **http://localhost:3000**

## Available Commands

| Command | Description |
|---|---|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
