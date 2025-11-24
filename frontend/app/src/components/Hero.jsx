import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Highlighter from "react-highlight-words";
import { MdTrendingUp, MdTrendingDown } from "react-icons/md";

import hero from "../assets/hero.jpg";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";

export default function Hero() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [portfolioSummary, setPortfolioSummary] = useState(null);
  const [isPortfolioNull, setIsPortfolioNull] = useState(false);
  const [isPositive, setIsPositive] = useState(false);

  const growthColor = isPositive
    ? "bg-green-100 text-green-700"
    : "bg-red-100 text-red-600";
  const growthIcon = isPositive ? <MdTrendingUp /> : <MdTrendingDown />;

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (user) {
        const token = await user.getIdToken();
        try {
          const res = await axios.get(
            "https://backend-r0n6.onrender.com/user/portfolio/summary",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (res.data === null) {
            // Todo: Maybe deal with this later for now set everything to 0.
            setPortfolioSummary({
              total_gain: 0,
              total_value: 0,
              fund_count: 0,
            });
            setIsPortfolioNull(true);
          } else {
            setPortfolioSummary(res.data);
            setIsPositive(res.data.total_gain >= 0);
          }
          setLoading(false);
        } catch (err) {
          setPortfolioSummary(null);
          setLoading(false);
          console.error("Failed to fetch portfolio summary:", err);
        }
      }
    };
    fetchPortfolio();
  }, [user]);

  if (!user) {
    // Non-logged-in Hero
    return (
      <section className="w-full h-full flex items-center justify-between bg-white px-6 md:px-16 lg:px-24">
        <div className="w-full md:w-3/5 flex flex-col justify-center gap-6">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight max-w-2xl">
            Powering the Future of{" "}
            <Highlighter
              searchWords={["Intelligent"]}
              autoEscape
              textToHighlight="Intelligent Fund Tracking"
              highlightStyle={{
                background: "none",
                textDecoration: "none",
                boxShadow: "inset 0 -0.4em 0 rgba(59, 130, 246, 0.4)",
                fontWeight: 650,
              }}
            />
          </h1>
          <p className="text-gray-600 text-base sm:text-lg max-w-xl">
            Get real-time insights, predictive analytics, and custom dashboards
            to make smarter investment decisions — all in one unified platform.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/signup")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full text-sm font-medium transition"
            >
              Sign Up
            </button>
            <button
              onClick={() => {
                const section = document.getElementById("recommendations");
                if (section) section.scrollIntoView({ behavior: "smooth" });
              }}
              className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-6 py-2 rounded-full text-sm font-medium transition"
            >
              Explore
            </button>
          </div>
        </div>
        <div className="hidden md:flex md:w-2/5 p-[2%] m-[1%]">
          <img
            src={hero}
            alt="Hero Graphic"
            className="w-full h-auto object-contain"
          />
        </div>
      </section>
    );
  }

  // Logged-in Hero
  return (
    <section className="w-full h-full flex items-center justify-center bg-white px-6 md:px-16 lg:px-20">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-12 py-12">
        {/* Left Text */}
        <div className="flex flex-col justify-center gap-6">
          <h1 className="text-2xl sm:text-5xl font-bold text-gray-900 leading-tight">
            Welcome back, {user.displayName || user.email.split("@")[0]}!
          </h1>

          <p className="text-gray-600 text-base sm:text-lg">
            Here’s a quick summary of your investments — keep track of your
            funds, monitor performance, and explore new opportunities, all in
            one place.
          </p>

          <div className="flex gap-4 pt-4">
            <button
              onClick={() => navigate("/portfolio")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full text-sm font-medium transition"
            >
              View My Portfolio
            </button>
            <button
              onClick={() => navigate("/explore")}
              className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-6 py-2 rounded-full text-sm font-medium transition"
            >
              Add Funds to Watchlist
            </button>
          </div>
        </div>

        {/* Right Side - Portfolio Summary Card */}
        <div className="w-3/5 relative bg-white/60 backdrop-blur-md border border-blue-200 rounded-2xl shadow-lg p-6 sm:p-8 text-gray-800 max-w-md mx-auto">
          {/* Top-centered circular image */}
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
            <div className="w-20 h-20 rounded-full border-4 border-white shadow-md overflow-hidden bg-white">
              <img
                src={require("../assets/portfolio.webp")}
                alt="Portfolio Icon"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Card Content */}
          <div className="pt-12 text-center">
            <h3 className="text-2xl font-semibold mb-6 text-blue-600 tracking-wide">
              My Portfolio
            </h3>

            {/* {!loading ? (
              <ul className="space-y-2 text-sm sm:text-base text-right text-gray-700 max-w-xs mx-auto">
                <li className="flex justify-between border-b pb-1">
                  <span className="text-gray-500">Portfolio Value:</span>
                  <span className="font-semibold text-gray-800">
                    ₹{portfolioSummary.total_value.toLocaleString()}
                  </span>
                </li>
                <li className="flex justify-between border-b pb-1">
                  <span className="text-gray-500">Return </span>
                  <span
                    className={`flex items-center gap-1 px-2 py-1 rounded-full font-medium text-xs ${growthColor}`}
                  >
                    {growthIcon} ₹{portfolioSummary.total_gain.toLocaleString()}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-500">Funds Tracked:</span>
                  <span className="font-semibold text-gray-800">
                    {portfolioSummary.fund_count}
                  </span>
                </li>
              </ul>
            ) : (
              <p className="text-gray-500 mt-4">
                Loading your portfolio summary...
              </p>
            )} */}
            {!loading ? (
              <ul className="space-y-2 text-sm sm:text-base text-right text-gray-700 max-w-xs mx-auto">
                <li className="flex justify-between border-b pb-1">
                  <span className="text-gray-500">Portfolio Value:</span>
                  <span className="font-semibold text-gray-800">
                    ₹{portfolioSummary?.total_value?.toLocaleString?.() ?? "0"}
                  </span>
                </li>
                <li className="flex justify-between border-b pb-1">
                  <span className="text-gray-500">Return</span>
                  <span
                    className={`flex items-center gap-1 px-2 py-1 rounded-full font-medium text-xs ${growthColor}`}
                  >
                    {growthIcon} ₹
                    {portfolioSummary?.total_gain?.toLocaleString?.() ?? "0"}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-500">Funds Tracked:</span>
                  <span className="font-semibold text-gray-800">
                    {portfolioSummary?.fund_count ?? 0}
                  </span>
                </li>
              </ul>
            ) : (
              <p className="text-gray-500 mt-4">
                Loading your portfolio summary...
              </p>
            )}
          </div>

          {/* Shine effect overlay */}
          <div className="absolute inset-0 rounded-2xl pointer-events-none bg-gradient-to-br from-blue-100/20 via-white/10 to-yellow-100/20" />
        </div>
      </div>
    </section>
  );
}
