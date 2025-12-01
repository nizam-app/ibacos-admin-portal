// src/components/sidebar/CallCenterSidebar.jsx
import { NavLink, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { logoutApi } from "../../api/authApi";

const baseItem =
  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium";

const CallCenterSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = async (e) => {
    e.preventDefault();

    // SweetAlert confirm
    const result = await Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to logout from Call Center?",
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
    <div className="h-full flex flex-col p-4 border-r-1 border-r-neutral-100">
      {/* top nav items */}
      <nav className="space-y-2 border-b-1 border-b-neutral-300 pb-4">
        <NavLink
          to="/call-center/dashboard"
          className={({ isActive }) =>
            `${baseItem} ${
              isActive
                ? "bg-[#c20001] text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`
          }
        >
          <span className="text-lg">▣</span>
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/call-center/create-sr"
          className={({ isActive }) =>
            `${baseItem} ${
              isActive
                ? "bg-[#c20001] text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`
          }
        >
          <span className="text-lg">＋</span>
          <span>Create SR</span>
        </NavLink>

        <NavLink
          to="/call-center/history"
          className={({ isActive }) =>
            `${baseItem} ${
              isActive
                ? "bg-[#c20001] text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`
          }
        >
          <span className="text-lg">⏱</span>
          <span>SR History</span>
        </NavLink>
      </nav>

      {/* Logout */}
      <a
        href="#logout"
        onClick={handleLogout}
        className="mt-4 flex items-center gap-2 px-4 py-2 text-[#c20001] text-sm font-medium hover:bg-red-200 rounded-lg"
      >
        <span>↩</span>
        <span>Logout</span>
      </a>
    </div>
  );
};

export default CallCenterSidebar;
