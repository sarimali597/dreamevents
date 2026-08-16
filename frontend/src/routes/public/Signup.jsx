import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Sparkles, PartyPopper, Store, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { apiErrorMessage } from '../../lib/api.js';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Field.jsx';
import { AuthShell } from '../../components/layout/AuthShell.jsx';
import { cn } from '../../lib/utils.js';

const schema = z.object({
  name: z.string().min(2, 'Enter your full name'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().min(7, 'Enter a valid phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['customer', 'seller']),
});

function strengthOf(pw = '') {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s; // 0–4
}
const STRENGTH = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];

export default function Signup() {
  const { signup } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: 'customer' },
  });

  const role = watch('role');
  const pw = watch('password') || '';
  const strength = strengthOf(pw);

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      const user = await signup(values);
      toast.success(`Welcome to DreamEvents, ${user.name}!`);
      navigate(user.role === 'seller' ? '/seller/onboarding' : '/customer');
    } catch (e) {
      toast.error(apiErrorMessage(e, 'Sign up failed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      mode="signup"
      title="Create your account"
      subtitle="Join DreamEvents — free for couples"
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:underline dark:text-primary-400">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Full name" placeholder="Ayesha Khan" autoComplete="name" error={errors.name?.message} {...register('name')} />
        <Input label="Email" type="email" placeholder="you@example.com" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <Input label="Phone (WhatsApp)" type="tel" placeholder="+92 300 0000000" autoComplete="tel" error={errors.phone?.message} {...register('phone')} />

        <div>
          <span className="mb-1.5 block text-body-sm font-medium text-text-secondary">I am a…</span>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'customer', label: 'Couple / planner', Icon: PartyPopper },
              { value: 'seller', label: 'Wedding vendor', Icon: Store },
            ].map((r) => {
              const active = role === r.value;
              return (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setValue('role', r.value)}
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-body-sm font-medium transition-colors',
                    active
                      ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-400'
                      : 'border-border-default text-text-secondary hover:border-primary-300'
                  )}
                >
                  <r.Icon className="h-4 w-4" />
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <span className="mb-1.5 block text-body-sm font-medium text-text-secondary">Password</span>
          <div className="relative">
            <Input
              type={showPw ? 'text' : 'password'}
              placeholder="At least 6 characters"
              autoComplete="new-password"
              error={errors.password?.message}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary transition-colors hover:text-text-primary"
              aria-label="Toggle password visibility"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {pw.length > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-sunken">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    strength <= 1 ? 'w-1/4 bg-error' : strength === 2 ? 'w-2/4 bg-amber-500' : strength === 3 ? 'w-3/4 bg-primary-500' : 'w-full bg-emerald-500'
                  )}
                />
              </div>
              <span className="text-micro text-text-tertiary">{STRENGTH[strength]}</span>
            </div>
          )}
        </div>

        {role === 'seller' && (
          <p className="rounded-lg bg-accent-50 px-3 py-2.5 text-micro text-accent-700 dark:bg-accent-900/40 dark:text-accent-400">
            Vendor accounts are reviewed by our team before they go live — set up your storefront right after signing up.
          </p>
        )}

        <Button type="submit" loading={submitting} variant="sheen" className="w-full" size="lg">
          <Check className="h-4 w-4" /> Create account
        </Button>
      </form>
    </AuthShell>
  );
}
