import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Healing Prenatal Music — 제작 워크플로우",
  description: "태교음악 유튜브 채널 영상 제작 워크플로우 대시보드",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-slate-50">
        <div className="max-w-screen-2xl mx-auto px-6 py-8">{children}</div>
      </body>
    </html>
  );
}
