import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api, apiErrorMessage, unwrap } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Stepper } from '../../components/effects/Stepper.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input, Select, Textarea } from '../../components/ui/Field.jsx';
import { ImageInput } from '../../components/ui/ImageInput.jsx';
import { Card, CardBody } from '../../components/ui/Card.jsx';
import { Skeleton } from '../../components/ui/Feedback.jsx';

const basicsSchema = z.object({
  businessName: z.string().min(2, 'Business name is required'),
  category: z.string().min(1, 'Pick a category'),
  subcategories: z.string().optional(),
  city: z.string().min(1, 'Pick a city'),
  area: z.string().min(1, 'Area is required'),
  address: z.string().min(5, 'Address is required'),
  contactPhone: z.string().min(7, 'Phone is required'),
  contactEmail: z.string().email().optional().or(z.literal('')),
  whatsappNumber: z.string().optional(),
  startingPrice: z.coerce.number().min(0),
  description: z.string().optional(),
  coverImage: z.string().optional(),
  logo: z.string().optional(),
});

const quickItemSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  price: z.coerce.number().min(0),
});

export default function SellerOnboarding() {
  const toast = useToast();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [galleryUrl, setGalleryUrl] = useState('');
  const [menuCategory, setMenuCategory] = useState('');
  const [menuItems, setMenuItems] = useState([{ name: '', unitPrice: '', minQuantity: '1' }]);

  const { data: categories } = useQuery({
  queryKey: ['categories'],
  queryFn: async () => unwrap(await api.get('/search/categories')),
  });
  const { data: cities } = useQuery({
  queryKey: ['cities'],
  queryFn: async () => unwrap(await api.get('/search/cities')),
  });
  const { data: me } = useQuery({
  queryKey: ['seller-me'],
  queryFn: async () => unwrap(await api.get('/sellers/dashboard')).catch(() => null),
  });
  const profile = me?.profile || null;
  const [coverImage, setCoverImage] = useState(profile?.coverImage || '');
  const [logo, setLogo] = useState(profile?.logo || '');

  const {
  register,
  handleSubmit,
  formState: { errors },
  } = useForm({
  resolver: zodResolver(basicsSchema),
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
  coverImage: profile.coverImage || '',
  logo: profile.logo || '',
  }
  : { category: '', city: 'Sukkur', startingPrice: 0 },
  });

  const advanceMutation = useMutation({
  mutationFn: async (s) => unwrap(await api.post('/sellers/onboarding/step', { step: s })),
  onSuccess: (r) => {
  if (r.onboardingCompleted) {
  toast.success('Onboarding complete! Your storefront is now under review.');
  qc.invalidateQueries({ queryKey: ['seller-me'] });
  navigate('/seller');
  }
  },
  onError: (e) => toast.error(apiErrorMessage(e)),
  });

  const saveBasics = async (values) => {
  const payload = {
  ...values,
  subcategories: values.subcategories
  ? values.subcategories.split(',').map((s) => s.trim()).filter(Boolean)
  : [],
  contactEmail: values.contactEmail || undefined,
  description: values.description || undefined,
  coverImage: coverImage || undefined,
  logo: logo || undefined,
  };
  try {
  if (profile) {
  await api.put(`/sellers/${profile._id}`, payload);
  } else {
  await api.post('/sellers', payload);
  }
  toast.success('Business details saved');
  qc.invalidateQueries({ queryKey: ['seller-me'] });
  await advanceMutation.mutateAsync(2);
  setStep(1);
  } catch (e) {
  toast.error(apiErrorMessage(e));
  }
  };

  const quickMutation = useMutation({
  mutationFn: async ({ kind, payload }) => {
  const url =
  kind === 'service'
  ? '/services/services'
  : kind === 'package'
  ? '/services/packages'
  : null;
  if (!url) return null;
  return unwrap(await api.post(url, payload));
  },
  onError: (e) => toast.error(apiErrorMessage(e)),
  });

  const skipTo = async (s) => {
  try {
  await advanceMutation.mutateAsync(s);
  setStep(s - 1);
  } catch {
  /* already advanced */
  }
  };

  const addService = async (values, nextStep) => {
  await quickMutation.mutateAsync({
  kind: 'service',
  payload: { ...values, priceType: 'fixed', category: profile?.category || 'General' },
  });
  toast.success('Service added');
  await skipTo(nextStep);
  };

  const addPackage = async (values, nextStep) => {
  await quickMutation.mutateAsync({
  kind: 'package',
  payload: { ...values, inclusions: [], servicesIncluded: [] },
  });
  toast.success('Package added');
  await skipTo(nextStep);
  };

  const addGallery = async (nextStep) => {
  if (!galleryUrl) return skipTo(nextStep);
  await api.post('/services/gallery-images', { url: galleryUrl, thumbnailUrl: galleryUrl, category: 'other' });
  toast.success('Photo added to gallery');
  await skipTo(nextStep);
  };

  const addMenu = async (nextStep) => {
  if (menuCategory.trim()) {
  const mc = unwrap(await api.post('/services/menu-categories', { name: menuCategory.trim() }));
  for (const item of menuItems) {
  if (!item.name.trim()) continue;
  await api.post('/services/menu-items', {
  menuCategoryId: mc._id,
  name: item.name.trim(),
  unitPrice: Number(item.unitPrice),
  minQuantity: Number(item.minQuantity) || 1,
  });
  }
  toast.success('Menu saved');
  }
  await skipTo(nextStep);
  };

  const finish = async () => {
  await advanceMutation.mutateAsync(6);
  };

  const steps = [
  {
  title: 'Business',
  content: (
  <form onSubmit={handleSubmit(saveBasics)} className="space-y-4">
  <div className="grid gap-4 sm:grid-cols-2">
  <Input label="Business name" placeholder="e.g. Royal Flavours Catering" error={errors.businessName?.message} {...register('businessName')} />
  <Select label="Category" error={errors.category?.message} {...register('category')}>
  <option value="">Select…</option>
  {(categories || []).map((c) => (
  <option key={c._id} value={c.name}>{c.name}</option>
  ))}
  </Select>
  <Input label="Specialties (comma separated)" placeholder="Bridal makeup, Family events" error={errors.subcategories?.message} {...register('subcategories')} />
  <Select label="City" error={errors.city?.message} {...register('city')}>
  {(cities || []).map((c) => (
  <option key={c._id} value={c.name}>{c.name}</option>
  ))}
  </Select>
  <Input label="Area / neighbourhood" placeholder="e.g. Clifton" error={errors.area?.message} {...register('area')} />
  <Input label="Address" placeholder="Street, building…" error={errors.address?.message} {...register('address')} />
  <Input label="Contact phone" type="tel" placeholder="+92 300 0000000" error={errors.contactPhone?.message} {...register('contactPhone')} />
  <Input label="Contact email (optional)" type="email" placeholder="business@email.com" error={errors.contactEmail?.message} {...register('contactEmail')} />
  <Input label="WhatsApp number (optional)" type="tel" placeholder="+92 300 0000000" error={errors.whatsappNumber?.message} {...register('whatsappNumber')} />
  <Input label="Starting price (PKR)" type="number" min="0" error={errors.startingPrice?.message} {...register('startingPrice')} />
  </div>
  <Textarea label="About your business" placeholder="Tell couples what makes you special…" error={errors.description?.message} {...register('description')} />
  <div className="grid gap-4 sm:grid-cols-2">
  <ImageInput label="Cover image" value={coverImage} onChange={setCoverImage} />
  <ImageInput label="Logo" value={logo} onChange={setLogo} />
  </div>
  <div className="flex justify-end">
  <Button type="submit" loading={advanceMutation.isPending}>Save & continue</Button>
  </div>
  </form>
  ),
  },
  {
  title: 'Services',
  content: (
  <QuickAddForm
  fields={[
  ['name', 'Service name', 'e.g. Full buffet service'],
  ['price', 'Price (PKR)', 'e.g. 1200'],
  ]}
  onSubmit={(v) => addService(v, 3)}
  loading={quickMutation.isPending}
  />
  ),
  },
  {
  title: 'Packages',
  content: (
  <QuickAddForm
  fields={[
  ['name', 'Package name', 'e.g. Royal Wedding Package'],
  ['price', 'Price (PKR)', 'e.g. 350000'],
  ]}
  onSubmit={(v) => addPackage(v, 4)}
  loading={quickMutation.isPending}
  />
  ),
  },
  {
  title: 'Gallery',
  content: (
  <div className="space-y-4">
  <ImageInput label="Add a showcase photo" value={galleryUrl} onChange={setGalleryUrl} />
  <div className="flex justify-end">
  <Button onClick={() => addGallery(5)} loading={quickMutation.isPending}>Add photo & continue</Button>
  </div>
  </div>
  ),
  },
  {
  title: 'Menu',
  content: (
  <div className="space-y-4">
  <Input label="Menu category (e.g. BBQ, Desi, Chinese)" value={menuCategory} onChange={(e) => setMenuCategory(e.target.value)} placeholder="e.g. BBQ" />
  <div className="space-y-2">
  {menuItems.map((item, i) => (
  <div key={i} className="grid grid-cols-12 gap-2">
  <input
  value={item.name}
  onChange={(e) => setMenuItems((items) => items.map((it, j) => (j === i ? { ...it, name: e.target.value } : it)))}
  placeholder="Item name"
  className="col-span-5 h-10 rounded-lg border border-border-default bg-surface-sunken px-3 text-sm focus:border-primary-500 focus:outline-none"
  />
  <input
  value={item.unitPrice}
  onChange={(e) => setMenuItems((items) => items.map((it, j) => (j === i ? { ...it, unitPrice: e.target.value } : it)))}
  placeholder="Unit price"
  type="number"
  min="0"
  className="col-span-3 h-10 rounded-lg border border-border-default bg-surface-sunken px-3 text-sm focus:border-primary-500 focus:outline-none"
  />
  <input
  value={item.minQuantity}
  onChange={(e) => setMenuItems((items) => items.map((it, j) => (j === i ? { ...it, minQuantity: e.target.value } : it)))}
  placeholder="Min qty"
  type="number"
  min="1"
  className="col-span-3 h-10 rounded-lg border border-border-default bg-surface-sunken px-3 text-sm focus:border-primary-500 focus:outline-none"
  />
  <button
  type="button"
  onClick={() => setMenuItems((items) => items.filter((_, j) => j !== i))}
  className="col-span-1 text-error hover:opacity-70"
  aria-label="Remove item"
  >
  ×
  </button>
  </div>
  ))}
  </div>
  <Button
  variant="outline"
  onClick={() => setMenuItems((items) => [...items, { name: '', unitPrice: '', minQuantity: '1' }])}
  >
  + Add item
  </Button>
  <div className="flex justify-end">
  <Button onClick={() => addMenu(6)} loading={quickMutation.isPending}>Save menu & continue</Button>
  </div>
  </div>
  ),
  },
  {
  title: 'Publish',
  content: (
  <Card>
  <CardBody className="text-center">
  <h3 className="font-fraunces text-h2 text-text-primary">Ready for review!</h3>
  <p className="mx-auto mt-3 max-w-md text-body-sm text-text-secondary">
  Your storefront looks great. Once you finish, DreamEvents admins will review it — usually
  within 24 hours. You'll be notified the moment you're live.
  </p>
  <div className="mt-6 flex justify-center gap-3">
  <Link to="/seller/settings"><Button variant="outline">Review profile</Button></Link>
  </div>
  </CardBody>
  </Card>
  ),
  },
  ];

  return (
  <div className="mx-auto max-w-3xl space-y-6">
  <div>
  <h2 className="font-fraunces text-h2 text-text-primary">Set up your storefront</h2>
  <p className="text-body-sm text-text-tertiary">
  Six quick steps and you're ready for couples to find you. You can always edit later.
  </p>
  </div>
  <Card>
  <CardBody>
  <Stepper
  steps={steps}
  initialStep={step}
  onStepChange={setStep}
  onComplete={finish}
  nextButtonText="Next"
  completeButtonText="Finish & submit"
  />
  </CardBody>
  </Card>
  </div>
  );
}

function QuickAddForm({ fields, onSubmit, loading }) {
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(quickItemSchema) });
  return (
  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
  <div className="grid gap-4 sm:grid-cols-2">
  {fields.map(([name, label, ph]) => (
  <Input key={name} label={label} placeholder={ph} error={errors[name]?.message} {...register(name)} />
  ))}
  </div>
  <p className="text-micro text-text-tertiary">You can manage everything in detail from your dashboard tabs later.</p>
  <div className="flex justify-end">
  <Button type="submit" loading={loading}>Add & continue</Button>
  </div>
  </form>
  );
}