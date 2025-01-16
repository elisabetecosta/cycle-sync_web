'use client'

import { LoginForm } from '@/components/forms/LoginForm';
import Link from 'next/link';
import { AuthProvider } from '@/contexts/AuthContext';

export default function LoginPage() {
  return (
    <AuthProvider>
      <main className="min-h-screen flex flex-col items-center justify-center bg-background py-8">
        <div className="w-full max-w-md">
          <LoginForm />
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Don&#39;t have an account?{' '}
              <Link href="/register" className="text-blue-500 hover:underline">
                Register
              </Link>
            </p>
          </div>
        </div>
      </main>
    </AuthProvider>
  );
}