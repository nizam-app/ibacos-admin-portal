// router.jsx (উপরে import গুলোর নিচে)

const mockCustomers = [
    {
        id: "c1",
        name: "Ahmed Al-Mansoori",
        phone: "+97150000001",
        email: "ahmed@example.com",
        address: "Building 10, Dubai Marina, Dubai",
    },
    {
        id: "c2",
        name: "Fatima Hassan",
        phone: "+97150000002",
        email: "fatima@example.com",
        address: "Near Central Mall, Abu Dhabi, UAE",
    },
    {
        id: "c3",
        name: "Mohammed Khalil",
        phone: "+97150000003",
        email: "m.khalil@example.com",
        address: "Villa 23, Sharjah, UAE",
    },
];


import { createBrowserRouter } from "react-router-dom";
import Login from "../pages/login/Login";
import DashboardLayout from "../layouts/DashboardLayout";
import CallCenterSidebar from "../components/sidebar/CallCenterSidebar";
import CallCenterDashboard from "../pages/call-center/Dashboard";
import DispatcherDashboard from "../pages/dispatcher/Dashboard";
import AdminDashboard from "../pages/administrator/Dashboard";
import DispatcherSidebar from "../components/sidebar/DispatcherSidebar";
import AdminSidebar from "../components/sidebar/AdminSidebar";
import ServiceRequestForm from "../pages/call-center/ServiceRequestForm";
import SRHistoryPage from "../pages/call-center/SRHistory";
import DispatcherServiceRequests from "../pages/dispatcher/DispatcherServiceRequests";
import DispatcherWorkOrdersPage from "../pages/dispatcher/DispatcherWorkOrdersPage";

const Router = createBrowserRouter([
    {
        path: '/',
        element: <Login />
    },
    {
        path: '/call-center',
        element: <DashboardLayout sidebar={<CallCenterSidebar />} />,
        children: [
            {
                path: 'dashboard',
                element: <CallCenterDashboard />,
            },
            {
                path: 'create-sr',
                element: <ServiceRequestForm customers={mockCustomers} onSubmit={(data, customerId) => {
                    console.log('SR created', { data, customerId });
                }} />,
            },
            {
                path: 'history',
                element: <SRHistoryPage />,
            },
            // More pages...
        ],
    },
    {
        path: '/dispatcher',
        element: <DashboardLayout sidebar={<DispatcherSidebar/>} />,
        children: [
            {
                path: 'overview',
                element: <DispatcherDashboard />
            },
            {
                path: 'service-requests',
                element: <DispatcherServiceRequests />
            },
            {
                path: 'work-orders',
                element: <DispatcherWorkOrdersPage />
            },
            {
                path: 'payments',
                element: <h3>payment comming soon.....</h3>
            },
            {
                path: 'technicians',
                element: <h3>technicians comming soon.....</h3>
            },
        ]
    },
    {
        path: '/admin',
        element: <DashboardLayout sidebar={<AdminSidebar />} />,
        children: [
            {
                path: 'overview',
                element: <AdminDashboard />
            }
        ]
    }
])

export default Router;