import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Reddit Newsletter",
  description: "AI-powered Reddit digest delivered to your inbox",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} dark h-full antialiased`}>
        <body className="min-h-full flex flex-col">
          {children}
          <Toaster richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}
