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
// import DispatcherPayments from "../pages/dispatcher/DispatcherPayments";


import AdminOverviewPage from "../pages/administrator/AdminOverviewPage";
import AdminPaymentsPage from "../pages/administrator/AdminPaymentsPage";

import ProtectedRoute from "./ProtectedRoute";
import TechnicianMapView from "../pages/dispatcher/TechnicianMapView";
import AdminPayoutManagement from "../pages/administrator/AdminPayoutManagement";
import AdminReportsPage from "../pages/administrator/AdminReportsPage";
import AdminAuditLogPage from "../pages/administrator/AdminAuditLogPage";
import AdminUserManagementPage from "../pages/administrator/AdminUserManagementPage";
import AdminCategoriesManagementPage from "../pages/administrator/AdminCategoriesManagementPage";
import AdminCommissionRatesPage from "../pages/administrator/AdminCommissionRatesPage";

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
      
      { path: "service-requests", element: <DispatcherServiceRequests /> },
      { path: "work-orders", element: <DispatcherWorkOrders></DispatcherWorkOrders> },
      { path: "payments", element: <AdminPaymentsPage></AdminPaymentsPage> },
      { path: "technicians", element: <DispatcherTechnicians /> },
    ],
  },
  { 
    path: "/technician-map", 
    element: (
      <ProtectedRoute allowedRoles={["DISPATCHER", "ADMIN"]}>
        <TechnicianMapView />
      </ProtectedRoute>
    ),
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
      { path: "overview", element: <AdminOverviewPage /> },
      { path: "service-requests", element: <DispatcherServiceRequests /> },
      { path: "work-orders", element: <DispatcherWorkOrders /> },
      { path: "payments", element: <AdminPaymentsPage /> },
      { path: "payout-management", element: <AdminPayoutManagement /> },
      { path: "technicians", element: <DispatcherTechnicians /> },
      { path: "reports", element: <AdminReportsPage/> },
      { path: "audit-log", element: <AdminAuditLogPage/> },
      { path: "user-management", element: <AdminUserManagementPage/> },
      { path: "categories-services", element: <AdminCategoriesManagementPage/> },
      { path: "commission-bonus", element: <AdminCommissionRatesPage/> },
    ],
  },
]);

export default Router;
