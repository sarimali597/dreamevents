import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, Plus, Trash2, UtensilsCrossed } from 'lucide-react';
import { api, apiErrorMessage, unwrap } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Card, CardBody } from '../../components/ui/Card.jsx';
import { EmptyState, Skeleton } from '../../components/ui/Feedback.jsx';
import { Input } from '../../components/ui/Field.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { formatPrice } from '../../lib/utils.js';

export default function SellerMenu() {
  const toast = useToast();
  const qc = useQueryClient();
  const [addingCategory, setAddingCategory] = useState(false);
  const [addingItemTo, setAddingItemTo] = useState(null);
  const [openCat, setOpenCat] = useState(null);

  const { data: me } = useQuery({
  queryKey: ['seller-me'],
  queryFn: async () => unwrap(await api.get('/sellers/dashboard')),
  });
  const sellerId = me?.profile?._id;

  const { data, isLoading } = useQuery({
  queryKey: ['menu', sellerId],
  queryFn: async () => unwrap(await api.get(`/sellers/${sellerId}/menu`)),
  enabled: !!sellerId,
  });
  const menu = data?.menu || data?.data || [];
  const categories = Array.isArray(menu) ? menu : [];

  const removeCat = useMutation({
  mutationFn: async (id) => unwrap(await api.delete(`/services/menu-categories/${id}`)),
  onSuccess: () => {
  toast.success('Category deleted');
  qc.invalidateQueries({ queryKey: ['menu'] });
  },
  onError: (e) => toast.error(apiErrorMessage(e)),
  });

  const removeItem = useMutation({
  mutationFn: async (id) => unwrap(await api.delete(`/services/menu-items/${id}`)),
  onSuccess: () => {
  toast.success('Item deleted');
  qc.invalidateQueries({ queryKey: ['menu'] });
  },
  onError: (e) => toast.error(apiErrorMessage(e)),
  });

  return (
  <div className="space-y-6">
  <div className="flex flex-wrap items-center justify-between gap-3">
  <div>
  <h2 className="font-fraunces text-h2 text-text-primary">Menu</h2>
  <p className="text-body-sm text-text-tertiary">Per-plate pricing your customers can browse.</p>
  </div>
  <Button variant="gold" onClick={() => setAddingCategory(true)}><Plus className="h-4 w-4" /> New category</Button>
  </div>

  {isLoading ? (
  <div className="space-y-3">
  <Skeleton className="h-24" />
  <Skeleton className="h-24" />
  </div>
  ) : categories.length === 0 ? (
  <EmptyState icon={UtensilsCrossed} title="No menu yet" description="Start with a category like BBQ or Desi food." />
  ) : (
  <div className="space-y-3">
  {categories.map((cat) => (
  <Card key={cat._id}>
  <CardBody>
  <div className="flex items-center justify-between">
  <button
  type="button"
  className="flex items-center gap-2 font-geist text-body-lg font-semibold text-text-primary"
  onClick={() => setOpenCat(openCat === cat._id ? null : cat._id)}
  >
  <ChevronDown className={`h-4 w-4 text-text-tertiary transition-transform ${openCat === cat._id ? 'rotate-180' : ''}`} />
  {cat.name}
  <span className="text-micro font-normal text-text-tertiary">{cat.items?.length || 0} items</span>
  </button>
  <div className="flex items-center gap-1">
  <Button variant="ghost" size="sm" onClick={() => setAddingItemTo(cat._id)}><Plus className="h-4 w-4" /></Button>
  <Button variant="ghost" size="sm" className="text-error" loading={removeCat.isPending} onClick={() => removeCat.mutate(cat._id)}>
  <Trash2 className="h-4 w-4" />
  </Button>
  </div>
  </div>

  {openCat === cat._id && (
  <div className="mt-3 divide-y divide-border-subtle border-t border-border-subtle">
  {cat.items?.length === 0 && (
  <p className="py-3 text-body-sm text-text-tertiary">No items yet — add your first dish.</p>
  )}
  {(cat.items || []).map((item) => (
  <div key={item._id} className="flex items-center justify-between gap-3 py-3">
  <div className="flex items-center gap-3">
  {item.image && <img src={item.image} alt={item.name} className="h-10 w-10 rounded-lg object-cover" />}
  <div>
  <p className="text-body-sm font-medium text-text-primary">{item.name}</p>
  <p className="text-micro text-text-tertiary">{item.description}{item.minQuantity > 1 ? ` · min ${item.minQuantity}` : ''}</p>
  </div>
  </div>
  <div className="flex items-center gap-2">
  <p className="font-geist text-body-sm font-semibold text-primary-600 dark:text-primary-400">{formatPrice(item.unitPrice)}</p>
  <Button variant="ghost" size="sm" className="text-error" loading={removeItem.isPending} onClick={() => removeItem.mutate(item._id)}>
  <Trash2 className="h-4 w-4" />
  </Button>
  </div>
  </div>
  ))}
  </div>
  )}
  </CardBody>
  </Card>
  ))}
  </div>
  )}

  {addingCategory && (
  <CategoryModal onClose={() => setAddingCategory(false)} />
  )}
  {addingItemTo && (
  <ItemModal categoryId={addingItemTo} onClose={() => setAddingItemTo(null)} />
  )}
  </div>
  );
}

