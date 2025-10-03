# Getting Started

This assumes that you have the docker templates loaded into GNS3

## Dependencies:

lucide-react (icons)
dexie
dexie-react-hooks

## If you don't have pnpm installed:

npm install -g pnpm

pnpm add lucide-react
nom install dexie dexie-react-hooks

## Create .env.local file

GNS3_URL=http://{IP_ADDRESS}:{PORT_NUMBER}/v2

## First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
