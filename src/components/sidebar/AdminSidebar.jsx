// src/components/sidebar/AdminSidebar.jsx
import { NavLink, useNavigate } from "react-router-dom";
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
  Users2,
} from "lucide-react";
import Swal from "sweetalert2";
import { logoutApi } from "../../api/authApi";

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
  const navigate = useNavigate();

  const handleLogout = async (e) => {
    e.preventDefault();

    // SweetAlert confirm
    const result = await Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to logout from Admin?",
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
        <NavLink to="/admin/customer-management" className={getLinkClasses}>
          <Users2 className="h-4 w-4" />
          <span>Customers Management</span>
        </NavLink>
      </div>

      {/* Logout */}
      <a
        href="#logout"
        onClick={handleLogout}
        className="mt-4 flex items-center gap-2 px-4 py-2 text-[#c20001] text-sm font-medium hover:bg-red-200 rounded-lg"
      >
        <span>↩</span>
        <span>Logout</span>
      </a>
    </nav>
  );
};

export default AdminSidebar;
