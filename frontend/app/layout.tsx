import type { Metadata } from "next";
import "./globals.css";
import { RouterInfoProvider } from "./contexts/router.context";

export const metadata: Metadata = {
  title: "WiFi Access Control System",
  description: "Created by Bruce Audo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`min-h-screen flex flex-col`}>
        <header className="h-[60px] border-b border-[rgba(0,0,0,0.2)] px-5 flex items-center justify-between bg-white">
          {/* LOGO */}
          <div className="text-2xl font-bold text-sky-600">
            MyWiFi<span className="text-gray-800">Zone</span>
          </div>

          {/* Welcome greeting */}
          {/*
          <div className="text-sm text-gray-600">Welcome, User</div>
          */}
        </header>

        <main className="h-screen flex-1">
          <RouterInfoProvider>{children}</RouterInfoProvider>
        </main>
        <footer className="h-[60px] border-t border-[rgba(0,0,0,0.2)] py-5 flex  flex-col space-y-2 items-center justify-between text-sm text-gray-600">
          <p className="flex items-center space-x-1">
            <span>&copy;</span>
            <span>
              {new Date().getFullYear()} WiFi Limited. All rights reserved.
            </span>
          </p>
          <div className="flex gap-4 pb-3">
            <a href="/terms" className="underline">
              Terms
            </a>
            <a href="/privacy" className="underline">
              Privacy
            </a>
            <a href="/contact" className="underline">
              Contact
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}
