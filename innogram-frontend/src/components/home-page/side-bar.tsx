'use client';

import { ReactElement } from 'react';
import { CircleEllipsis } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Navigators from '@/components/home-page/navigators';
import { API_GATEWAY_BASE_URL } from '../../../constants/env-variables/env-variables';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

export default function SideBar(): ReactElement<HTMLDivElement> {
  const router = useRouter();
  const auth = useAuth();

  const handleLogout = async () => {
    try {
      const res = await fetch(`${API_GATEWAY_BASE_URL}/v1/auth/tokens`, {
        method: 'DELETE',
        headers: {},
        credentials: 'include',
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.message);

      auth.logout();
      router.push('/login');
    } catch (error) {
      throw error;
    }
  };

  return (
    <div className={'flex-col'}>
      <h1 className={'text-[30px] font-bold mb-[50px]'}>Innogram</h1>

      <div
        className={
          'flex flex-col gap-[30px] justify-center font-bold align-center'
        }
      >
        <Navigators />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={'flex-row flex gap-[5px] text-[20px] self-start'}
            >
              <CircleEllipsis size={28} />
              More
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className={'ml-[80px]'}>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem
                className={'text-red-500'}
                onClick={handleLogout}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
