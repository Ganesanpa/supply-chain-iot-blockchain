import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";

import { useAuth } from "../context/AuthContext";
import { loginUser } from "../services/api/auth";
import { FiMail, FiLock,FiEye, FiEyeOff  } from "react-icons/fi";
import { useEffect } from "react";

import Loginimage from "../assets/Login.json";
import Lottie from 'react-lottie-player';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
const [showPassword, setShowPassword] = useState(false);
const [rememberMe, setRememberMe] = useState(false);
  useEffect(() => {
  const savedEmail = localStorage.getItem("rememberedEmail");
  if (savedEmail) {
    setEmail(savedEmail);
    setRememberMe(true);
  }
}, []);

const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await loginUser({ email, password });

      if (!res.token) {
        alert(res.message || "Login failed");
        return;
      }

      login(res);
      navigate(`/dashboard/${res.user.role.toLowerCase()}`);
    } catch (error) {
      console.error("LOGIN ERROR:", error);
      alert(error?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  if (rememberMe) {
    localStorage.setItem("rememberedEmail", email);
  } else {
    localStorage.removeItem("rememberedEmail");
  }
}, [rememberMe, email]);
  return (
   <div className="min-h-screen bg-gradient-to-br from-emerald-700 via-green-600 to-lime-500 flex items-center justify-center px-4 py-6 sm:py-10">

  {/* BACK BUTTON */}
  <button
    onClick={() => navigate("/")}
    className="fixed top-3 left-3 sm:top-4 sm:left-4 z-50 bg-green-600 text-white px-3 py-2 sm:px-4 rounded-xl shadow-lg hover:bg-green-700 transition flex items-center gap-2 font-semibold text-sm sm:text-base"
  >
    ⬅️
  </button>

  <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 bg-white/90 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">

    {/* LEFT PANEL (hide on small screens) */}
    <div className="hidden md:flex flex-col items-center justify-center">

      <div className="w-[80%] max-w-[350px]">
        <Lottie
          loop
          play
          animationData={Loginimage}
          style={{ width: "100%", height: "100%" }}
        />
      </div>

    </div>

    {/* RIGHT PANEL */}
    <div className="p-6 sm:p-8 md:p-10 bg-white/80 backdrop-blur-xl">
      <div className="max-w-md mx-auto">

        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center">
          Login
        </h2>

        <p className="text-center text-gray-500 mt-2 mb-6 sm:mb-8 text-sm sm:text-base">
          Access your dashboard securely
        </p>
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* EMAIL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>

                <div className="relative">
                  <FiMail className="absolute left-3 top-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                    className="w-full pl-10 border border-gray-300 p-3 rounded-xl 
                    focus:border-green-500 focus:ring-2 focus:ring-green-100 
                    outline-none shadow-sm transition"
                  />
                </div>
              </div>

              {/* PASSWORD */}
             <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Password
  </label>

  <div className="relative">
    <FiLock className="absolute left-3 top-4 text-gray-400" />

    <input
      type={showPassword ? "text" : "password"}
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
      placeholder="Enter your password"
      className="w-full pl-10 pr-10 border border-gray-300 p-3 rounded-xl 
      focus:border-green-500 focus:ring-2 focus:ring-green-100 
      outline-none shadow-sm transition"
    />

    {/* 👁 Toggle */}
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
    >
      {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
    </button>
  </div>
</div>
<div className="flex items-center justify-between text-sm">

  {/* Remember Me */}
  <label className="flex items-center gap-2 cursor-pointer">
    <input
      type="checkbox"
      checked={rememberMe}
      onChange={() => setRememberMe(!rememberMe)}
      className="accent-green-600"
    />
    <span className="text-gray-600">Remember me</span>
  </label>

  {/* Forgot Password (optional link) */}
  <span className="text-green-700 hover:underline cursor-pointer">
    Forgot password?
  </span>
</div>
              {/* BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-500 
                text-white py-3 rounded-xl font-semibold 
                hover:scale-[1.02] hover:shadow-lg 
                hover:from-green-700 hover:to-emerald-600 
                disabled:opacity-70 transition-all duration-300"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            {/* LINKS */}
            <p className="text-center text-sm text-gray-600 mt-6">
              New user?{" "}
              <Link
                to="/register"
                className="text-green-700 font-semibold hover:underline"
              >
                Register here
              </Link>
            </p>

            <p className="text-center text-sm text-gray-500 mt-3">
              Farm Supply Chain Tracking System
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;