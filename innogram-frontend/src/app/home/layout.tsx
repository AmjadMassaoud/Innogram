'use client';

import { ReactElement, ReactNode, useEffect } from 'react';
import SideBar from '@/components/home-page/side-bar';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

type HomeLayoutPageProps = {
  children: ReactNode;
};

export default function HomeLayoutPage({
  children,
}: HomeLayoutPageProps): ReactElement<HTMLDivElement> | null {
  const { accessToken } = useAuth();

  const router = useRouter();

  useEffect(() => {
    if (!accessToken) {
      router.push('/login');
    }
  }, [accessToken, router]);

  return (
    <div className={'h-full p-[50px]'}>
      <SideBar />
      {children}
    </div>
  );
}
