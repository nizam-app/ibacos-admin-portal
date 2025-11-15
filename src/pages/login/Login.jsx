import { useState } from 'react';

const Login = () => {
  const [role, setRole] = useState('Call Center Agent');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ role, username, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#ffb111]/10 via-white to-[#c20001]/10 p-4">
      <div className="bg-white text-gray-200 flex flex-col gap-6 rounded-xl border w-full max-w-md shadow-lg">
        {/* Header */}
        <div className="grid grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 space-y-3 text-center">
          <div className="flex justify-center mb-2">
            <img src="/IBACOS.png" alt="IBACOS Logo" className="w-24 h-24" />
          </div>
          <h4 className="text-lg font-semibold text-[#c20001]">IBACOS Services</h4>
          <p className=" text-gray-500">Sign in to access the dashboard</p>
        </div>

        {/* Form */}
        <div className="px-6 pb-6 text-gray-900">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Role Dropdown */}
            <div className="space-y-2">
              <label htmlFor="role" className="block text-sm font-medium">
                Role
              </label>
              <select
                id="role"
                className="w-full bg-gray-100 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-[1px] focus:ring-[#ffb111]"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option>Call Center Agent</option>
                <option>Dispatcher</option>
                <option>Administrator</option>
              </select>
            </div>

            {/* Username */}
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium">
                Username
              </label>
              <input
                id="username"
                type="text"
                required
                placeholder="Enter your username"
                className="w-full h-9 bg-gray-100 border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-[1px] focus:ring-[#ffb111]"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                placeholder="Enter your password"
                className="w-full h-9 bg-gray-100 border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-[1px] focus:ring-[#ffb111]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <a href="#" className="text-[#c20001] text-sm font-medium hover:underline">
                Forgot Password?
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full h-9 px-4 py-2 bg-[#c20001] text-white text-sm font-medium rounded-md hover:bg-[#a80000] transition"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
