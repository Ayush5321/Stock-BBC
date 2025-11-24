import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Highlighter from "react-highlight-words";

// Components
import Navbar from "../components/navbar";
import Footer from "../components/Footer";
import FundCard from "../components/FundCard"; // Assuming you have this from the other page
import SearchResultCard from "../components/SearchResultCard";
import { useAuth } from "../contexts/AuthContext";

// Config & Data
import BASE_URL from "../config";
import heroImage from "../assets/hero.jpg";
import categoryData from "../data/categoryData.json";
import fallbackFunds from "./fallback.json"; // Assuming you have a fallback for recommendations

// Dummy NAV image for recommendations
import nav_ss from "../assets/nav_ss.png";

// Hero Section Component
const HeroSection = () => {
  const navigate = useNavigate();
  return (
    <section className="w-full flex items-center justify-between bg-white py-16">
      <div className="w-full md:w-3/5 flex flex-col justify-center gap-6">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight max-w-2xl">
          Discover Your Next
          <br />
          <Highlighter
            searchWords={["Great Investment"]}
            autoEscape
            textToHighlight="Great Investment"
            highlightStyle={{
              background: "none",
              boxShadow: "inset 0 -0.4em 0 rgba(59, 130, 246, 0.4)",
              fontWeight: 650,
            }}
          />
        </h1>
        <p className="text-gray-600 text-base sm:text-lg max-w-xl">
          Use our powerful search and filtering tools to find the perfect mutual
          fund that aligns with your financial goals.
        </p>
      </div>
      <div className="hidden md:flex md:w-2/5 p-4">
        <img
          src={heroImage}
          alt="Investment Discovery"
          className="w-full h-auto object-contain"
        />
      </div>
    </section>
  );
};

