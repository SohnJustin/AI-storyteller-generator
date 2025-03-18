import { NextApiRequest } from "next";
import { NextResponse } from "next/server";
import axios from "axios";

const OPEN_ROUTER_API_KEY = process.env.STORY_GENERATOR_API_KEY;
const OPEN_ROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

export async function POST(req: NextApiRequest, res: NextResponse) {
  try {
    // Create the prompt data
    const { prompt, genre } = req.body;
    // Call the OpenRouter(Deepseek API) to generate the story
    const promptData = `Create a story in the ${genre} genre with the following prompt: ${prompt}`;

    const apiResponse = await axios.post(
      `${OPEN_ROUTER_API_URL}`,
      {
        // Model that we want to use
        model: "deepseek/deepseek-r1:free",
        // Prompt in the beginnging that will be given to the user
        prompt: promptData,
        // The messages that the user sent
        messege: [{ role: "user", content: promptData }],
      },
      {
        headers: {
          Authorization: `Bearer ${OPEN_ROUTER_API_KEY}`,
          "Content-Type": `application/json`,
        },
      }
    );

    // DEBUGGING: Log the response data to see its structure
    //console.log("API Response:", apiResponse.data);

    // Access the 'text' to return the story to the user
    const story = apiResponse.data.choices[0].text;
    return NextResponse.json({ story });
  } catch (error: any) {
    console.error(
      "Error from OpenRouter API:",
      error.response ? error.response.data : error.message
    );
    return NextResponse.json(
      { error: "Failed to generate story" },
      { status: 500 }
    );
  }
}

// Handle other HTTP methods (GET, etc.)
export async function GET(req: NextApiRequest) {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
