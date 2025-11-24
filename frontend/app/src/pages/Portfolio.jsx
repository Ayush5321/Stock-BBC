import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom"; // Assuming you use react-router for navigation

// Import Components
import Navbar from "../components/navbar";
import Footer from "../components/Footer";
import Chart from "../components/Chart";
import DonutChart from "../components/DonutChart";
import BarChart from "../components/BarChart";

import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import { FiDollarSign, FiBarChart2, FiList } from "react-icons/fi";
import BASE_URL from "../config";
import { useAuth } from "../contexts/AuthContext";

// --- Mock/Placeholder Components for Demonstration ---
// In your actual project, these would be your real chart components.

// const Chart = ({ data }) => <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">Chart with {data.length} data points</div>;
// const DonutChart = ({ data }) => <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">Donut Chart: {data.map(d => d.label).join(', ')}</div>;
// const BarChart = ({ data }) => <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">Bar Chart: {data.length} holdings</div>;
// const Navbar = () => <div className="fixed top-0 left-0 w-full h-16 bg-white shadow z-50 flex items-center px-6"><p>Navbar</p></div>;
// const Footer = () => <div className="mt-12 py-8 bg-gray-100 text-center"><p>Footer</p></div>;

// --- Helper function to process data for charts ---
const processCompositionData = (funds = []) => {
  // 1. Top Holdings by Value (for Bar Chart)
  console.log(funds);
  const topHoldings = [...funds]
    .sort((a, b) => b.currentValue - a.currentValue)
    .slice(0, 5) // Get top 5 funds
    .map((fund) => ({
      label: fund.schemeCode.split(" ").slice(0, 3).join(" "),
      value: fund.currentValue,
    }));

  // 2. Asset Allocation (for Donut Chart)
  // NOTE: The provided API doesn't give asset category per fund.
  // We are SIMULATING this by inferring from the scheme name.
  // In a real-world scenario, you would fetch this detail for each schemeCode.
  const assetAllocation = funds.reduce((acc, fund) => {
    let category = "Other";
    const name = fund.schemeCode.toLowerCase();
    if (name.includes("equity")) category = "Equity";
    else if (name.includes("debt") || name.includes("bond")) category = "Debt";
    else if (name.includes("hybrid") || name.includes("balanced"))
      category = "Hybrid";
    else if (name.includes("gold")) category = "Commodity";

    acc[category] = (acc[category] || 0) + fund.currentValue;
    return acc;
  }, {});

  const assetAllocationData = Object.entries(assetAllocation).map(
    ([label, value]) => ({
      label,
      value,
    }),
  );

  return { topHoldings, assetAllocationData };
};

