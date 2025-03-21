import Link from 'next/link';
import { ForgotPasswordForm } from '@/components/forms/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background py-8">
      <div className="w-full max-w-md">
        <ForgotPasswordForm />
        <div className="text-center mt-4">
          <Link href="/" className="text-blue-500 hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </main>
  );
}

