import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { apiErrorMessage } from '../../lib/api.js';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Field.jsx';
import { AuthShell } from '../../components/layout/AuthShell.jsx';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      const user = await login(values.email, values.password);
      toast.success(`Welcome back, ${user.name || user.email}!`);
      const redirect = params.get('redirect');
      const home = user.role === 'admin' ? '/admin' : user.role === 'seller' ? '/seller' : '/customer';
      navigate(redirect && redirect.startsWith('/') ? redirect : home);
    } catch (e) {
      toast.error(apiErrorMessage(e, 'Login failed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      mode="login"
      title="Welcome back"
      subtitle="Sign in to continue planning your celebration"
      footer={
        <>
          New to DreamEvents?{' '}
          <Link to="/signup" className="font-medium text-primary-600 hover:underline dark:text-primary-400">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Email" type="email" placeholder="you@example.com" autoComplete="email" error={errors.email?.message} {...register('email')} />

        <div>
          <div className="flex items-center justify-between">
            <span className="mb-1.5 block text-body-sm font-medium text-text-secondary">Password</span>
            <Link to="/support" className="mb-1.5 text-micro font-medium text-primary-600 hover:underline dark:text-primary-400">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              type={showPw ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
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
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-body-sm text-text-secondary">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 rounded border-border-default text-primary-600 focus:ring-primary-500"
          />
          Keep me signed in
        </label>

        <Button type="submit" loading={submitting} variant="sheen" className="w-full" size="lg">
          <Sparkles className="h-4 w-4" /> Sign in
        </Button>
      </form>
    </AuthShell>
  );
}
