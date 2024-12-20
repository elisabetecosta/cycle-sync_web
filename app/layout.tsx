import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cycle Sync",
  description: "Plan your life (food, workouts, routines) around your cycle",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
