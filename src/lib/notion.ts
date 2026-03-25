import { Client } from "@notionhq/client";
import { StageId } from "./constants";

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DATABASE_ID = process.env.NOTION_DATABASE_ID!;

export type Video = {
  id: string;
  title: string;
  status: StageId;
  uploadDate: string | null;
  referenceUrl: string | null;
  conceptMemo: string | null;
  sunoStylePrompt: string | null;
  sunoLyricsPrompt: string | null;
  sunoSongUrl: string | null;
  coverImageUrl: string | null;
  youtubeUrl: string | null;
  done: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pageToVideo(page: any): Video {
  const props = page.properties;
  return {
    id: page.id,
    title: props["제목"]?.title?.[0]?.plain_text ?? "(제목 없음)",
    status: (props["상태"]?.select?.name ?? "planning") as StageId,
    uploadDate: props["업로드 예정일"]?.date?.start ?? null,
    referenceUrl: props["참고 곡 URL"]?.url ?? null,
    conceptMemo: props["컨셉 메모"]?.rich_text?.[0]?.plain_text ?? null,
    sunoStylePrompt: props["SUNO Style Prompt"]?.rich_text?.[0]?.plain_text ?? null,
    sunoLyricsPrompt: props["SUNO Lyrics Prompt"]?.rich_text?.[0]?.plain_text ?? null,
    sunoSongUrl: props["SUNO 곡 URL"]?.url ?? null,
    coverImageUrl: props["커버 이미지 URL"]?.url ?? null,
    youtubeUrl: props["유튜브 URL"]?.url ?? null,
    done: props["완료 여부"]?.checkbox ?? false,
  };
}

export async function getAllVideos(): Promise<Video[]> {
  const res = await notion.databases.query({
    database_id: DATABASE_ID,
    sorts: [{ property: "업로드 예정일", direction: "ascending" }],
  });
  return res.results.map(pageToVideo);
}

export async function getVideo(id: string): Promise<Video> {
  const page = await notion.pages.retrieve({ page_id: id });
  return pageToVideo(page);
}

export async function createVideo(title: string): Promise<Video> {
  const page = await notion.pages.create({
    parent: { database_id: DATABASE_ID },
    properties: {
      제목: { title: [{ text: { content: title } }] },
      상태: { select: { name: "기획" } },
    },
  });
  return pageToVideo(page);
}

export async function updateVideo(
  id: string,
  fields: Partial<{
    title: string;
    status: StageId;
    uploadDate: string;
    referenceUrl: string;
    conceptMemo: string;
    sunoStylePrompt: string;
    sunoLyricsPrompt: string;
    sunoSongUrl: string;
    coverImageUrl: string;
    youtubeUrl: string;
    done: boolean;
  }>
): Promise<Video> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const properties: Record<string, any> = {};

  if (fields.title !== undefined)
    properties["제목"] = { title: [{ text: { content: fields.title } }] };
  if (fields.status !== undefined)
    properties["상태"] = { select: { name: statusToKorean(fields.status) } };
  if (fields.uploadDate !== undefined)
    properties["업로드 예정일"] = fields.uploadDate
      ? { date: { start: fields.uploadDate } }
      : { date: null };
  if (fields.referenceUrl !== undefined)
    properties["참고 곡 URL"] = { url: fields.referenceUrl || null };
  if (fields.conceptMemo !== undefined)
    properties["컨셉 메모"] = {
      rich_text: fields.conceptMemo ? [{ text: { content: fields.conceptMemo } }] : [],
    };
  if (fields.sunoStylePrompt !== undefined)
    properties["SUNO Style Prompt"] = {
      rich_text: fields.sunoStylePrompt ? [{ text: { content: fields.sunoStylePrompt } }] : [],
    };
  if (fields.sunoLyricsPrompt !== undefined)
    properties["SUNO Lyrics Prompt"] = {
      rich_text: fields.sunoLyricsPrompt ? [{ text: { content: fields.sunoLyricsPrompt } }] : [],
    };
  if (fields.sunoSongUrl !== undefined)
    properties["SUNO 곡 URL"] = { url: fields.sunoSongUrl || null };
  if (fields.coverImageUrl !== undefined)
    properties["커버 이미지 URL"] = { url: fields.coverImageUrl || null };
  if (fields.youtubeUrl !== undefined)
    properties["유튜브 URL"] = { url: fields.youtubeUrl || null };
  if (fields.done !== undefined) properties["완료 여부"] = { checkbox: fields.done };

  const page = await notion.pages.update({ page_id: id, properties });
  return pageToVideo(page);
}

function statusToKorean(id: StageId): string {
  const map: Record<StageId, string> = {
    planning: "기획",
    prompt_writing: "프롬프트 작성",
    music_production: "SUNO 음악 제작",
    cover_image: "커버 이미지",
    video_editing: "영상 편집",
    thumbnail: "썸네일",
    description_tags: "설명/태그 작성",
    scheduled: "업로드 예약",
    done: "완료",
  };
  return map[id] ?? "기획";
}
