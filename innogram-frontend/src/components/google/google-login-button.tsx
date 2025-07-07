import { useGoogleLogin } from '@react-oauth/google';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { API_GATEWAY_BASE_URL } from '../../../constants/env-variables/env-variables';
import { useAuth } from '@/hooks/use-auth';

export default function GoogleLoginButton() {
  const router = useRouter();

  const auth = useAuth();

  const handleGoogleLogin = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async (response) => {
      try {
        const res = await fetch(
          `${API_GATEWAY_BASE_URL}/v1/auth/google?code=${response.code}`,
          {
            method: 'POST',
            credentials: 'include',
          },
        );

        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.message || 'Google login failed.');
        }

        auth.login(result.accessToken);
        router.push('/home');
      } catch (error) {
        console.error('Google Login Submission Error:', error);
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
      Continue with Google
    </Button>
  );
}
