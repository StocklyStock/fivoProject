import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const Treemap = ({ data, onThemeClick }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || !data.children) return;

    const width = 1000;
    const height = 500;

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("width", "100%")
      .style("height", "auto");

    svg.selectAll("*").remove();

    const positiveData = {
      name: "양수",
      children: data.children.filter((d) => d.value >= 0),
    };

    const negativeData = {
      name: "음수",
      children: data.children.filter((d) => d.value < 0),
    };

    const posHierarchy = d3
      .hierarchy(positiveData)
      .sum((d) => d.value)
      .sort((a, b) => b.value - a.value);

    const negHierarchy = d3
      .hierarchy(negativeData)
      .sum((d) => Math.abs(d.value))
      .sort((a, b) => a.value - b.value);

    const posRoot = d3
      .treemap()
      .size([width / 2, height])
      .padding(5)(posHierarchy);

    const negRoot = d3
      .treemap()
      .size([width / 2, height])
      .padding(5)(negHierarchy);

    negRoot.eachBefore((node) => {
      if (node.parent) {
        node.x0 = width / 2 + node.x0;
        node.x1 = width / 2 + node.x1;
      }
    });

    const minNeg = d3.min(negativeData.children, (d) => d.value);
    const maxPos = d3.max(positiveData.children, (d) => d.value);

    const colorScale = (d) =>
      d >= 0
        ? d3.interpolateReds(d / maxPos)
        : d3.interpolateBlues(Math.abs(d / minNeg));

    const renderGroup = (root, className) => {
      svg
        .selectAll(`g.${className}`)
        .data(root.leaves())
        .join("g")
        .attr("class", className)
        .attr("transform", (d) => `translate(${d.x0}, ${d.y0})`)
        .on("click", (event, d) => {
          console.log("🖱️ 클릭된 테마:", d.data); // 👉 디버깅에 유용
          if (onThemeClick && d.data.theme_code) {
            onThemeClick(d.data.theme_code);
          }
        })
        .call((g) => {
          g.append("rect")
            .attr("width", (d) => d.x1 - d.x0)
            .attr("height", (d) => d.y1 - d.y0)
            .attr("fill", (d) => colorScale(d.data.value))
            .attr("stroke", "white");

          g.append("text")
            .attr("x", (d) => (d.x1 - d.x0) / 2)
            .attr("y", (d) => (d.y1 - d.y0) / 2)
            .attr("text-anchor", "middle")
            .style("font-size", (d) =>
              `${Math.max(Math.min((d.x1 - d.x0) / 8, 14), 8)}px`
            )
            .style("fill", "white")
            .text((d) => {
              const name = d.data.name ?? "";
              const value = parseFloat(d.data.value);
              const valueText =
                !isNaN(value) && typeof value === "number"
                  ? `${value > 0 ? "+" : ""}${value.toFixed(2)}%`
                  : "";
              return `${name}\n${valueText}`;
            });
        });
    };

    renderGroup(posRoot, "pos");
    renderGroup(negRoot, "neg");
  }, [data, onThemeClick]);

  return <svg ref={svgRef}></svg>;
};

export default Treemap;