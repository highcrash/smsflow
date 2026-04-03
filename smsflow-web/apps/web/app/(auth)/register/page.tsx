'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    terms: z.boolean().refine((v) => v === true, 'You must agree to the terms'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
      });
      const { accessToken, refreshToken, user } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full px-3 py-2.5 rounded-md border text-sm outline-none transition-all ${
      hasError
        ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10'
        : 'border-surface-cool focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10'
    }`;

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark-900">Create your account</h1>
        <p className="mt-1 text-sm text-dark-500">
          Start your 14-day free trial. No credit card required.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-dark-700 mb-1.5">Full name</label>
          <input {...register('name')} type="text" placeholder="John Doe" className={inputClass(!!errors.name)} />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-700 mb-1.5">Email address</label>
          <input {...register('email')} type="email" placeholder="you@example.com" className={inputClass(!!errors.email)} />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-700 mb-1.5">Password</label>
          <input {...register('password')} type="password" placeholder="At least 8 characters" className={inputClass(!!errors.password)} />
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-700 mb-1.5">Confirm password</label>
          <input {...register('confirmPassword')} type="password" placeholder="••••••••" className={inputClass(!!errors.confirmPassword)} />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="flex items-start gap-2.5 pt-1">
          <input
            {...register('terms')}
            id="terms"
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-surface-cool text-brand-600 focus:ring-brand-500"
          />
          <label htmlFor="terms" className="text-sm text-dark-600">
            I agree to the{' '}
            <Link href="/terms" className="text-brand-600 hover:text-brand-700 font-medium">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-brand-600 hover:text-brand-700 font-medium">
              Privacy Policy
            </Link>
          </label>
        </div>
        {errors.terms && <p className="text-xs text-red-600 -mt-2">{errors.terms.message}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-md transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-dark-500">
        Already have an account?{' '}
        <Link href="/login" className="text-brand-600 font-semibold hover:text-brand-700">
          Sign in
        </Link>
      </p>
    </>
  );
}
