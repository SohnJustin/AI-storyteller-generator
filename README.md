# AI StoryTeller Generator

A full-stack web application that generates AI-driven short stories from a user
prompt. You pick a **genre** and **length**, describe the story you want, and the
app calls a large language model to write it, persists it to a database, and
renders it on a shareable book page with **text-to-speech** narration.

## Features

- **Story generation** — sends your prompt, genre, and length to the
  [OpenRouter](https://openrouter.ai) API (currently the `deepseek/deepseek-r1:free`
  model) and parses the returned story.
- **Shareable story pages** — each generated story is saved to a PostgreSQL
  database (via Prisma) and rendered at a dynamic `/book/[id]` URL with a short
  TTL before it expires.
- **Text-to-speech** — client-side narration built on the browser's Web Speech
  API (`src/app/hooks/useTTS.ts`) with play/pause/resume controls.
- **Read Along / Read Myself** modes — `ReadAlong` highlights and auto-scrolls
  text as it is narrated; `ReadMyself` is a self-paced reading view.
- **Accounts (in progress)** — signup/login routes with bcrypt-hashed passwords.

## Tech Stack

| Layer            | Technology                                              |
| ---------------- | ------------------------------------------------------- |
| Framework        | Next.js 15 (App Router) + React 19 + TypeScript         |
| Styling          | Tailwind CSS v4, Framer Motion                          |
| Backend          | Next.js API routes (`src/app/api/*`)                    |
| Database / ORM   | PostgreSQL + Prisma                                      |
| AI provider      | OpenRouter (OpenAI-compatible chat completions API)     |
| Text-to-speech   | Web Speech API (browser, client-side)                   |

---

## 1. Project Title and Description

**AI StoryTeller Generator** — see the description and features above. In short:
give it a prompt, a genre, and a length, and it generates a story you can read or
have read aloud to you, accessible at a unique shareable URL.

---

## 2. Installation Instructions

### Prerequisites

- **Node.js 18+** and a package manager (`npm`, `yarn`, or `pnpm`)
- A running **PostgreSQL** database (local or hosted, e.g. Supabase / Neon / Railway)
- An **OpenRouter API key** — sign up at [openrouter.ai](https://openrouter.ai)

### Steps

Clone the repository:

```bash
git clone https://github.com/SohnJustin/AI-storyteller-generator.git
cd AI-storyteller-generator
```

Install dependencies:

```bash
npm install
```

> **Note:** the login/signup routes import `bcryptjs`, which is not yet listed in
> `package.json`. Until that is fixed, install it manually so auth doesn't crash:
>
> ```bash
> npm install bcryptjs
> ```

Create environment files in the project root.

`.env` (used by Prisma):

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DBNAME"
```

`.env.local` (used by the story-generation API route):

```env
STORY_GENERATOR_API_KEY="your_openrouter_api_key_here"
```

Generate the Prisma client and apply the schema to your database:

```bash
npx prisma generate
npx prisma migrate dev
```

---

## 3. Running the Application & Test Prompts

Start the development server:

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

### Walkthrough

1. From the landing page, click **"Start Creating Your Story"** (this goes to
   `/generate-story`).
2. Choose a **Genre** (e.g. Fantasy), a **Length** (Short / Medium / Long), and
   type your story idea into **Story Content**.
3. Click **Generate Story**. The app calls the API, saves the result, and
   redirects you to `/book/[id]?mode=readAlong`.
4. On the book page, use the text-to-speech controls to have the story read aloud.

### Test prompts

Use these to confirm everything works end to end:

| Genre     | Length | Story Content                                                        |
| --------- | ------ | ------------------------------------------------------------------- |
| Fantasy   | Short  | A young mapmaker discovers a city that only appears at midnight.     |
| Sci-Fi    | Medium | Two rival astronauts must cooperate after their station loses power. |
| Children's| Short  | A shy hedgehog learns to make friends at the autumn festival.        |
| Mystery   | Short  | A librarian notices the same book keeps returning itself overnight.  |

A successful run lands you on a `/book/[id]` page showing a generated title and
story body. If you only see a fallback `/book` page (no `[id]`), the database
write failed — check the **Known Issues** below.

### Running with Docker (optional)

A `Dockerfile` and `compose.yaml` are included:

```bash
docker compose up --build
```

The app is served on port `3000`. You must still provide `DATABASE_URL` and
`STORY_GENERATOR_API_KEY` (the compose file does not define a database service by
default — uncomment the `db` block in `compose.yaml` or point at an external one).

---

## 4. Known Issues

These are observable issues in the current codebase, roughly in order of severity:

1. **Prisma schema does not match the code.**
   `prisma/schema.prisma` defines the `Story` model with a required `userId`,
   `content`, `genre`, `prompt`, and `ttsUrl`, and **no `body` or `expiresAt`
   fields**. However, the API routes
   ([generate-story/route.ts](src/app/api/generate-story/route.ts) and
   [stories/route.ts](src/app/api/stories/route.ts)) write `{ title, body,
   expiresAt }` and read `body`/`expiresAt`. As written this will fail TypeScript
   compilation and/or the database insert, so story saving (and thus the
   `/book/[id]` redirect) is broken until the schema and code are reconciled.

2. **`bcryptjs` is not declared as a dependency.**
   It is imported by [login/route.ts](src/app/api/login/route.ts) and
   [signup/route.ts](src/app/api/signup/route.ts) but is missing from
   `package.json`, so a clean `npm install` followed by using auth will fail.
   (See the install note above.)

3. **Authentication is incomplete.**
   Login succeeds but no session/token is established or persisted, and stories
   are not tied to a logged-in user (the API never sets `Story.userId`). There is
   an `AuthContext`, but accounts are effectively cosmetic for now.

4. **Next.js 15 async `params`.**
   [stories/[id]/route.ts](src/app/api/stories/[id]/route.ts) reads `params.id`
   synchronously. In Next.js 15 route `params` is a Promise and should be
   awaited; this can produce warnings/errors.

5. **Multiple Prisma client instances.**
   The login and signup routes each call `new PrismaClient()` instead of reusing
   the shared client in [src/lib/prismaClient.ts](src/lib/prismaClient.ts), which
   can exhaust database connections in development with hot reload.

6. **Debug logging in production paths.**
   The generation and signup routes `console.log` prompt data, raw API
   responses, and even `DATABASE_URL`. These should be removed before deploying.

7. **Stories expire.**
   Generated stories are stored with a TTL (~3 hours) and the `/book/[id]` page
   returns `410 Gone` afterward, so shared links are intentionally short-lived.

---

## Author

Developed by Justin Sohn.
