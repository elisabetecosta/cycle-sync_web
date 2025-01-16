import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { AuthProvider } from '@/contexts/AuthContext';
import { Navbar } from '@/components/ui/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Cycle Sync",
  description: "Plan your life (meals, workouts, routines) around your cycle",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <main className={inter.className}>{children}</main>
          <Navbar />
        </AuthProvider>
      </body>
    </html>
  );
}