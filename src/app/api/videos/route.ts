import { NextRequest, NextResponse } from "next/server";
import { getAllVideos, createVideo } from "@/lib/notion";

export async function GET() {
  const videos = await getAllVideos();
  return NextResponse.json(videos);
}

export async function POST(req: NextRequest) {
  const { title } = await req.json();
  if (!title?.trim()) {
    return NextResponse.json({ error: "제목을 입력해주세요." }, { status: 400 });
  }
  const video = await createVideo(title);
  return NextResponse.json(video);
}
