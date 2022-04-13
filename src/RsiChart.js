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

function RsiChart({ config, setConfig, margin }) {
  const svgRef = useRef();
  const wrapperRef = useRef();
  const wrapDim = useResizeObserver(wrapperRef);

  let selected = config.selected;

  // close: 396.536133
  // date: Mon Apr 12 2021 02:00:00 GMT+0200 (Central European Summer Time) {}
  // momentum_rsi: 55.40683407538983
  // symbol: "AAVEUSD"
  // trend_adx: 15.324558408856744
  // trend_sma_slow: 367.33209

  useEffect(() => {
    console.log("entering Rsi with selected ", config.selected);
    const svg = d3.select(svgRef.current);

    svg.selectAll("*").remove();
    if (!wrapDim) return;

    const width = wrapDim.width;
    const height = wrapDim.height < 400 ? 400 : wrapDim.height;

    const dates = config.data.map((d) => d.date);

    svg
      .append("defs")
      .append("linearGradient")
      .attr("id", "line-gradient-rsi")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 0)
      .attr("y2", height)
      .selectAll("stop")
      .data([
        { offset: "20%", color: "red" },
        { offset: "40%", color: "white" },
        { offset: "60%", color: "white" },
        { offset: "80%", color: "green" },
      ])
      .enter()
      .append("stop")
      .attr("offset", function (d) {
        return d.offset;
      })
      .attr("stop-color", function (d) {
        return d.color;
      });

    svg.attr("width", "100%").attr("height", "100%");

    // console.log("rokam sa ", config);
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
      .y((d) => y(d.momentum_rsi))
      .curve(d3.curveCardinal);

    const axes = svg.append("g");
    const content = svg.append("g").attr("class", "content");
    content
      .append("rect")
      .attr("x", margin.left)
      .attr("y", margin.top)
      .attr("width", width - margin.left - margin.right)
      .attr("height", height - margin.top - margin.bottom)
      .attr("fill", "url(#line-gradient-rsi)")
      .attr("opacity", 0.35)
      .on("mousemove", (event) => {
        var mouse = d3.pointer(event);
        const xm = x.invert(mouse[0]);
        const i1 = d3.bisectLeft(dates, xm, 1);
        const i0 = i1 - 1;
        const i = xm - dates[i0] > dates[i1] - xm ? i1 : i0;

        if (i >= 0 && i < config.data.length) {
          // d3.select(".titleDate").text(d3.utcFormat("%b %d, %Y")(config.data[i].date));

          // d3.selectAll(".hoverline")
          //   .attr("x1", x(config.data[i].date))
          //   .attr("x2", x(config.data[i].date))
          //   .attr("display", null);

          setConfig({ ...config, selected: i });
        }
      });

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

    axes.append("g").call(yGrid);

    if(selected) {
      axes
      .append("text")
      .attr("x", width - margin.right - 10)
      .attr("y", margin.top)
      .attr("dy", -5)
      .attr("fill", "#000")
      .attr("opacity", 0.9)
      .attr("font-size", 12)
      // .attr("font-weight", "bold")
      .attr("text-anchor", "end")
      .text(`${d3.timeFormat("%d %b, %Y")(config.data[selected].date)}: ${d3.format(",.0f")(config.data[selected].momentum_rsi)}%`);
    }

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
      .call((g) =>
        g.select(".tick:last-of-type text").append("tspan").text("%")
      )
      .call((g) =>
        g
          .append("text")
          .attr("x", 5)
          .attr("y", margin.top)
          .attr("dy", -5)
          .attr("fill", "#000")
          .attr("opacity", 0.5)
          .attr("font-size", 12)
          // .attr("font-weight", "bold")
          .attr("text-anchor", "start")
          .text(`${config.ticker} Relative Strength Index`)
      );

    //add the 50% dotted line
    // content
    //   .append("line")
    //   .attr("x1", x.range()[0])
    //   .attr("x2", x.range()[1])
    //   .attr("y1", y(50))
    //   .attr("y2", y(50))
    //   .attr("stroke", "black")
    //   // .attr('stroke-width', .5)
    //   .attr("opacity", 0.4)
    //   .attr("stroke-dasharray", "8,4");

    content
      .append("path")
      .attr("class", "backdropLine")
      // .attr(
      //   "d",
      //   line(
      //     config.data.map((d) => {
      //       return { ...d, momentum_rsi: 0 };
      //     })
      //   )
      // )
      // .transition()
      // .duration(1000)
      .attr("d", line(config.data));

    content
      .append("path")
      .attr("class", "mainChartLine")
      // .attr(
      //   "d",
      //   line(
      //     config.data.map((d) => {
      //       return { ...d, momentum_rsi: 0 };
      //     })
      //   )
      // )
      // .transition()
      // .duration(1000)
      .attr("d", line(config.data));

    content
      .append("circle")
      .attr("cx", config.selected ? x(config.data[selected].date) : 0)
      .attr("cy", config.selected ? y(config.data[selected].momentum_rsi) : 0)
      .attr("r", 5)
      .attr("class", "selectionCircle");
  }, [wrapDim, config]);

  return (
    <div ref={wrapperRef} className="viz-wrapper">
      <svg ref={svgRef}></svg>
    </div>
  );
}

export default RsiChart;
