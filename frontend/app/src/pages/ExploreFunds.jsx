import React, { useRef, useState, useEffect } from "react";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";
import NavChartCompare from "../components/NavChartCompare";
import FundComparison from "../components/FundComparison";
import NavChart from "../components/NavChart"; // Assuming this is the correct path
import { FaTimes, FaRegBookmark, FaInfoCircle } from "react-icons/fa";
import { MdExpandLess, MdExpandMore } from "react-icons/md";
import { FiTrendingUp, FiShield, FiBriefcase } from "react-icons/fi";
import { FaCheck } from "react-icons/fa";
import axios from "axios";

import AddToPortfolio from "../components/AddToPortfolio";
import PortfolioVisuals from "../components/PortfolioVisuals";
import AuthForm from "../components/AuthForm";
import { useAuth } from "../contexts/AuthContext";
import fallbackData from "./fallback.json";
import { useParams } from "react-router-dom";
import BASE_URL from "../config";

const fundDetailsData = fallbackData.fundDetails;
const scorecardData = fallbackData.scorecardData;

const performanceData = {
  trailingReturns: [
    { period: "1Y", fund: 15.2, category: 14.1, benchmark: 14.8 },
    { period: "3Y", fund: 18.9, category: 17.5, benchmark: 18.2 },
    { period: "5Y", fund: 14.5, category: 13.8, benchmark: 14.1 },
  ],
  riskRatios: [
    { metric: "Sharpe Ratio", fund: 1.09, categoryAvg: 0.95 },
    { metric: "Beta", fund: 0.98, categoryAvg: 1.01 },
    { metric: "Jensen's Alpha", fund: 2.1, categoryAvg: 1.5 },
    { metric: "Std. Deviation", fund: 16.5, categoryAvg: 17.2 },
  ],
};

const portfolioData = {
  topHoldings: [
    { security: "HDFC Bank Ltd.", sector: "Financial Services", holding: 8.5 },
    { security: "Reliance Industries Ltd.", sector: "Energy", holding: 7.9 },
    { security: "ICICI Bank Ltd.", sector: "Financial Services", holding: 7.2 },
    {
      security: "Infosys Ltd.",
      sector: "Information Technology",
      holding: 6.8,
    },
    {
      security: "Tata Consultancy Services Ltd.",
      sector: "Information Technology",
      holding: 5.5,
    },
  ],
  sectorAllocation: [
    { sector: "Financial Services", value: 32.5 },
    { sector: "Information Technology", value: 18.2 },
    { sector: "Energy", value: 12.8 },
    { sector: "Consumer Goods", value: 9.5 },
    { sector: "Healthcare", value: 7.1 },
    { sector: "Others", value: 19.9 },
  ],
};
// --- END DUMMY DATA ---

