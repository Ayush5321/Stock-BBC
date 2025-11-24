import React from "react";
import { useNavigate } from "react-router-dom";
import { FaInstagram, FaFacebookF, FaGithub } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";

export default function Footer() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <footer className="bg-gradient-to-b from-white to-gray-100 text-gray-800 mt-24">
      {/* CTA Section - only if not logged in */}
      {!user && (
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 rounded-3xl text-white py-16 px-6 shadow-xl text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-blue-400">
              Ready to take control of your investments?
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-base sm:text-lg text-gray-300">
              Join thousands of investors who are tracking, comparing, and
              optimizing their mutual fund portfolios with ease.
            </p>
            <button
              onClick={() => navigate("/signup")}
              className="mt-6 px-6 py-3 rounded-full bg-white text-gray-900 font-semibold hover:bg-gray-200 transition text-sm sm:text-base"
            >
              Get Started
            </button>
          </div>
        </div>
      )}

      {/* Adjust spacing when user is logged in */}
      <div className={`${user ? "mt-20" : "mt-20"} pb-10 px-6`}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 text-sm sm:text-base">
          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">
              Contact Us
            </h3>
            <p>
              Email:{" "}
              <a
                href="mailto:stocktechm12@gmail.com"
                className="text-blue-600 hover:underline"
              >
                stocktechm12@gmail.com
              </a>
            </p>
            <p>
              Phone:{" "}
              <a
                href="tel:+919876543210"
                className="text-blue-600 hover:underline"
              >
                +91 98765 43210
              </a>
            </p>
            <p>Location: Hitec City, Hyderabad</p>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">
              Follow Us
            </h3>
            <div className="flex space-x-5 mt-2">
              <a
                href="https://instagram.com/fundvision"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-600 transition"
              >
                <FaInstagram size={22} />
              </a>
              <a
                href="https://facebook.com/fundvision"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-600 transition"
              >
                <FaFacebookF size={22} />
              </a>
              <a
                href="https://github.com/fundvision"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-600 transition"
              >
                <FaGithub size={22} />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">
              Navigate
            </h3>
            <ul className="space-y-2">
              <li
                className="cursor-pointer hover:text-blue-600 transition"
                onClick={() => navigate("/")}
              >
                Home
              </li>
              <li
                className="cursor-pointer hover:text-blue-600 transition"
                onClick={() => navigate("/portfolio")}
              >
                Portfolio
              </li>
              <li
                className="cursor-pointer hover:text-blue-600 transition"
                onClick={() => navigate("/watchlist")}
              >
                Watchlist
              </li>
              <li
                className="cursor-pointer hover:text-blue-600 transition"
                onClick={() => navigate("/explore")}
              >
                Explore Funds
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="border-t border-gray-300 text-center py-5 text-sm text-gray-500">
        © 2025 <span className="font-medium text-blue-600">FundScope</span>.
        All rights reserved.
      </div>
    </footer>
  );
}
