import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from 'recharts';

const getRiskLevel = (score) => {
  if (score >= 80) return { label: '우수', color: '#2ca02c' };
  if (score >= 50) return { label: '보통', color: '#f9c80e' };
  return { label: '취약', color: '#d62728' };
};

const ProfitabilityGauge = ({ score }) => {
  const { label: riskLevel, color } = getRiskLevel(score);
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

  const data = [
    { name: 'score', value: score },
    { name: 'rest', value: 100 - score }
  ];

  return (
    <section className='profitability-gauge'>
      <div className="profitability-gauge-wrap">
        <h1 style={{ margin: 0 }}>
          📋 수익성 점수
          <span
            style={{ marginLeft: 6, cursor: 'pointer', fontWeight: 'bold', color: '#888' }}
            title="수익성 점수 설명"
            onClick={() => setShowTooltip(!showTooltip)}
          >
            ℹ️
          </span>
        </h1>

        {showTooltip && <div style={tooltipStyle}>{explanation}</div>}

        <div className="profitability-gauge-chart-wrap" style={{ position: 'relative' }}>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                innerRadius="65%"
                outerRadius="100%"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? color : '#ededed'} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* 가운데 점수 + 텍스트 */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              color: color,
            }}
          >
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{`${score.toFixed(2)}%`}</div>
            <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>{riskLevel}</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfitabilityGauge;
