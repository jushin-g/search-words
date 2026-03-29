import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "辞書サーチ",
  description: "言葉を探す",
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;
