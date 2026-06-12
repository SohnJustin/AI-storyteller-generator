# AI StoryTeller Generator

A full-stack web application that generates AI-driven short stories from a user
prompt. You pick a **genre** and **length**, describe the story you want, and the
app calls a large language model to write it, persists it to a database, and
renders it in a **paginated open-book reader** with **text-to-speech** narration.

## Features

- **Story generation** — sends your prompt, genre, and length to the
  [OpenRouter](https://openrouter.ai) API and parses the returned story. Uses a
  free-model fallback list (currently `openai/gpt-oss-120b:free` →
  `gpt-oss-20b:free` → `meta-llama/llama-3.3-70b-instruct:free`) so a throttled
  provider automatically falls back to the next.
- **Open-book reader** — each story renders at a dynamic `/book/[id]` URL as a
  two-page parchment spread inside a leather cover, with Prev/Next page turning.
- **Text-to-speech** — client-side narration built on the browser's Web Speech
  API (`src/app/hooks/useTTS.ts`) with play/pause/resume and a word-by-word
  highlight that auto-turns the page as it reads.
- **Accounts** — email/password authentication via Auth.js (NextAuth v5) with
  bcrypt-hashed passwords and JWT sessions. Logged-in users get a `/profile`
  page listing their stories.
- **Story persistence** — stories are saved to PostgreSQL via Prisma. Stories
  created while logged in are kept permanently; guest (anonymous) stories expire
  after a TTL.

## Tech Stack

| Layer            | Technology                                              |
| ---------------- | ------------------------------------------------------- |
| Framework        | Next.js 15 (App Router) + React 19 + TypeScript         |
| Styling          | Tailwind CSS v4, Framer Motion                          |
| Backend          | Next.js API routes (`src/app/api/*`)                    |
| Auth             | Auth.js / NextAuth v5 (Credentials provider, JWT)       |
| Database / ORM   | PostgreSQL + Prisma                                      |
| AI provider      | OpenRouter (OpenAI-compatible chat completions API)     |
| Text-to-speech   | Web Speech API (browser, client-side)                   |

---

## 1. Project Title and Description

**AI StoryTeller Generator** — see the description and features above. In short:
give it a prompt, a genre, and a length, and it generates a story you can read in
an open-book reader or have read aloud to you, accessible at a unique URL.

---

## 2. Installation Instructions

### Prerequisites

- **Node.js 18+** and a package manager (`npm`, `yarn`, or `pnpm`)
- A **PostgreSQL** database (local or hosted, e.g. Supabase / Neon / Railway)
- An **OpenRouter API key** — sign up at [openrouter.ai](https://openrouter.ai)

### Steps

Clone the repository and install dependencies:

```bash
git clone https://github.com/SohnJustin/AI-storyteller-generator.git
cd AI-storyteller-generator
npm install
```

Create the environment files in the project root.

`.env` (used by Prisma). With a connection-pooling provider like Supabase, use
the pooled URL at runtime and a direct/session URL for migrations:

```env
# App runtime (e.g. Supabase transaction pooler, port 6543)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:6543/postgres?pgbouncer=true"
# Migrations (e.g. Supabase session pooler / direct, port 5432)
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/postgres"
```

> If your database is a plain Postgres instance (not pooled), you can set both
> `DATABASE_URL` and `DIRECT_URL` to the same standard connection string.

`.env.local` (app secrets):

```env
STORY_GENERATOR_API_KEY="your_openrouter_api_key_here"
AUTH_SECRET="a_long_random_string"
```

Generate an `AUTH_SECRET` with `openssl rand -base64 33` (or `npx auth secret`).

Generate the Prisma client and apply the schema to your database:

```bash
npx prisma generate
npx prisma migrate deploy   # or: npx prisma migrate dev
```

---

## 3. Running the Application & Test Prompts

Start the development server:

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

### Walkthrough

1. **Sign up** at `/signup`, then **log in** at `/login`. (You can generate as a
   guest, but logging in ties stories to your account and keeps them permanently.)
2. From the landing page, click **"Start Creating Your Story"** (`/generate-story`).
3. Choose a **Genre**, a **Length** (Short / Medium / Long), and type your story
   idea into **Story Content**.
4. Click **Generate Story**. The app calls the model, saves the result, and
   redirects you to `/book/[id]`.
5. Read it in the open-book reader — turn pages with **Prev/Next**, or press
   **Play** to have it narrated with synchronized highlighting.
6. Visit **`/profile`** to see all stories tied to your account.

### Test prompts

| Genre     | Length | Story Content                                                        |
| --------- | ------ | ------------------------------------------------------------------- |
| Fantasy   | Short  | A young mapmaker discovers a city that only appears at midnight.     |
| Sci-Fi    | Medium | Two rival astronauts must cooperate after their station loses power. |
| Children's| Short  | A shy hedgehog learns to make friends at the autumn festival.        |
| Mystery   | Short  | A librarian notices the same book keeps returning itself overnight.  |

### Running with Docker (optional)

A `Dockerfile` and `compose.yaml` are included:

```bash
docker compose up --build
```

The app is served on port `3000`. You must still provide `DATABASE_URL`,
`DIRECT_URL`, `STORY_GENERATOR_API_KEY`, and `AUTH_SECRET` (the compose file does
not define a database service by default — uncomment the `db` block in
`compose.yaml` or point at an external one).

### Deploying

When deploying (e.g. to Vercel), set `DATABASE_URL`, `DIRECT_URL`,
`STORY_GENERATOR_API_KEY`, and `AUTH_SECRET` as environment variables. The build
script runs `prisma migrate deploy`, so the database must be reachable at build
time.

---

## 4. Known Issues / Limitations

- **Free-model rate limits.** OpenRouter's free models are throttled upstream and
  can return `429`. The fallback list mitigates this, but if every model in the
  list is busy at once, generation can intermittently fail ("Error generating
  story"). Retrying usually works; adding OpenRouter credits or your own provider
  key removes the limit.
- **Email verification is not implemented.** The signup form shows a disabled
  "Verification Code" field and `User.isVerified` always stays `false`; there is
  no email-sending or verification flow yet.
- **"Read Myself" mode is not built.** `/book/[id]` renders the Read Along reader
  regardless of the `mode` query param; a separate self-paced view is planned.
- **Guest stories expire.** Stories created without logging in are stored with a
  TTL and the `/book/[id]` page treats them as gone afterward. This is by design —
  log in to keep stories permanently.
- **TTS quality varies by browser.** Narration uses the browser's built-in Web
  Speech API, so available voices and quality depend on the user's OS/browser.

---

## Author

Developed by Justin Sohn.
