import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ScrollToTop from "./components/site/ScrollToTop";
import AuthErrorHandler from "./components/AuthErrorHandler";
import Home from "./pages/Home";
import Community from "./pages/Community";
import CommunityQuestion from "./pages/CommunityQuestion";
import Blogs from "./pages/Blogs";
import BlogDetail from "./pages/BlogDetail";
import Professionals from "./pages/Professionals";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import SignupSelection from "./pages/SignupSelection";
import PatientSignup from "./pages/PatientSignup";
import ProfessionalSignup from "./pages/ProfessionalSignup";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import Profile from "./pages/Profile";
import BookAppointment from "./pages/BookAppointment";
import DoctorDashboard from "./pages/DoctorDashboard";
import LiveSession from "./pages/LiveSession.tsx";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import Notifications from "./pages/Notifications";
import NotificationDetail from "./pages/NotificationDetail";

// Import Login component
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import ProtectedRoute from "./components/ProtectedRoute";

// Loading wrapper component
const AppContent = () => {
  const { loading } = useAuth();

  // Show auth error handler if there are authentication issues
  return (
    <>
      <AuthErrorHandler />
      {loading ? (
        <div className="min-h-screen bg-gray-50">
          {/* Header Skeleton */}
          <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded bg-gray-200 animate-pulse"></div>
                <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden md:block">
                  <div className="h-10 w-64 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
                <div className="h-9 w-9 rounded-full bg-gray-200 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Main Content Skeleton */}
          <main className="py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="space-y-8">
                {/* Hero Section Skeleton */}
                <div className="text-center space-y-4">
                  <div className="h-12 w-96 bg-gray-200 rounded-lg animate-pulse mx-auto"></div>
                  <div className="h-6 w-2/3 bg-gray-200 rounded animate-pulse mx-auto"></div>
                </div>

                {/* Cards Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="p-6 border border-gray-200 rounded-lg bg-white"
                    >
                      <div className="space-y-4">
                        <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      ) : (
        <>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/community" element={<Community />} />
            <Route path="/community/q/:id" element={<CommunityQuestion />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blogs/:slug" element={<BlogDetail />} />
            <Route path="/professionals" element={<Professionals />} />
            <Route path="/services" element={<Services />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/book/:providerSlug/:serviceSlug"
              element={<BookAppointment />}
            />
            <Route path="/book/:id" element={<BookAppointment />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/auth" element={<Navigate to="/login" replace />} />
            <Route path="/signup" element={<SignupSelection />} />
            <Route path="/signup/patient" element={<PatientSignup />} />
            <Route
              path="/signup/professional"
              element={<ProfessionalSignup />}
            />
            <Route
              path="/doctor-dashboard"
              element={
                <ProtectedRoute requiredRole="professional">
                  <DoctorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/notifications/:id" element={<NotificationDetail />} />
            <Route path="/live/:id" element={<LiveSession />} />
            <Route path="/live-session/:id" element={<LiveSession />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </>
      )}
    </>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
