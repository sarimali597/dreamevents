import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar.jsx';
import { Footer } from './Footer.jsx';

export function PublicLayout() {
  return (
  <div className="flex min-h-screen flex-col bg-surface-base">
  <Navbar />
  <main className="flex-1">
  <Outlet />
  </main>
  <Footer />
  </div>
  );
}