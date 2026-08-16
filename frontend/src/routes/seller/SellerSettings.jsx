import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Bell, Building2, Save } from 'lucide-react';
import { api, apiErrorMessage, unwrap } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Card, CardBody, CardHeader } from '../../components/ui/Card.jsx';
import { Skeleton } from '../../components/ui/Feedback.jsx';
import { Input, Select, Textarea } from '../../components/ui/Field.jsx';
import { ImageInput } from '../../components/ui/ImageInput.jsx';

const profileEditSchema = z.object({
  businessName: z.string().min(2, 'Business name is required'),
  category: z.string().min(1),
  subcategories: z.string().optional(),
  city: z.string().min(1),
  area: z.string().min(1),
  address: z.string().min(5),
  contactPhone: z.string().min(7),
  contactEmail: z.string().email().optional().or(z.literal('')),
  whatsappNumber: z.string().optional(),
  startingPrice: z.coerce.number().min(0),
  description: z.string().optional(),
  cancellationPolicy: z.string().optional(),
  advancePaymentPolicy: z.string().optional(),
  extraChargesPolicy: z.string().optional(),
});

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function SellerSettings() {
  const toast = useToast();
  const qc = useQueryClient();
  const [avatar, setAvatar] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [hours, setHours] = useState([]);

  const { data: me } = useQuery({
  queryKey: ['seller-me'],
  queryFn: async () => unwrap(await api.get('/sellers/dashboard')),
  });
  const { data: user } = useQuery({
  queryKey: ['me'],
  queryFn: async () => unwrap(await api.get('/users/me')),
  });
  const { data: categories } = useQuery({
  queryKey: ['categories'],
  queryFn: async () => unwrap(await api.get('/search/categories')),
  });
  const { data: cities } = useQuery({
  queryKey: ['cities'],
  queryFn: async () => unwrap(await api.get('/search/cities')),
  });

  const profile = me?.profile;
  const initialHours =
  profile?.businessHours?.length === DAYS.length
  ? profile.businessHours
  : DAYS.map((day, i) => ({ day, open: i < 6 ? '09:00' : '11:00', close: i < 6 ? '22:00' : '20:00', isOpen: i < 6 }));

  const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(profileEditSchema),
  defaultValues: profile
  ? {
  businessName: profile.businessName,
  category: profile.category,
  subcategories: profile.subcategories?.join(', ') || '',
  city: profile.city,
  area: profile.area,
  address: profile.address,
  contactPhone: profile.contactPhone,
  contactEmail: profile.contactEmail || '',
  whatsappNumber: profile.whatsappNumber || '',
  startingPrice: profile.startingPrice,
  description: profile.description || '',
  cancellationPolicy: profile.policies?.cancellation || '',
  advancePaymentPolicy: profile.policies?.advancePayment || '',
  extraChargesPolicy: profile.policies?.extraCharges || '',
  }
  : { category: '', city: 'Sukkur', startingPrice: 0 },
  });

  const saveProfile = useMutation({
  mutationFn: async (values) =>
  unwrap(
  await api.put(`/sellers/${profile._id}`, {
  businessName: values.businessName,
  category: values.category,
  subcategories: values.subcategories ? values.subcategories.split(',').map((s) => s.trim()).filter(Boolean) : [],
  city: values.city,
  area: values.area,
  address: values.address,
  contactPhone: values.contactPhone,
  contactEmail: values.contactEmail || undefined,
  whatsappNumber: values.whatsappNumber || undefined,
  startingPrice: values.startingPrice,
  description: values.description || undefined,
  coverImage: coverImage || profile.coverImage || undefined,
  logo: profile.logo || undefined,
  businessHours: hours,
  policies: {
  cancellation: values.cancellationPolicy || undefined,
  advancePayment: values.advancePaymentPolicy || undefined,
  extraCharges: values.extraChargesPolicy || undefined,
  },
  })
  ),
  onSuccess: () => {
  toast.success('Profile saved — resubmitted for review');
  qc.invalidateQueries({ queryKey: ['seller-me'] });
  },
  onError: (e) => toast.error(apiErrorMessage(e)),
  });

  const saveUser = useMutation({
  mutationFn: async () =>
  unwrap(
  await api.put('/users/me', {
  name: user?.name,
  phone: user?.phone || undefined,
  city: user?.city,
  avatar: avatar || undefined,
  notificationPreferences: user?.notificationPreferences,
  })
  ),
  onSuccess: () => {
  toast.success('Account updated');
  qc.invalidateQueries({ queryKey: ['me'] });
  },
  onError: (e) => toast.error(apiErrorMessage(e)),
  });

  if (!profile) {
  return (
  <div className="space-y-4">
  <Skeleton className="h-64" />
  </div>
  );
  }

  const setHour = (day, patch) => {
  setHours((h) => (h.length === 0 ? initialHours : h).map((x) => (x.day === day ? { ...x, ...patch } : x)));
  };

  return (
  <div className="max-w-3xl space-y-6">
  <div>
  <h2 className="font-fraunces text-h2 text-text-primary">Settings</h2>
  <p className="text-body-sm text-text-tertiary">
  {profile.status === 'rejected'
  ? 'Fix the issues below — saving resubmits your storefront for review.'
  : 'Keep your storefront info fresh. Changes trigger a re-review if you were approved.'}
  </p>
  </div>

  {/* Account */}
  <Card>
  <CardHeader icon={Bell} title="Account" />
  <CardBody>
  <div className="flex items-center gap-4">
  <img
  src={avatar || user?.avatar || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user?.name || 'S')}`}
  alt="avatar"
  className="h-14 w-14 rounded-full border border-border-subtle object-cover"
  />
  <div className="flex-1">
  <p className="font-geist text-body-lg font-semibold text-text-primary">{user?.name}</p>
  <p className="text-body-sm text-text-tertiary">{user?.email}</p>
  <ImageInput label="Change avatar" value={avatar} onChange={setAvatar} />
  </div>
  </div>
  {avatar && (
  <div className="mt-3 flex justify-end">
  <Button size="sm" loading={saveUser.isPending} onClick={() => saveUser.mutate()}>
  <Save className="h-4 w-4" /> Save avatar
  </Button>
  </div>
  )}
  </CardBody>
  </Card>

  {/* Business info */}
  <Card>
  <CardHeader icon={Building2} title="Business information" />
  <CardBody>
  <form onSubmit={handleSubmit((v) => saveProfile.mutate(v))} className="space-y-4">
  <div className="grid gap-4 sm:grid-cols-2">
  <Input label="Business name" error={errors.businessName?.message} {...register('businessName')} />
  <Select label="Category" error={errors.category?.message} {...register('category')}>
  <option value="">Select…</option>
  {(categories || []).map((c) => (
  <option key={c._id} value={c.name}>{c.name}</option>
  ))}
  </Select>
  <Input label="Specialties (comma separated)" error={errors.subcategories?.message} {...register('subcategories')} />
  <Select label="City" error={errors.city?.message} {...register('city')}>
  {(cities || []).map((c) => (
  <option key={c._id} value={c.name}>{c.name}</option>
  ))}
  </Select>
  <Input label="Area" error={errors.area?.message} {...register('area')} />
  <Input label="Address" error={errors.address?.message} {...register('address')} />
  <Input label="Contact phone" type="tel" error={errors.contactPhone?.message} {...register('contactPhone')} />
  <Input label="Contact email (optional)" type="email" error={errors.contactEmail?.message} {...register('contactEmail')} />
  <Input label="WhatsApp (optional)" type="tel" error={errors.whatsappNumber?.message} {...register('whatsappNumber')} />
  <Input label="Starting price (PKR)" type="number" min="0" error={errors.startingPrice?.message} {...register('startingPrice')} />
  </div>
  <Textarea label="About" rows={4} error={errors.description?.message} {...register('description')} />
  <ImageInput label="Cover image" value={coverImage || profile.coverImage || ''} onChange={setCoverImage} />

  <div>
  <p className="text-micro font-medium text-text-secondary">Business hours</p>
  <div className="mt-2 space-y-2">
  {(hours.length === 0 ? initialHours : hours).map((h) => (
  <div key={h.day} className="grid grid-cols-12 items-center gap-2">
  <span className="col-span-4 text-body-sm capitalize text-text-primary">{h.day}</span>
  <input
  type="time"
  value={h.open}
  onChange={(e) => setHour(h.day, { open: e.target.value })}
  disabled={!h.isOpen}
  className="col-span-3 h-9 rounded-lg border border-border-default bg-surface-sunken px-2 text-sm disabled:opacity-40"
  />
  <input
  type="time"
  value={h.close}
  onChange={(e) => setHour(h.day, { close: e.target.value })}
  disabled={!h.isOpen}
  className="col-span-3 h-9 rounded-lg border border-border-default bg-surface-sunken px-2 text-sm disabled:opacity-40"
  />
  <label className="col-span-2 flex items-center gap-1.5 text-micro text-text-secondary">
  <input
  type="checkbox"
  checked={h.isOpen}
  onChange={(e) => setHour(h.day, { isOpen: e.target.checked })}
  className="h-4 w-4 accent-primary-600"
  />
  Open
  </label>
  </div>
  ))}
  </div>
  </div>

  <div className="grid gap-4">
  <Textarea label="Cancellation policy" rows={2} error={errors.cancellationPolicy?.message} {...register('cancellationPolicy')} />
  <Textarea label="Advance payment policy" rows={2} error={errors.advancePaymentPolicy?.message} {...register('advancePaymentPolicy')} />
  <Textarea label="Extra charges policy" rows={2} error={errors.extraChargesPolicy?.message} {...register('extraChargesPolicy')} />
  </div>

  <div className="flex justify-end">
  <Button type="submit" loading={saveProfile.isPending}>
  <Save className="h-4 w-4" /> Save & resubmit
  </Button>
  </div>
  </form>
  </CardBody>
  </Card>
  </div>
  );
}