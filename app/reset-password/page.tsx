import { ResetPasswordForm } from '@/components/forms/ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background py-8">
      <div className="w-full max-w-md">
        <ResetPasswordForm />
      </div>
    </main>
  );
}

