import React, { useState } from 'react';
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts';

const getStatus = (score) => {
  if (score === null || isNaN(score)) return { label: '정보 없음', color: '#999' };
  if (score >= 75) return { label: '안정', color: '#2ca02c' };
  if (score >= 50) return { label: '보통', color: '#f9c80e' };
  return { label: '위험', color: '#d62728' };
};

const StabilityGauge = ({ score }) => {
  const { label, color } = getStatus(score);

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

  const explanation = `📌 안정성 점수란?\n
부채비율, 고정비율, 유동비율, 당좌비율 각각을 평가하여 계산한 총점입니다.
총점은 100점 만점이며, 점수가 높을수록 재무 안정성이 뛰어납니다.

- 75점 이상 : 안정
- 50~74점 : 보통
- 50점 미만 : 위험`;

  return (
    <div style={{ marginBottom: 24, maxWidth: 300, position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
        <h3 style={{ margin: 0 }}>📋 안정성 점수</h3>
        <span
          style={{
            marginLeft: 6,
            cursor: 'pointer',
            fontWeight: 'bold',
            color: '#888',
          }}
          title="안정성 점수 설명"
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
          data={[{ name: 'stability', value: score, fill: color }]}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} angleAxisId={0} />
          <RadialBar background dataKey="value" cornerRadius={10} />
        </RadialBarChart>
      </ResponsiveContainer>

      <div style={{ textAlign: 'center', marginTop: 8 }}>
        <div style={{ fontSize: 18, fontWeight: 600, color }}>
          {score}
        </div>
        <div style={{ fontSize: 14, fontWeight: 500, color }}>{label}</div>
      </div>
    </div>
  );
};

export default StabilityGauge;
