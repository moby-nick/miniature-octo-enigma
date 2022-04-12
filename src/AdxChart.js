import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

const useResizeObserver = (ref) => {
  const [dimensions, setDimensions] = useState(null);
  useEffect(() => {
    const observeTarget = ref.current;
    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        setDimensions(entry.contentRect);
      });
    });
    resizeObserver.observe(observeTarget);
    return () => {
      resizeObserver.unobserve(observeTarget);
    };
  }, [ref]);

  return dimensions;
};

function AdxChart({ config }) {
  const svgRef = useRef();
  const wrapperRef = useRef();
  const wrapDim = useResizeObserver(wrapperRef);

  // close: 396.536133
  // date: Mon Apr 12 2021 02:00:00 GMT+0200 (Central European Summer Time) {}
  // momentum_rsi: 55.40683407538983
  // symbol: "AAVEUSD"
  // trend_adx: 15.324558408856744
  // trend_sma_slow: 367.33209

  useEffect(() => {
    const svg = d3.select(svgRef.current);

    svg.selectAll("*").remove();
    if (!wrapDim) return;

    const width = wrapDim.width;
    const height = wrapDim.height;
    const margin = { left: 70, right: 70, top: 50, bottom: 50 };

    svg.attr("width", "100%").attr("height", "100%");

    console.log("rokam sa ", config);
    const x = d3
      .scaleUtc()
      .domain(d3.extent(config.data, (d) => d.date))
      .range([margin.left, width - margin.right]);

    const y = d3
      .scaleLinear()
      .domain([0, 100])
      .range([height - margin.bottom, margin.top]);

    const line = d3
      .line()
      .x((d) => x(d.date))
      .y((d) => y(d.trend_adx))
      .curve(d3.curveCardinal);

    const axes = svg.append("g");
    const content = svg.append("g").attr("class", "content");

    const yGrid = (g) =>
      g
        .attr("transform", `translate(${margin.left},0)`)
        .call(
          d3
            .axisLeft(y)
            .tickSize(-width + margin.left + margin.right)
            .ticks(4)
        )
        .call((g) => g.select(".domain").remove())
        .call((g) => g.selectAll("text").remove())
        .call((g) => g.selectAll("line").attr("stroke", "black").attr('opacity', .2));

        axes.append('g').call(yGrid)

    axes
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(4))
      .call((g) => g.select(".domain").remove());


    axes
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(4).tickFormat(d3.format("~s")))
      .call((g) => g.select(".domain").remove())
      .call((g) => g.select(".tick:last-of-type text").append("tspan").text("%"))
      .call((g) =>
        g
          .append("text")
          .attr("x", 5)
          .attr("y", margin.top)
          .attr('dy', -5)
          .attr("fill", "#000")
          .attr("opacity", 0.5)
          .attr("font-size", 12)
          // .attr("font-weight", "bold")
          .attr("text-anchor", "start")
          .text(`${config.ticker} Average Directional Index`)
      )

    content
      .append("path")
      .attr("class", "mainChartLine")
      .attr("d", line(config.data));

    // svg.append("text").attr("x", 100).attr("y", 100).text(config.ticker);
  }, [wrapDim, config]);

  return (
    <div ref={wrapperRef} className="viz-wrapper">
      <svg ref={svgRef}></svg>
    </div>
  );
}

export default AdxChart;
