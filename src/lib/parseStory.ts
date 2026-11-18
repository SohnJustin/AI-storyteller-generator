import { jsonrepair } from "jsonrepair";
export function parseStoryResponse(content: string): {
  title: string;
  story: string;
} {
  // Try to robustly extract {title, story} even if the model added thinking or formatting
  let raw = content;
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
      const repaired = jsonrepair(jsonLike);
      parsed = JSON.parse(repaired);
    } catch {
      // Last resort: regex pull of title/story allowing single or double quotes
      const t =
        /\"title\"\s*:\s*\"([\s\S]*?)\"|\'title\'\s*:\s*\'([\s\S]*?)\'/i.exec(
          jsonLike,
        );
      const s =
        /\"story\"\s*:\s*\"([\s\S]*?)\"|\'story\'\s*:\s*\'([\s\S]*?)\'/i.exec(
          jsonLike,
        );
      parsed = {
        title: t && (t[1] || t[2]) ? t[1] || t[2] : "Your Story",
        story: s && (s[1] || s[2]) ? s[1] || s[2] : "",
      };
    }
  }

  const title = (parsed?.title ?? "Your Story").toString();
  const story = (parsed?.story ?? "").toString();
  return { title, story };
}
