import React, { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";

// A component for when no data is available
const NoDataMessage = () => (
  <div className="absolute inset-0 flex items-center justify-center h-full">
    <p className="text-gray-500">No portfolio history data available.</p>
  </div>
);

/**
 * A reusable chart component to display time-series data.
 * @param {object[]} data - The data to plot. Expected format: [{ date: string | Date, value: number }]
 */
export default function Chart({ data }) {
  const chartRef = useRef(null);
  const tooltipRef = useRef(null);
  const [chartData, setChartData] = useState([]);

  // 1. Process the incoming data prop
  useEffect(() => {
    if (data && data.length > 0) {
      const parsedData = data
        .map((d) => ({
          date: new Date(d.date),
          value: +d.value, // Ensure 'value' is a number
        }))
        .sort((a, b) => a.date - b.date); // Always sort data by date
      setChartData(parsedData);
    } else {
      setChartData([]); // Handle empty or null data prop
    }
  }, [data]);

  // 2. Define the D3 drawing logic in a useCallback hook
  const drawChart = useCallback((plotData) => {
    const container = chartRef.current;
    if (!container || plotData.length === 0) return;

    // Clear previous SVG
    d3.select(container).selectAll("*").remove();

    // Define dimensions, respecting container size
    const margin = { top: 20, right: 20, bottom: 40, left: 60 };
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

    // Define scales
    const x = d3
      .scaleTime()
      .domain(d3.extent(plotData, (d) => d.date))
      .range([0, width]);

    const y = d3
      .scaleLinear()
      .domain([
        d3.min(plotData, (d) => d.value) * 0.95, // Use d.value
        d3.max(plotData, (d) => d.value) * 1.05, // Use d.value
      ])
      .range([height, 0])
      .nice();

    // Define gradient for the area chart
    const gradient = svg
      .append("defs")
      .append("linearGradient")
      .attr("id", "portfolio-chart-gradient")
      .attr("gradientTransform", "rotate(90)");
    gradient
      .append("stop")
      .attr("offset", "20%")
      .attr("stop-color", "rgba(59, 130, 246, 0.2)");
    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "rgba(59, 130, 246, 0)");

    // Draw axes
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
      .call(
        d3
          .axisLeft(y)
          .ticks(5)
          .tickFormat((d) => `₹${d3.format("~s")(d)}`)
          .tickSize(-width),
      )
      .attr("class", "text-xs text-gray-500")
      .call((g) => g.select(".domain").remove())
      .call((g) =>
        g
          .selectAll(".tick line")
          .attr("stroke-opacity", 0.1)
          .attr("stroke-dasharray", "2,2"),
      );

    // Draw area
    const area = d3
      .area()
      .x((d) => x(d.date))
      .y0(height)
      .y1((d) => y(d.value)) // Use d.value
      .curve(d3.curveMonotoneX);
    svg
      .append("path")
      .datum(plotData)
      .attr("fill", "url(#portfolio-chart-gradient)")
      .attr("d", area);

    // Draw line
    const line = d3
      .line()
      .x((d) => x(d.date))
      .y((d) => y(d.value)) // Use d.value
      .curve(d3.curveMonotoneX);
    svg
      .append("path")
      .datum(plotData)
      .attr("fill", "none")
      .attr("stroke", "#3B82F6")
      .attr("stroke-width", 2)
      .attr("d", line);

    // --- Interactive Tooltip Logic ---
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
        const x0 = x.invert(d3.pointer(event)[0]);
        const i = bisector(plotData, x0, 1);
        const d0 = plotData[i - 1];
        const d1 = plotData[i];
        const closestPoint = !d0
          ? d1
          : !d1
            ? d0
            : x0 - d0.date > d1.date - x0
              ? d1
              : d0;

        focus.attr("transform", `translate(${x(closestPoint.date)}, 0)`);
        focus
          .select(".focus-circle")
          .attr("transform", `translate(0, ${y(closestPoint.value)})`);

        tooltipRef.current.innerHTML = `
          <div class="font-bold text-gray-800">${d3.timeFormat("%d %b, %Y")(closestPoint.date)}</div>
          <div class="text-sm text-gray-600">Value: <span class="font-semibold">₹${closestPoint.value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
        `;

        const tooltipEl = tooltipRef.current;
        const containerRect = container.getBoundingClientRect();
        let left = x(closestPoint.date) + margin.left + 15;
        if (left + tooltipEl.offsetWidth > containerRect.width) {
          left =
            x(closestPoint.date) + margin.left - tooltipEl.offsetWidth - 15;
        }
        const top = y(closestPoint.value) + margin.top;

        tooltipEl.style.left = `${left}px`;
        tooltipEl.style.top = `${top}px`;
      });
  }, []); // useCallback has no dependencies as it's self-contained

  // 3. Draw or re-draw the chart when data changes or window is resized
  useEffect(() => {
    const handleResize = () => {
      if (chartData.length > 0) {
        drawChart(chartData);
      }
    };

    // Initial draw
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [chartData, drawChart]);

  return (
    <div className="relative h-[300px] w-full">
      <style>{`
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

      <div
        ref={chartRef}
        className="w-full h-full"
        aria-label="Portfolio Value Trend Chart"
      >
        {chartData.length === 0 && <NoDataMessage />}
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
