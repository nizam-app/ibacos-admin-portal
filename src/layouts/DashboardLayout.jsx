// src/layouts/DashboardLayout.jsx

import { Outlet } from "react-router-dom";

// Helper function to get user initials
const getUserInitials = () => {
  try {
    const rawUser = localStorage.getItem("user");
    if (!rawUser) return "U";
    const user = JSON.parse(rawUser);
    const name = user?.name || "";
    if (!name) return "U";
    
    // Get first letter of first name and first letter of last name
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  } catch (e) {
    console.error("Failed to get user initials", e);
    return "U";
  }
};

const DashboardLayout = ({ sidebar }) => {
  const userInitials = getUserInitials();

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f6f8]">
      {/* TOP BAR */}
      <header className="h-16 z-10 bg-white shadow-md  flex items-center justify-between px-6">
        {/* LEFT: LOGO */}
        <div className="flex items-center">
          {/* public ফোল্ডারে logo রাখবে (নিচে বলছি) */}
          <img
            src="/IBACOS-full.png"  // logo path
            alt="IBACOS Services"
            className="h-8"
          />
        </div>

        {/* RIGHT: NOTIFICATION + AVATAR */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <span className="text-xl">🔔</span>
            <span className="absolute -top-1 -right-1 bg-[#c20001] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
              3
            </span>
          </div>

          <div className="w-9 h-9 rounded-full bg-[#c20001] text-white flex items-center justify-center text-sm font-semibold">
            {userInitials}
          </div>
        </div>
      </header>

      {/* BODY: SIDEBAR + MAIN CONTENT */}
      <div className="flex flex-1">
        {/* LEFT SIDEBAR */}
        <aside className="w-64 bg-white">
          {sidebar}
        </aside>

        {/* RIGHT MAIN AREA */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
