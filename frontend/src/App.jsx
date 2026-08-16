import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { PublicLayout } from './components/layout/PublicLayout.jsx';
import { DashboardLayout } from './components/layout/DashboardLayout.jsx';
import { RequireRole } from './components/layout/RequireRole.jsx';
import { PageLoader } from './components/ui/Feedback.jsx';

const Home = lazy(() => import('./routes/public/Home.jsx'));
const Search = lazy(() => import('./routes/public/Search.jsx'));
const SellerProfile = lazy(() => import('./routes/public/SellerProfile.jsx'));
const Login = lazy(() => import('./routes/public/Login.jsx'));
const Signup = lazy(() => import('./routes/public/Signup.jsx'));
const Support = lazy(() => import('./routes/public/Support.jsx'));
const SupportSuccess = lazy(() => import('./routes/public/SupportSuccess.jsx'));
const NotFound = lazy(() => import('./routes/public/NotFound.jsx'));
const Inspiration = lazy(() => import('./routes/public/Inspiration.jsx'));

const CustomerHome = lazy(() => import('./routes/customer/CustomerHome.jsx'));
const MyBookings = lazy(() => import('./routes/customer/MyBookings.jsx'));
const BookingDetail = lazy(() => import('./routes/customer/BookingDetail.jsx'));
const MyRequests = lazy(() => import('./routes/customer/MyRequests.jsx'));
const RequestDetail = lazy(() => import('./routes/customer/RequestDetail.jsx'));
const Messages = lazy(() => import('./routes/partner/Messages.jsx'));
const MyEvents = lazy(() => import('./routes/customer/MyEvents.jsx'));
const Favorites = lazy(() => import('./routes/customer/Favorites.jsx'));
const CustomerProfile = lazy(() => import('./routes/customer/CustomerProfile.jsx'));

const SellerDashboard = lazy(() => import('./routes/seller/SellerDashboard.jsx'));
const SellerOnboarding = lazy(() => import('./routes/seller/SellerOnboarding.jsx'));
const SellerRequests = lazy(() => import('./routes/seller/SellerRequests.jsx'));
const SellerEstimates = lazy(() => import('./routes/seller/SellerEstimates.jsx'));
const SellerBookings = lazy(() => import('./routes/seller/SellerBookings.jsx'));
const SellerCalendar = lazy(() => import('./routes/seller/SellerCalendar.jsx'));
const SellerServices = lazy(() => import('./routes/seller/SellerServices.jsx'));
const SellerPackages = lazy(() => import('./routes/seller/SellerPackages.jsx'));
const SellerGallery = lazy(() => import('./routes/seller/SellerGallery.jsx'));
const SellerMenu = lazy(() => import('./routes/seller/SellerMenu.jsx'));
const SellerFeed = lazy(() => import('./routes/seller/SellerFeed.jsx'));
const SellerSettings = lazy(() => import('./routes/seller/SellerSettings.jsx'));

const AdminDashboard = lazy(() => import('./routes/admin/AdminDashboard.jsx'));
const AdminSellers = lazy(() => import('./routes/admin/AdminSellers.jsx'));
const AdminUsers = lazy(() => import('./routes/admin/AdminUsers.jsx'));
const AdminBookings = lazy(() => import('./routes/admin/AdminBookings.jsx'));
const AdminModeration = lazy(() => import('./routes/admin/AdminModeration.jsx'));
const AdminCatalog = lazy(() => import('./routes/admin/AdminCatalog.jsx'));
const AdminFeatured = lazy(() => import('./routes/admin/AdminFeatured.jsx'));

export default function App() {
  return (
  <Suspense fallback={<PageLoader />}>
  <Routes>
  <Route element={<PublicLayout />}>
  <Route path="/" element={<Home />} />
  <Route path="/search" element={<Search />} />
  <Route path="/seller/:slug" element={<SellerProfile />} />
  <Route path="/login" element={<Login />} />
  <Route path="/signup" element={<Signup />} />
  <Route path="/support" element={<Support />} />
  <Route path="/support/success" element={<SupportSuccess />} />
  <Route path="/feed" element={<Inspiration />} />
  <Route path="*" element={<NotFound />} />
  </Route>

  <Route
  path="/customer"
  element={
  <RequireRole role="customer">
  <DashboardLayout area="customer" />
  </RequireRole>
  }
  >
  <Route index element={<CustomerHome />} />
  <Route path="bookings" element={<MyBookings />} />
  <Route path="bookings/:id" element={<BookingDetail />} />
  <Route path="requests" element={<MyRequests />} />
  <Route path="requests/:id" element={<RequestDetail />} />
  <Route path="messages" element={<Messages />} />
  <Route path="events" element={<MyEvents />} />
  <Route path="favorites" element={<Favorites />} />
  <Route path="profile" element={<CustomerProfile />} />
  </Route>

  <Route
  path="/seller"
  element={
  <RequireRole role="seller">
  <DashboardLayout area="seller" />
  </RequireRole>
  }
  >
  <Route index element={<SellerDashboard />} />
  <Route path="onboarding" element={<SellerOnboarding />} />
  <Route path="requests" element={<SellerRequests />} />
  <Route path="estimates" element={<SellerEstimates />} />
  <Route path="bookings" element={<SellerBookings />} />
  <Route path="calendar" element={<SellerCalendar />} />
  <Route path="services" element={<SellerServices />} />
  <Route path="packages" element={<SellerPackages />} />
  <Route path="gallery" element={<SellerGallery />} />
  <Route path="menu" element={<SellerMenu />} />
  <Route path="feed" element={<SellerFeed />} />
  <Route path="messages" element={<Messages />} />
  <Route path="settings" element={<SellerSettings />} />
  </Route>

  <Route
  path="/admin"
  element={
  <RequireRole role="admin">
  <DashboardLayout area="admin" />
  </RequireRole>
  }
  >
  <Route index element={<AdminDashboard />} />
  <Route path="sellers" element={<AdminSellers />} />
  <Route path="users" element={<AdminUsers />} />
  <Route path="bookings" element={<AdminBookings />} />
  <Route path="moderation" element={<AdminModeration />} />
  <Route path="catalog" element={<AdminCatalog />} />
  <Route path="featured" element={<AdminFeatured />} />
  </Route>
  </Routes>
  </Suspense>
  );
}
