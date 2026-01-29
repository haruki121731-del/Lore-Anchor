import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lore-Anchor | IP侵害検知・削除要請プラットフォーム",
  description: "クリエイターの作品を守る。インターネット上の違法アップロードを自動検知し、DMCA削除要請を効率化します。",
  keywords: ["著作権", "DMCA", "IP保護", "侵害検知", "クリエイター", "イラスト", "音楽", "動画"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
