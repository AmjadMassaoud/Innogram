import { ReactElement } from 'react';
import { MoonLoader } from 'react-spinners';

export default function Loading(): ReactElement {
  return (
    <div className={'bg-white h-full w-full'}>
      <MoonLoader size={5} />
    </div>
  );
}
