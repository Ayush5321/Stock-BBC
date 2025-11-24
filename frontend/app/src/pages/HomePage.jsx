import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Navbar from "../components/navbar";
import nav_ss from "../assets/nav_ss.png";
import AuthForm from "../components/AuthForm";
import FundCard from "../components/FundCard";
import Hero from "../components/Hero";
import { useAuth } from "../contexts/AuthContext";
import Footer from "../components/Footer";
import BASE_URL from "../config";

const fallbackFunds = [
  {
    scheme_name:
      "ICICI Prudential Regular Gold Savings Fund (FOF) - Direct Plan -  Growth",
    scheme_code: "120685",
    gain_1d: 2.34,
    gain_1q: 12.63,
    vr_rating: "***",
    vr_stars: 3,
    risk_rating: 8.1,
    expense_ratio_s_d: 0.09,
    fund_size: 2056.5473,
    date_of_inception: "01-Jan-13",
    sharpe_ratio: 0.2885,
  },
  {
    scheme_name: "Quantum Gold Savings Fund - Direct Plan Growth Option",
    scheme_code: "115132",
    gain_1d: 2.37,
    gain_1q: 12.59,
    vr_rating: "***",
    vr_stars: 3,
    risk_rating: 8.1,
    expense_ratio_s_d: 0.03,
    fund_size: 192.173,
    date_of_inception: "19-May-11",
    sharpe_ratio: 0.2675,
  },
  {
    scheme_name: "Kotak Gold Fund Growth - Direct",
    scheme_code: "119781",
    gain_1d: 2.2,
    gain_1q: 12.42,
    vr_rating: "***",
    vr_stars: 3,
    risk_rating: 8.1,
    expense_ratio_s_d: 0.16,
    fund_size: 3028.3206,
    date_of_inception: "01-Jan-13",
    sharpe_ratio: 0.2953,
  },
  {
    scheme_name: "HDFC Gold ETF Fund of Fund - Direct Plan",
    scheme_code: "119132",
    gain_1d: 2.02,
    gain_1q: 12.41,
    vr_rating: "*****",
    vr_stars: 5,
    risk_rating: 8.1,
    expense_ratio_s_d: 0.18,
    fund_size: 3870.9044,
    date_of_inception: "31-Dec-12",
    sharpe_ratio: 0.3051,
  },
  {
    scheme_name: "Invesco India Gold ETF FoF - Direct Plan- - Growth",
    scheme_code: "120531",
    gain_1d: 2.05,
    gain_1q: 12.34,
    vr_rating: "****",
    vr_stars: 4,
    risk_rating: 8.1,
    expense_ratio_s_d: 0.1,
    fund_size: 155.4795,
    date_of_inception: "01-Jan-13",
    sharpe_ratio: 0.2877,
  },
  {
    scheme_name: "Axis Gold Fund - Direct Plan - Growth option",
    scheme_code: "120473",
    gain_1d: 2.03,
    gain_1q: 12.24,
    vr_rating: "****",
    vr_stars: 4,
    risk_rating: 8.1,
    expense_ratio_s_d: 0.17,
    fund_size: 1032.7855,
    date_of_inception: "01-Jan-13",
    sharpe_ratio: 0.3054,
  },
];
export default function App() {
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [funds, setFunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [navData, setNavData] = useState({});

  useEffect(() => {
    axios
      .get(`${BASE_URL}/mutual-fund/recommendations`)
      .then((res) => {
        const enrichedFunds = res.data.map((fund) => ({
          ...fund,
          navImage: nav_ss,
        }));
        console.log("Funds fetched from backend:", enrichedFunds);
        setFunds(enrichedFunds);
        setLoading(false);
        const schemeCodes = enrichedFunds.map((f) => f.scheme_code);
        console.log("Scheme codes:", schemeCodes);
        
        // Build query string manually to ensure proper format
        const queryString = schemeCodes.map((c) => `scheme_code=${encodeURIComponent(c)}`).join("&");
        console.log("Query string:", queryString);
        console.log("Full URL:", `${BASE_URL}/mutual-fund/quarter-nav?${queryString}`);
        
        axios
          .get(`${BASE_URL}/mutual-fund/quarter-nav?${queryString}`)
          .then((res) => {
            const navData = res.data;
            setNavData(navData);
            console.log("NAV data fetched from backend:", navData);
          })
          .catch((err) => console.error("NAV fetch failed", err));
      })
      .catch((err) => {
        console.warn("⚠️ Backend not reachable, using fallback data.");
        const fallback = fallbackFunds;
        setFunds(fallback);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      <Navbar onShowForm={() => setShowForm(true)} />
      {showForm && <AuthForm closeForm={() => setShowForm(false)} />}
      <div className="w-full h-[400px] sm:h-[450px] md:h-[550px] pt-10">
        <Hero />
      </div>

      <main className="max-w-7xl mx-auto px-6 pt-2 pb-10">
        <h1 className="text-3xl sm:text-4xl font-semibold text-gray-800 mb-6 text-center">
          Featured <span className="text-blue-600">Mutual Funds</span>
        </h1>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="w-10 h-10 border-4 border-blue-500 border-dashed rounded-full animate-spin" />
            <span className="ml-3 text-gray-600 text-lg">Loading funds...</span>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            id="recommendations"
          >
            {funds.map((fund, index) => (
              <div
                key={index}
                className="transition-transform transform hover:-translate-y-1 hover:shadow-xl"
              >
                <FundCard
                  {...fund}
                  navHistory={navData[fund.scheme_code]}
                  onClick={() => {
                    if (user) {
                      // window.open("/fund-details", "_blank");
                      // window.open("/explore", "_blank");
                      navigate(`/explore/${fund.scheme_code}`);
                    } else {
                      setShowForm(true);
                    }
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
