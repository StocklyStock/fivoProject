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
  '외국인 지분율': `📌 외국인 지분율\n\n외국인이 해당 종목을 얼마나 보유하고 있는지를 나타냅니다.\n40% 이상이면 수급이 안정적인 것으로 평가됩니다.`,
  '외국인 순매수': `📌 외국인 순매수\n\n외국인의 매수/매도 흐름을 나타냅니다.\n매수 우위일수록 긍정적인 신호입니다.`,
  '기관 순매수': `📌 기관 순매수\n\n기관 투자자의 수급 동향을 나타냅니다.\n기관의 지속적인 매수는 상승 기대 요인이 될 수 있습니다.`,
  '회전율(유동성)': `📌 회전율\n\n유통 주식 대비 거래량 비율로 유동성을 나타냅니다.\n0.1~2.0% 범위가 적정 수준입니다.`,
};

// ✅ 수치 기반 상태 판단
const getStatusByValue = (label, value) => {
  switch (label) {
    case '외국인 지분율':
      if (value >= 40) return '좋음';
      if (value >= 20) return '보통';
      return '위험';

    case '외국인 순매수':
    case '기관 순매수':
      if (value > 1_000_000) return '좋음';
      if (value > 0) return '보통';
      return '위험';

    case '회전율(유동성)':
      if (value >= 0.1 && value <= 2.0) return '좋음';
      if (value <= 5.0) return '보통';
      return '위험';

    default:
      return '보통';
  }
};

const statusColor = {
  좋음: 'rgb(29, 196, 101)',
  보통: 'rgb(247, 182, 42)',
  위험: '#FF6E6E',
};

const SupplyRiskOverview = ({ data }) => {
  const [tooltipKey, setTooltipKey] = useState(null);

  if (!data || data.length === 0) return null;

  return (
    <section className='supply-risk'>
      <h2>📊 외국인·기관 수급 리스크 지표</h2>
      <ul>
        {data.map((item, i) => {
          const status = getStatusByValue(item.label, item.value);
          const color = statusColor[status];

          return (
            <li key={i}>


              {/* 제목 + 툴팁 */}
              <h3>
                {item.label}
                <span className='decription-btn'
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
              </h3>
              <div className='supply-risk-chart-wrap'>
                {/* 도넛 차트 */}
                <ResponsiveContainer width="100%" height={175}>
                  <PieChart>
                    <Pie
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                    data={[
                      {name: item.label, value: item.score},
                      {name: '빈공간', value: (item.max || 30) - item.score}
                    ]}
                    innerRadius="65%"
                    outerRadius="100%"
                    cornerRadius={4}
                    >
                      {[color, '#EDEDED'].map((fill, index) => (
                        <Cell key={`cell-${index}`} fill={fill}/>
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                {/* 수치 + 상태 출력 */}
                <h4>
                  {typeof item.value === 'number'
                    ? <p style={{color}}>{item.value.toLocaleString()}</p>
                    : '정보 없음'}{' '}
                   <span style={{ color }}>{status}</span>
                </h4>
              </div>{/*.supply-risk-chart-wrap 닫음*/}
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default SupplyRiskOverview;