function CategoryModal({ onClose }) {
  const toast = useToast();
  const qc = useQueryClient();
  const [name, setName] = useState('');

  const save = useMutation({
  mutationFn: async () => unwrap(await api.post('/services/menu-categories', { name })),
  onSuccess: () => {
  toast.success('Category added');
  onClose();
  qc.invalidateQueries({ queryKey: ['menu'] });
  },
  onError: (e) => toast.error(apiErrorMessage(e)),
  });

  return (
  <Modal open onClose={onClose} title="New menu category">
  <div className="space-y-4">
  <Input label="Category name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. BBQ" autoFocus />
  <div className="flex justify-end gap-2">
  <Button variant="ghost" onClick={onClose}>Cancel</Button>
  <Button loading={save.isPending} disabled={name.trim().length < 2} onClick={() => save.mutate()}>Add category</Button>
  </div>
  </div>
  </Modal>
  );
}

function ItemModal({ categoryId, onClose }) {
  const toast = useToast();
  const qc = useQueryClient();
  const [item, setItem] = useState({ name: '', description: '', unitPrice: '', minQuantity: '1' });

  const save = useMutation({
  mutationFn: async () =>
  unwrap(await api.post('/services/menu-items', {
  menuCategoryId: categoryId,
  name: item.name,
  description: item.description || undefined,
  unitPrice: Number(item.unitPrice),
  minQuantity: Number(item.minQuantity) || 1,
  })),
  onSuccess: () => {
  toast.success('Item added');
  onClose();
  qc.invalidateQueries({ queryKey: ['menu'] });
  },
  onError: (e) => toast.error(apiErrorMessage(e)),
  });

  return (
  <Modal open onClose={onClose} title="Add menu item">
  <div className="space-y-4">
  <Input label="Item name" value={item.name} onChange={(e) => setItem({ ...item, name: e.target.value })} placeholder="e.g. Chicken Karahi" autoFocus />
  <Input label="Description (optional)" value={item.description} onChange={(e) => setItem({ ...item, description: e.target.value })} placeholder="e.g. Served with naan" />
  <div className="grid grid-cols-2 gap-3">
  <Input label="Unit price (PKR)" type="number" min="0" value={item.unitPrice} onChange={(e) => setItem({ ...item, unitPrice: e.target.value })} placeholder="e.g. 1200" />
  <Input label="Minimum quantity" type="number" min="1" value={item.minQuantity} onChange={(e) => setItem({ ...item, minQuantity: e.target.value })} />
  </div>
  <div className="flex justify-end gap-2">
  <Button variant="ghost" onClick={onClose}>Cancel</Button>
  <Button loading={save.isPending} disabled={!item.name.trim() || item.unitPrice === ''} onClick={() => save.mutate()}>Add item</Button>
  </div>
  </div>
  </Modal>
  );
}