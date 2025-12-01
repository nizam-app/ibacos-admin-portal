// src/routes/router.jsx
import { createBrowserRouter } from "react-router-dom";

import Login from "../pages/login/Login";
import DashboardLayout from "../layouts/DashboardLayout";

import CallCenterSidebar from "../components/sidebar/CallCenterSidebar";
import DispatcherSidebar from "../components/sidebar/DispatcherSidebar";
import AdminSidebar from "../components/sidebar/AdminSidebar";

import CallCenterDashboard from "../pages/call-center/Dashboard";
import ServiceRequestForm from "../pages/call-center/ServiceRequestForm";
import SRHistoryPage from "../pages/call-center/SRHistory";

import DispatcherDashboard from "../pages/dispatcher/Dashboard";
import DispatcherServiceRequests from "../pages/dispatcher/DispatcherServiceRequests";
import DispatcherWorkOrdersPage from "../pages/dispatcher/DispatcherWorkOrdersPage";

import AdminDashboard from "../pages/administrator/Dashboard";

import ProtectedRoute from "./ProtectedRoute";
import TechnicianMapView from "../pages/dispatcher/TechnicianMapView";

const Router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },

  // 🔴 CALL CENTER ROUTES – শুধু CALL_CENTER role
  {
    path: "/call-center",
    element: (
      <ProtectedRoute allowedRoles={["CALL_CENTER"]}>
        <DashboardLayout sidebar={<CallCenterSidebar />} />
      </ProtectedRoute>
    ),
    children: [
      { path: "dashboard", element: <CallCenterDashboard /> },
      {
        path: "create-sr",
        element: (
          <ServiceRequestForm
            customers={[]} // later API দিয়ে আসবে
            onSubmit={(data, customerId) => {
              console.log("SR created", { data, customerId });
            }}
          />
        ),
      },
      { path: "history", element: <SRHistoryPage /> },
    ],
  },

  // 🟠 DISPATCHER ROUTES – শুধু DISPATCHER role
  {
    path: "/dispatcher",
    element: (
      <ProtectedRoute allowedRoles={["DISPATCHER"]}>
        <DashboardLayout sidebar={<DispatcherSidebar />} />
      </ProtectedRoute>
    ),
    children: [
      { path: "overview", element: <DispatcherDashboard /> },
      { path: "technician-map", element: <TechnicianMapView /> },
      { path: "service-requests", element: <DispatcherServiceRequests /> },
      { path: "work-orders", element: <DispatcherWorkOrdersPage /> },
      { path: "payments", element: <h3>payment coming soon.....</h3> },
      { path: "technicians", element: <h3>technicians coming soon.....</h3> },
    ],
  },

  // 🟣 ADMIN ROUTES – শুধু ADMIN role
  {
    path: "/admin",
    element: (
      <ProtectedRoute allowedRoles={["ADMIN"]}>
        <DashboardLayout sidebar={<AdminSidebar />} />
      </ProtectedRoute>
    ),
    children: [{ path: "overview", element: <AdminDashboard /> }],
  },
]);

export default Router;
