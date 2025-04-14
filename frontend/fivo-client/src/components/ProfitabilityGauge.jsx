import React, { useState } from 'react';
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts';

const ProfitabilityGauge = ({ score }) => {
  const color =
    score >= 80 ? '#2ca02c' : score >= 50 ? '#f9c80e' : '#d62728';

  const getRiskLevel = (score) => {
    if (score >= 80) return '우수';
    if (score >= 50) return '보통';
    return '취약';
  };
  const riskLevel = getRiskLevel(score);

  const [showTooltip, setShowTooltip] = useState(false);

  const tooltipStyle = {
    position: 'absolute',
    top: 40,
    left: 10,
    background: '#333',
    color: '#fff',
    padding: '10px 14px',
    borderRadius: 8,
    fontSize: 12,
    whiteSpace: 'pre-line',
    maxWidth: 320,
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
    zIndex: 100,
  };

  const explanation = `📌 수익성 점수란?\n
ROE, ROA, 영업이익률, 순이익률 각각을 가중치에 따라 점수화한 총점입니다.
최대 100점이며, 점수가 높을수록 기업의 수익성이 우수함을 의미합니다.

- 80점 이상 : 우수
- 50~79점 : 보통
- 50점 미만 : 취약`;

  return (
    <div style={{ marginBottom: 24, maxWidth: 300, position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
        <h3 style={{ margin: 0 }}>📋 수익성 점수</h3>
        <span
          style={{ marginLeft: 6, cursor: 'pointer', fontWeight: 'bold', color: '#888' }}
          title="수익성 점수 설명"
          onClick={() => setShowTooltip(!showTooltip)}
        >
          ℹ️
        </span>
      </div>

      {showTooltip && <div style={tooltipStyle}>{explanation}</div>}

      <ResponsiveContainer width="100%" height={200}>
        <RadialBarChart
          cx="50%"
          cy="100%"
          innerRadius="60%"
          outerRadius="100%"
          startAngle={180}
          endAngle={0}
          barSize={20}
          data={[{ name: 'profitability', value: score, fill: color }]}
        >
          {/* @ts-ignore */}
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} angleAxisId={0} />
          <RadialBar background dataKey="value" cornerRadius={10} />
        </RadialBarChart>
      </ResponsiveContainer>

      <div style={{ textAlign: 'center', marginTop: 8 }}>
        <div style={{ fontSize: 18, fontWeight: 600, color }}>{score}</div>
        <div style={{ fontSize: 14, fontWeight: 500, color }}>{riskLevel}</div>
      </div>
    </div>
  );
};

export default ProfitabilityGauge;
