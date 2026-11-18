//src/app/api/generate-story/route.ts
import { parseStoryResponse } from "@/lib/parseStory";
import { NextResponse } from "next/server";
import axios from "axios";
import { prisma } from "@/lib/prismaClient";
import { auth } from "@/auth";

const OPEN_ROUTER_API_KEY = process.env.STORY_GENERATOR_API_KEY;
const OPEN_ROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

export async function POST(req: Request) {
  try {
    // 1. Parse the request body properly (depending on Next.js version, you might need await req.json())
    const { length, prompt, genre } = await req.json();

    // Associate the story with the signed-in user, if any.
    const session = await auth();
    const userId = session?.user?.id ? Number(session.user.id) : null;

    // 2. Create the prompt
    const promptData = `Create a ${length} length ${genre} story with the following prompt: "${prompt}"
    Please return the output in JSON format with the following structure:
{
  "title": "Generated Title",
  "story": "Generated story content..."
}`;

    // 3. Send the request to OpenRouter with the correct `messages` key
    const apiResponse = await axios.post(
      OPEN_ROUTER_API_URL,
      {
        // Free models get throttled upstream individually, so list several
        // and let OpenRouter fall back to the first available one.
        // OpenRouter caps this fallback array at 3 entries.
        models: [
          "openai/gpt-oss-120b:free",
          "openai/gpt-oss-20b:free",
          "meta-llama/llama-3.3-70b-instruct:free",
        ],
        messages: [{ role: "user", content: promptData }],
      },
      {
        headers: {
          Authorization: `Bearer ${OPEN_ROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    // 4. Extract and parse the JSON string from the first choice
    const contentString = apiResponse.data?.choices?.[0]?.message?.content;
    // For safety, make sure we actually got a string back
    if (!contentString) {
      return NextResponse.json(
        { error: "No content returned from API" },
        { status: 500 },
      );
    }

    const { title, story } = parseStoryResponse(contentString);
    // 6. Persist to DB (temporary) so client can route to /book/[id]
    //    If you haven't created the Story model yet, see the schema notes in chat.
    // Logged-in users keep their stories permanently (null); guest stories
    // expire after a TTL so anonymous content doesn't pile up.
    const ttlMinutes = 180;
    const expiresAt = userId
      ? null
      : new Date(Date.now() + ttlMinutes * 60_000);
    let created;
    try {
      created = await prisma.story.create({
        data: {
          title: (title ?? "Your Story").toString(),
          body: (story ?? "").toString(),
          expiresAt,
          userId,
        },
        select: { id: true, title: true },
      });
    } catch (e) {
      // If Prisma isn't set up yet, still return the story without an id
      console.error("DB create failed (continuing without id):", e);
    }

    // 7. Return the JSON to the client (include id if available)
    return NextResponse.json(
      { id: created?.id, title: created?.title ?? title, story },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error generating story:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