export default function SearchFund() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Search and Filter State
  const [amcList, setAmcList] = useState({}); // { "AMC Name": "AMC_CODE", ... }
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredAmcs, setFilteredAmcs] = useState([]);
  const [selectedAmc, setSelectedAmc] = useState(null); // { name: string, code: string }
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [subCategoryOptions, setSubCategoryOptions] = useState([]);

  // Results and Loading State
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearched, setIsSearched] = useState(false); // Controls view toggling

  // Recommendations State
  const [recommendedFunds, setRecommendedFunds] = useState([]);
  const [navData, setNavData] = useState({});
  const [isRecsLoading, setIsRecsLoading] = useState(true);

  // Initial data fetch for AMCs and recommendations
  useEffect(() => {
    // Fetch AMC List
    axios
      .get(`${BASE_URL}/mutual-fund/filter`)
      .then((res) => {
        setAmcList(res.data.amc_codes);
      })
      .catch((err) => console.error("Failed to fetch AMC list:", err));

    // Fetch Recommendations
    axios
      .get(`${BASE_URL}/mutual-fund/recommendations`)
      .then((res) => {
        const enrichedFunds = res.data.map((fund) => ({
          ...fund,
          navImage: nav_ss,
        }));
        setRecommendedFunds(enrichedFunds);
        setIsRecsLoading(false);

        const schemeCodes = enrichedFunds.map((f) => f.scheme_code);
        if (schemeCodes.length > 0) {
          axios
            .get(`${BASE_URL}/mutual-fund/quarter-nav`, {
              params: { scheme_code: schemeCodes },
              paramsSerializer: (params) =>
                params.scheme_code.map((c) => `scheme_code=${c}`).join("&"),
            })
            .then((res) => setNavData(res.data))
            .catch((err) => console.error("NAV fetch failed", err));
        }
      })
      .catch((err) => {
        console.warn(
          "⚠️ Backend not reachable, using fallback recommendations.",
          err,
        );
        setRecommendedFunds(fallbackFunds.recommendations || []);
        setIsRecsLoading(false);
      });
  }, []);

  // Update AMC suggestions as user types
  useEffect(() => {
    if (searchTerm) {
      const suggestions = Object.keys(amcList)
        .filter((name) => name.toLowerCase().includes(searchTerm.toLowerCase()))
        .slice(0, 5); // Limit suggestions
      setFilteredAmcs(suggestions);
    } else {
      setFilteredAmcs([]);
    }
  }, [searchTerm, amcList]);

  // Update sub-category options when a category is selected
  useEffect(() => {
    if (selectedCategory) {
      setSubCategoryOptions(categoryData[selectedCategory] || []);
      setSelectedSubCategory(""); // Reset sub-category on category change
    } else {
      setSubCategoryOptions([]);
    }
  }, [selectedCategory]);

  const handleAmcSelect = (amcName) => {
    setSelectedAmc({ name: amcName, code: amcList[amcName] });
    setSearchTerm(amcName);
    setFilteredAmcs([]);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!selectedAmc) {
      alert("Please select an AMC from the list.");
      return;
    }

    setIsLoading(true);
    setIsSearched(true);
    setSearchResults([]);

    try {
      const params = {
        amc_code: selectedAmc.code,
        ...(selectedCategory && { asset_category: selectedCategory }),
        ...(selectedSubCategory && { asset_sub_category: selectedSubCategory }),
      };

      const res = await axios.get(`${BASE_URL}/mutual-fund/filter`, { params });
      setSearchResults(res.data.mutual_funds);
    } catch (error) {
      console.error("Failed to search funds:", error);
      // You could set an error state here to show a message to the user
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setIsSearched(false);
    setSearchTerm("");
    setSelectedAmc(null);
    setSelectedCategory("");
    setSelectedSubCategory("");
    setSearchResults([]);
  };

  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-16">
      <div className="w-10 h-10 border-4 border-blue-500 border-dashed rounded-full animate-spin" />
      <span className="ml-3 text-gray-600 text-lg">Searching for funds...</span>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Search Bar */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border mb-12 sticky top-20 z-10">
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
              {/* AMC Search */}
              <div className="relative md:col-span-3 lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  AMC Name
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setSelectedAmc(null); // Deselect if user types again
                  }}
                  placeholder="e.g., HDFC Mutual Fund"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {filteredAmcs.length > 0 && (
                  <ul className="absolute z-20 w-full bg-white border rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg">
                    {filteredAmcs.map((name) => (
                      <li
                        key={amcList[name]}
                        onClick={() => handleAmcSelect(name)}
                        className="p-2 hover:bg-blue-50 cursor-pointer text-sm"
                      >
                        {name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All Categories</option>
                  {Object.keys(categoryData).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              {/* Sub-Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sub-Category
                </label>
                <select
                  value={selectedSubCategory}
                  onChange={(e) => setSelectedSubCategory(e.target.value)}
                  disabled={!selectedCategory}
                  className="w-full p-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                >
                  <option value="">All Sub-Categories</option>
                  {subCategoryOptions.map((subCat) => (
                    <option key={subCat} value={subCat}>
                      {subCat}
                    </option>
                  ))}
                </select>
              </div>
              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white p-2 rounded-lg font-semibold hover:bg-blue-700"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full bg-gray-200 text-gray-700 p-2 rounded-lg font-semibold hover:bg-gray-300"
                >
                  Reset
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* --- Conditional Content: Hero/Recs or Search Results --- */}
        {!isSearched ? (
          <>
            <HeroSection />
            <section id="recommendations" className="mt-16">
              <h2 className="text-3xl sm:text-4xl font-semibold text-gray-800 mb-8 text-center">
                Featured <span className="text-blue-600">Mutual Funds</span>
              </h2>
              {isRecsLoading ? (
                <div className="flex justify-center items-center py-16">
                  <div className="w-10 h-10 border-4 border-blue-500 border-dashed rounded-full animate-spin" />
                  <span className="ml-3 text-gray-600 text-lg">
                    Loading funds...
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendedFunds.map((fund) => (
                    <div
                      key={fund.scheme_code}
                      className="transition-transform transform hover:-translate-y-1 hover:shadow-xl"
                    >
                      <FundCard
                        {...fund}
                        navHistory={navData[fund.scheme_code]}
                        onClick={() => navigate(`/explore/${fund.scheme_code}`)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : (
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Search Results ({searchResults.length})
            </h2>
            {isLoading ? (
              <LoadingSpinner />
            ) : searchResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((fund) => (
                  <SearchResultCard key={fund.scheme_code} fund={fund} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-lg border">
                <h3 className="text-xl font-semibold text-gray-700">
                  No Funds Found
                </h3>
                <p className="text-gray-500 mt-2">
                  Try adjusting your search filters or select a different AMC.
                </p>
              </div>
            )}
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
