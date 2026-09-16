import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { AuthPage } from './pages/auth/AuthPage';
import { Home } from './pages/Home';
import { Invoice } from './pages/Invoice';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { OrganizerDashboard } from './pages/organizer/OrganizerDashboard';
import { CreateEvent } from './pages/organizer/CreateEvent';
import { ManageBooths } from './pages/organizer/ManageBooths';
import { VendorDashboard } from './pages/vendor/VendorDashboard';
import { ManageEvents } from './pages/organizer/ManageEvents';
import { EditEvent } from './pages/organizer/EditEvent';
import { Checkout } from './pages/vendor/Checkout';
import { BookingConfirmed } from './pages/vendor/BookingConfirmed';
import { EventDetails } from './pages/vendor/EventDetails';
import { ManageBookings } from './pages/organizer/ManageBookings';
import { OrganizerRequestForm } from './pages/vendor/OrganizerRequestForm';
import { Settings } from './pages/Settings';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';

import { BrowseEvents } from './pages/BrowseEvents';

import AdminEvents from './pages/admin/AdminEvents';
import AdminUsers from './pages/admin/AdminUsers';
import { OrganizerRequestsAdmin } from './pages/admin/OrganizerRequestsAdmin';
import { VerifyPayments } from './pages/admin/VerifyPayments';

import { PublicLayout } from './components/PublicLayout';
import { DashboardLayout } from './components/DashboardLayout';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
      <Router>
          <ErrorBoundary>
            <Routes>
              {/* Auth Routes */}
              <Route path="/login" element={<AuthPage />} />
              <Route path="/register" element={<AuthPage />} />
              
              {/* Public Routes with Top Navbar */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/events" element={<BrowseEvents />} />
            </Route>

            {/* Event Specific Routes (Custom Navbars) */}
            <Route path="/events/:id" element={<EventDetails />} />
            
            <Route element={<ProtectedRoute requiredRole="vendor" />}>
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/booking-confirmed" element={<BookingConfirmed />} />
            </Route>
            
            {/* Admin Dashboard Routes */}
            <Route element={<ProtectedRoute requiredRole="admin" />}>
              <Route element={<DashboardLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/events" element={<AdminEvents />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/organizer-requests" element={<OrganizerRequestsAdmin />} />
                <Route path="/admin/payments" element={<VerifyPayments />} />
              </Route>
            </Route>

            {/* Organizer Dashboard Routes */}
              <Route element={<ProtectedRoute requiredRole="organizer" />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/organizer" element={<OrganizerDashboard />} />
                  <Route path="/organizer/events" element={<ManageEvents />} />
                  <Route path="/organizer/events/create" element={<CreateEvent />} />
                  <Route path="/organizer/events/edit/:id" element={<EditEvent />} />
                  <Route path="/organizer/booths/manage" element={<ManageBooths />} />
                  <Route path="/organizer/bookings" element={<ManageBookings />} />
                </Route>
              </Route>

            {/* Vendor Dashboard Routes */}
            <Route element={<ProtectedRoute requiredRole="vendor" />}>
              <Route element={<DashboardLayout />}>
                <Route path="/vendor" element={<VendorDashboard />} />
                <Route path="/vendor/upgrade" element={<OrganizerRequestForm />} />
                <Route path="/invoice/:id" element={<Invoice />} />
              </Route>
            </Route>

            {/* Common Authenticated Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>
          </Routes>
        </ErrorBoundary>
      </Router>
    </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
