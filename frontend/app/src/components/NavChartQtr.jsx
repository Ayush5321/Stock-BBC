import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

export default function NavChartQtr({ navData }) {
  const chartRef = useRef();

  useEffect(() => {
    if (!navData || navData.length === 0) return;

    const data = navData.map((d) => ({
      date: new Date(d.date),
      value: +d.nav_value,
    }));

    const svg = d3.select(chartRef.current);
    svg.selectAll("*").remove(); // Clear previous chart

    // Chart dimensions
    const width = 500; // Virtual width (will scale with viewBox)
    const height = 192; // Matches h-48
    const margin = { top: 10, right: 15, bottom: 30, left: 40 };

    const x = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d.date))
      .range([margin.left, width - margin.right]);

    const y = d3
      .scaleLinear()
      .domain([d3.min(data, (d) => d.value), d3.max(data, (d) => d.value)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const xAxis = (g) =>
      g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(4).tickFormat(d3.timeFormat("%b")))
        .call((g) =>
          g
            .append("text")
            .attr("x", width - 10)
            .attr("y", 30)
            .attr("fill", "#000")
            .attr("text-anchor", "end")
            .attr("font-size", "8px")
            .text("Months"),
        );

    const yAxis = (g) =>
      g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(4))
        .call((g) =>
          g
            .append("text")
            .attr("x", 0)
            .attr("y", margin.top - 10)
            .attr("fill", "#000")
            .attr("text-anchor", "start")
            .attr("font-size", "10px")
            .text("NAV (₹)"),
        );

    const line = d3
      .line()
      .x((d) => x(d.date))
      .y((d) => y(d.value))
      .curve(d3.curveMonotoneX);

    svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#3B82F6")
      .attr("stroke-width", 2)
      .attr("d", line);

    svg.append("g").call(xAxis);
    svg.append("g").call(yAxis);
  }, [navData]);

  return <svg ref={chartRef} className="w-full h-full p-2" />;
}
