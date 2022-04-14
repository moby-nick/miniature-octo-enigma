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

function MovingAverageChart({ config, setConfig, margin }) {
  const svgRef = useRef();
  const wrapperRef = useRef();
  const wrapDim = useResizeObserver(wrapperRef);

  let selected = config.selected;

  useEffect(() => {
    if (!wrapDim) return;
    // console.log("entering MovingAvg with selected ", config.selected);
    const svg = d3.select(svgRef.current);

    const width = wrapDim.width;
    const height = wrapDim.height < 400 ? 400 : wrapDim.height;
    const dates = config.data.map((d) => d.date);

    svg.attr("width", "100%").attr("height", "100%");

    const x = d3
      .scaleUtc()
      .domain(d3.extent(config.data, (d) => d.date))
      .range([margin.left, width - margin.right]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(config.data, (d) => d.trend_sma_slow) * 1.1])
      .range([height - margin.bottom, margin.top]);

    const line = d3
      .line()
      .x((d) => x(d.date))
      .y((d) => y(d.trend_sma_slow))
      .curve(d3.curveCardinal);

    const area = d3
      .area()
      .x((d) => x(d.date))
      .y1((d) => y(d.trend_sma_slow))
      .y0((d) => y.range()[0])
      .curve(d3.curveCardinal);

    const axes = svg.select(".axes");
    const content = svg.select(".content");

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
        .call((g) =>
          g.selectAll("line").attr("stroke", "black").attr("opacity", 0.2)
        );

    axes.select(".y-axis-grid").call(yGrid);

    content
      .select(".hoverText")
      .attr("x", width - margin.right - 10)
      .attr("y", margin.top)
      .attr("dy", -5)
      .attr("fill", "#000")
      .attr("opacity", 0.9)
      .attr("font-size", 12)
      .attr("text-anchor", "end")
      .text(
        config.selected
          ? `${d3.timeFormat("%d %b, %Y")(
              config.data[config.selected].date
            )}: ${d3.format("$,.2f")(
              config.data[config.selected].trend_sma_slow
            )}`
          : ""
      );

    axes
      .select(".x-axis-group")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(4))
      .call((g) => g.select(".domain").remove());

    function formatTick(d) {
      const s = d3.format(",")(d);
      return this.parentNode.nextSibling ? `\xa0${s}` : `$${s}`;
    }

    axes
      .select(".y-axis-group")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(4).tickFormat(formatTick))
      .call((g) => g.select(".domain").remove());

    axes
      .select(".title-text")
      .attr("x", margin.left + 5)
      .attr("y", margin.top)
      .attr("dy", -5)
      .attr("fill", "#000")
      .attr("opacity", 0.5)
      .attr("font-size", 12)
      // .attr("font-weight", "bold")
      .attr("text-anchor", "start")
      .text(`${config.ticker} Moving Average`);

    content
      .selectAll(".fill-area")
      .data([config.data])
      .join("path")
      .transition()
      .attr("class", "fill-area")
      .attr("fill", "black")
      .attr("fill-opacity", 0.1)
      .attr("d", area(config.data));

    content
      .selectAll(".backdropLine")
      .data([config.data])
      .join("path")
      .transition()
      .attr("class", "backdropLine")
      .attr("d", line(config.data));

    content
      .selectAll(".mainChartLine")
      .data([config.data])
      .join("path")
      .transition()
      .attr("class", "mainChartLine")
      .attr("d", line(config.data));

    content
      .selectAll(".selectionCircle")
      .attr("cx", config.selected ? x(config.data[config.selected].date) : 0)
      .attr(
        "cy",
        config.selected ? y(config.data[config.selected].trend_sma_slow) : 0
      )
      .attr("r", 5)
      .attr("class", "selectionCircle")
      .raise();

    svg
      .selectAll(".overlayRect")
      .attr("x", margin.left)
      .attr("y", margin.top)
      .attr("width", width - margin.left - margin.right)
      .attr("height", height - margin.top - margin.bottom)
      .attr("fill", "black")
      .attr("opacity", 0)
      .on("mousemove", (event) => {
        var mouse = d3.pointer(event);
        const xm = x.invert(mouse[0]);
        const i1 = d3.bisectLeft(dates, xm, 1);
        const i0 = i1 - 1;
        const i = xm - dates[i0] > dates[i1] - xm ? i1 : i0;

        if (i >= 0 && i < config.data.length) {
          setConfig({ ...config, selected: i });
        }
      })
      .raise();
  }, [wrapDim, config]);

  return (
    <div ref={wrapperRef} className="viz-wrapper">
      <svg ref={svgRef}>
        <g className="content">
          <circle className="selectionCircle"></circle>
          <text className="hoverText" />
        </g>
        <g className="axes">
          <g className="x-axis-group" />
          <g className="y-axis-group" />
          <g className="y-axis-grid" />
          <text className="title-text" />
        </g>
        <rect className="overlayRect" />
      </svg>
    </div>
  );
}

export default MovingAverageChart;
