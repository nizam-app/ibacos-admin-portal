// src/pages/login/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";

const Login = () => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axiosClient.post("/auth/login", {
        phone,
        password,
      });

      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // role অনুযায়ী redirect
      if (user.role === "CALL_CENTER") {
        navigate("/call-center/dashboard");
      } else if (user.role === "DISPATCHER") {
        navigate("/dispatcher/overview");
      } else if (user.role === "ADMIN") {
        navigate("/admin/overview");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      if (err.response?.status === 401) {
        setError("Invalid phone or password.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#ffb111]/10 via-white to-[#c20001]/10 p-4">
      <div className="bg-white text-gray-200 flex flex-col gap-6 rounded-xl border w-full max-w-md shadow-lg">
        <div className="grid grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 space-y-3 text-center">
          <div className="flex justify-center mb-2">
            <img src="/IBACOS.png" alt="IBACOS Logo" className="w-24 h-24" />
          </div>
          <h4 className="text-lg font-semibold text-[#c20001]">
            IBACOS Services
          </h4>
          <p className="text-gray-500">Sign in to access the dashboard</p>
        </div>

        <div className="px-6 pb-6 text-gray-900">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium">
                Phone
              </label>
              <input
                id="phone"
                type="text"
                required
                placeholder="Enter your phone"
                autoComplete="tel"
                className="w-full h-9 bg-gray-100 border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-[1px] focus:ring-[#ffb111]"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                placeholder="Enter your password"
                autoComplete="current-password"
                className="w-full h-9 bg-gray-100 border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-[1px] focus:ring-[#ffb111]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="text-[#c20001] text-sm font-medium hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-9 px-4 py-2 bg-[#c20001] text-white text-sm font-medium rounded-md hover:bg-[#a80000] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
