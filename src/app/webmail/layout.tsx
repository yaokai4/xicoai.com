import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Xico 邮箱",
  robots: { index: false, follow: false },
};

export default function WebmailRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-bg text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
