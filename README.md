# Pennywise

An AI-powered personal expense dashboard built with Next.js, Clerk, Prisma, PostgreSQL, and OpenAI.

## What is included

- Modern responsive landing page and authenticated dashboard
- Clerk authentication with automatic user-profile sync to PostgreSQL
- Private, per-user expenses with ownership checks on every write
- AI expense categorization, tailored insights, and questions about recent spending
- PostgreSQL-ready budget data model for the next budgeting feature

## Run it locally

1. Copy `.env.example` to `.env` and fill in the three required services: PostgreSQL, Clerk, and an AI provider.
2. Apply the database schema: `npx prisma migrate deploy`
3. Start the app: `npm run dev`

For a new local development database, use `npx prisma migrate dev` instead.

## Deployment checklist

Add every value from `.env.example` to your deployment provider (for example Vercel), set `NEXT_PUBLIC_APP_URL` to the production URL, and run the Prisma migration against your production database before deploying.
