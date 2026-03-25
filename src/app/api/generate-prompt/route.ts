import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { EXCLUDE_PROMPT } from "@/lib/constants";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { mode, input } = await req.json();

  if (!input?.trim()) {
    return NextResponse.json({ error: "입력값이 없습니다." }, { status: 400 });
  }

  const systemPrompt = `You are an expert at creating SUNO AI music prompts for prenatal (태교) healing music.

The music must always be:
- Gentle, calming, peaceful, nurturing
- Major key, warm harmony, soft dynamics
- Extended long-form, slow evolving, continuous flow
- Suitable for pregnant mothers and unborn babies

You will generate TWO separate prompts:
1. **Style Prompt**: Describes the musical style, instruments, tempo, mood, atmosphere
2. **Lyrics Prompt**: [Verse] and [Chorus] structure with gentle, nurturing lyrics in English (can include Korean sentiment)

Always end with this exact exclude line:
${EXCLUDE_PROMPT}

Return your response in this exact JSON format:
{
  "stylePrompt": "...(style description ending with the exclude line)...",
  "lyricsPrompt": "[Verse]\\n...\\n\\n[Chorus]\\n..."
}`;

  let userMessage = "";
  if (mode === "url") {
    userMessage = `Generate SUNO prompts inspired by this classical music piece: ${input}

Analyze the mood, instrumentation, and emotional qualities of this piece, then create prenatal healing music prompts that capture its essence while making it gentle and suitable for 태교.`;
  } else {
    userMessage = `Generate SUNO prompts based on this concept or sentence: "${input}"

Create prenatal healing music prompts that evoke this feeling/scene while keeping it gentle and suitable for 태교.`;
  }

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return NextResponse.json({ error: "프롬프트 생성에 실패했습니다." }, { status: 500 });
  }

  const result = JSON.parse(jsonMatch[0]);
  return NextResponse.json(result);
}
