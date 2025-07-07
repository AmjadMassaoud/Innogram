'use client';

import { LoginForm } from '@/components/google/login-form';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

export default function Page() {
  const router = useRouter();
  const { accessToken } = useAuth();

  useEffect(() => {
    if (accessToken) {
      router.push('/home');
    }
  }, [accessToken, router]);

  if (!accessToken) {
    return (
      <div className='flex flex-col min-h-svh w-full items-center justify-center p-6 md:p-10'>
        <h2 className={'text-[50px]'}>Innogram</h2>

        <div className='w-full max-w-sm'>
          <LoginForm />
        </div>
      </div>
    );
  }

  return (
    <div className='flex min-h-svh w-full items-center justify-center'>
      <p>You are already logged in. Redirecting...</p>
    </div>
  );
}
