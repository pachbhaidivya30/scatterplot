import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import classes from "./BarChart.module.css";
import tip from "d3-tip";
import { convertNumber, getTickDistancesMap } from "./helper";
import { Divider } from "antd";

const BarChart = ({
  chartData = [],
  xAxisTitle = "",
  yAxisTitle = "",
  zAxisTitle = "",
  barTooltipFunc,
  toggleValue = false,
  columnColors = [
    "var(--fractal-brand-blue-6)",
    "var(--fractal-brand-blue-5)",
    "var(--fractal-brand-blue-4)",
    "var(--fractal-brand-blue-3)",
    "var(--fractal-brand-blue-2)",
    "var(--fractal-brand-blue-1)",
  ],
  xDataPoint = "",
  yDataPoint = "",
  zDataPoint = "",
  tickCount = 3,
  barLabel = "",
  margin = { top: 30, bottom: 40, right: 40, left: 40 },
  showPercentOnTop = false,
  showLineChart = false,
  lineColors = ["var(--fractal-brand-blue-4)"],
  height = 0,
  width = 0,
  yAxisBarRange = undefined,
  yAxisBarPrecision = 0,
  tooltipDataPoint = "",
}) => {
  const xAxisLabels = chartData.map((d) => d[xDataPoint]);
  const svgElement = useRef();

  const currencySelected = "Local"; // USD or Local

  useEffect(() => {
    svgElement.current.scrollTop = svgElement.current.scrollHeight;

    // width = width <= 0 ? svgElement.current.parentElement.clientWidth : width;
    // height =
    //   height <= 0 ? height : svgElement.current.parentElement.clientHeight;

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    let svg = d3
      .select(svgElement.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    let tooltip = tip().attr("class", "d3-tip").html(barTooltipFunc);

    svg.call(tooltip);

    let xScale = d3
      .scaleBand()
      .range([margin.left, width - margin.left - margin.right])
      .padding(0.3);

    let yScale = d3
      .scaleLinear()
      .range([height - margin.top - margin.bottom, margin.bottom]);

    let zScale = d3
      .scaleLinear()
      .range([height - margin.top - margin.bottom, margin.bottom]);

    let g = svg.append("g");
    let g1 = svg.append("g");

    xScale.domain(chartData.map((d) => d[xDataPoint]));
    yScale.domain([0, d3.max(chartData, (d) => d[yDataPoint]) * 1.3]);
    zScale.domain([
      0,
      d3.max(chartData, function (d) {
        return parseInt(d[zDataPoint]) * 1.5;
      }),
    ]);

    //X axis
    g.append("g")
      .attr("transform", `translate(0,${yScale(0)})`)
      .call(d3.axisBottom(xScale).tickSize(0))
      .call((g) => g.select(".domain").remove())
      .call(d3.axisBottom(xScale).tickSize(0).tickPadding(8))
      .attr("class", classes["barchart-vertical-x-axis"]);

    //Y axis for bar chart.
    g.append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(
        d3
          .axisLeft(yScale)
          .tickFormat((d) =>
            d == 0 ? 0 : convertNumber(d, yAxisBarRange, yAxisBarPrecision)
          )
          .ticks(tickCount)
          .tickSize(0)
          .tickPadding(8)
      )
      .attr("class", classes["barchart-vertical-y-axis"]);

    const tickDistancesMap = getTickDistancesMap(xAxisLabels, "x");

    //Bars
    g.selectAll(".bar")
      .data(chartData)
      .enter()
      .append("rect")
      .attr("class", classes["bar"])
      .style("fill", (d, i) => {
        if (columnColors.length > 1) {
          return columnColors[i];
        } else {
          return columnColors[0];
        }
      }) // Setting the colors for rect
      .style("z-index", 10)
      .attr("x", function (d) {
        return tickDistancesMap[d[xDataPoint]] - xScale.bandwidth() / 2;
      })
      .attr("y", function (d) {
        return yScale(d[yDataPoint]);
      })
      .attr("width", xScale.bandwidth())
      .attr("height", function (d) {
        return yScale(0) - yScale(d[yDataPoint]);
      });
    // .on("mouseover", tooltip.show)
    // .on("mouseout", tooltip.hide);

    if (showLineChart) {
      g1.attr(
        "transform",
        `translate(${width - margin.left - margin.right}, 0)`
      ).call(
        d3
          .axisRight(zScale)
          .tickFormat(function (d) {
            return d;
          })
          .ticks(tickCount)
          .tickSize(0)
      );

      // Line Chart for WADTC
      g.append("path")
        .datum(chartData)
        .attr("class", classes["line-chart-1"])
        .attr("fill", "none")
        .attr("stroke", lineColors[0])
        .attr("stroke-width", 3)
        .attr(
          "d",
          d3
            .line()
            .x(function (d) {
              return tickDistancesMap[d[xDataPoint]];
            })
            .y(function (d) {
              return zScale(d[zDataPoint]);
            })
        );

      g.append("g")
        .selectAll(".line-chart-1")
        .data(chartData)
        .join("circle")
        .attr("fill", lineColors[0])
        .attr("class", classes["line-chart-1-dot"])
        .attr("r", "4")
        .attr("cx", (d) => tickDistancesMap[d[xDataPoint]])
        .attr("cy", (d) => zScale(d[zDataPoint]))
        .append("title")
        .text((d) => {
          return toggleValue === false
            ? d[xDataPoint] + " | " + convertNumber(d[tooltipDataPoint])
            : d[xDataPoint] + " | " + d[tooltipDataPoint] + "%";
        });

      // Line Chart for W Term Days
      g.append("path")
        .datum(chartData)
        .attr("fill", "none")
        .attr("class", classes["line-chart-2"])
        .attr("stroke", lineColors[0])
        .attr("stroke-width", 3)
        .attr(
          "d",
          d3
            .line()
            .x(function (d) {
              return tickDistancesMap[d[xDataPoint]];
            })
            .y(function (d) {
              return zScale(d[zDataPoint]);
            })
        );

      // g.append("g")
      //   .selectAll(".line-chart-2")
      //   .data(chartData)
      //   .join("circle")
      //   .attr("fill", lineColors[0])
      //   .attr("class", classes["line-chart-2-dot"])
      //   .attr("r", "4")
      //   .attr("cx", (d) => tickDistancesMap[d[xDataPoint]])
      //   .attr("cy", (d) => zScale(d[barLabel]))
      //   .append("title")
      //   .text((d) => {
      //     return d[xDataPoint] + " | " + d[barLabel]
      //   });
    }

    //Percentage above the Bars
    if (showPercentOnTop) {
      g.selectAll(".text")
        .data(chartData)
        .enter()
        .append("text")
        .attr("class", classes["text"])
        .attr("x", (d) => xScale(d[xDataPoint]) + xScale.bandwidth() / 2)
        .attr("y", (d) => yScale(d[yDataPoint]) - 6)
        .attr("dy", "-0.5em")
        .text((d) =>
          barLabel.includes("percent")
            ? d[barLabel] + "%"
            : convertNumber(d[barLabel])
        );
      // .on("mouseover", tooltip.show)
      // .on("mouseout", tooltip.hide);
    }

    //X axis caption.
    if (xAxisTitle !== "") {
      svg
        .append("text")
        .attr("class", classes["x-axis-caption"])
        .attr("y", yScale(0) + margin.bottom)
        .attr("dy", "0.5em")
        .attr("x", width / 2)
        .attr("text-anchor", "middle")
        .text(xAxisTitle);
    }

    //Y axis caption for bar chart.
    if (yAxisTitle !== "") {
      svg
        .append("text")
        .attr("class", classes["y-axis-bar-caption"])
        .attr(`transform`, `rotate(-90)`)
        .attr("y", margin.left / 4)
        .attr("x", -(height / 2.5))
        .attr("dx", "1em")
        .attr("text-anchor", "middle")
        .text(yAxisTitle);
    }

    //Y axis caption for line chart.
    if (zAxisTitle !== "") {
      svg
        .append("text")
        .attr("class", classes["y-axis-line-caption"])
        .attr("transform", "rotate(-90)")
        .attr("y", width - margin.left - margin.top)
        .attr("dy", "0.8em")
        .attr("x", -(height / 2.5))
        .attr("dx", "1em")
        .attr("text-anchor", "middle")
        .text(zAxisTitle);
    }

    svg
      .selectAll(".y-gridline")
      .data(yScale.ticks(tickCount))
      .enter()
      .append("line")
      .attr("class", "y-gridline")
      .attr("x1", margin.left)
      .attr("x2", width - margin.left - margin.right)
      .attr("y1", (d) => yScale(d) - margin.top / (tickCount - margin.bottom))
      .attr("y2", (d) => yScale(d) - margin.top / (tickCount - margin.bottom))
      .style("stroke-dasharray", "5,4")
      .style("stroke", "#C4C4C4")
      .style("z-index", "0");

    return () => {
      const prevState = svgElement.current;
      if (prevState) {
        prevState.innerHTML = "";
      }
    };
  }, [chartData, toggleValue]);

  return (
    <React.Fragment>
      <div className={classes["overdue-by-days"]}>
        <div ref={svgElement}></div>
      </div>
    </React.Fragment>
  );
};

export default BarChart;