'use client'

import { RegisterForm } from '@/components/forms/RegisterForm';
import Link from 'next/link';
import { AuthProvider } from '@/contexts/AuthContext';

export default function RegisterPage() {
  return (
    <AuthProvider>
      <main className="min-h-screen flex flex-col items-center justify-center bg-background py-8">
        <div className="w-full max-w-md">
          <RegisterForm />
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-500 hover:underline">
                Login
              </Link>
            </p>
          </div>
        </div>
      </main>
    </AuthProvider>
  );
}