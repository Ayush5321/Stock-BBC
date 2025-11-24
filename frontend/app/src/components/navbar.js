import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  FaUserCircle,
  FaSignOutAlt,
  FaEdit,
  FaSignInAlt,
} from "react-icons/fa";

const Navbar = ({ onShowForm }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "My Portfolio", path: "/portfolio" },
    { label: "Watchlist", path: "/watchlist" },
    { label: "Explore Funds", path: "/search" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl sm:text-3xl font-extrabold tracking-tight"
        >
          <span className="text-blue-500">Fund</span>
          <span className="text-gray-800">Scope</span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex space-x-6">
          {navItems.map((item) => (
            // <Link
            //   key={item.path}
            //   to={item.path}
            //   className="text-gray-700 hover:text-blue-600 font-medium transition"
            // >
            //   {item.label}
            // </Link>
            <Link
              key={item.path}
              to={item.path}
              className={`font-medium transition ${
                location.pathname === item.path
                  ? "text-blue-600 font-semibold"
                  : "text-gray-700 hover:text-blue-600"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Account Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full transition"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <FaUserCircle className="text-lg text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              {user ? "My Account" : "Sign In"}
            </span>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-3 w-72 bg-white text-black rounded-2xl shadow-lg z-50 border border-gray-200 animate-fade-in">
              <div className="flex justify-between items-center px-5 py-3 border-b border-gray-200">
                <div>
                  <p className="text-sm text-gray-600">Signed in as</p>
                  <p className="font-semibold text-base">
                    {user
                      ? user.displayName || user.email.split("@")[0]
                      : "Guest"}
                  </p>
                </div>
                <button
                  onClick={() => setShowDropdown(false)}
                  className="text-gray-400 hover:text-gray-700 text-xl font-bold"
                >
                  &times;
                </button>
              </div>

              <div className="flex flex-col py-3 px-4 space-y-2">
                {user ? (
                  <>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 text-sm px-4 py-2 rounded-md hover:bg-gray-100 transition"
                    >
                      <FaEdit className="text-gray-500" /> Edit Profile
                    </Link>
                    <button
                      className="flex items-center gap-2 text-sm px-4 py-2 rounded-md hover:bg-gray-100 transition"
                      onClick={logout}
                    >
                      <FaSignOutAlt className="text-gray-500" /> Logout
                    </button>
                  </>
                ) : (
                  <button
                    className="flex items-center gap-2 text-sm px-4 py-2 rounded-md hover:bg-gray-100 transition"
                    onClick={() => {
                      onShowForm?.();
                      navigate("/signup");
                      setShowDropdown(false);
                    }}
                  >
                    <FaSignInAlt className="text-gray-500" /> Sign In / Register
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
