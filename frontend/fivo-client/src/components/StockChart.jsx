import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const D3CandlestickChart = ({ data, symbol, timeframe }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    // 차트를 그리기 전에 이전의 모든 요소를 제거
    d3.select(svgRef.current).selectAll('*').remove();

    const margin = { top:20, right: 0, bottom: 30, left: 50 };
    const width = 1000;  // 차트 너비
    const height = 600;  // 차트 높이
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const volumeHeight = 100;  // 볼륨 차트 높이

    const parseDate = d3.timeParse('%Y%m%d');
    const candles = data.map((d) => ({
      ...d,
      date: parseDate(d.time), // 시간 데이터를 Date 객체로 변환
    }));

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('class', 'chart-area')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // x, y 스케일 정의
    const x = d3.scaleBand()
      .domain(candles.map((d) => d.date.toISOString()))
      .range([0, innerWidth])
      .padding(0.3);

    const y = d3.scaleLinear()
      .domain([d3.min(candles, (d) => d.low) * 0.98, d3.max(candles, (d) => d.high) * 1.02])
      .range([innerHeight - volumeHeight, 0]);

    const yVolume = d3.scaleLinear()
      .domain([0, d3.max(candles, (d) => d.volume) * 1.2])
      .range([innerHeight, innerHeight - volumeHeight]);

    // 그리드 추가 (색상 연하게 설정)
    svg.append('g')
      .attr('class', 'grid y-grid')
      .call(d3.axisLeft(y).tickSize(-innerWidth).tickFormat(() => ''))
      .style('stroke-opacity', 0.1); // 격자선 투명도 설정

    svg.append('g')
      .attr('class', 'grid x-grid')
      .attr('transform', `translate(0, ${innerHeight - volumeHeight})`)
      .call(d3.axisBottom(x).tickSize(-innerHeight + volumeHeight).tickFormat(() => ''))
      .style('stroke-opacity', 0.1); // 격자선 투명도 설정

    // x 축 날짜 표시
    svg.append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(x).tickFormat((d) => {
        const date = new Date(d);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      }));

    svg.append('g').call(d3.axisLeft(y));

    // 단순 이동 평균 (SMA) 추가
    const sma = candles.map((d, i, arr) => {
      if (i < 4) return null;
      const avg = d3.mean(arr.slice(i - 4, i + 1), (d) => d.close);
      return { date: d.date, value: avg };
    }).filter(Boolean);

    const line = d3.line()
      .x((d) => x(d.date.toISOString()) + x.bandwidth() / 2)
      .y((d) => y(d.value));

    svg.append('path')
      .datum(sma)
      .attr('fill', 'none')
      .attr('stroke', 'orange')
      .attr('stroke-width', 2)
      .attr('d', line);

    // 캔들 바 그리기
    const barGroup = svg.append('g').attr('class', 'candles');
    candles.forEach((d) => {
      const xVal = x(d.date.toISOString());
      const bw = x.bandwidth();
      const color = d.close > d.open ? '#d62728' : '#2ca02c';

      barGroup.append('line')
        .attr('x1', xVal + bw / 2)
        .attr('x2', xVal + bw / 2)
        .attr('y1', y(d.high))
        .attr('y2', y(d.low))
        .attr('stroke', color);

      barGroup.append('rect')
        .attr('x', xVal)
        .attr('y', y(Math.max(d.open, d.close)))
        .attr('width', bw)
        .attr('height', Math.max(1, Math.abs(y(d.open) - y(d.close))))
        .attr('fill', color);

      barGroup.append('rect')
        .attr('x', xVal)
        .attr('y', yVolume(d.volume))
        .attr('width', bw)
        .attr('height', innerHeight - yVolume(d.volume))
        .attr('fill', color)
        .attr('opacity', 0.4);
    });

    // 크로스헤어 및 툴팁 설정
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

    const tooltipGroup = svg.append('g').style('display', 'none');
    const tooltipBox = tooltipGroup.append('rect')
      .attr('width', 160)
      .attr('height', 120)
      .attr('rx', 8)
      .attr('ry', 8)
      .attr('fill', 'white')
      .attr('stroke', '#ccc')
      .attr('opacity', 0.95);

    const tooltipLines = Array.from({ length: 7 }).map((_, i) =>
      tooltipGroup.append('text')
        .attr('x', 12)
        .attr('y', 20 + i * 15)
        .attr('font-size', i === 0 ? 13 : 12)
        .attr('font-weight', i === 0 ? 'bold' : 'normal')
        .attr('fill', '#333')
    );

    const staticText = svg.append('text')
      .attr('x', 10)
      .attr('y', 15)
      .attr('font-size', 12)
      .attr('fill', 'black');

    svg.on('mousemove', function (event) {
      const [mx, my] = d3.pointer(event);
      const dateToX = new Map(candles.map((d) => [d.date.toISOString(), x(d.date.toISOString())]));
      const closest = d3.least(candles, (d) =>
        Math.abs((dateToX.get(d.date.toISOString()) ?? 0) + x.bandwidth() / 2 - (mx - margin.left))
      );

      if (!closest) return;

      const dx = dateToX.get(closest.date.toISOString());
      const xPos = dx + x.bandwidth() / 2 + margin.left;

      const tooltipWidth = 160;
      const tooltipOffset = 10;
      const showLeft = xPos + tooltipWidth + tooltipOffset > width;
      const tooltipX = showLeft ? xPos - tooltipWidth - tooltipOffset : xPos + tooltipOffset;

      tooltipGroup
        .style('display', null)
        .attr('transform', `translate(${tooltipX},${my - 60})`);

      const changeRate = ((closest.close - closest.open) / closest.open) * 100;
      const rateColor = changeRate >= 0 ? 'red' : 'blue';

      tooltipLines[0].text(`📅 ${d3.timeFormat('%Y-%m-%d')(closest.date)}`);
      tooltipLines[1].text(`시: ${closest.open.toLocaleString()}`);
      tooltipLines[2].text(`고: ${closest.high.toLocaleString()}`);
      tooltipLines[3].text(`저: ${closest.low.toLocaleString()}`);
      tooltipLines[4].text(`종: ${closest.close.toLocaleString()}`);
      tooltipLines[5]
        .text(`변동률: ${changeRate.toFixed(2)}%`)
        .attr('fill', rateColor);
      tooltipLines[6].text(`거래량: ${(closest.volume / 1_000_000).toFixed(1)}M`);

      staticText.html(
        `📅 ${d3.timeFormat('%Y-%m-%d')(closest.date)} | 시: ${closest.open.toLocaleString()} 고: ${closest.high.toLocaleString()} 저: ${closest.low.toLocaleString()} 종: ${closest.close.toLocaleString()} <tspan fill="${rateColor}">(${changeRate.toFixed(2)}%)</tspan> 거래량: ${(closest.volume / 1_000_000).toFixed(1)}M`
      );

      crosshairV.attr('x1', xPos).attr('x2', xPos).style('display', null);
      crosshairH.attr('y1', my).attr('y2', my).style('display', null);
    });

    svg.on('mouseleave', () => {
      tooltipGroup.style('display', 'none');
      crosshairV.style('display', 'none');
      crosshairH.style('display', 'none');
      staticText.text('');
    });

    svg.call(
      d3.zoom()
        .scaleExtent([1, 5])
        .translateExtent([[0, 0], [width, height]])
        .on('zoom', (event) => {
          svgArea.attr('transform', `translate(${margin.left + event.transform.x},${margin.top}) scale(${event.transform.k}, 1)`);
        })
    );
  }, [data]);

  return (
    <div className='scroll-wrap'>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default D3CandlestickChart;
