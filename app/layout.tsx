import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Sidebar from "@/components/Sidebar";
import { SessionProvider } from "@/components/SessionProvider";

export const metadata: Metadata = {
  title: "Cashbook — 나의 가계부",
  description: "수입과 지출을 쉽게 관리하는 나만의 가계부 대시보드",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <SessionProvider>
          <ThemeProvider>
            <Sidebar />
            <main className="md:ml-[220px] min-h-screen pb-20 md:pb-0">
              {children}
            </main>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
