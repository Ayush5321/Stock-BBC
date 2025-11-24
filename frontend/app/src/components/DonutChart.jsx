import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

const DonutChart = ({ data, width, height }) => {
  const ref = useRef();
  const [tooltip, setTooltip] = useState({
    visible: false,
    content: "",
    x: 0,
    y: 0,
  });

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3
      .select(ref.current)
      .attr("width", width)
      .attr("height", height)
      .html(""); // Clear previous renders

    const radius = Math.min(width, height) / 2;
    const g = svg
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const color = d3.scaleOrdinal(
      d3.schemeBlues[data.length > 3 ? data.length : 3].reverse(),
    );

    const pie = d3
      .pie()
      .value((d) => d.holding)
      .sort(null);
    const path = d3
      .arc()
      .outerRadius(radius - 10)
      .innerRadius(radius - 70);

    const arcs = g
      .selectAll(".arc")
      .data(pie(data))
      .enter()
      .append("g")
      .attr("class", "arc");

    arcs
      .append("path")
      .attr("fill", (d, i) => color(i))
      .style("stroke", "#ffffff")
      .style("stroke-width", "2px")
      .on("mousemove", (event, d) => {
        const [x, y] = d3.pointer(event, svg.node());
        setTooltip({
          visible: true,
          content: `${d.data.security}: ${d.data.holding.toFixed(2)}%`,
          x: x + 15,
          y: y + 10,
        });
      })
      .on("mouseout", () => {
        setTooltip({ ...tooltip, visible: false });
      })
      .transition()
      .duration(1000)
      .attrTween("d", function (d) {
        const i = d3.interpolate(d.startAngle, d.endAngle);
        return function (t) {
          d.endAngle = i(t);
          return path(d);
        };
      });

    // Cleanup function
    return () => {
      svg.selectAll("*").remove();
    };
  }, [data, width, height]);

  return (
    <div className="relative">
      <svg ref={ref}></svg>
      {tooltip.visible && (
        <div
          className="absolute bg-black text-white text-xs rounded-md py-1 px-2 pointer-events-none"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
};

export default DonutChart;
