import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/api/auth";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import registerAnimation from "../assets/Login (1).json";
import Lottie from 'react-lottie-player';
function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    role: "farmer",
    email: "",
    password: "",
    address: "",
    lat: null,
    lng: null,
  });

  const [loading, setLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported in this browser.");
      return;
    }

    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((prev) => ({
          ...prev,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }));
        setLoadingLocation(false);
        alert("Location captured successfully 📍");
      },
      (error) => {
        console.error("Location error:", error);
        setLoadingLocation(false);
        alert("Unable to fetch location");
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await registerUser(form);

      alert(res.message || "Registration successful");
      navigate("/login");
    } catch (err) {
      console.log("REGISTER ERROR:", err.response?.data || err.message);
      alert(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (<div className="min-h-screen flex items-center justify-center px-4 py-6 sm:py-10 bg-gradient-to-br from-emerald-700 via-green-600 to-lime-500">

  <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 bg-white rounded-3xl overflow-hidden shadow-2xl">

    {/* LEFT PANEL */}
    <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-green-700 to-emerald-900 text-white p-6 relative overflow-hidden">

      {/* Glow Effects */}
      <div className="absolute w-40 h-40 sm:w-48 sm:h-48 bg-green-400/20 rounded-full blur-3xl top-10 left-10 animate-pulse"></div>
      <div className="absolute w-40 h-40 sm:w-48 sm:h-48 bg-emerald-300/20 rounded-full blur-3xl bottom-10 right-10 animate-pulse"></div>

      {/* Text */}
      <div className="z-10 text-center mb-6 px-4">
        <h2 className="text-xl sm:text-2xl font-bold">Join Our Network</h2>
        <p className="text-green-200 mt-2 text-sm">
          Smart supply chain starts here
        </p>
      </div>

      {/* Animation */}
      <div className="w-full max-w-[300px] sm:max-w-[360px] aspect-square z-10">
        <Lottie
          loop
          play
          animationData={registerAnimation}
          style={{ width: "100%", height: "100%" }}
        />
      </div>

      <div className="z-10 text-center text-xs text-green-300 mt-6 px-4">
        Connecting farmers, distributors & retailers seamlessly 🚜
      </div>
    </div>

    {/* RIGHT PANEL */}
    <div className="p-5 sm:p-6 md:p-8 flex flex-col justify-center">

      {/* Mobile animation */}
      <div className="md:hidden flex justify-center mb-4">
        <div className="w-[180px] sm:w-[240px]">
          <Lottie
            loop
            play
            animationData={registerAnimation}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      </div>

      <div className="max-w-md mx-auto w-full">

        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center">
          Create Account
        </h2>

        <p className="text-center text-gray-500 mt-2 mb-5 sm:mb-6 text-sm sm:text-base">
          Register to access your dashboard
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* INPUTS → ADD text-base */}
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Full Name"
            required
            className="w-full border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none p-3 rounded-xl text-base"
          />

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none p-3 rounded-xl text-base"
          >
            <option value="farmer">Farmer</option>
            <option value="distributor">Distributor</option>
            <option value="warehouse">Warehouse</option>
            <option value="retailer">Retailer</option>
          </select>

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email Address"
            required
            className="w-full border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none p-3 rounded-xl text-base"
          />

          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            required
            className="w-full border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none p-3 rounded-xl text-base"
          />

          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Address"
            rows={3}
            className="w-full border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none p-3 rounded-xl resize-none text-base"
          />

          {/* LOCATION BOX (fixed overflow issue) */}
          <div className="bg-gray-50 border rounded-2xl p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

              <div>
                <p className="font-semibold text-gray-800">
                  Location Info
                </p>
                <p className="text-sm text-gray-500">
                  Save your current location
                </p>
              </div>

              <button
                type="button"
                onClick={handleGetLocation}
                disabled={loadingLocation}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-xl text-sm"
              >
                {loadingLocation ? "Getting..." : "Use My Location"}
              </button>
            </div>

            <div className="mt-3 text-sm">
              {form.lat && form.lng ? (
                <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-3">
                  📍 Location captured
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-xl p-3">
                  Not captured yet
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-70 text-white py-3 rounded-xl font-semibold transition"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-green-700 font-semibold hover:underline">
            Login
          </Link>
        </p>

      </div>
    </div>
  </div>
</div>
  );
}

export default Register;