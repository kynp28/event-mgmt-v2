import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Home } from './pages/Home';
import { Invoice } from './pages/Invoice';
import { AdminDashboard } from './pages/AdminDashboard';
import { OrganizerDashboard } from './pages/OrganizerDashboard';
import { CreateEvent } from './pages/organizer/CreateEvent';
import { ManageBooths } from './pages/organizer/ManageBooths';
import { VendorDashboard } from './pages/VendorDashboard';
import { ManageEvents } from './pages/organizer/ManageEvents';
import { EditEvent } from './pages/organizer/EditEvent';
import { EventDetails } from './pages/vendor/EventDetails';
import { ManageBookings } from './pages/organizer/ManageBookings';
import { OrganizerRequestForm } from './pages/vendor/OrganizerRequestForm';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';

import { BrowseEvents } from './pages/BrowseEvents';

import AdminEvents from './pages/admin/AdminEvents';
import AdminUsers from './pages/admin/AdminUsers';
import { OrganizerRequestsAdmin } from './pages/admin/OrganizerRequestsAdmin';
import { VerifyPayments } from './pages/admin/VerifyPayments';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
      <Router>
        <Navbar />
        <ErrorBoundary>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<BrowseEvents />} />
            <Route path="/events/:id" element={<EventDetails />} />
            
            <Route element={<ProtectedRoute requiredRole="admin" />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/events" element={<AdminEvents />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/organizer-requests" element={<OrganizerRequestsAdmin />} />
              <Route path="/admin/payments" element={<VerifyPayments />} />
            </Route>

            <Route element={<ProtectedRoute requiredRole="organizer" />}>
              <Route path="/organizer" element={<OrganizerDashboard />} />
              <Route path="/organizer/events" element={<ManageEvents />} />
              <Route path="/organizer/events/create" element={<CreateEvent />} />
              <Route path="/organizer/events/edit/:id" element={<EditEvent />} />
              <Route path="/organizer/booths/manage" element={<ManageBooths />} />
              <Route path="/organizer/bookings" element={<ManageBookings />} />
            </Route>

            <Route element={<ProtectedRoute requiredRole="vendor" />}>
              <Route path="/vendor" element={<VendorDashboard />} />
              <Route path="/vendor/upgrade" element={<OrganizerRequestForm />} />
              <Route path="/invoice/:id" element={<Invoice />} />
            </Route>
          </Routes>
        </ErrorBoundary>
      </Router>
    </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
