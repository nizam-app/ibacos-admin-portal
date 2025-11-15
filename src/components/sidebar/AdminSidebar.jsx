// src/components/sidebar/AdminSidebar.jsx
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Truck,
  DollarSign,
  Wallet,
  Users,
  BarChart3,
  ScrollText,
  UserCog,
  Layers,
  Percent,
  LogOut,
} from "lucide-react";

const linkBaseClasses =
  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors";

const getLinkClasses = ({ isActive }) =>
  [
    linkBaseClasses,
    isActive
      ? "bg-[#c20001] text-white"
      : "text-gray-700 hover:text-gray-900 hover:bg-gray-100",
  ].join(" ");

const AdminSidebar = () => {
  return (
    <nav className="flex h-full flex-col py-4">
      {/* main menu */}
      <div className="space-y-1 px-3">
        <NavLink to="/admin/overview" className={getLinkClasses}>
          <LayoutDashboard className="h-4 w-4" />
          <span>Overview</span>
        </NavLink>

        <NavLink to="/admin/service-requests" className={getLinkClasses}>
          <FileText className="h-4 w-4" />
          <span>Service Requests</span>
        </NavLink>

        <NavLink to="/admin/work-orders" className={getLinkClasses}>
          <Truck className="h-4 w-4" />
          <span>Work Orders</span>
        </NavLink>

        <NavLink to="/admin/payments" className={getLinkClasses}>
          <DollarSign className="h-4 w-4" />
          <span>Payments</span>
        </NavLink>

        <NavLink to="/admin/payout-management" className={getLinkClasses}>
          <Wallet className="h-4 w-4" />
          <span>Payout Management</span>
        </NavLink>

        <NavLink to="/admin/technicians" className={getLinkClasses}>
          <Users className="h-4 w-4" />
          <span>Technicians</span>
        </NavLink>

        <NavLink to="/admin/reports" className={getLinkClasses}>
          <BarChart3 className="h-4 w-4" />
          <span>Reports</span>
        </NavLink>

        <NavLink to="/admin/audit-log" className={getLinkClasses}>
          <ScrollText className="h-4 w-4" />
          <span>Audit Log</span>
        </NavLink>

        <NavLink to="/admin/user-management" className={getLinkClasses}>
          <UserCog className="h-4 w-4" />
          <span>User Management</span>
        </NavLink>

        <NavLink to="/admin/categories-services" className={getLinkClasses}>
          <Layers className="h-4 w-4" />
          <span>Categories &amp; Services</span>
        </NavLink>

        <NavLink to="/admin/commission-bonus" className={getLinkClasses}>
          <Percent className="h-4 w-4" />
          <span>Commission &amp; Bonus</span>
        </NavLink>
      </div>

      {/* logout – bottom fixed */}
      <div className="mt-auto border-t border-gray-200 pt-4 px-3">
        <NavLink
          to="/logout"
          className={({ isActive }) =>
            [
              linkBaseClasses,
              "text-red-600 hover:text-red-700 hover:bg-red-50",
              isActive && "bg-red-50",
            ]
              .filter(Boolean)
              .join(" ")
          }
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default AdminSidebar;
