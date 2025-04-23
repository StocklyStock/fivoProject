import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const Treemap = ({ data, onThemeClick }) => {
  const svgRef = useRef();
  const [containerWidth, setContainerWidth] = useState(0);

  // 👉 resize 될 때마다 containerWidth 업데이트
  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current) {
        setContainerWidth(svgRef.current.clientWidth);
      }
    };

    handleResize(); // 초기 실행
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!data || !data.children || containerWidth === 0) return;

    const width = containerWidth;
    const height = 500;
    const isTablet = window.innerWidth <= 768;

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("width", "100%")
      .style("height", `${height}px`);

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
      .size(isTablet ? [width, height / 2] : [width / 2, height])
      .padding(0)(posHierarchy);

    const negRoot = d3
      .treemap()
      .size(isTablet ? [width, height / 2] : [width / 2, height])
      .padding(0)(negHierarchy);

    if (!isTablet) {
      negRoot.eachBefore((node) => {
        if (node.parent) {
          node.x0 += width / 2;
          node.x1 += width / 2;
        }
      });
    } else {
      negRoot.eachBefore((node) => {
        if (node.parent) {
          node.y0 += height / 2;
          node.y1 += height / 2;
        }
      });
    }

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
          if (onThemeClick && d.data.theme_code) {
            onThemeClick(d.data.theme_code);
          }
        })
        .call((g) => {
          g.append("rect")
            .attr("width", (d) => d.x1 - d.x0)
            .attr("height", (d) => d.y1 - d.y0)
            .attr("fill", (d) => colorScale(d.data.value))
            .attr("stroke", "white")
            .attr("rx", 3)
            .attr("ry", 3);

          g.append("foreignObject")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", (d) => d.x1 - d.x0)
            .attr("height", (d) => d.y1 - d.y0)
            .append("xhtml:div")
            .style("width", "100%")
            .style("height", "100%")
            .style("display", "flex")
            .style("flex-direction", "column")
            .style("justify-content", "center")
            .style("align-items", "center")
            .style("text-align", "center")
            .style("cursor", "pointer")
            .style("font-size", (d) => {
              const w = d.x1 - d.x0;
              return `${Math.max(12.5, Math.min(13, w / 10))}px`;
            })
            .style("line-height", "1.2")
            .style("color", "white")
            .style("padding", "10px")
            .style("overflow", "hidden")
            .style("word-break", "break-word")
            .html((d) => {
              const name = d.data.name ?? "";
              const value = parseFloat(d.data.value);
              const valueText = !isNaN(value)
                ? `${value > 0 ? "+" : ""}${value.toFixed(2)}%`
                : "";
              return `<div>${name}</div><div>${valueText}</div>`;
            });
        });
    };

    renderGroup(posRoot, "pos");
    renderGroup(negRoot, "neg");
  }, [data, onThemeClick, containerWidth]);

  return <svg ref={svgRef}></svg>;
};

export default Treemap;