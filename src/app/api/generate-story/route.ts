// Note: we optionally use 'jsonrepair' at runtime to fix slightly invalid JSON from models.
//src/app/api/generate-story/route.ts
import { NextResponse } from "next/server";
import axios from "axios";
import { prisma } from "@/lib/prismaClient";

const OPEN_ROUTER_API_KEY = process.env.STORY_GENERATOR_API_KEY;
const OPEN_ROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

export async function POST(req: Request) {
  try {
    // 1. Parse the request body properly (depending on Next.js version, you might need await req.json())
    const { length, prompt, genre } = await req.json();

    // 2. Create the prompt
    const promptData = `Create a ${length} length ${genre} story with the following prompt: "${prompt}"
    Please return the output in JSON format with the following structure:
{
  "title": "Generated Title",
  "story": "Generated story content..."
}`;

    // DEBUGGING PRINT OUT PROMPT DATA
    console.log("Prompt Data:", promptData);

    // 3. Send the request to OpenRouter with the correct `messages` key
    const apiResponse = await axios.post(
      OPEN_ROUTER_API_URL,
      {
        model: "deepseek/deepseek-r1:free",
        messages: [{ role: "user", content: promptData }],
      },
      {
        headers: {
          Authorization: `Bearer ${OPEN_ROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // DEBUGGING PRINT OUT API RESPONSE
    console.log("API Response:", apiResponse.data);

    // 4. Extract and parse the JSON string from the first choice
    const contentString = apiResponse.data?.choices?.[0]?.message?.content;
    // For safety, make sure we actually got a string back
    if (!contentString) {
      return NextResponse.json(
        { error: "No content returned from API" },
        { status: 500 }
      );
    }

    // 5. Try to robustly extract {title, story} even if the model added thinking or formatting
    let raw = contentString;

    // Drop DeepSeek/other reasoning wrappers like &lt;think&gt; ... &lt;/think&gt; or <think> ... </think>
    raw = raw
      .replace(/&lt;think&gt;[\s\S]*?&lt;\/think&gt;/gi, "")
      .replace(/<think>[\s\S]*?<\/think>/gi, "");

    // If wrapped in markdown fences, unwrap
    if (raw.trim().startsWith("```")) {
      const firstFence = raw.indexOf("\n");
      const lastFence = raw.lastIndexOf("```");
      if (firstFence !== -1 && lastFence !== -1) {
        raw = raw.slice(firstFence + 1, lastFence).trim();
      }
    }

    // Find the largest JSON-looking block
    const jsonBlockMatch = raw.match(/{[\s\S]*}/);
    let jsonLike = jsonBlockMatch ? jsonBlockMatch[0] : raw;

    // Normalize smart quotes
    jsonLike = jsonLike
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2018\u2019]/g, "'");

    // Ensure we don't have trailing text after the last closing brace
    const lastBrace = jsonLike.lastIndexOf("}");
    if (lastBrace !== -1) jsonLike = jsonLike.slice(0, lastBrace + 1);

    let parsed: any | null = null;
    try {
      parsed = JSON.parse(jsonLike);
    } catch {
      // Try jsonrepair as a best-effort fix if available
      try {
        const { jsonrepair } = await import("jsonrepair");
        const repaired = jsonrepair(jsonLike);
        parsed = JSON.parse(repaired);
      } catch {
        // Last resort: regex pull of title/story allowing single or double quotes
        const t =
          /\"title\"\s*:\s*\"([\s\S]*?)\"|\'title\'\s*:\s*\'([\s\S]*?)\'/i.exec(
            jsonLike
          );
        const s =
          /\"story\"\s*:\s*\"([\s\S]*?)\"|\'story\'\s*:\s*\'([\s\S]*?)\'/i.exec(
            jsonLike
          );
        parsed = {
          title: t && (t[1] || t[2]) ? t[1] || t[2] : "Your Story",
          story: s && (s[1] || s[2]) ? s[1] || s[2] : "",
        };
      }
    }

    const title = (parsed?.title ?? "Your Story").toString();
    const story = (parsed?.story ?? "").toString();

    // 6. Persist to DB (temporary) so client can route to /book/[id]
    //    If you haven't created the Story model yet, see the schema notes in chat.
    const ttlMinutes = 180;
    const expiresAt = new Date(Date.now() + ttlMinutes * 60_000);
    let created;
    try {
      created = await prisma.story.create({
        data: {
          title: (title ?? "Your Story").toString(),
          body: (story ?? "").toString(),
          expiresAt,
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
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error generating story:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
