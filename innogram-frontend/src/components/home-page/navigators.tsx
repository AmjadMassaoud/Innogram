import { Bell, House, MessageCircle, Search } from 'lucide-react';
import { ReactElement } from 'react';

export default function Navigators(): ReactElement<HTMLDivElement> {
  return (
    <div className={'flex flex-col gap-[30px]'}>
      <button className={'flex-row flex gap-[5px] align-center text-[20px]'}>
        <House size={28} />
        Home
      </button>

      <button className={'flex-row flex gap-[5px] align-center text-[20px]'}>
        <Search size={28} />
        Search
      </button>

      <button className={'flex-row flex gap-[5px] align-center text-[20px]'}>
        <MessageCircle size={28} />
        Search
      </button>

      <button className={'flex-row flex gap-[5px] align-center text-[20px]'}>
        <Bell size={28} />
        Notifications
      </button>
    </div>
  );
}
