import React from "react";
import { FiArrowRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function SearchResultCard({ fund }) {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/explore/${fund.scheme_code}`);
  };

  return (
    <div className="bg-white border rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 p-5 flex flex-col justify-between">
      <div>
        <h3 className="font-bold text-base text-gray-800 leading-snug">
          {fund.scheme_name}
        </h3>
        <p className="text-xs text-gray-500 mt-1">{fund.amc_name}</p>
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
            {fund.asset_category}
          </span>
          <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
            {fund.asset_sub_category}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4 text-center border-t pt-3">
          <div>
            <p className="text-xs text-gray-500">NAV</p>
            <p className="font-semibold text-sm text-gray-900">
              ₹{fund.nav?.toFixed(2) ?? "N/A"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Fund Size (Cr)</p>
            <p className="font-semibold text-sm text-gray-900">
              {fund.fund_size ? `₹${fund.fund_size.toLocaleString()}` : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Expense Ratio</p>
            <p className="font-semibold text-sm text-gray-900">
              {fund.expense_ratio_s_d ? `${fund.expense_ratio_s_d}%` : "N/A"}
            </p>
          </div>
        </div>
      </div>
      <button
        onClick={handleViewDetails}
        className="mt-4 w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
      >
        View Details <FiArrowRight />
      </button>
    </div>
  );
}
