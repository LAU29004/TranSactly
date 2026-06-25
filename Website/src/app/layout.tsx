import type { Metadata } from "next";
import "./globals.css";

import LayoutWrapper from "../components/LayoutWrapper";
import GoogleProvider from "../components/GoogleProvider";

export const metadata: Metadata = {
  title: "centfluence — Understand Your Finances Automatically",
  description:
    "centfluence transforms bank SMS into real-time financial intelligence, AI insights, smart categorization, and spending forecasts.",

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <GoogleProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
        </GoogleProvider>
      </body>
    </html>
  );
}