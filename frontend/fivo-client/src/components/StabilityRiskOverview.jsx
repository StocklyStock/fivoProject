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

const descriptions = {
  부채비율: `📌 부채비율\n\n총자산 대비 총부채의 비율로, 기업의 재무 건전성을 나타냅니다.\n일반적으로 200% 이하가 바람직합니다.`,
  고정비율: `📌 고정비율\n\n자기자본 대비 고정자산의 비율로, 장기적인 안정성을 보여줍니다.\n낮을수록 유동성 확보에 유리합니다.`,
  유동비율: `📌 유동비율\n\n유동자산 대비 유동부채의 비율로, 단기 지급능력을 나타냅니다.\n일반적으로 100% 이상이 이상적입니다.`,
  당좌비율: `📌 당좌비율\n\n유동비율 중 재고자산을 제외한 당좌자산 대비 유동부채 비율입니다.\n보다 보수적인 단기 지급능력 지표입니다.`,
};

// ✅ 수치 기반 상태 판단
const getStatus = (score) => {
  if (score >= 25) return '안정';
  if (score >= 10) return '보통';
  return '위험';
};

const statusColor = {
  안정: 'rgb(29, 196, 101)',
  보통: 'rgb(247, 182, 42)',
  위험: '#FF6E6E',
};

const StabilityRiskOverview = ({ data }) => {
  const [tooltipKey, setTooltipKey] = useState(null);

  return (
    <section className='stability-risk'>
      <h2>📋 안정성 구성 지표</h2>
      <ul>
        {data.map((item, i) => {
          const status = getStatus(item.score);
          const color = statusColor[status];
          const cappedValue = Math.min(Math.abs(item.value), 100);

          return (
            <li key={i}>
              <h3>
                {item.label}

                {tooltipKey === item.label && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 30,
                      left: 0,
                      zIndex: 10,
                      background: '#333',
                      color: '#fff',
                      padding: '8px 12px',
                      borderRadius: 6,
                      fontSize: 12,
                      maxWidth: 260,
                      whiteSpace: 'pre-line',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                    }}
                  >
                    {descriptions[item.label]}
                  </div>
                )}
                <span className='description-btn'
                  onClick={() =>
                    setTooltipKey(tooltipKey === item.label ? null : item.label)
                  }
                >
                  ℹ️
                </span>

              </h3>
              <div className="stability-risk-chart-wrap">
                <ResponsiveContainer width="100%" height={175}>
                  <PieChart>
                    <Pie
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                    data={[
                      {name: item.label, value: cappedValue},
                      {name: "빈공간", value: 100 - cappedValue}
                    ]}
                    innerRadius="65%"
                    outerRadius="100%"
                    cornerRadius={4}
                    >
                      
                      {[statusColor[status], '#EDEDED'].map((fill, index) => (
                        <Cell key={`cell-${index}`} fill={fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                <h4>
                  <p style={{color}}>{item.value?.toFixed(2)}%{' '}</p>
                  <span style={{ color }}>{status}</span>
                </h4>
              </div>{/*.stability-risk-chart-wrap 닫음*/}
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default StabilityRiskOverview;
