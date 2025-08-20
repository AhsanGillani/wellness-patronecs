import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";
import Community from "./pages/Community";
import CommunityQuestion from "./pages/CommunityQuestion";
import Blogs from "./pages/Blogs";
import BlogDetail from "./pages/BlogDetail";
import Professionals from "./pages/Professionals";
import Professional from "./pages/Professional";
import Services from "./pages/Services";
import ServiceDetail from "./pages/ServiceDetail";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import SignupSelection from "./pages/SignupSelection";
import PatientSignup from "./pages/PatientSignup";
import ProfessionalSignup from "./pages/ProfessionalSignup";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import Profile from "./pages/Profile";
import BookAppointment from "./pages/BookAppointment";
import DoctorDashboard from "./pages/DoctorDashboard";
import LiveSession from "./pages/LiveSession.tsx";
import AdminDashboard from "./pages/AdminDashboard";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/community" element={<Community />} />
          <Route path="/community/q/:id" element={<CommunityQuestion />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/blogs/:id" element={<BlogDetail />} />
          <Route path="/professionals" element={<Professionals />} />
          <Route path="/professional/:id" element={<Professional />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:providerId/:serviceId" element={<ServiceDetail />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/book/:id" element={<BookAppointment />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/signup" element={<SignupSelection />} />
          <Route path="/signup/patient" element={<PatientSignup />} />
          <Route path="/signup/professional" element={<ProfessionalSignup />} />
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/live-session/:id" element={<LiveSession />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
