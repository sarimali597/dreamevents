import { useCallback, useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ExternalLink, LogOut, MapPin, Menu, Search, Sparkles, User as UserIcon, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { cn, initials } from '../../lib/utils.js';
import ThemeToggle from './ThemeToggle.jsx';
import { NotificationsBell } from './NotificationsBell.jsx';

const LOGO = (
  <Link to="/" className="group flex items-center gap-2">
    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent-400 to-primary-600 text-white shadow-sm transition-transform group-hover:rotate-6">
      <Sparkles className="h-4 w-4" />
    </span>
    <span className="font-fraunces text-lg font-semibold tracking-tight text-text-primary">
      Dream<span className="text-primary-600 dark:text-primary-400">Events</span>
    </span>
  </Link>
);

// homepage section each nav item scrolls to (enables scroll-spy)
const SECTION_FOR = {
  '/': 'top',
  '/search': 'vendors',
  '/feed': 'inspiration',
};

export function Navbar() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState('');
  const [activeSection, setActiveSection] = useState('top');

  // Smooth-scroll to a homepage section by id, or navigate home with that hash.
  const goToSection = useCallback(
    (id) => {
      if (location.pathname === '/') {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
      }
      navigate(`/#${id}`);
    },
    [location.pathname, navigate]
  );

  const goToLocation = () => goToSection('location');
  const goToAbout = () => goToSection('about');

  const dashboardPath = user?.role === 'admin' ? '/admin' : user?.role === 'seller' ? '/seller' : '/customer';

  const links = [
    { to: '/', label: 'Home' },
    { to: '/search', label: 'Vendors' },
    { to: '/support', label: 'Support' },
  ];

  // scroll-spy: highlight the nav link whose homepage section is in view
  useEffect(() => {
    if (location.pathname !== '/') {
      setActiveSection('');
      return;
    }
    const ids = ['top', 'categories', 'about', 'vendors', 'inspiration', 'location'];
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!els.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveSection(visible[0].target.id);
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5, 1] }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [location.pathname]);

  const activeSectionFor = (to) => (location.pathname === '/' && SECTION_FOR[to] === activeSection ? to : '');

  const submitSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    setSearchOpen(false);
    navigate(`/search?${params.toString()}`);
  };

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate('/');
  };

  const navLinkClass = (to) => {
    const spyActive = location.pathname === '/' && SECTION_FOR[to] === activeSection;
    return cn(
      'rounded-full px-4 py-1.5 text-body-sm font-medium transition-colors',
      spyActive
        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-400'
        : 'text-text-secondary hover:text-text-primary'
    );
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border-default bg-surface-base/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        {LOGO}

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} className={navLinkClass(l.to)}>
              {l.label}
            </NavLink>
          ))}

          {/* About — scrolls to the homepage About section (merged into main) */}
          <button
            type="button"
            onClick={goToAbout}
            className={cn(
              'rounded-full px-4 py-1.5 text-body-sm font-medium transition-colors',
              activeSection === 'about'
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-400'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            About
          </button>

          {/* Inspiration kept separate & prominent, per product direction */}
          <NavLink
            to="/feed"
            end
            className={cn(
              'ml-1 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-body-sm font-semibold transition-colors',
              location.pathname === '/feed' || activeSection === 'inspiration'
                ? 'bg-primary-600 text-white dark:bg-primary-500'
                : 'bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-primary-900/50 dark:text-primary-300 dark:hover:bg-primary-900'
            )}
          >
            <Sparkles className="h-3.5 w-3.5" /> Inspiration
          </NavLink>

          {/* Location — icon-only pill, smooth-scrolls to the office map on home */}
          <button
            type="button"
            onClick={goToLocation}
            className={cn(
              'group relative ml-1 inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink-200 transition-colors dark:border-ink-700',
              activeSection === 'location'
                ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
                : 'text-text-secondary hover:border-primary-300 hover:text-text-primary'
            )}
            aria-label="Our location in Sukkur"
          >
            <MapPin className="h-4 w-4 text-primary-600 dark:text-primary-400" />
            <span className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink-950 px-2.5 py-1 text-micro font-medium text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 dark:bg-ink-800">
              Dream Palace Marquee, Sukkur
            </span>
          </button>
        </nav>

        <div className="flex items-center gap-2">
          {/* expandable search */}
          <form
            onSubmit={submitSearch}
            className={cn(
              'hidden items-center overflow-hidden rounded-full border border-primary-200 transition-all dark:border-ink-700 sm:flex',
              searchOpen ? 'w-56 px-3' : 'w-9 justify-center'
            )}
          >
            {searchOpen ? (
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onBlur={() => !q && setSearchOpen(false)}
                placeholder="Search vendors…"
                className="h-9 w-full bg-transparent text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none"
              />
            ) : (
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="flex h-9 w-9 items-center justify-center text-primary-600 dark:text-primary-500"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </button>
            )}
          </form>

          {!loading && (
            <>
              {user ? (
                <>
                  {(user.role === 'customer' || user.role === 'seller') && <NotificationsBell />}
                  <Link
                    to={dashboardPath}
                    className="hidden rounded-full border border-primary-200 px-4 py-1.5 text-body-sm font-medium text-primary-600 transition-colors hover:bg-primary-50 dark:border-ink-700 dark:text-primary-400 dark:hover:bg-ink-800 sm:block"
                  >
                    Dashboard
                  </Link>
                  <div className="relative">
                    <button
                      onClick={() => setMenuOpen((v) => !v)}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-primary-800 text-micro font-bold text-white dark:from-primary-500 dark:to-primary-700"
                      aria-label="Account menu"
                    >
                      {initials(user.name || user.email)}
                    </button>
                    {menuOpen && (
                      <div className="absolute right-0 top-11 z-50 w-56 overflow-hidden rounded-xl border border-border-default bg-surface-raised py-1 shadow-xl">
                        <div className="border-b border-border-subtle px-4 py-2.5">
                          <p className="truncate text-body-sm font-semibold text-text-primary">{user.name || 'User'}</p>
                          <p className="truncate text-micro text-text-tertiary">{user.email}</p>
                        </div>
                        <Link
                          to={dashboardPath}
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-body-sm text-text-secondary transition-colors hover:bg-slate-50 hover:text-text-primary dark:hover:bg-ink-800"
                        >
                          <UserIcon className="h-4 w-4" /> My dashboard
                        </Link>
                        <a
                          href="https://sarimfolio.vercel.app"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-body-sm text-text-secondary transition-colors hover:bg-slate-50 hover:text-text-primary dark:hover:bg-ink-800"
                        >
                          <ExternalLink className="h-4 w-4" /> My portfolio
                        </a>
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-body-sm text-error transition-colors hover:bg-error-light dark:hover:bg-error/10"
                        >
                          <LogOut className="h-4 w-4" /> Sign out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="hidden rounded-full px-4 py-1.5 text-body-sm font-medium text-text-secondary transition-colors hover:text-text-primary sm:block"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/signup"
                    className="hidden rounded-lg bg-primary-600 px-4 py-1.5 text-body-sm font-medium text-white transition-colors hover:bg-primary-700 sm:block dark:bg-primary-500 dark:hover:bg-primary-600"
                  >
                    Get started
                  </Link>
                </>
              )}
              <Link
                to="/search"
                aria-label="Search vendors"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary-200 text-primary-600 transition-colors hover:bg-primary-50 dark:border-ink-700 dark:text-primary-500 dark:hover:bg-ink-800 lg:hidden"
              >
                <Search className="h-4 w-4" />
              </Link>
              {/* mobile Inspiration */}
              <Link
                to="/feed"
                aria-label="Inspiration"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400 lg:hidden"
              >
                <Sparkles className="h-4 w-4" />
              </Link>
            </>
          )}
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary-200 text-primary-600 dark:border-ink-700 dark:text-primary-500 lg:hidden"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-border-default bg-surface-base px-4 py-3 lg:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.to === '/'} onClick={() => setMobileOpen(false)} className={navLinkClass(l.to)}>
                {l.label}
              </NavLink>
            ))}
            <NavLink to="/feed" onClick={() => setMobileOpen(false)} className="rounded-lg bg-primary-600 px-3 py-2 text-center text-body-sm font-semibold text-white">
              Inspiration
            </NavLink>
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                goToAbout();
              }}
              className="rounded-lg px-3 py-2 text-left text-body-sm font-medium text-text-secondary hover:bg-slate-50 dark:hover:bg-ink-800"
            >
              About
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                goToLocation();
              }}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-primary-200 px-3 py-2 text-body-sm font-medium text-text-secondary dark:border-ink-700"
            >
              <MapPin className="h-3.5 w-3.5 text-primary-600" /> Our location
            </button>
            {!user ? (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-body-sm font-medium text-text-secondary hover:bg-slate-50 dark:hover:bg-ink-800">
                  Sign in
                </Link>
                <Link to="/signup" onClick={() => setMobileOpen(false)} className="rounded-lg bg-primary-600 px-3 py-2 text-center text-body-sm font-medium text-white dark:bg-primary-500">
                  Get started
                </Link>
              </>
            ) : (
              <Link to={dashboardPath} onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-body-sm font-medium text-primary-600 dark:text-primary-400">
                My dashboard
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
