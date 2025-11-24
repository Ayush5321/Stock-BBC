import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

const BarChart = ({ data }) => {
  const svgRef = useRef();
  const containerRef = useRef();
  const [containerWidth, setContainerWidth] = useState(600); // Default width

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries.length) return;
      setContainerWidth(entries[0].contentRect.width);
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!data || data.length === 0 || containerWidth === 0) return;

    const sortedData = [...data].sort((a, b) => b.value - a.value);

    const barHeight = 14;
    const barSpacing = 10;
    const margin = {
      top: 10,
      right: 30,
      bottom: 20,
      left: containerWidth * 0.35,
    }; // text takes ~35%

    const maxBarWidth = containerWidth - margin.left - margin.right;
    const height = sortedData.length * (barHeight + barSpacing);

    const svg = d3
      .select(svgRef.current)
      .attr(
        "viewBox",
        `0 0 ${containerWidth} ${height + margin.top + margin.bottom}`,
      )
      .html("") // clear previous
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const y = d3
      .scaleBand()
      .domain(sortedData.map((d) => d.sector))
      .range([0, height])
      .padding(0.2);

    const x = d3
      .scaleLinear()
      .domain([0, d3.max(sortedData, (d) => d.value)])
      .range([0, maxBarWidth]);

    // Axis (labels)
    svg
      .append("g")
      .call(d3.axisLeft(y).tickSize(0))
      .call((g) => g.select(".domain").remove())
      .selectAll("text")
      .style("font-size", `${barHeight}px`)
      .style("fill", "#374151");

    // Bars
    svg
      .selectAll(".bar")
      .data(sortedData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("y", (d) => y(d.sector))
      .attr("height", barHeight)
      .attr("fill", "#3B82F6")
      .attr("x", 0)
      .attr("width", 0)
      .transition()
      .duration(800)
      .delay((d, i) => i * 100)
      .attr("width", (d) => x(d.value));

    // Value Labels
    svg
      .selectAll(".label")
      .data(sortedData)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("y", (d) => y(d.sector) + barHeight / 2 + 4)
      .attr("fill", "white")
      .attr("font-size", "11px")
      .attr("font-weight", "500")
      .attr("x", (d) => x(d.value) - 6)
      .attr("text-anchor", "end")
      .style("opacity", 0)
      .text((d) => `${d.value}%`)
      .transition()
      .duration(800)
      .delay((d, i) => i * 100 + 200)
      .style("opacity", 1);

    return () => {
      d3.select(svgRef.current).selectAll("*").remove();
    };
  }, [data, containerWidth]);

  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} className="w-full h-auto" />
    </div>
  );
};

export default BarChart;
