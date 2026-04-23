import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import logo from "../assets/logo.png";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const navLink = (path) =>
    `transition duration-200 ${
      location.pathname === path
        ? "text-green-400"
        : "hover:text-green-400"
    }`;

  return (
    <nav className="bg-gray-900/90 backdrop-blur-md text-white px-6 md:px-10 py-4 flex justify-between items-center shadow-md sticky top-0 z-50">
      
      {/* 🔥 Logo Section */}
      <Link to="/" className="flex items-center gap-3">
        <img
          src={logo}
          alt="Farm SCM Logo"
          className="h-12 w-12 object-contain"
        />
        <span className="text-xl font-bold tracking-wide hidden sm:block">
          Farm SCM
        </span>
      </Link>

      {/* Desktop Menu */}
      <div className="hidden md:flex gap-8 items-center text-sm font-medium">
        <Link to="/" className={navLink("/")}>Home</Link>
        <Link to="/verify" className={navLink("/verify")}>Verify</Link>
        <Link to="/about" className={navLink("/about")}>About</Link>

        <Link
          to="/login"
          className="bg-green-600 px-5 py-2 rounded-lg hover:bg-green-700 transition shadow"
        >
          Login
        </Link>
      </div>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden text-2xl"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        ☰
      </button>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute top-16 left-0 w-full bg-gray-900 flex flex-col items-center gap-6 py-6 md:hidden shadow-lg">
          <Link to="/" onClick={() => setMenuOpen(false)} className={navLink("/")}>Home</Link>
          <Link to="/verify" onClick={() => setMenuOpen(false)} className={navLink("/verify")}>Verify</Link>
          <Link to="/about" onClick={() => setMenuOpen(false)} className={navLink("/about")}>About</Link>

          <Link
            to="/login"
            onClick={() => setMenuOpen(false)}
            className="bg-green-600 px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Login
          </Link>
        </div>
      )}
    </nav>
  );
}

export default Navbar;