import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api, apiErrorMessage, unwrap } from '../../lib/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { Card, CardBody } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Field.jsx';
import { Skeleton } from '../../components/ui/Feedback.jsx';
import { initials } from '../../lib/utils.js';

const schema = z.object({
  name: z.string().min(2, 'Enter your full name'),
  phone: z.string().min(7, 'Enter a valid phone number'),
});

export default function CustomerProfile() {
  const { user, refresh } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();

  const { data: profile, isLoading } = useQuery({
  queryKey: ['me'],
  queryFn: async () => unwrap(await api.get('/users/me')),
  });

  const {
  register,
  handleSubmit,
  formState: { errors },
  } = useForm({
  resolver: zodResolver(schema),
  defaultValues: async () => {
  const p = await unwrap(await api.get('/users/me'));
  return { name: p.name, phone: p.phone || '' };
  },
  });

  const mutation = useMutation({
  mutationFn: async (values) => unwrap(await api.put('/users/me', values)),
  onSuccess: () => {
  toast.success('Profile updated');
  refresh();
  qc.invalidateQueries({ queryKey: ['me'] });
  },
  onError: (e) => toast.error(apiErrorMessage(e)),
  });

  if (isLoading) {
  return <Skeleton className="h-72" />;
  }

  const p = profile || user || {};

  return (
  <div className="mx-auto max-w-2xl space-y-6">
  <div>
  <h2 className="font-fraunces text-h2 text-text-primary">My profile</h2>
  <p className="text-body-sm text-text-tertiary">Your account details</p>
  </div>

  <Card>
  <CardBody>
  <div className="mb-6 flex items-center gap-4">
  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-primary-800 text-lg font-bold text-white dark:from-primary-500 dark:to-primary-700">
  {initials(p.name || p.email)}
  </span>
  <div>
  <p className="font-geist text-h4 font-semibold text-text-primary">{p.name}</p>
  <p className="text-micro text-text-tertiary">{p.email}</p>
  <span className="mt-1 inline-block rounded-full bg-primary-100 px-2.5 py-0.5 text-micro font-medium capitalize text-primary-700 dark:bg-primary-900 dark:text-primary-400">
  {p.role}
  </span>
  </div>
  </div>

  <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
  <Input label="Full name" error={errors.name?.message} {...register('name')} />
  <Input label="Email" value={p.email || ''} disabled hint="Email cannot be changed" />
  <Input label="Phone (WhatsApp)" type="tel" error={errors.phone?.message} {...register('phone')} />
  <div className="flex justify-end">
  <Button type="submit" loading={mutation.isPending}>Save changes</Button>
  </div>
  </form>
  </CardBody>
  </Card>
  </div>
  );
}