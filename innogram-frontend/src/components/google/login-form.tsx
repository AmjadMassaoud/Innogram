'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import GoogleLoginButton from '@/components/google/google-login-button';
import {
  API_GATEWAY_BASE_URL,
  GOOGLE_CLIENT_ID,
} from '@/../constants/env-variables/env-variables';
import { useAuth } from '@/hooks/use-auth';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

const signupSchema = z.object({
  username: z.string().min(3, {
    message: 'Username must be at least 3 characters.',
  }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(10, {
    message: 'Password must be at least 10 characters long.',
  }),
});

type FormValues = z.infer<typeof loginSchema> | z.infer<typeof signupSchema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const [isError, setError] = useState<Error | null>(null);
  const [registerMethod, setRegisterMethod] = useState<'signup' | 'login'>(
    'signup',
  );
  const auth = useAuth();

  const router = useRouter();

  const currentSchema = useMemo(() => {
    return registerMethod === 'signup' ? signupSchema : loginSchema;
  }, [registerMethod]);

  const form = useForm<FormValues>({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    form.reset();
  }, [registerMethod, form]);

  async function handleOnSubmit(values: FormValues) {
    const endpoint = registerMethod === 'signup' ? 'users' : 'tokens';

    try {
      const res = await fetch(`${API_GATEWAY_BASE_URL}/v1/auth/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
        credentials: 'include',
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.message);

      if (result) {
        auth.login(result.accessToken);
        router.push('/home');
      }
    } catch (error) {
      if (error) {
        console.log(error);
        setError(error! as Error);
      }
    }
  }

  const title =
    registerMethod === 'signup' ? 'Create an Account' : 'Login to Your Account';
  const description =
    registerMethod === 'signup'
      ? 'Enter your details to get started.'
      : 'Enter your credentials to login.';
  const buttonText = registerMethod === 'signup' ? 'Sign Up' : 'Login';
  const toggleLinkText =
    registerMethod === 'signup'
      ? 'Already have an account?'
      : "Don't have an account?";
  const toggleActionText = registerMethod === 'signup' ? 'Login' : 'Sign Up';

  const toggleMode = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent the link from navigating
    setRegisterMethod((prev) => (prev === 'signup' ? 'login' : 'signup'));
  };

  return (
    <div className={cn('w-[400px]', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleOnSubmit)}
              className='space-y-6'
            >
              {registerMethod === 'signup' && (
                <FormField
                  control={form.control}
                  name='username'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder='innogram1234' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder='m@example.com' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <div className='flex items-center'>
                      <FormLabel>Password</FormLabel>
                      {registerMethod === 'login' && (
                        <a
                          href='#'
                          className='ml-auto inline-block text-sm underline-offset-4 hover:underline'
                        >
                          Forgot your password?
                        </a>
                      )}
                    </div>
                    <FormControl>
                      <Input type='password' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isError && (
                <div
                  className='rounded-md border border-red-500 bg-transparent p-3 text-center text-sm text-red-700'
                  role='alert'
                >
                  {isError.message}
                </div>
              )}

              <div className='flex flex-col gap-3 pt-2'>
                <Button type='submit' className='w-full cursor-pointer'>
                  {buttonText}
                </Button>

                <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                  <GoogleLoginButton />
                </GoogleOAuthProvider>
              </div>

              <div className='mt-4 text-center text-sm'>
                {toggleLinkText}{' '}
                <a
                  href='#'
                  className='underline underline-offset-4'
                  onClick={toggleMode}
                >
                  {toggleActionText}
                </a>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
