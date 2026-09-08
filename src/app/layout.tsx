import { Suspense } from "react";
import type { Metadata } from "next";
import { QueryProvider } from "@/components/QueryProvider";
import { AuthModalsProvider } from "@/components/auth/AuthModalsProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "VintageFindr",
  description: "Vintage Kleidung von unabhängigen Vintage-Shops aus Deutschland.",
  icons: {
    icon: "/logo-vintage.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de" className="h-full">
      <body className="min-h-full flex flex-col font-sans antialiased">
        <QueryProvider>{children}</QueryProvider>
        <Suspense fallback={null}>
          <AuthModalsProvider />
        </Suspense>
      </body>
    </html>
  );
}
