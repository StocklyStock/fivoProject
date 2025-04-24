import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const Treemap = ({ data, onThemeClick }) => {
  const svgRef = useRef();

  /* 20250423 - 반응형을 위한 코드 추가 - 박홍덕 - start */
  const containerRef = useRef();
  const [containerWidth, setContainerWidth] = useState(1000);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const newWidth = entries[0].contentRect.width;
      setContainerWidth(newWidth);
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);
  /* 20250423 - 반응형을 위한 코드 추가 - 박홍덕 - end */

  useEffect(() => {
    if (!data || !data.children) return;

  /* 20250423 - 반응형을 위한 코드 추가 - 박홍덕 - start */
    const isVertical = containerWidth <= 768;
    const width = containerWidth;
    const height = 500;
  /* 20250423 - 반응형을 위한 코드 추가 - 박홍덕 - end */

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${isVertical ? height * 2 : height}`) // 20250423 - 반응형을 위한 코드 추가 - 박홍덕
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

  /* 20250423 - 반응형을 위한 코드 추가 - 박홍덕 - start */
    const layoutWidth = isVertical ? width : width / 2;
    const layoutHeight = height;
  /* 20250423 - 반응형을 위한 코드 추가 - 박홍덕 - end */

    const posRoot = d3
      .treemap()
      .size([layoutWidth, layoutHeight]) // 20250423 - 반응형을 위한 코드 추가 - 박홍덕
      .padding(0)(posHierarchy);

    const negRoot = d3
      .treemap()
      .size([layoutWidth, layoutHeight]) // 20250423 - 반응형을 위한 코드 추가 - 박홍덕
      .padding(0)(negHierarchy);

    /* 20250423 - 반응형을 위한 코드 추가 - 박홍덕 - start */
    if(isVertical){
      negRoot.eachBefore((node) => {
        if(node.parent){
          node.y0 += layoutHeight;
          node.y1 += layoutHeight;
        }
      });
    } else {
      negRoot.eachBefore((node) => {
        if(node.parent){
          node.x0 += layoutWidth;
          node.x1 += layoutWidth;
        }
      });
    }

    /* 20250423 - 반응형을 위한 코드 추가 - 박홍덕 - end */  

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
            .attr("stroke", "white")
            .attr("rx", 3)
            .attr("ry", 3);;

          // g.append("text")
          //   .attr("x", (d) => (d.x1 - d.x0) / 2)
          //   .attr("y", (d) => (d.y1 - d.y0) / 2)
          //   .attr("text-anchor", "middle")
          //   .style("font-size", (d) =>
          //     `${Math.max(Math.min((d.x1 - d.x0) / 8, 14), 8)}px`
          //   )
          //   .style("fill", "white")
          //   .text((d) => {
          //     const name = d.data.name ?? "";
          //     const value = parseFloat(d.data.value);
          //     const valueText =
          //       !isNaN(value) && typeof value === "number"
          //         ? `${value > 0 ? "+" : ""}${value.toFixed(2)}%`
          //         : "";
          //     return `${name}\n${valueText}`;
          // 텍스트를 foreignObject로 삽입
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
          .style("cursor","pointer")
          .style("font-size", (d) => {
            const w = d.x1 - d.x0;
            return `${Math.max(12.5, Math.min(13, w /10))}px`
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
  }, [data, onThemeClick, containerWidth]); // 20250423 - 반응형을 위한 코드 추가 - 박홍덕

  return (
    <div ref={containerRef}>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default Treemap;