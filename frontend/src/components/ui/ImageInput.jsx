import { useRef, useState } from 'react';
import { ImagePlus, Link2, X } from 'lucide-react';
import { api, apiErrorMessage, unwrap } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { cn } from '../../lib/utils.js';

export function ImageInput({ value, onChange, label = 'Image', className }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const toast = useToast();

  const handleFile = async (file) => {
  if (!file) return;
  const fd = new FormData();
  fd.append('image', file);
  setUploading(true);
  try {
  // Let the browser set the multipart boundary — the axios instance defaults
  // to application/json, which would make multer never see the file.
  const res = await api.post('/upload', fd, { headers: { 'Content-Type': undefined } });
  onChange(unwrap(res)?.url || '');
  } catch (e) {
  toast.error(apiErrorMessage(e, 'Upload failed'));
  } finally {
  setUploading(false);
  }
  };

  return (
  <div className={className}>
  <span className="mb-1.5 block text-body-sm font-medium text-text-secondary">{label}</span>
  {value ? (
  <div className="relative overflow-hidden rounded-lg border border-border-default">
  <img src={value} alt="" className="h-36 w-full object-cover" />
  <button
  type="button"
  onClick={() => onChange('')}
  className="absolute right-2 top-2 rounded-full bg-ink-950/70 p-1.5 text-white transition-colors hover:bg-ink-950"
  aria-label="Remove image"
  >
  <X className="h-3.5 w-3.5" />
  </button>
  </div>
  ) : (
  <div className="flex gap-2">
  <button
  type="button"
  onClick={() => fileRef.current?.click()}
  className={cn(
  'flex h-36 flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border-default text-text-tertiary transition-colors hover:border-primary-400 hover:text-primary-600'
  )}
  >
  {uploading ? (
  <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
  ) : (
  <>
  <ImagePlus className="h-6 w-6" />
  <span className="text-micro">{uploading ? 'Uploading…' : 'Upload image'}</span>
  </>
  )}
  </button>
  <button
  type="button"
  onClick={() => setShowUrl((v) => !v)}
  className="flex h-36 w-16 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border-default text-text-tertiary transition-colors hover:border-primary-400 hover:text-primary-600"
  title="Paste an image URL instead"
  >
  <Link2 className="h-5 w-5" />
  <span className="text-micro">URL</span>
  </button>
  <input
  ref={fileRef}
  type="file"
  accept="image/jpeg,image/png,image/webp,image/gif"
  className="hidden"
  onChange={(e) => handleFile(e.target.files?.[0])}
  />
  </div>
  )}
  {showUrl && (
  <input
  type="url"
  value={value.startsWith('data:') || !value ? '' : value}
  onChange={(e) => onChange(e.target.value)}
  placeholder="https://…/image.jpg"
  className="mt-2 h-10 w-full rounded-lg border border-border-default bg-surface-sunken px-3 text-sm text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
  />
  )}
  </div>
  );
}