import React, { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import axios from "axios";
import BASE_URL from "../config";

const COLORS = [
  "#1e40af",
  "#f59e0b",
  "#22c55e",
  "#ef4444",
  "#eab308",
  "#6366f1",
];

export default function NavChartCompare({
  schemeCodes,
  schemeNames,
  timeRange,
}) {
  const chartRef = useRef(null);
  const tooltipRef = useRef(null);
  const [dataSets, setDataSets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!schemeCodes || schemeCodes.length === 0) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        console.log("Making NAV requests for codes:", schemeCodes);
        // const validCodes = schemeCodes.filter(Boolean); // ✅ Remove undefined/null
        const validCodes = schemeCodes.filter(Boolean);
        const validNames = schemeNames.filter((_, i) =>
          Boolean(schemeCodes[i]),
        );
        const requests = validCodes.map((code) =>
          axios.get(`${BASE_URL}/mutual-fund/nav-data`, {
            params: { scheme_code: code, time_range: "max" },
          }),
        );
        const responses = await Promise.all(requests);

        // const processed = responses.map((res, i) => {
        //   const raw = res.data.map((d) => ({
        //     date: new Date(d.date),
        //     nav: +d.nav_value,
        //   }));
        //   return {
        //     name: validNames[i] || `Fund ${i + 1}`,
        //     color: COLORS[i % COLORS.length],
        //     rawData: raw,
        //   };
        // });
        const processed = responses
          .map((res, i) => {
            if (!res || !Array.isArray(res.data)) return null;

            const raw = res.data
              .filter((d) => d.date && d.nav_value) // ✅ extra safety
              .map((d) => ({
                date: new Date(d.date),
                nav: +d.nav_value,
              }));

            return {
              name: validNames[i] || `Fund ${i + 1}`,
              color: COLORS[i % COLORS.length],
              rawData: raw,
            };
          })
          .filter(Boolean); // ✅ remove null entries

        setDataSets(processed);
      } catch (err) {
        console.error("Error fetching NAV data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [schemeCodes, schemeNames]);

  const filterAndNormalize = useCallback(
    (rawData) => {
      const now = new Date();
      let cutoff = new Date(0);
      switch (timeRange) {
        case "1Y":
          cutoff.setFullYear(now.getFullYear() - 1);
          break;
        case "3Y":
          cutoff.setFullYear(now.getFullYear() - 3);
          break;
        case "5Y":
          cutoff.setFullYear(now.getFullYear() - 5);
          break;
      }

      const filtered = rawData.filter((d) => d.date >= cutoff);
      if (filtered.length === 0) return [];

      const base = filtered[0].nav;
      return filtered.map((d) => ({
        date: d.date,
        nav: (d.nav / base) * 100,
      }));
    },
    [timeRange],
  );

  useEffect(() => {
    if (isLoading || !dataSets.length || !chartRef.current) return;

    const normalized = dataSets.map((d) => ({
      name: d.name,
      color: d.color,
      data: filterAndNormalize(d.rawData),
    }));

    drawChart(normalized);
  }, [dataSets, isLoading, timeRange]);

  const drawChart = useCallback((seriesList) => {
    const container = chartRef.current;
    d3.select(container).selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = container.clientHeight - margin.top - margin.bottom;

    const svg = d3
      .select(container)
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr(
        "viewBox",
        `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`,
      )
      .attr("preserveAspectRatio", "xMidYMid meet")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const allPoints = seriesList.flatMap((s) => s.data);
    const x = d3
      .scaleTime()
      .domain(d3.extent(allPoints, (d) => d.date))
      .range([0, width]);

    const y = d3
      .scaleLinear()
      .domain([
        d3.min(allPoints, (d) => d.nav) * 0.95,
        d3.max(allPoints, (d) => d.nav) * 1.05,
      ])
      .range([height, 0])
      .nice();

    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat("%b %y")));

    svg.append("g").call(d3.axisLeft(y).ticks(5));

    const line = d3
      .line()
      .x((d) => x(d.date))
      .y((d) => y(d.nav))
      .curve(d3.curveMonotoneX);

    seriesList.forEach((s) => {
      svg
        .append("path")
        .datum(s.data)
        .attr("fill", "none")
        .attr("stroke", s.color)
        .attr("stroke-width", 2)
        .attr("d", line);

      const last = s.data[s.data.length - 1];
      svg
        .append("text")
        .attr("x", x(last.date) + 6)
        .attr("y", y(last.nav))
        .attr("fill", s.color)
        .style("font-size", "12px")
        .text(s.name);
    });

    const focus = svg
      .append("g")
      .attr("class", "focus")
      .style("display", "none");

    seriesList.forEach((s) => {
      focus
        .append("circle")
        .attr("r", 4)
        .attr("fill", s.color)
        .attr("stroke", "white")
        .attr("stroke-width", 1.5);
    });

    d3.select(container)
      .select("svg")
      .append("rect")
      .attr("class", "overlay")
      .attr("width", width)
      .attr("height", height)
      .attr("transform", `translate(${margin.left},${margin.top})`)
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
        const [mouseX] = d3.pointer(event);
        const mouseDate = x.invert(mouseX - margin.left);

        const tooltipLines = seriesList.map((s, i) => {
          const closest = s.data.reduce((a, b) =>
            Math.abs(a.date - mouseDate) < Math.abs(b.date - mouseDate) ? a : b,
          );
          focus
            .selectAll("circle")
            .nodes()
            [i].setAttribute(
              "transform",
              `translate(${x(closest.date)},${y(closest.nav)})`,
            );
          return `<div style="color:${s.color}">${s.name}: ${closest.nav.toFixed(2)}%</div>`;
        });

        tooltipRef.current.innerHTML = `<strong>${d3.timeFormat("%d %b %Y")(mouseDate)}</strong><br>${tooltipLines.join("")}`;

        const containerRect = container.getBoundingClientRect();
        const tooltipWidth = tooltipRef.current.offsetWidth;
        const tooltipHeight = tooltipRef.current.offsetHeight;
        const xPos = mouseX + 10;
        const yPos = d3.pointer(event, container)[1];
        tooltipRef.current.style.left = `${Math.min(xPos, containerRect.width - tooltipWidth - 10)}px`;
        tooltipRef.current.style.top = `${Math.min(yPos, containerRect.height - tooltipHeight - 10)}px`;
      });
  }, []);

  return (
    <div className="relative flex-1 min-h-[300px]">
      <div
        ref={chartRef}
        className="w-full h-[300px]"
        aria-label="NAV Comparison Chart"
      />
      <div
        ref={tooltipRef}
        className="absolute bg-white p-2 border border-gray-300 rounded shadow-lg pointer-events-none opacity-0 transition-opacity text-sm z-10"
        style={{ transform: "translateY(-100%)" }}
        role="tooltip"
        aria-hidden="true"
      />
    </div>
  );
}
