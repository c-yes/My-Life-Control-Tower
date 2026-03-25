import { getVideo } from "@/lib/notion";
import { VideoDetail } from "./VideoDetail";

export const revalidate = 0;

export default async function VideoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const video = await getVideo(id);
  return <VideoDetail video={video} />;
}