export default function ExploreFund() {
  const { userData, setUserData, user } = useAuth();
  const [fundDetails, setFundDetails] = useState({});
  const [FundRisks, setFundRisks] = useState({});
  const [performance, setPerformance] = useState({});
  const [portfolio, setPortfolio] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [navTimeRange, setNavTimeRange] = useState("max");
  const { scheme_code } = useParams();
  const schemeCode = scheme_code;

  console.log("User Data", userData);

  const performanceRef = useRef(null);
  const portfolioRef = useRef(null);
  const taxRef = useRef(null);

  const isInPortfolio = userData?.portfolio?.funds?.some(
    (fund) => fund.schemeCode === schemeCode,
  );
  const isInWatchlist = userData?.watchlist?.some(
    (item) => item.schemeCode === schemeCode,
  );

  console.log("The Scheme Code: ", schemeCode);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    // TODO: Later fetch the actual data instead of dummy one.

    const fetchData = async () => {
      // const [detailsRes, perfRes, portfolioRes] = await Promise.all([
      //   axios.get(`/api/fund-details?code=${schemeCode}`),
      //   axios.get(`/api/fund-performance?code=${schemeCode}`),
      //   axios.get(`/api/fund-portfolio?code=${schemeCode}`),
      // ]);
      // setFundDetails(detailsRes.data);
      // setPerformance(perfRes.data);
      // setPortfolio(portfolioRes.data);
      //
      setIsLoading(true);
      const token = await user.getIdToken();
      console.log("User", user);

      try {
        const detailsRes = await axios.get(
          `${BASE_URL}/mutual-fund/?scheme_code=${schemeCode}`,
        );
        const fundRisk = await axios.get(
          `${BASE_URL}/mutual-fund/risk/?scheme_code=${schemeCode}`,
        );
        const updated = await axios.get(`${BASE_URL}/user/data`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("user", user);
        console.log("Risk Data", fundRisk.data);
        console.log("Newly Fetched Data", updated.data);

        setFundDetails(detailsRes.data);
        setUserData(updated.data);
        setFundRisks(fundRisk.data);
      } catch (error) {
        console.error("Failed to fetch fund data:", error);
      } finally {
        setIsLoading(false);
      }

      // setFundDetails(fundDetailsData);
      setPerformance(performanceData);
      setPortfolio(portfolioData);

      setIsLoading(false);
    };

    fetchData();
  }, [schemeCode]);

  const handleAddToPortfolioClick = () => {
    if (user) {
      // If user is logged in, show the portfolio form
      setShowPortfolioModal(true);
    } else {
      // Otherwise, show the login form
      setShowLoginModal(true);
    }
  };

  const scrollToRef = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const toggleItem = (title) => {
    setExpanded((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  // A simple loading spinner component
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  );

  if (isLoading) {
    return (
      <>
        <Navbar />
        <LoadingSpinner />
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      {showLoginModal && (
        <AuthForm closeForm={() => setShowLoginModal(false)} />
      )}

      {showPortfolioModal && (
        <AddToPortfolio
          schemeCode={schemeCode}
          schemeName={fundDetailsData.schemeName}
          onClose={() => setShowPortfolioModal(false)}
        />
      )}

      <div className="pt-24 px-4 sm:px-6 max-w-7xl mx-auto">
        {/* Top Fund Header */}
        <div className="mb-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
            {fundDetails.schemeName}
          </h1>
          <div className="mt-2 flex items-center space-x-4 text-xs sm:text-sm text-gray-600">
            <span>{fundDetails.assetCategory}</span>
            <span className="text-gray-300">•</span>
            <span>{fundDetails.assetSubCategory}</span>
            <span className="text-gray-300">•</span>
            <span className="font-semibold px-2 py-1 bg-red-50 text-red-700 rounded">
              {fundDetails.riskometer}
            </span>
          </div>
        </div>

        {/* Secondary Navigation */}
        <nav className="sticky top-[72px] bg-white/80 backdrop-blur-sm z-10 flex space-x-4 sm:space-x-6 py-3 border-b border-gray-200 text-sm font-medium text-gray-600 mb-6 overflow-x-auto">
          <button className="text-blue-600 border-b-2 border-blue-600 py-1 whitespace-nowrap">
            Overview
          </button>
          <button
            onClick={() => scrollToRef(performanceRef)}
            className="hover:text-blue-600 py-1 whitespace-nowrap"
          >
            Performance & Risk
          </button>
          <button
            onClick={() => scrollToRef(portfolioRef)}
            className="hover:text-blue-600 py-1 whitespace-nowrap"
          >
            Portfolio
          </button>
          <button
            onClick={() => scrollToRef(taxRef)}
            className="hover:text-blue-600 py-1 whitespace-nowrap"
          >
            Tax Implication
          </button>
        </nav>

        {/* Main Content */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          {!isCollapsed && (
            <aside className="w-full md:w-[350px] md:sticky md:top-[140px] self-start flex-shrink-0">
              <div className="bg-white border shadow-lg rounded-2xl p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      {fundDetails.amcName}
                    </h2>
                    <p className="text-xs text-gray-500 uppercase mt-1">
                      {fundDetails.assetSubCategory} -{" "}
                      {fundDetails.schemeName.includes("Growth")
                        ? "Growth"
                        : "IDCW"}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsCollapsed(true)}
                    className="p-2 -mt-2 -mr-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full"
                  >
                    <FaTimes />
                  </button>
                </div>

                <div className="mb-4">
                  <p className="text-3xl font-semibold text-gray-800">
                    ₹{fundDetails.nav?.toFixed(2)}
                    <span
                      className={`ml-2 text-base font-medium ${fundDetails.navChange >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {fundDetails.navChange >= 0 ? "▲" : "▼"}{" "}
                      {fundDetails.navChangePercent?.toFixed(2)}%
                    </span>
                  </p>
                  <p className="text-xs text-gray-500">
                    {/* NAV as on{" "}
                    {new Date(fundDetails.navDate).toLocaleDateString("en-GB", {
                      day: "short",
                      month: "short",
                      year: "numeric",
                    })} */}
                  </p>
                </div>

                <button
                  onClick={handleAddToPortfolioClick}
                  className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition duration-200"
                >
                  {!isInPortfolio ? (
                    "Add to Portfolio"
                  ) : (
                    <span className="inline-flex items-center">
                      <FaCheck className="mr-1" />
                      In Portfolio
                    </span>
                  )}
                </button>
                <button className="mt-2 w-full bg-blue-50 text-blue-700 py-2.5 rounded-lg font-semibold hover:bg-blue-100 transition duration-200 flex items-center justify-center gap-2">
                  <FaRegBookmark /> Add to Watchlist
                </button>

                <hr className="my-4" />

                {/* Scorecard - As per original */}
                <h3 className="text-md font-semibold text-gray-700 mb-3">
                  Scorecard
                </h3>
                <div className="space-y-2">
                  {scorecardData.map((item) => (
                    <div
                      key={item.title}
                      className="p-3 bg-gray-50 rounded-lg border"
                    >
                      <div
                        className="flex justify-between items-center cursor-pointer"
                        onClick={() => toggleItem(item.title)}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-bold px-2 py-1 rounded-full ${item.color}`}
                          >
                            {item.status}
                          </span>
                          <span className="font-medium text-sm text-gray-800">
                            {item.title}
                          </span>
                        </div>
                        {expanded[item.title] ? (
                          <MdExpandLess className="text-gray-500" />
                        ) : (
                          <MdExpandMore className="text-gray-500" />
                        )}
                      </div>
                      {expanded[item.title] && (
                        <p className="mt-2 text-xs text-gray-600">
                          {item.desc}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Fund Snapshot */}
                <hr className="my-4" />
                <h3 className="text-md font-semibold text-gray-700 mb-3">
                  Fund Snapshot
                </h3>
                <ul className="space-y-2.5 text-sm text-gray-600">
                  <li className="flex justify-between">
                    <span>AUM (Cr)</span>{" "}
                    <strong className="text-gray-800">
                      ₹{fundDetails.fundSize?.toLocaleString()}
                    </strong>
                  </li>
                  <li className="flex justify-between">
                    <span>Expense Ratio</span>{" "}
                    <strong className="text-gray-800">
                      {fundDetails.expenseRatio}%
                    </strong>
                  </li>
                  <li className="flex justify-between">
                    <span>Exit Load</span>{" "}
                    <strong className="text-gray-800 text-right">
                      {fundDetails.exitLoad}
                    </strong>
                  </li>
                  <li className="flex justify-between">
                    <span>Inception</span>{" "}
                    <strong className="text-gray-800">
                      {new Date(fundDetails.inceptionDate).toLocaleDateString()}
                    </strong>
                  </li>
                  <li className="flex justify-between">
                    <span>Fund Manager</span>{" "}
                    <strong className="text-gray-800 text-right">
                      {fundDetails.fundManager}
                    </strong>
                  </li>
                </ul>
              </div>
            </aside>
          )}

          {/* Main Content Area */}
          <main
            className={`flex-grow transition-all duration-300 ${isCollapsed ? "w-full" : "w-full md:w-auto"}`}
          >
            <div className="space-y-8">
              {isCollapsed && (
                <button
                  onClick={() => setIsCollapsed(false)}
                  className="fixed top-28 right-6 z-20 bg-white shadow-lg border rounded-full px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition"
                >
                  Show Fund Info
                </button>
              )}

              {/* NAV Chart Section */}
              <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 sm:mb-0">
                    NAV Trend
                  </h3>
                  <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg text-sm">
                    {["1Y", "3Y", "5Y", "max"].map((range) => (
                      <button
                        key={range}
                        onClick={() => setNavTimeRange(range)}
                        className={`px-3 py-1 rounded-md transition ${navTimeRange === range ? "bg-white text-blue-600 shadow" : "text-gray-600 hover:bg-gray-200"}`}
                      >
                        {range.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <NavChart
                  schemeCode={schemeCode}
                  timeRange={navTimeRange} // Pass current time range
                />
              </div>

              {/* Performance & Risk Section */}
              <div
                ref={performanceRef}
                className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FiTrendingUp /> Performance & Risk
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Trailing Returns */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">
                      Trailing Returns (%)
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 bg-gray-50">
                          <tr>
                            <th className="p-2">Period</th>
                            <th className="p-2 text-center">
                              {fundDetails.schemeName.split(" ")[0]}
                            </th>
                            <th className="p-2 text-center">Category Avg.</th>
                            <th className="p-2 text-center">Benchmark</th>
                          </tr>
                        </thead>
                        <tbody>
                          {FundRisks.trailing_returns?.map((item) => (
                            <tr key={item.period} className="border-b">
                              <td className="p-2 font-medium">{item.period}</td>
                              <td className="p-2 text-center font-bold text-blue-600">
                                {item.fund}%
                              </td>
                              <td className="p-2 text-center">
                                {item.category !== undefined &&
                                item.category !== null
                                  ? `${item.category}%`
                                  : "-"}
                              </td>
                              <td className="p-2 text-center">
                                {item.benchmark !== undefined &&
                                item.benchmark !== null
                                  ? `${item.benchmark}% `
                                  : "-"}
                                %
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {/* Risk Ratios */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">
                      Risk Ratios
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 bg-gray-50">
                          <tr>
                            <th className="p-2">Metric</th>
                            <th className="p-2 text-center">
                              {fundDetails.schemeName.split(" ")[0]}
                            </th>
                            <th className="p-2 text-center">Category Avg.</th>
                          </tr>
                        </thead>
                        <tbody>
                          {FundRisks.risk_ratios?.map((item) => (
                            <tr key={item.metric} className="border-b">
                              <td className="p-2 font-medium">{item.metric}</td>
                              <td className="p-2 text-center font-bold text-blue-600">
                                {item.fund?.toFixed(3)}
                              </td>
                              <td className="p-2 text-center">
                                {item.categoryAvg?.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* Portfolio Section */}
              {/* <div className="p-2 "> */}
              <PortfolioVisuals portfolio={portfolioData} />
              {/* </div> */}
              {/*  */}

              {/* Tax Implication Section (Placeholder) */}
              <div
                ref={taxRef}
                className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FaInfoCircle /> Tax Implication
                </h3>
                <p className="text-sm text-gray-600">
                  For equity funds, if you sell your units after holding them
                  for more than 1 year, the gains are considered Long-Term
                  Capital Gains (LTCG) and are taxed at 10% on gains exceeding
                  ₹1 lakh in a financial year. If you sell within 1 year, the
                  gains are Short-Term Capital Gains (STCG) and are taxed at
                  15%. This information is for educational purposes only. Please
                  consult a tax advisor.
                </p>
              </div>
            </div>
          </main>
        </div>
        <FundComparison
          baseSchemeCode={schemeCode}
          baseSchemeName={fundDetails.schemeName}
        />
      </div>

      <Footer />
    </>
  );
}
