import React from "react";
import { FaStar } from "react-icons/fa";
import { MdTrendingUp, MdTrendingDown } from "react-icons/md";
import NavChartQtr from "./NavChartQtr";

export default function FundCard({
  scheme_name,
  scheme_code,
  gain_1q,
  vr_rating,
  vr_stars,
  risk_rating,
  date_of_inception,
  sharpe_ratio,
  navHistory,
  onClick,
}) {
  const schemeName = scheme_name.split("-")[0];
  const isPositive = gain_1q >= 0;
  const growthColor = isPositive
    ? "bg-green-100 text-green-700"
    : "bg-red-100 text-red-600";
  const growthIcon = isPositive ? <MdTrendingUp /> : <MdTrendingDown />;
  const title = schemeName;

  const riskColor =
    risk_rating < 5
      ? "text-green-600"
      : risk_rating < 8
        ? "text-yellow-600"
        : "text-red-600";
  //console.log("📈 FundCard:", scheme_code, "navHistory =", navHistory);

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl shadow hover:shadow-lg transition-all p-5 cursor-pointer flex flex-col justify-between border border-gray-100 hover:border-blue-300
             w-full h-full min-h-[90px]"
    >
      {/* Title */}
      <h3 className="text-md font-semibold text-gray-900 leading-snug">
        {title}
      </h3>

      {/* NAV Chart */}
      <div className="overflow-hidden rounded-xl h-24">
        {navHistory ? (
          <NavChartQtr navData={navHistory} />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-sm">
            Loading chart...
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="flex flex-col gap-3 text-sm mt-1">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Quarter Growth</span>
          <span
            className={`flex items-center gap-1 px-2 py-1 rounded-full font-medium text-xs ${growthColor}`}
          >
            {growthIcon} {Math.abs(gain_1q)}%
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">VR Rating</span>
          <span className="flex items-center gap-1 text-yellow-400">
            {[...Array(vr_stars)].map((_, i) => (
              <FaStar key={i} className="text-sm" />
            ))}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Risk Score</span>
          <span className={`font-semibold ${riskColor}`}>{risk_rating}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Sharpe Ratio</span>
          <span className="text-gray-800 font-medium">
            {sharpe_ratio.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Inception</span>
          <span className="text-gray-700">{date_of_inception}</span>
        </div>
      </div>
    </div>
  );
}
