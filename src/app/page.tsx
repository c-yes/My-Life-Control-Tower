import { getAllVideos } from "@/lib/notion";
import { KanbanBoard } from "@/components/KanbanBoard";

export const revalidate = 0;

export default async function HomePage() {
  const videos = await getAllVideos();
  return <KanbanBoard initialVideos={videos} />;
}
