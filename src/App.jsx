import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useState, lazy, Suspense } from "react";
import Navbar from "./components/Navbar";
import AdminNavbar from "./components/AdminNavbar";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import PageTransition from "./components/PageTransition";
import HomePage from "./pages/HomePage";
const EquipmentManagement = lazy(() => import("./pages/EquipmentManagement"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const ClinicCatalog = lazy(() => import("./pages/ClinicCatalog"));
const ClinicDirectory = lazy(() => import("./pages/ClinicDirectory"));
const ClinicBooking = lazy(() => import("./pages/ClinicBooking"));
const ClinicAppointments = lazy(() => import("./pages/ClinicAppointments"));
const ClinicInventory = lazy(() => import("./pages/ClinicInventory"));
const ClinicSchedules = lazy(() => import("./pages/ClinicSchedules"));
const ClinicPayments = lazy(() => import("./pages/ClinicPayments"));
const workspacePage = (name) =>
  lazy(() =>
    import("./pages/ClinicWorkspace").then((m) => ({ default: m[name] })),
  );
const ClinicDashboard = workspacePage("ClinicDashboard");
const ClinicReports = workspacePage("ClinicReports");
const ClinicSecurity = workspacePage("ClinicSecurity");
const ClinicSettings = workspacePage("ClinicSettings");
const ClinicHelp = workspacePage("ClinicHelp");
import { AuthProvider } from "./contexts/AuthContext";
import { ClinicProvider } from "./contexts/ClinicContext";
import ProtectedRoute from "./components/ProtectedRoute";
function PublicLayout() {
  return (
    <>
      <Navbar />
      <main className="public-content">
        <PageTransition />
      </main>
      <Footer />
    </>
  );
}
function WorkspaceLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  return (
    <div className="app-shell">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      {open && (
        <button
          className="clinic-sidebar-scrim"
          aria-label="Đóng menu"
          onClick={() => setOpen(false)}
        />
      )}
      <div className="main-content">
        <AdminNavbar onMenu={() => setOpen(!open)} />
        <main className="page-wrapper">
          <div className="clinic-demo-banner" key={location.pathname}>
            <span className="clinic-demo-dot" />
            BẢN XEM THỬ GIAO DIỆN · Dữ liệu mẫu lưu trên trình duyệt
          </div>
          <PageTransition />
        </main>
      </div>
    </div>
  );
}
const guard = (roles, element) => (
  <ProtectedRoute roles={roles}>{element}</ProtectedRoute>
);
export default function App() {
  return (
    <AuthProvider>
      <ClinicProvider>
        <BrowserRouter>
          <Suspense
            fallback={
              <div
                className="d-flex justify-content-center align-items-center min-vh-100"
                role="status"
              >
                <span className="spinner-border" />
                <span className="ms-3">Đang tải trang...</span>
              </div>
            }
          >
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route element={<PublicLayout />}>
                <Route index element={<HomePage />} />
                <Route path="/booking" element={<ClinicBooking />} />
                <Route
                  path="/specialties"
                  element={
                    <ClinicDirectory key="specialties" kind="specialties" />
                  }
                />
                <Route
                  path="/doctors"
                  element={<ClinicDirectory key="doctors" />}
                />
                <Route
                  path="/services"
                  element={<ClinicDirectory key="services" kind="services" />}
                />
              </Route>
              <Route element={<ProtectedRoute />}>
                <Route element={<WorkspaceLayout />}>
                  <Route
                    path="/admin"
                    element={guard(["ADMIN"], <ClinicDashboard />)}
                  />
                  <Route
                    path="/equipment"
                    element={guard(["ADMIN", "STAFF"], <EquipmentManagement />)}
                  />
                  <Route
                    path="/profiles"
                    element={guard(
                      ["PATIENT"],
                      <ClinicCatalog resource="patients" />,
                    )}
                  />
                  <Route
                    path="/patients"
                    element={guard(
                      ["ADMIN", "STAFF"],
                      <ClinicCatalog resource="patients" />,
                    )}
                  />
                  <Route
                    path="/my-appointments"
                    element={guard(["PATIENT"], <ClinicAppointments />)}
                  />
                  <Route
                    path="/appointments"
                    element={guard(["ADMIN", "STAFF"], <ClinicAppointments />)}
                  />
                  <Route
                    path="/consultations"
                    element={guard(
                      ["DOCTOR"],
                      <ClinicAppointments consultation />,
                    )}
                  />
                  <Route
                    path="/schedules"
                    element={guard(
                      ["ADMIN", "STAFF", "DOCTOR"],
                      <ClinicSchedules />,
                    )}
                  />
                  <Route
                    path="/payments"
                    element={guard(
                      ["ADMIN", "STAFF", "PATIENT"],
                      <ClinicPayments />,
                    )}
                  />
                  <Route
                    path="/reports"
                    element={guard(["ADMIN"], <ClinicReports />)}
                  />
                  <Route
                    path="/inventory"
                    element={guard(
                      ["ADMIN", "STAFF", "DOCTOR"],
                      <ClinicInventory key="supplies" />,
                    )}
                  />
                  <Route
                    path="/inventory/batches"
                    element={guard(
                      ["ADMIN", "STAFF"],
                      <ClinicInventory key="batches" view="batches" />,
                    )}
                  />
                  <Route
                    path="/inventory/transactions"
                    element={guard(
                      ["ADMIN", "STAFF"],
                      <ClinicInventory
                        key="transactions"
                        view="transactions"
                      />,
                    )}
                  />
                  {[
                    "specialties",
                    "rooms",
                    "doctors",
                    "services",
                    "timeSlots",
                  ].map((resource) => (
                    <Route
                      key={resource}
                      path={`/catalog/${resource}`}
                      element={guard(
                        ["ADMIN", "STAFF"],
                        <ClinicCatalog key={resource} resource={resource} />,
                      )}
                    />
                  ))}
                  {["supplies", "categories", "suppliers", "norms"].map(
                    (resource) => (
                      <Route
                        key={resource}
                        path={`/inventory/${resource}`}
                        element={guard(
                          resource === "norms" ? ["ADMIN"] : ["ADMIN", "STAFF"],
                          <ClinicCatalog key={resource} resource={resource} />,
                        )}
                      />
                    ),
                  )}
                  <Route
                    path="/users"
                    element={guard(
                      ["ADMIN"],
                      <ClinicCatalog resource="users" />,
                    )}
                  />
                  <Route
                    path="/audit-logs"
                    element={guard(["ADMIN"], <ClinicSecurity audit />)}
                  />
                  <Route path="/sessions" element={<ClinicSecurity />} />
                  <Route path="/settings" element={<ClinicSettings />} />
                  <Route path="/help" element={<ClinicHelp />} />
                </Route>
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ClinicProvider>
    </AuthProvider>
  );
}
