import { useGoogleLogin } from '@react-oauth/google';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { API_GATEWAY_BASE_URL } from '../../../constants/env-variables/env-variables';
import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';

export default function GoogleLoginButton() {
  const [isError, setIsError] = useState<string | null>(null);

  const router = useRouter();

  const auth = useAuth();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsError(null);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [isError]);

  const handleGoogleLogin = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async (response) => {
      console.log(response.code);
      try {
        const res = await fetch(`${API_GATEWAY_BASE_URL}/v1/auth/google`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: response.code }),
        });

        const result = await res.json();

        if (!res.ok) {
          throw new Error(
            result.message || result.error || 'Google login failed.',
          );
        }

        auth.login(result.accessToken);
        router.push('/home');
      } catch (error) {
        if (error instanceof Error) {
          setIsError(error.message);
        }
      }
    },
    onError: (error) => console.log('Google login in failed', error),
    ux_mode: 'popup',
  });

  return (
    <Button
      type='button'
      variant='outline'
      className='w-full cursor-pointer'
      onClick={() => handleGoogleLogin()}
    >
      {!isError && 'Continue with Google'}
      {isError && <span className='text-red-500'>{isError}</span>}
    </Button>
  );
}
