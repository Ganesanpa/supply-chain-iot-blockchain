import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import logo from "../assets/logo.png";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const navLink = (path) =>
    `relative px-2 py-1 transition duration-300 ${
      location.pathname === path
        ? "text-green-300"
        : "text-gray-300 hover:text-white"
    }`;

  return (
    <nav className="fixed w-full top-0 z-50 bg-gray-900/60 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-4 flex justify-between items-center text-white">

        {/* 🔥 Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src={logo}
            alt="Farm SCM Logo"
            className="h-10 w-10 object-contain group-hover:scale-105 transition"
          />
          <span className="text-lg md:text-xl font-semibold tracking-wide hidden sm:block">
            Farm SCM
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link to="/" className={navLink("/")}>Home</Link>
          <Link to="/verify" className={navLink("/verify")}>Verify</Link>
          <Link to="/about" className={navLink("/about")}>About</Link>

          {/* CTA */}
          <Link
            to="/login"
            className="bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-2 rounded-xl font-semibold shadow-lg hover:scale-105 hover:shadow-green-500/30 transition"
          >
            Login
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-3xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden bg-gray-900/95 backdrop-blur-xl border-t border-white/10 px-6 transition-all duration-300 ${
          menuOpen ? "max-h-96 py-6 opacity-100" : "max-h-0 overflow-hidden opacity-0"
        }`}
      >
        <div className="flex flex-col gap-5 text-center text-sm font-medium text-white">
          <Link to="/" onClick={() => setMenuOpen(false)} className={navLink("/")}>Home</Link>
          <Link to="/verify" onClick={() => setMenuOpen(false)} className={navLink("/verify")}>Verify</Link>
          <Link to="/about" onClick={() => setMenuOpen(false)} className={navLink("/about")}>About</Link>

          <Link
            to="/login"
            onClick={() => setMenuOpen(false)}
            className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-2 rounded-xl font-semibold mt-2"
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;