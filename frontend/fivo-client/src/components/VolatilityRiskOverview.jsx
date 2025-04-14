import React, { useState } from 'react';
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts';

const descriptions = {
  등락률: `📌 등락률\n\n전일 대비 주가 변동률을 의미합니다.\n5% 이상이면 높은 변동성을 뜻하며 단기 이슈나 테마 확인이 필요합니다.`,
  거래량변동률: `📌 거래량 변동률\n\n전일 대비 거래량 증가율을 나타냅니다.\n급격한 상승은 수급 변화나 세력 개입 신호일 수 있습니다.`,
  괴리율: `📌 괴리율\n\n52주 최고가 대비 현재가 하락 비율입니다.\n높을수록 고점 대비 저평가 상태를 의미합니다.`,
  회전율: `📌 회전율(유동성)\n\n주식의 유통량 대비 거래량 비율입니다.\n높을수록 단기 매매가 활발하고 유동성이 풍부함을 뜻합니다.`,
};

const getStatus = (label, value) => {
  if (label === '등락률') return Math.abs(value) >= 5 ? '높음' : Math.abs(value) >= 2 ? '보통' : '낮음';
  if (label === '거래량변동률') return value >= 300 ? '높음' : value >= 100 ? '보통' : '낮음';
  if (label === '괴리율') return Math.abs(value) >= 30 ? '높음' : Math.abs(value) >= 15 ? '보통' : '낮음';
  if (label === '회전율') return value >= 20 ? '높음' : value >= 10 ? '보통' : '낮음';
  return '낮음';
};

const statusColor = {
  높음: '#d62728',
  보통: '#f9c80e',
  낮음: '#2ca02c',
};

const VolatilityRiskOverview = ({ data }) => {
  const [tooltipKey, setTooltipKey] = useState(null);

  return (
    <div
      style={{
        marginBottom: 24,
        maxWidth: 1000,
        padding: 20,
        borderRadius: 12,
        background: '#f6f9fb',
        fontFamily: 'sans-serif',
      }}
    >
      <h3 style={{ marginBottom: 16 }}>⚡ 변동성 리스크 구성 지표</h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 16,
        }}
      >
        {data.map((item, i) => {
          const status = getStatus(item.label, item.value);
          const color = statusColor[status];

          return (
            <div
              key={i}
              style={{
                position: 'relative',
                padding: '12px 16px',
                borderRadius: 8,
                background: '#fff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                {item.label}
                <span
                  style={{
                    marginLeft: 6,
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    color: '#888',
                  }}
                  onClick={() =>
                    setTooltipKey(tooltipKey === item.label ? null : item.label)
                  }
                  title="지표 설명 보기"
                >
                  ℹ️
                </span>
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
              </div>

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
                      value: Math.abs(item.value),
                      fill: color,
                    },
                  ]}
                  startAngle={180}
                  endAngle={0}
                >
                  <PolarAngleAxis
                    type="number"
                    domain={[0, 100]}
                    angleAxisId={0}
                    tick={false}
                  />
                  <RadialBar background dataKey="value" cornerRadius={6} />
                </RadialBarChart>
              </ResponsiveContainer>

              <div style={{ textAlign: 'center', marginTop: 4, fontSize: 14 }}>
                {item.value.toFixed(2)}% /{' '}
                <span style={{ color }}>{status}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VolatilityRiskOverview;
