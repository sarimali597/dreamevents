import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Bookmark,
  CalendarDays,
  Camera,
  Calendar,
  ChevronLeft,
  ClipboardList,
  FileText,
  FolderKanban,
  Home,
  Image as ImageIcon,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Receipt,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  User as UserIcon,
  Users,
  UtensilsCrossed,
  Wallet,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { cn, initials } from '../../lib/utils.js';
import { NotificationsBell } from './NotificationsBell.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import { MobileBottomNav } from './MobileBottomNav.jsx';

const SECTIONS = {
  customer: [
  { to: '/customer', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/customer/requests', label: 'Requests & Quotes', icon: ClipboardList },
  { to: '/customer/bookings', label: 'My Bookings', icon: CalendarDays },
  { to: '/customer/messages', label: 'Messages', icon: MessageSquare },
  { to: '/customer/events', label: 'My Events', icon: Sparkles },
  { to: '/customer/favorites', label: 'Favorites', icon: Bookmark },
  { to: '/customer/profile', label: 'Profile', icon: UserIcon },
  ],
  seller: [
  { to: '/seller', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/seller/requests', label: 'Requests', icon: ClipboardList },
  { to: '/seller/estimates', label: 'Estimates', icon: FileText },
  { to: '/seller/bookings', label: 'Bookings', icon: CalendarDays },
  { to: '/seller/calendar', label: 'Calendar', icon: Calendar },
  { to: '/seller/services', label: 'Services', icon: Star },
  { to: '/seller/packages', label: 'Packages', icon: FolderKanban },
  { to: '/seller/gallery', label: 'Gallery', icon: ImageIcon },
  { to: '/seller/menu', label: 'Menu', icon: UtensilsCrossed },
  { to: '/seller/feed', label: 'Feed Posts', icon: Camera },
  { to: '/seller/messages', label: 'Messages', icon: MessageSquare },
  { to: '/seller/settings', label: 'Settings', icon: Settings },
  ],
  admin: [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/sellers', label: 'Sellers', icon: Users },
  { to: '/admin/users', label: 'Users', icon: UserIcon },
  { to: '/admin/bookings', label: 'Bookings', icon: CalendarDays },
  { to: '/admin/moderation', label: 'Moderation', icon: ShieldCheck },
  { to: '/admin/catalog', label: 'Catalog', icon: FolderKanban },
  { to: '/admin/featured', label: 'Featured', icon: Star },
  ],
};

const TITLES = {
  customer: 'Customer Dashboard',
  seller: 'Vendor Dashboard',
  admin: 'Admin Console',
};

/**
 * Mobile bottom-tab destinations (UI/UX Brief §9.5: 4–5 items). Admin is
 * desktop-first, so it gets no bottom nav. Each entry must also exist in
 * SECTIONS so the icon/label stay consistent.
 */
const BOTTOM_NAV = {
  customer: [
  { to: '/customer', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/customer/requests', label: 'Requests', icon: ClipboardList },
  { to: '/customer/bookings', label: 'Bookings', icon: CalendarDays },
  { to: '/customer/messages', label: 'Messages', icon: MessageSquare },
  { to: '/customer/favorites', label: 'Saved', icon: Bookmark },
  ],
  seller: [
  { to: '/seller', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/seller/requests', label: 'Requests', icon: ClipboardList },
  { to: '/seller/bookings', label: 'Bookings', icon: CalendarDays },
  { to: '/seller/calendar', label: 'Calendar', icon: Calendar },
  { to: '/seller/messages', label: 'Messages', icon: MessageSquare },
  ],
};

export function DashboardLayout({ area }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const sections = SECTIONS[area] || [];
  const title = TITLES[area];

  const handleLogout = async () => {
  await logout();
  navigate('/');
  };

  const sidebar = (
  <div className="flex h-full flex-col bg-gradient-to-b from-primary-900 to-ink-950 text-slate-300">
  <div className="flex items-center gap-2 px-5 py-5">
  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent-400 to-primary-500 text-white">
  <Sparkles className="h-4 w-4" />
  </span>
  <span className="font-fraunces text-lg font-semibold text-white">
  Dream<span className="text-accent-400">Events</span>
  </span>
  </div>

  <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
  {sections.map((item) => (
  <NavLink
  key={item.to}
  to={item.to}
  end={item.end}
  onClick={() => setOpen(false)}
  className={({ isActive }) =>
  cn(
  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-body-sm font-medium transition-colors',
  isActive
  ? 'bg-accent-500/15 text-accent-400'
  : 'text-slate-400 hover:bg-white/5 hover:text-white'
  )
  }
  >
  <item.icon className="h-4 w-4 shrink-0" />
  {item.label}
  </NavLink>
  ))}
  </nav>

  <div className="border-t border-white/10 p-4">
  <div className="flex items-center gap-3">
  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-500 text-micro font-bold text-ink-950">
  {initials(user?.name || user?.email)}
  </span>
  <div className="min-w-0 flex-1">
  <p className="truncate text-body-sm font-medium text-white">{user?.name || 'User'}</p>
  <p className="truncate text-micro capitalize text-slate-500">{user?.role}</p>
  </div>
  <button
  onClick={handleLogout}
  className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
  aria-label="Sign out"
  >
  <LogOut className="h-4 w-4" />
  </button>
  </div>
  </div>
  </div>
  );

  return (
  <div className="flex min-h-screen bg-slate-50 dark:bg-ink-950">
  {/* Desktop sidebar */}
  <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 lg:block">{sidebar}</aside>

  {/* Mobile sidebar */}
  {open && (
  <div className="fixed inset-0 z-50 lg:hidden">
  <div className="absolute inset-0 bg-ink-950/60" onClick={() => setOpen(false)} />
  <aside className="absolute inset-y-0 left-0 w-64">{sidebar}</aside>
  </div>
  )}

  <div className="flex min-w-0 flex-1 flex-col lg:pl-60">
  <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-border-default bg-surface-base/85 px-4 backdrop-blur-md sm:px-6">
  <div className="flex items-center gap-3">
  <button
  onClick={() => setOpen(true)}
  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary-200 text-primary-600 dark:border-ink-700 dark:text-primary-500 lg:hidden"
  aria-label="Open menu"
  >
  <Menu className="h-4 w-4" />
  </button>
  <div>
  <h1 className="font-fraunces text-h4 text-text-primary">{title}</h1>
  <p className="hidden text-micro capitalize text-text-tertiary sm:block">
  {user?.name || user?.email}
  </p>
  </div>
  </div>
  <div className="flex items-center gap-2">
  {area !== 'admin' && <NotificationsBell />}
  <ThemeToggle />
  </div>
  </header>

  <main className="flex-1 px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-6">
  <Outlet />
  </main>
  </div>

  {/* Mobile bottom tab bar (<lg) */}
  <MobileBottomNav items={BOTTOM_NAV[area]} />
  </div>
  );
}