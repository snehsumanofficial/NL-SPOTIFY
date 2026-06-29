import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Spotify VOC Pulse AI",
  description: "AI Product Copilot for Product Managers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="flex h-screen bg-[#121212] overflow-hidden text-white selection:bg-[#1DB954] selection:text-white">
        <Sidebar />
        <main className="flex-1 h-full overflow-y-auto bg-gradient-to-br from-[#121212] via-[#121212] to-[#181818]">
          {children}
        </main>
      </body>
    </html>
  );
}
