'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/login');
  }, []);

  return (
    <div
      className={
        'justify-center flex h-screen items-center p-[20px] flex-col gap-[20]'
      }
    ></div>
  );
}
