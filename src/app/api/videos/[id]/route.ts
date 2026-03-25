import { NextRequest, NextResponse } from "next/server";
import { getVideo, updateVideo } from "@/lib/notion";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const video = await getVideo(id);
  return NextResponse.json(video);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const fields = await req.json();
  const video = await updateVideo(id, fields);
  return NextResponse.json(video);
}
