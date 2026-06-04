import { NextResponse } from "next/server";
import OpenAI from "openai";
import { toFile } from "openai/uploads";

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "Use browser speech recognition." }, { status: 501 });
    }

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: "file is required." }, { status: 400 });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const model = process.env.OPENAI_STT_MODEL ?? "whisper-1";

    const transcription = await client.audio.transcriptions.create({
      model,
      file: await toFile(file, "audio.webm"),
    });

    return NextResponse.json({ text: transcription.text });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "STT failed." },
      { status: 500 },
    );
  }
}
