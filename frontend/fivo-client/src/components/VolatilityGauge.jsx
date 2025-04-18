import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from 'recharts';

const VolatilityGauge = ({ score }) => {
  const getColor = (score) => {
    if (score >= 70) return '#FF4E42';       // 높음
    if (score >= 40) return '#F9C80E';       // 보통
    return 'rgb(29, 196, 101)';              // 낮음
  };

  const getLevelText = (score) => {
    if (score >= 70) return '위험';
    if (score >= 40) return '주의';
    return '안정적';
  };

  const color = getColor(score);
  const levelText = getLevelText(score);

  const [showTooltip, setShowTooltip] = useState(false);

  const tooltipStyle = {
    position: 'absolute',
    top: 100,
    right: 0,
    background: '#333',
    color: '#fff',
    padding: '10px 14px',
    borderRadius: 8,
    fontSize: 12,
    whiteSpace: 'pre-line',
    maxWidth: 200,
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
    zIndex: 100,
  };

  const explanation = `📌 변동성 점수란?\n
전일 등락률, 거래량 변동률, 괴리율, 회전율을 조합하여 계산된 수치입니다.
0~100점 사이이며, 점수가 높을수록 단기 리스크가 큽니다.

- 0~39 : 낮음 (안정적)
- 40~69 : 보통 (주의)
- 70~100 : 높음 (위험)`;

  const data = [
    { name: "score", value: score },
    { name: "rest", value: 100 - score }
  ];

  return (
    <section className="volatility-gauge">
      <div className="volatility-gauge-wrap">
        <h1>
          ⚡ 변동성 점수
          <span
            style={{ marginLeft: 6, cursor: 'pointer', fontWeight: 'bold', color: '#888' }}
            title="변동성 점수 설명"
            onClick={() => setShowTooltip(!showTooltip)}
          >
            ℹ️
          </span>
        </h1>
        {showTooltip && <div style={tooltipStyle}>{explanation}</div>}
        <div className="volatility-gauge-chart-wrap" style={{ position: 'relative', textAlign: 'center' }}>
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
            <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>{levelText}</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VolatilityGauge;
