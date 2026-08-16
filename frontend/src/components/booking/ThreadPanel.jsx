import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FileText, Send } from 'lucide-react';
import { api, apiErrorMessage, unwrap } from '../../lib/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { cn, formatDateTime } from '../../lib/utils.js';

export function ThreadPanel({ requestId, className }) {
  const { user } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();
  const [text, setText] = useState('');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const { data: messages, isLoading } = useQuery({
  queryKey: ['thread', requestId],
  queryFn: async () => unwrap(await api.get(`/messages/${requestId}`)),
  refetchInterval: 10_000,
  });

  const sendMutation = useMutation({
  mutationFn: async (content) =>
  unwrap(await api.post('/messages', { bookingRequestId: requestId, content })),
  onSuccess: () => {
  setText('');
  qc.invalidateQueries({ queryKey: ['thread', requestId] });
  qc.invalidateQueries({ queryKey: ['conversations'] });
  inputRef.current?.focus();
  },
  onError: (e) => toast.error(apiErrorMessage(e)),
  });

  useEffect(() => {
  bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages?.length]);

  const submit = (e) => {
  e.preventDefault();
  const t = text.trim();
  if (!t || sendMutation.isPending) return;
  sendMutation.mutate(t);
  };

  return (
  <div className={cn('flex h-full flex-col', className)}>
  <div className="flex-1 space-y-3 overflow-y-auto p-4">
  {isLoading && <p className="text-center text-micro text-text-tertiary">Loading conversation…</p>}
  {(messages || []).map((m) => {
  const mine = String(m.senderId) === String(user?._id);
  const isSystem = m.type === 'system_notification';
  const isEstimate = m.type === 'estimate';

  if (isSystem) {
  return (
  <div key={m._id} className="mx-auto max-w-sm rounded-full bg-slate-100 px-4 py-1.5 text-center text-micro text-text-tertiary dark:bg-ink-800">
  {m.content}
  </div>
  );
  }

  return (
  <div key={m._id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
  <div
  className={cn(
  'max-w-[80%] rounded-2xl px-4 py-2.5 text-body-sm shadow-sm',
  isEstimate &&
  'border border-accent-300 bg-accent-50 dark:border-accent-700 dark:bg-accent-900/40',
  mine
  ? 'rounded-br-md bg-primary-600 text-white dark:bg-primary-500'
  : 'rounded-bl-md bg-surface-raised text-text-primary'
  )}
  >
  {isEstimate && (
  <p className="mb-1 flex items-center gap-1.5 text-micro font-semibold uppercase tracking-wide text-accent-700 dark:text-accent-400">
  <FileText className="h-3 w-3" /> Estimate
  </p>
  )}
  <p className="whitespace-pre-wrap">{m.content}</p>
  <p className={cn('mt-1 text-[10px]', mine ? 'text-white/70' : 'text-text-tertiary')}>
  {formatDateTime(m.createdAt)}
  </p>
  </div>
  </div>
  );
  })}
  <div ref={bottomRef} />
  </div>

  <form onSubmit={submit} className="flex items-center gap-2 border-t border-border-default p-3">
  <input
  ref={inputRef}
  value={text}
  onChange={(e) => setText(e.target.value)}
  placeholder="Write a message…"
  className="h-10 flex-1 rounded-lg border border-border-default bg-surface-sunken px-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
  />
  <button
  type="submit"
  disabled={!text.trim() || sendMutation.isPending}
  className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 text-white transition-colors hover:bg-primary-700 disabled:opacity-50 dark:bg-primary-500 dark:hover:bg-primary-600"
  aria-label="Send message"
  >
  <Send className="h-4 w-4" />
  </button>
  </form>
  </div>
  );
}