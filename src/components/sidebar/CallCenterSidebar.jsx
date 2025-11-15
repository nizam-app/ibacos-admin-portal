// src/components/sidebar/CallCenterSidebar.jsx
import { NavLink } from "react-router-dom";

const baseItem =
  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium";

const CallCenterSidebar = () => {
  return (
    <div className="h-full flex flex-col p-4 border-r-1 border-r-neutral-100">
      {/* উপরের nav আইটেমগুলো */}
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

      {/* নিচের Logout */}
      <NavLink
        to="/logout"
        className="mt-4 flex items-center gap-2 px-4 py-2 text-[#c20001] text-sm font-medium hover:bg-red-200 rounded-lg"
      >
        <span>↩</span>
        <span>Logout</span>
      </NavLink>
    </div>
  );
};

export default CallCenterSidebar;
