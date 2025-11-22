import { Navigate, Route, Routes } from "react-router-dom";

// 🩺 Pages Patient
import PatientAppointments from "../pages/patient/Appointments.jsx";
import DashboardContainer from "../pages/patient/DashboardContainer.jsx";
import PatientHome from "../pages/patient/Home.jsx";
import Profile from "../pages/patient/Profile.jsx";

// 👨‍⚕️ Professionnel
import Availabilities from "../pages/pro/Availabilities.jsx";
import Billing from "../pages/pro/Billing.jsx";
import ProCalendar from "../pages/pro/Calendar.jsx";
import ProDashboard from "../pages/pro/Dashboard.jsx";
import ProPatients from "../pages/pro/Patients.jsx";
import ProPrescriptions from "../pages/pro/Prescriptions.jsx";
import PrescriptionsEditor from "../pages/pro/PrescriptionsEditor.jsx";
import ProProfile from "../pages/pro/Profile.jsx";
import Profilpro from "../pages/pro/Profilpro.jsx";
import ProSettings from "../pages/pro/Settings.jsx";
import ProTeleconsult from "../pages/pro/Teleconsult.jsx";

// 🧑‍💼 Administrateur
import AddDoctor from "../pages/admin/AddDoctor.jsx";
import AddPharmacy from "../pages/admin/AddPharmacy.jsx";
import Catalog from "../pages/admin/Catalog.jsx";
import AdminDashboard from "../pages/admin/Dashboard.jsx";
import Moderation from "../pages/admin/Moderation.jsx";
import Monetization from "../pages/admin/Monetization.jsx";
import Reports from "../pages/admin/Reports.jsx";
import Settings from "../pages/admin/Settings.jsx";
import Users from "../pages/admin/Users.jsx";

// 🔧 Layouts
import AdminLayout from "../layouts/AdminLayout.jsx";

// 🔐 Authentification
import Login from "../pages/auth/Login.jsx";
import Register from "../pages/auth/Register.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

// 🔍 Fonctionnalités patient
import Notifications from "../pages/notifications/Notifications.jsx";
import Booking from "../pages/patient/Booking.jsx";
import Checkout from "../pages/patient/Checkout.jsx";
import Doctor from "../pages/patient/Doctor.jsx";
import PatientPrescriptions from "../pages/patient/Prescriptions.jsx";
import Search from "../pages/patient/Search.jsx";
import Teleconsult from "../pages/patient/Teleconsult.jsx";
import Triage from "../pages/patient/Triage.jsx";

// 📄 Pages statiques
import About from "../pages/static/About.jsx";
import Contact from "../pages/static/Contact.jsx";
import Pricing from "../pages/static/Pricing.jsx";
import Security from "../pages/static/Security.jsx";
import Terms from "../pages/static/Terms.jsx";

// 🔧 Containers

export default function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<PatientHome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Pages statiques */}
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/security" element={<Security />} />

      {/* Patient */}
      <Route path="/search" element={<Search />} />
      <Route path="/booking/:doctorId" element={<Booking />} />
      <Route path="/teleconsult/:roomId" element={<Teleconsult />} />
      <Route path="/patient/prescriptions" element={<PatientPrescriptions />} />
      <Route
        path="/patient/appointments"
        element={
          <ProtectedRoute roles={["patient"]}>
            <PatientAppointments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute roles={["patient"]}>
            <Notifications />
          </ProtectedRoute>
        }
      />
      <Route path="/checkout/:appointmentId" element={<Checkout />} />
      <Route path="/triage" element={<Triage />} />
      <Route path="/doctor/:id" element={<Doctor />} />
      <Route path="/patient/profile" element={<Profile />} />
      <Route
        path="/patient/dashboard"
        element={
          <ProtectedRoute roles={["patient"]}>
            <DashboardContainer />
          </ProtectedRoute>
        }
      />

      {/* Professionnel */}
      <Route
        path="/pro/dashboard"
        element={
          <ProtectedRoute roles={["doctor", "nurse", "pro"]}>
            <ProDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pro/calendar"
        element={
          <ProtectedRoute roles={["doctor", "nurse", "pro"]}>
            <ProCalendar />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pro/availabilities"
        element={
          <ProtectedRoute roles={["doctor", "nurse", "pro"]}>
            <Availabilities />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pro/patients"
        element={
          <ProtectedRoute roles={["doctor", "nurse", "pro"]}>
            <ProPatients />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pro/prescriptions"
        element={
          <ProtectedRoute roles={["doctor", "nurse", "pro"]}>
            <ProPrescriptions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pro/prescriptions/editor/:prescriptionId?"
        element={
          <ProtectedRoute roles={["doctor", "nurse", "pro"]}>
            <PrescriptionsEditor />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pro/prescriptions/new"
        element={
          <ProtectedRoute roles={["doctor", "nurse", "pro"]}>
            <PrescriptionsEditor />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pro/teleconsult"
        element={
          <ProtectedRoute roles={["doctor", "nurse", "pro"]}>
            <ProTeleconsult />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pro/profile"
        element={
          <ProtectedRoute roles={["doctor", "nurse", "pro"]}>
            <ProProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pro/profilpro"
        element={
          <ProtectedRoute roles={["doctor", "nurse", "pro"]}>
            <Profilpro />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pro/settings"
        element={
          <ProtectedRoute roles={["doctor", "nurse", "pro"]}>
            <ProSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pro/billing"
        element={
          <ProtectedRoute roles={["doctor", "nurse", "pro"]}>
            <Billing />
          </ProtectedRoute>
        }
      />

      {/* Admin */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminLayout>
              <Users />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/catalog"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminLayout>
              <Catalog />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/monetization"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminLayout>
              <Monetization />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminLayout>
              <Reports />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/moderation"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminLayout>
              <Moderation />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/add-doctor"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminLayout>
              <AddDoctor />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/add-pharmacy"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminLayout>
              <AddPharmacy />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminLayout>
              <Settings />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
