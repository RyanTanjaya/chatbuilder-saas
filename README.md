# ChatBuilder

> Project 3 of 6 — Ryan Tanjaya portfolio.

A no-code SaaS where anyone can create a custom AI chatbot trained on their own documents (PDF / TXT / DOCX), test it in a dashboard, and embed it on any website with one line of code. Powered by OpenAI + RAG (retrieval-augmented generation) with Supabase pgvector.

## Stack

- **Frontend:** Vite + React + TypeScript + Tailwind + shadcn/ui
- **Backend:** Node + Express + TypeScript
- **DB + vector store:** Supabase Postgres with pgvector (1536-dim, cosine)
- **ORM:** Prisma
- **AI:** OpenAI `text-embedding-3-small` (embeddings) + `gpt-4o-mini` (chat)
- **Deploy:** Vercel (client) + Render (server) + Supabase

## Monorepo layout

```
.
├── client/              # Vite + React dashboard
├── server/              # Express API + RAG pipeline
├── design-handoff/      # Claude Design handoff bundle
└── project3_ai_chatbot_builder.html  # Original spec
```

## Local dev

```bash
# install everything
npm install

# copy env templates and fill in values
cp server/.env.example server/.env
cp client/.env.example client/.env

# run prisma migrations
npm run db:migrate --workspace server

# start both apps
npm run dev
```

Client runs on http://localhost:5173 · Server on http://localhost:4000.
