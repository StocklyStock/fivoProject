import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const D3CandlestickChart = ({ data }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    d3.select(svgRef.current).selectAll('*').remove();

    const margin = { top: 20, right: 0, bottom: 30, left: 50 };
    const width = 1000;
    const height = 600;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const volumeHeight = 100;

    const parseDate = d3.timeParse('%Y%m%d');
    const candles = data.map((d) => ({
      ...d,
      date: parseDate(d.time)
    })).filter(d => d.date);

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const chart = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .domain(candles.map(d => d.date.toISOString()))
      .range([0, innerWidth])
      .padding(0.3);

    const y = d3.scaleLinear()
      .domain([d3.min(candles, d => d.low) * 0.98, d3.max(candles, d => d.high) * 1.02])
      .range([innerHeight - volumeHeight, 0]);

    const yVolume = d3.scaleLinear()
      .domain([0, d3.max(candles, d => d.volume) * 1.2])
      .range([innerHeight, innerHeight - volumeHeight]);

    // 격자선
    chart.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(y).tickSize(-innerWidth).tickFormat(() => ''))
      .attr('opacity', 0.1);

    chart.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0, ${innerHeight - volumeHeight})`)
      .call(d3.axisBottom(x).tickSize(-innerHeight + volumeHeight).tickFormat(() => ''))
      .attr('opacity', 0.1);

    chart.append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(x).tickFormat((d) => {
        const date = new Date(d);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      }));

    chart.append('g').call(d3.axisLeft(y));

    const candleWidth = x.bandwidth();

    const sma = candles.map((d, i, arr) => {
      if (i < 4) return null;
      const avg = d3.mean(arr.slice(i - 4, i + 1), (d) => d.close);
      return { date: d.date.toISOString(), value: avg };
    }).filter(Boolean);

    const line = d3.line()
      .x(d => x(d.date) + candleWidth / 2)
      .y(d => y(d.value));

    chart.append('path')
      .datum(sma)
      .attr('fill', 'none')
      .attr('stroke', 'orange')
      .attr('stroke-width', 2)
      .attr('d', line);

    const barGroup = chart.append('g');
    candles.forEach(d => {
      const xVal = x(d.date.toISOString());
      const color = d.close > d.open ? '#2ca02c' : '#d62728';

      barGroup.append('line')
        .attr('x1', xVal + candleWidth / 2)
        .attr('x2', xVal + candleWidth / 2)
        .attr('y1', y(d.high))
        .attr('y2', y(d.low))
        .attr('stroke', color);

      barGroup.append('rect')
        .attr('x', xVal)
        .attr('y', y(Math.max(d.open, d.close)))
        .attr('width', candleWidth)
        .attr('height', Math.max(1, Math.abs(y(d.open) - y(d.close))))
        .attr('fill', color);

      barGroup.append('rect')
        .attr('x', xVal)
        .attr('y', yVolume(d.volume))
        .attr('width', candleWidth)
        .attr('height', innerHeight - yVolume(d.volume))
        .attr('fill', color)
        .attr('opacity', 0.4);
    });

    // 크로스헤어 추가
    const crosshairV = svg.append('line')
      .attr('stroke', '#aaa')
      .attr('stroke-dasharray', '3,3')
      .attr('y1', margin.top)
      .attr('y2', height - margin.bottom)
      .style('display', 'none');

    const crosshairH = svg.append('line')
      .attr('stroke', '#aaa')
      .attr('stroke-dasharray', '3,3')
      .attr('x1', margin.left)
      .attr('x2', width - margin.right)
      .style('display', 'none');

    const tooltip = chart.append('g').style('display', 'none');
    tooltip.append('rect')
      .attr('width', 160)
      .attr('height', 110)
      .attr('fill', 'white')
      .attr('stroke', '#ccc')
      .attr('rx', 8)
      .attr('ry', 8)
      .attr('opacity', 0.95);

    const tooltipTexts = Array.from({ length: 6 }).map((_, i) =>
      tooltip.append('text')
        .attr('x', 10)
        .attr('y', 20 + i * 16)
        .attr('font-size', 12)
        .attr('fill', '#333')
    );

    svg.on('mousemove', function (event) {
      const [mx, my] = d3.pointer(event);
      const x0 = mx - margin.left;
      const dateMap = new Map(candles.map(d => [x(d.date.toISOString()), d]));
      let closest = null;
      let minDist = Infinity;
      for (let [xVal, d] of dateMap) {
        const center = xVal + candleWidth / 2;
        const dist = Math.abs(x0 - center);
        if (dist < minDist) {
          minDist = dist;
          closest = d;
        }
      }
      if (!closest) return;

      const dx = x(closest.date.toISOString());
      const xPos = dx + candleWidth / 2 + margin.left;
      const changeRate = ((closest.close - closest.open) / closest.open) * 100;
      const rateColor = changeRate >= 0 ? 'red' : 'blue';

      let tooltipX = xPos + 10;
      if (tooltipX + 160 > width) tooltipX = xPos - 170;

      tooltip.style('display', null).attr('transform', `translate(${tooltipX - margin.left}, 40)`);
      tooltipTexts[0].text(`📅 ${d3.timeFormat('%Y-%m-%d')(closest.date)}`);
      tooltipTexts[1].text(`시: ${closest.open}`);
      tooltipTexts[2].text(`고: ${closest.high}`);
      tooltipTexts[3].text(`저: ${closest.low}`);
      tooltipTexts[4].text(`종: ${closest.close}`);
      tooltipTexts[5].text(`변동률: ${changeRate.toFixed(2)}%`).attr('fill', rateColor);

      crosshairV
        .attr('x1', xPos)
        .attr('x2', xPos)
        .style('display', null);

      crosshairH
        .attr('y1', my)
        .attr('y2', my)
        .style('display', null);
    });

    svg.on('mouseleave', () => {
      tooltip.style('display', 'none');
      crosshairV.style('display', 'none');
      crosshairH.style('display', 'none');
    });
  }, [data]);

  return (
    <div className='scroll-wrap'>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default D3CandlestickChart;