import React, { useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const descriptions = {
  ROE: `📌 ROE (자기자본이익률)\n\n자기자본을 얼마나 효율적으로 활용해 이익을 냈는지를 나타냅니다.`,
  ROA: `📌 ROA (총자산이익률)\n\n총자산 대비 이익률로, 기업 전체 자산의 효율성을 보여줍니다.`,
  영업이익률: `📌 영업이익률\n\n매출에서 영업이익이 차지하는 비율로, 핵심 사업의 수익성을 나타냅니다.`,
  순이익률: `📌 순이익률\n\n매출 대비 최종 이익 비율로, 기업 전체의 수익성 수준을 반영합니다.`,
};

const getStatus = (score) => {
  if (score >= 25) return '우수';
  if (score >= 15) return '양호';
  if (score >= 5) return '보통';
  return '위험';
};

const statusColor = {
  우수: 'rgb(23, 151, 79)',
  양호: 'rgb(29, 196, 101)',
  보통: 'rgb(247, 182, 42)',
  위험: '#FF6E6E',
};

const ProfitabilityOverview = ({ data }) => {
  const [tooltipKey, setTooltipKey] = useState(null);

  if (!data || !data.score_details || data.score_details.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>수익성 데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <section className='profitability'>
      <h2>📋 수익성 구성 지표</h2>
      <ul>
        {data.score_details.map((item, idx) => {
          const value = !isNaN(item.value) && item.value !== null ? Math.abs(item.value) : 0;
          const cappedValue = Math.min(value, 100);  // 최대 100으로 제한
          const status = getStatus(item.score ?? 0);
          const color = statusColor[status];

          return (
            <li key={idx}>
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
                <span
                  className='description-btn'
                  onClick={() =>
                    setTooltipKey(tooltipKey === item.label ? null : item.label)
                  }
                >
                  ℹ️
                </span>
              </h3>

              <div className="profitability-chart-wrap">
                <ResponsiveContainer width="100%" height={175}>
                  <PieChart>
                    <Pie
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                      data={[
                        { name: item.label, value: cappedValue },
                        { name: '빈공간', value: 100 - cappedValue }
                      ]}
                      innerRadius="65%"
                      outerRadius="100%"
                      cornerRadius={4}
                    >
                      {[color, '#EDEDED'].map((fill, index) => (
                        <Cell key={`cell-${index}`} fill={fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                <h4>
                  <p style={{ color }}>
                    {value !== 0 ? `${value.toFixed(2)}%` : '정보 없음'}
                  </p>
                  <span style={{ color }}>{status}</span>
                </h4>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default ProfitabilityOverview;
