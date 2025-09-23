# Getting Started
This assumes that you have the docker templates loaded into GNS3
## Dependencies:

react-dnd (drag and drop) \
react-dnd-html5-backend (drag and drop) \
lucide-react (icons)

## If you don't have pnpm installed:

npm install -g pnpm 

pnpm add react-dnd react-dnd-html5-backend \
pnpm add lucide-react

## Replace Project ID:

MainDropZone.tsx \
const projectId = {GNS3_PROJECT_ID}

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
