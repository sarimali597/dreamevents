import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search as SearchIcon, SlidersHorizontal } from 'lucide-react';
import { api, unwrap } from '../../lib/api.js';
import { SellerCard } from '../../components/ui/SellerCard.jsx';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { EmptyState, Skeleton } from '../../components/ui/Feedback.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input, Select } from '../../components/ui/Field.jsx';
import { cn } from '../../lib/utils.js';

const SORTS = [
  { value: '', label: 'Recommended' },
  { value: 'rating', label: 'Highest rated' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'newest', label: 'Newest first' },
];

export default function Search() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const category = params.get('category') || '';
  const city = params.get('city') || '';
  const sort = params.get('sort') || '';
  const rating = params.get('rating') || '';
  const maxPrice = params.get('maxPrice') || '';
  const page = Number(params.get('page')) || 1;

  const [qInput, setQInput] = useState(q);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => setQInput(q), [q]);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => unwrap(await api.get('/search/categories')),
  });
  const { data: cities } = useQuery({
    queryKey: ['cities'],
    queryFn: async () => unwrap(await api.get('/search/cities')),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['search', { q, category, city, sort, rating, maxPrice, page }],
    queryFn: async () =>
      unwrap(
        await api.get('/search', {
          params: { q, category, city, sort, rating, maxPrice, page, limit: 12 },
        })
      ),
  });

  const update = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => {
      if (v) next.set(k, v);
      else next.delete(k);
    });
    next.delete('page');
    setParams(next, { replace: false });
  };

  const submit = (e) => {
    e.preventDefault();
    update({ q: qInput.trim() });
  };

  const sellers = data?.sellers || [];
  const pages = data?.pages || 1;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-fraunces text-h1 text-text-primary">Find your vendor</h1>
          <p className="mt-1 text-body-sm text-text-secondary">
            {data?.total ?? 0} approved vendors{category ? ` in ${category}` : ''}
            {city ? ` in ${city}` : ''}
          </p>
        </div>
        <Button variant="outline" onClick={() => setShowFilters((v) => !v)}>
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Search + filters */}
      <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
          <input
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            placeholder="Search by business, category, city…"
            className="h-12 w-full rounded-xl border border-border-default bg-surface-raised pl-10 pr-24 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 h-9 -translate-y-1/2 rounded-lg bg-primary-600 px-4 text-body-sm font-medium text-white transition-colors hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
          >
            Search
          </button>
        </div>

        <div className={cn('grid gap-3 sm:grid-cols-2 lg:grid-cols-4', !showFilters && 'hidden')}>
          <Select label="Category" value={category} onChange={(e) => update({ category: e.target.value })}>
            <option value="">All categories</option>
            {(categories || []).map((c) => (
              <option key={c._id} value={c.name}>{c.name}</option>
            ))}
          </Select>
          <Select label="City" value={city} onChange={(e) => update({ city: e.target.value })}>
            <option value="">All cities</option>
            {(cities || []).map((c) => (
              <option key={c._id} value={c.name}>{c.name}</option>
            ))}
          </Select>
          <Select label="Minimum rating" value={rating} onChange={(e) => update({ rating: e.target.value })}>
            <option value="">Any rating</option>
            <option value="4.5">4.5+ stars</option>
            <option value="4">4+ stars</option>
            <option value="3">3+ stars</option>
          </Select>
          <Input
            label="Max starting price (PKR)"
            type="number"
            min="0"
            value={maxPrice}
            onChange={(e) => update({ maxPrice: e.target.value })}
            placeholder="e.g. 500000"
          />
          <div className="sm:col-span-2 lg:col-span-4">
            <Select label="Sort by" value={sort} onChange={(e) => update({ sort: e.target.value })}>
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </Select>
          </div>
        </div>
      </form>

      {/* Results */}
      <div className="mt-8">
        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-80" />
            ))}
          </div>
        ) : sellers.length === 0 ? (
          <EmptyState
            icon={SearchIcon}
            title="No vendors found"
            description="Try adjusting your filters or search terms."
            action={
              <Button variant="outline" onClick={() => setParams(new URLSearchParams())}>
                Clear all filters
              </Button>
            }
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sellers.map((s) => (
              <SellerCard key={s._id} seller={s} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-10">
        <Pagination page={page} pages={pages} onChange={(p) => update({ page: p })} />
      </div>
    </div>
  );
}