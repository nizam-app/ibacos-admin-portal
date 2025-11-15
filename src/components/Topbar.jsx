const Topbar = () => {
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
          CA
        </div>
      </div>
    </header>
  );
};

export default Topbar;
