import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Card Keeper - 信用卡权益管家",
  description: "追踪和管理你的信用卡权益，不再错过任何福利",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
