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
import DispatcherWorkOrders from "../pages/dispatcher/DispatcherWorkOrders";
import DispatcherTechnicians from '../pages/dispatcher/DispatcherTechnicians';
import DispatcherPayments from "../pages/dispatcher/DispatcherPayments";

import AdminDashboard from "../pages/administrator/Dashboard";
import AdminWorkOrders from "../pages/administrator/AdminWorkOrders";
import AdminPaymentsPage from "../pages/administrator/AdminPaymentsPage";
// import AdminTechniciansPage from "../pages/administrator/AdminTechniciansPage";

import ProtectedRoute from "./ProtectedRoute";
import TechnicianMapView from "../pages/dispatcher/TechnicianMapView";

const Router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },

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
      { path: "work-orders", element: <DispatcherWorkOrders></DispatcherWorkOrders> },
      { path: "payments", element: <DispatcherPayments></DispatcherPayments> },
      { path: "technicians", element: <DispatcherTechnicians /> },
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
    children: [
      { path: "overview", element: <AdminDashboard /> },
      { path: "work-orders", element: <AdminWorkOrders /> },
      { path: "payments", element: <AdminPaymentsPage /> },
      // { path: "technicians", element: <AdminTechniciansPage /> }
    ],
  },
]);

export default Router;
