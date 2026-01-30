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

const Topbar = () => {
  const userInitials = getUserInitials();

  return (
    <header className="h-16 bg-white flex items-center justify-end px-6 shadow-sm">
      <div className="flex items-center gap-4">
        {/* notification icon */}
        <div className="relative">
          <span className="text-xl">🔔</span>
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
            3
          </span>
        </div>

        {/* user avatar */}
        <div className="w-9 h-9 rounded-full bg-[#c20001] text-white flex items-center justify-center text-sm font-semibold">
          {userInitials}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
