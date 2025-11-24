// src/components/PortfolioVisuals.js
import React, { useMemo } from "react";
import { FiBriefcase } from "react-icons/fi"; // Assuming you use react-icons
import DonutChart from "./DonutChart";
import BarChart from "./BarChart";
import * as d3 from "d3";

const PortfolioVisuals = ({ portfolio }) => {
  const donutChartData = useMemo(() => {
    if (!portfolio.topHoldings) return [];

    const holdings = portfolio.topHoldings;
    const totalHoldings = holdings.reduce((sum, item) => sum + item.holding, 0);

    if (totalHoldings < 100) {
      return [
        ...holdings,
        { security: "Others", holding: 100 - totalHoldings, sector: "Various" },
      ];
    }
    return holdings;
  }, [portfolio.topHoldings]);

  // Define colors for the legend to match the chart
  const donutColors = d3.scaleOrdinal(
    d3.schemeBlues[
      donutChartData.length > 3 ? donutChartData.length : 3
    ].reverse(),
  );

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
        <FiBriefcase className="mr-3 text-blue-600" /> Portfolio Allocation
      </h3>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 items-start">
        {/* Top Holdings Section */}
        <div>
          <h4 className="font-semibold text-gray-700 mb-4 text-lg">
            Top Holdings
          </h4>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <DonutChart data={donutChartData} width={220} height={220} />
            <ul className="space-y-2 flex-1">
              {donutChartData.map((item, index) => (
                <li key={item.security} className="flex items-center text-sm">
                  <span
                    className="w-3 h-3 rounded-full mr-3"
                    style={{ backgroundColor: donutColors(index) }}
                  ></span>
                  <div className="flex justify-between w-full font-medium text-gray-800">
                    <span>{item.security}</span>
                    <span>{item.holding.toFixed(1)}%</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sector Allocation Section */}
        <div>
          <h4 className="font-semibold text-gray-700 mb-2 text-lg">
            Sector Allocation
          </h4>
          <div className="mt-4">
            {portfolio.sectorAllocation &&
            portfolio.sectorAllocation.length > 0 ? (
              <BarChart data={portfolio.sectorAllocation} />
            ) : (
              <p className="text-gray-500">No sector data available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioVisuals;