export default function PortfolioPage() {
  const { user } = useAuth();

  const [portfolioSummary, setPortfolioSummary] = useState(null);
  const [portfolioHistory, setPortfolioHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPortfolioData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await user.getIdToken();
        const [summaryRes, historyRes] = await Promise.all([
          fetch(`${BASE_URL}/user/portfolio/summary`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${BASE_URL}/user/portfolio/history`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (!summaryRes.ok || !historyRes.ok) {
          throw new Error("Failed to fetch portfolio data.");
        }

        const summaryData = await summaryRes.json();
        const historyData = await historyRes.json();

        setPortfolioSummary(summaryData);
        // Assuming history API returns an object like { history: [...] }
        console.log(historyData);
        setPortfolioHistory(historyData || []);
      } catch (err) {
        setError(err.message);
        console.error("Portfolio fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioData();
  }, [BASE_URL]);

  // Memoize processed chart data to avoid re-calculation on every render
  const compositionData = useMemo(
    () => processCompositionData(portfolioSummary?.funds),
    [portfolioSummary?.funds],
  );

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="pt-24 h-screen flex items-center justify-center">
          <p className="text-lg text-gray-600">Loading your portfolio...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="pt-24 h-screen flex items-center justify-center">
          <p className="text-lg text-red-600">Error: {error}</p>
        </div>
      </>
    );
  }

  if (!portfolioSummary || portfolioSummary.fund_count === 0) {
    return (
      <>
        <Navbar />
        <div className="pt-24 text-center">
          <h1 className="text-2xl font-bold">Your Portfolio is Empty</h1>
          <p className="text-gray-600 mt-2">
            Start by adding funds to see your portfolio here.
          </p>
        </div>
      </>
    );
  }

  const totalGainPercent =
    (portfolioSummary.total_gain /
      (portfolioSummary.total_value - portfolioSummary.total_gain)) *
    100;
  const isGainPositive = portfolioSummary.total_gain >= 0;

  return (
    <>
      <Navbar />

      <div className="pt-24 px-4 sm:px-6 max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
            My Portfolio
          </h1>
          <p className="text-gray-500 mt-1">
            An overview of your investments and performance.
          </p>
        </div>

        {/* Main Layout: Reverse row to put sidebar on the right for desktop */}
        <div className="flex flex-col md:flex-row-reverse gap-8">
          {/* Sidebar (Portfolio Summary) */}
          <aside className="w-full md:w-[350px] md:sticky md:top-24 self-start flex-shrink-0">
            <div className="bg-white border shadow-lg rounded-2xl p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Portfolio Summary
              </h2>

              <div className="mb-5">
                <p className="text-sm text-gray-500">Current Value</p>
                <p className="text-3xl font-semibold text-gray-800">
                  ₹{portfolioSummary.total_value.toLocaleString("en-IN")}
                </p>
              </div>

              <div className="mb-5">
                <p className="text-sm text-gray-500">Overall Gain / Loss</p>
                <p
                  className={`text-xl font-medium ${isGainPositive ? "text-green-600" : "text-red-600"}`}
                >
                  {isGainPositive ? (
                    <FaArrowUp className="inline -mt-1" />
                  ) : (
                    <FaArrowDown className="inline -mt-1" />
                  )}{" "}
                  ₹
                  {Math.abs(portfolioSummary.total_gain).toLocaleString(
                    "en-IN",
                  )}
                  <span className="text-base ml-2">
                    ({totalGainPercent.toFixed(2)}%)
                  </span>
                </p>
              </div>

              <hr className="my-5" />

              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex justify-between">
                  <span>Total Investment</span>{" "}
                  <strong className="text-gray-800">
                    ₹
                    {(
                      portfolioSummary.total_value - portfolioSummary.total_gain
                    ).toLocaleString("en-IN")}
                  </strong>
                </li>
                <li className="flex justify-between">
                  <span>Number of Funds</span>{" "}
                  <strong className="text-gray-800">
                    {portfolioSummary.fund_count}
                  </strong>
                </li>
              </ul>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-grow">
            <div className="space-y-8">
              {/* Portfolio Value Chart Section */}
              <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FiDollarSign /> Portfolio Value Trend
                </h3>
                <Chart data={portfolioHistory} />
              </div>

              {/* Portfolio Composition Section */}
              <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FiBarChart2 /> Portfolio Composition
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2 text-center">
                      Asset Allocation
                    </h4>
                    <DonutChart data={compositionData.assetAllocationData} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2 text-center">
                      Top Holdings by Value
                    </h4>
                    <BarChart data={compositionData.topHoldings} />
                  </div>
                </div>
              </div>

              {/* Detailed Holdings Table */}
              <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FiList /> All Holdings
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 bg-gray-50">
                      <tr>
                        <th className="p-3 font-medium">Fund Name</th>
                        <th className="p-3 font-medium text-right">Units</th>
                        <th className="p-3 font-medium text-right">
                          Current Value (₹)
                        </th>
                        <th className="p-3 font-medium text-right">Gain (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {portfolioSummary.funds.map((fund) => (
                        <tr
                          key={fund.schemeCode}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="p-3 font-medium text-gray-800">
                            <Link
                              to={`/fund/${fund.schemeCode}`}
                              className="hover:text-blue-600"
                            >
                              {fund.schemeName}
                            </Link>
                          </td>
                          <td className="p-3 text-right">{fund.units}</td>
                          <td className="p-3 text-right font-semibold text-gray-800">
                            {fund.currentValue.toLocaleString("en-IN")}
                          </td>
                          <td
                            className={`p-3 text-right font-semibold ${fund.gainPercent >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {fund.gainPercent.toFixed(2)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      <Footer />
    </>
  );
}
