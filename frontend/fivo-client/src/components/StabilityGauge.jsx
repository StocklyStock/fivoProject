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
  if (score >= 75) return { label: '안정', color: 'rgb(29, 196, 101)' };
  if (score >= 50) return { label: '보통', color: '#F9C80E' };
  return { label: '위험', color: '#FF4E42' };
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

const data = [
  {name: "score", value: score},
  {name: "rest", value: 100 - score}
]

  return (
    <section className='stability-gauge'>
      <div className='stability-gauge-wrap'>

        <h1 style={{ margin: 0 }}>📋 안정성 점수
          <span
            style={{ marginLeft: 6, cursor: 'pointer', fontWeight: 'bold', color: '#888' }}
            title="안정성 점수 설명"
            onClick={() => setShowTooltip(!showTooltip)}
          >
            ℹ️
          </span>
        </h1>

        {showTooltip && <div style={tooltipStyle}>{explanation}</div>}
        <div className="stability-gauge-chart-wrap">
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
                  <Cell key={`cell-${index}`} fill={index === 0 ? color: '#ededed'} />
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
            <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>{label}</div>
          </div>
        </div>{/*.stability-gauge-chart-wrap 닫음*/}
      </div>{/*.stability-gauge-wrap 닫음*/}
    </section>
  );
};

export default StabilityGauge;
