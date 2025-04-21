import React, { useState } from 'react';
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
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

  // 데이터가 없거나 score_details가 비어있는 경우 처리
  if (!data || !data.score_details || data.score_details.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>수익성 데이터가 없습니다.</p>
      </div>
    );
  }

  // metrics 값에 null 체크 후 0으로 처리, NaN 체크도 추가
  const metrics = data.score_details.map((item) => ({
    label: item.label,
    value: item.value !== null && item.value !== undefined && !isNaN(item.value) ? item.value : 0,  // null, undefined, NaN을 0으로 처리
    score: item.score !== null && item.score !== undefined ? item.score : 0,  // score가 null일 경우 0으로 처리
  }));

  // 차트의 value 범위 동적으로 설정
  const maxValue = Math.max(...metrics.map(item => item.value !== 0 ? item.value : 1));  // NaN을 처리하여 최대값 계산

  // maxValue가 0일 경우, 1로 처리하여 차트가 표시되도록 처리
  const chartMaxValue = maxValue === 0 ? 1 : maxValue;

  return (
    <section className='profitability'>
      <h2>📋 수익성 구성 지표</h2>
      <ul>
        {metrics.map((item, idx) => {
          const status = getStatus(item.score);
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
                <span className='description-btn'
                  onClick={() =>
                    setTooltipKey(tooltipKey === item.label ? null : item.label)
                  }
                >
                  ℹ️
                </span>

              </h3>

              <ResponsiveContainer width="100%" height={130}>
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="60%"
                  outerRadius="100%"
                  barSize={12}
                  data={[
                    {
                      name: item.label,
                      value: item.value !== 0 ? item.value : 1,  // 0일 때, 1로 처리하여 차트 표시
                      fill: color,
                    },
                  ]}
                  startAngle={180}
                  endAngle={0}
                >
                  <PolarAngleAxis
                    type="number"
                    domain={[0, chartMaxValue]} // 동적으로 최대 값 설정
                    angleAxisId={0}
                    tick={false}
                  />
                  <RadialBar background dataKey="value" cornerRadius={6} />
                </RadialBarChart>
              </ResponsiveContainer>

              <div style={{ textAlign: 'center', marginTop: 4, fontSize: 14 }}>
                {item.value !== 0 ? `${item.value.toFixed(2)}%` : '정보 없음'} /{' '}
                <span style={{ color }}>{status}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default ProfitabilityOverview;
