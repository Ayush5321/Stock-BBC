import React, { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import axios from "axios";
import BASE_URL from "../config";

// A simple styled loader component
const ChartLoader = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-20">
    <p className="text-gray-500">Loading Chart...</p>
  </div>
);

// A component for when no data is available
const NoDataMessage = () => (
  <div className="absolute inset-0 flex items-center justify-center">
    <p className="text-gray-500">No data available for this time range.</p>
  </div>
);

export default function NavChart({ schemeCode, timeRange }) {
  const chartRef = useRef(null);
  const tooltipRef = useRef(null);
  const [fullData, setFullData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    if (!schemeCode) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`${BASE_URL}/mutual-fund/nav-data`, {
          params: { scheme_code: schemeCode, time_range: "max" },
        });

        if (res.data?.length) {
          const parsed = res.data
            .map((d) => ({
              date: new Date(d.date),
              nav: +d.nav_value,
            }))
            .sort((a, b) => a.date - b.date); // Sort data by date
          setFullData(parsed);
        } else {
          setFullData([]);
        }
      } catch (err) {
        console.error("Error fetching NAV data:", err);
        setFullData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [schemeCode]);

  useEffect(() => {
    if (!fullData.length) {
      setFilteredData([]);
      return;
    }

    const now = new Date();
    let cutoffDate;

    switch (timeRange) {
      case "1Y":
        cutoffDate = new Date(new Date().setFullYear(now.getFullYear() - 1));
        break;
      case "3Y":
        cutoffDate = new Date(new Date().setFullYear(now.getFullYear() - 3));
        break;
      case "5Y":
        cutoffDate = new Date(new Date().setFullYear(now.getFullYear() - 5));
        break;
      default:
        cutoffDate = new Date(0);
    }

    const filtered = fullData.filter((d) => d.date >= cutoffDate);
    setFilteredData(filtered);
  }, [fullData, timeRange]);

  const drawChart = useCallback((data) => {
    const container = chartRef.current;
    if (!container) return;

    d3.select(container).selectAll("*").remove();

    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3
      .select(container)
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr(
        "viewBox",
        `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`,
      )
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d.date))
      .range([0, width]);
    const y = d3
      .scaleLinear()
      .domain([
        d3.min(data, (d) => d.nav) * 0.9,
        d3.max(data, (d) => d.nav) * 1.1,
      ])
      .range([height, 0])
      .nice();

    const gradient = svg
      .append("defs")
      .append("linearGradient")
      .attr("id", "chart-gradient")
      .attr("gradientTransform", "rotate(90)");
    gradient
      .append("stop")
      .attr("offset", "20%")
      .attr("stop-color", "rgba(59, 130, 246, 0.2)");
    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "rgba(59, 130, 246, 0)");

    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(width / 80)
          .tickSizeOuter(0),
      )
      .attr("class", "text-xs text-gray-500")
      .select(".domain")
      .remove();
    svg
      .append("g")
      .call(d3.axisLeft(y).ticks(5).tickSize(-width))
      .attr("class", "text-xs text-gray-500")
      .call((g) => g.select(".domain").remove())
      .call((g) =>
        g
          .selectAll(".tick line")
          .attr("stroke-opacity", 0.1)
          .attr("stroke-dasharray", "2,2"),
      );

    const area = d3
      .area()
      .x((d) => x(d.date))
      .y0(height)
      .y1((d) => y(d.nav))
      .curve(d3.curveMonotoneX);
    svg
      .append("path")
      .datum(data)
      .attr("fill", "url(#chart-gradient)")
      .attr("d", area);

    const line = d3
      .line()
      .x((d) => x(d.date))
      .y((d) => y(d.nav))
      .curve(d3.curveMonotoneX);
    svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#3B82F6")
      .attr("stroke-width", 2)
      .attr("d", line);

    const lastPoint = data[data.length - 1];
    svg
      .append("circle")
      .attr("class", "pulsing-dot")
      .attr("cx", x(lastPoint.date))
      .attr("cy", y(lastPoint.nav))
      .attr("r", 5)
      .attr("fill", "#3B82F6");

    const focus = svg
      .append("g")
      .attr("class", "focus")
      .style("display", "none");
    focus
      .append("line")
      .attr("class", "focus-line")
      .attr("y1", 0)
      .attr("y2", height);
    focus.append("circle").attr("r", 6).attr("class", "focus-circle");

    svg
      .append("rect")
      .attr("class", "overlay")
      .attr("width", width)
      .attr("height", height)
      .style("fill", "none")
      .style("pointer-events", "all")
      .on("mouseover", () => {
        focus.style("display", null);
        tooltipRef.current.style.opacity = 1;
      })
      .on("mouseout", () => {
        focus.style("display", "none");
        tooltipRef.current.style.opacity = 0;
      })
      .on("mousemove", (event) => {
        const bisector = d3.bisector((d) => d.date).left;
        // Adjust mouse coordinate by subtracting margin.left and clamp to [0, width]
        const mouseX = Math.max(
          0,
          Math.min(width, d3.pointer(event)[0] - margin.left),
        );
        const x0 = x.invert(mouseX);
        const i = bisector(data, x0, 1);

        let closestPoint;
        if (i <= 0) {
          closestPoint = data[0];
        } else if (i >= data.length) {
          closestPoint = data[data.length - 1];
        } else {
          const d0 = data[i - 1];
          const d1 = data[i];
          closestPoint = x0 - d0.date > d1.date - x0 ? d1 : d0;
        }

        focus.attr("transform", `translate(${x(closestPoint.date)}, 0)`);
        focus
          .select(".focus-circle")
          .attr("transform", `translate(0, ${y(closestPoint.nav)})`);

        tooltipRef.current.innerHTML = `
          <div class="font-bold text-gray-800">${d3.timeFormat("%d %b, %Y")(
            closestPoint.date,
          )}</div>
          <div class="text-sm text-gray-600">NAV: <span class="font-semibold">₹${closestPoint.nav.toFixed(
            2,
          )}</span></div>
        `;

        const tooltipEl = tooltipRef.current;
        const containerRect = container.getBoundingClientRect();
        let left = x(closestPoint.date) + margin.left + 15;
        if (left + tooltipEl.offsetWidth > containerRect.width) {
          left =
            x(closestPoint.date) + margin.left - tooltipEl.offsetWidth - 15;
        }

        const top = y(closestPoint.nav) + margin.top;

        tooltipEl.style.left = `${left}px`;
        tooltipEl.style.top = `${top}px`;
      });
  }, []);

  useEffect(() => {
    if (filteredData.length > 0 && !isLoading) {
      drawChart(filteredData);
    }
  }, [filteredData, isLoading, drawChart]);

  return (
    <div className="relative h-[300px] w-full">
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.7; }
        }

        .focus-line {
            stroke: #9ca3af;
            stroke-width: 1px;
            stroke-dasharray: 3,3;
        }
        .focus-circle {
            fill: none;
            stroke: #3B82F6;
            stroke-width: 2px;
        }
      `}</style>

      {isLoading && <ChartLoader />}

      <div
        ref={chartRef}
        className="w-full h-full"
        aria-label="NAV Trend Chart"
      >
        {!isLoading && filteredData.length === 0 && <NoDataMessage />}
      </div>

      <div
        ref={tooltipRef}
        className="absolute bg-white p-2 border border-gray-200 rounded-md shadow-lg pointer-events-none opacity-0 transition-opacity duration-200 text-sm z-10"
        style={{ transform: "translateY(-50%)" }}
        role="tooltip"
      />
    </div>
  );
}
