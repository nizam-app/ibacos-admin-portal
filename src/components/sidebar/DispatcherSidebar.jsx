// src/components/sidebar/DispatcherSidebar.jsx
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Truck,
  DollarSign,
  Users,
  LogOut,
  Briefcase,
} from "lucide-react";
import { logoutApi } from "../../api/authApi";
import Swal from "sweetalert2";

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

  const navigate = useNavigate();

  const handleLogout = async (e) => {
    e.preventDefault();

    // SweetAlert confirm
    const result = await Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to logout from Dispatcher?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#c20001",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, logout",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      await logoutApi();
    } catch (err) {
      console.error("Logout failed", err);
      // error alert
      await Swal.fire({
        title: "Logout failed",
        text:
          err.response?.data?.message ||
          "Something went wrong while logging out.",
        icon: "error",
        confirmButtonColor: "#c20001",
      });
      return;
    }

    // localStorage clear
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // success alert
    await Swal.fire({
      title: "Logged out",
      text: "You have been logged out successfully.",
      icon: "success",
      confirmButtonColor: "#c20001",
      timer: 1500,
      showConfirmButton: false,
    });

    navigate("/");
  };
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

        <NavLink to="/dispatcher/specializations" className={getLinkClasses}>
          <Briefcase className="h-4 w-4" />
          <span>Specializations</span>
        </NavLink>
        <div className="border-t border-gray-300 pt-4">
          <a
            href="#logout"
            onClick={handleLogout}
            className="mt-4 flex items-center gap-2 px-4 py-2 text-[#c20001] text-sm font-medium hover:bg-red-200 rounded-lg"
          >
            <span>↩</span>
            <span>Logout</span>
          </a>
        </div>
      </div>

      {/* logout button – always bottom */}

    </nav>

  );
};

export default DispatcherSidebar;
