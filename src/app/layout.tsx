import type { Metadata } from "next";
import "./globals.css";
import GitHubPagesShim from "@/components/GitHubPagesShim";

export const metadata: Metadata = {
  title: "ZPHS Somasanigunta | Official School Portal",
  description: "Zilla Parishad High School, Somasanigunta, Venkatagiri Mandal, Tirupati District",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <GitHubPagesShim />
        {children}
      </body>
    </html>
  );
}
