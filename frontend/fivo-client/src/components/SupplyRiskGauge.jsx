import React, { useState } from 'react';
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const getStatus = (score) => {
  if (score === null || isNaN(score)) return { label: '정보 없음', color: '#999' };
  if (score >= 70) return { label: '위험', color: '#FF4E42' };
  if (score >= 40) return { label: '보통', color: '#F9C80E' };
  return { label: '좋음', color: 'rgb(29, 196, 101)' };
};

const SupplyRiskGauge = ({ score }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const { label, color } = getStatus(score);

  const explanation = `📌 수급 리스크 점수란?

외국인·기관의 순매수/지분율, 회전율(유동성)을 종합 분석한 점수입니다.
점수가 높을수록 수급 불안정 가능성이 큽니다.

- 0~39점: 좋음 (안정적)
- 40~69점: 보통 (주의 필요)
- 70~100점: 위험 (매수 신중 필요)
`;

  const data = [
    { name: 'score', value: score ?? 0 },
    { name: 'rest', value: 100 - (score ?? 0) }
  ];

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

  return (
    <section className='supply-risk-gauge'>
      <div className="supply-risk-gauge-wrap">
        <h1 style={{ margin: 0 }}>📊 수급 리스크 점수
          <span style={{ marginLeft: 6, cursor: 'pointer', fontWeight: 'bold', color: '#888' }}
            title="수급 리스크 설명"
            onClick={() => setShowTooltip(!showTooltip)}
          >
            ℹ️
          </span>
        </h1>
        {showTooltip && <div style={tooltipStyle}>{explanation}</div>}
        <div className="supply-risk-gauge-chart-wrap">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                startAngle={90}
                endAngle={-270}
                innerRadius="65%"
                outerRadius="100%"
                data={data}
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
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
              {score !== null ? `${score.toFixed(2)}%` : '–'}
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>{label}</div>
          </div>
        
        </div>{/*.supply-risk-gauge-chart-wrap 닫음*/}
      </div>{/*.supply-risk-gauge-wrap 닫음*/}
    </section>
  );
};

export default SupplyRiskGauge;
