// src/components/sidebar/DispatcherSidebar.jsx
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Truck,
  DollarSign,
  Users,
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

const DispatcherSidebar = () => {
  return (
    <nav className="h-full flex flex-col p-4 border-r-1 border-r-neutral-100">
      {/* main nav items */}
      <div className="space-y-1 px-3">
        <NavLink to="/dispatcher/overview" className={getLinkClasses}>
          <LayoutDashboard className="h-4 w-4" />
          <span>Overview</span>
        </NavLink>

        <NavLink
          to="/dispatcher/service-requests"
          className={getLinkClasses}
        >
          <FileText className="h-4 w-4" />
          <span>Service Requests</span>
        </NavLink>

        <NavLink to="/dispatcher/work-orders" className={getLinkClasses}>
          <Truck className="h-4 w-4" />
          <span>Work Orders</span>
        </NavLink>

        <NavLink to="/dispatcher/payments" className={getLinkClasses}>
          <DollarSign className="h-4 w-4" />
          <span>Payments</span>
        </NavLink>

        <NavLink to="/dispatcher/technicians" className={getLinkClasses}>
          <Users className="h-4 w-4 " />
          <span>Technicians</span>
        </NavLink>
        <div className="border-t border-gray-300 pt-4">
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
      </div>

      {/* logout button – always bottom */}
      
    </nav>
    
  );
};

export default DispatcherSidebar;
