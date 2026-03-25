import { getAllVideos } from "@/lib/notion";
import { UploadCalendar } from "./UploadCalendar";

export const revalidate = 0;

export default async function CalendarPage() {
  const videos = await getAllVideos();
  const withDate = videos.filter((v) => v.uploadDate);
  return <UploadCalendar videos={withDate} />;
}
