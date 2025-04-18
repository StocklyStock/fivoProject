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

const VolatilityGauge = ({ score }) => {
  const color = score >= 70 ? '#FF4E42' : score >= 40 ? '#F9C80E' : 'rgb(29, 196, 101)';
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

const data=[
  {name: "score", value: score},
  {name: "rest", value: 100 - score}
]

  return (
    <section className="volatility-gauge">

 
      <div className='volatility-gauge-wrap'>
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
        <div className='volatility-gauge-chart-wrap'>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
            data={data}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
              // cx="50%"
              // cy="100%"
              innerRadius="65%"
              outerRadius="100%"  
              connerRadius={4}
              //barSize={20}

              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? color: '#ededed'} />
                ))}
              </Pie>
            </PieChart>  
          {/* <RadialBarChart
            cx="50%"
            cy="100%"
            innerRadius="60%"
            outerRadius="100%"
            startAngle={180}
            endAngle={0}
            barSize={20}
            data={[{ name: 'volatility', value: score, fill: color }]}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} angleAxisId={0} />
            <RadialBar background dataKey="value" cornerRadius={10} />
          </RadialBarChart> */}
        </ResponsiveContainer>

          <h2 style={{color}}>
            <p>{score}</p>
          </h2>
        </div>{/*.volatility-gauge-chart-wrap 닫음*/}
      </div>{/*.volatility-gauge-wrap 닫음*/}
    </section>
  );
};

export default VolatilityGauge;
