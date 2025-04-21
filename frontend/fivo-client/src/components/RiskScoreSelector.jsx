import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';

const calculateScore = (scores, profile) => {
  const weights = {
    aggressive: { stability: 0.2, profitability: 0.4, volatility: 0.3, supplyRisk: 0.1 },
    neutral: { stability: 0.3, profitability: 0.3, volatility: 0.25, supplyRisk: 0.15 },
    conservative: { stability: 0.5, profitability: 0.3, volatility: 0.1, supplyRisk: 0.1 },
  }[profile];

  return (
    scores.stability * weights.stability +
    scores.profitability * weights.profitability +
    scores.volatility * weights.volatility +
    scores.supplyRisk * weights.supplyRisk
  );
};

const getRiskLevel = (score) => {
  if (score >= 80) return '우수';
  if (score >= 50) return '보통';
  return '취약';
};

const getColor = (score) => {
  return score >= 80 ? '#2ca02c' : score >= 50 ? '#f9c80e' : '#d62728';
};

const emphasize = (label, color = '#d62728') => `<strong style='color: ${color}'>${label}</strong>`;
const scoreTag = (value) => `<span style='color: #f05a28; font-weight: bold'>${value}</span>`;

const getAnalysis = (score, profile, company, scores) => {
  const name = company ?? '이 종목';
  const vol = scores.volatility;
  const prof = scores.profitability;
  const stab = scores.stability;
  const supply = scores.supplyRisk;

  const styleMap = {
    aggressive: '#d62728',
    neutral: '#f57c00',
    conservative: '#1e88e5',
  };

  let message = `${name}의 종합 리스크 점수는 ${scoreTag(score.toFixed(1))}점입니다.<br/><br/>`;

  if (profile === 'aggressive') {
    message += `${emphasize('공격형 투자자', styleMap.aggressive)}는 ${emphasize('높은 수익성과 변동성')}을 중시합니다.<br/>단기간의 큰 수익을 위해 더 높은 리스크를 감수합니다.<br/><br/>`;
    if (vol >= 60 && prof >= 60) {
      message += `✅ ${name}은 ${emphasize('변동성')}(${scoreTag(vol)}), ${emphasize('수익성')}(${scoreTag(prof)})이 모두 높아 매우 적합합니다.`;
    } else if (vol >= 60 || prof >= 60) {
      message += `⚠️ ${name}은 ${vol >= 60 ? emphasize('변동성') + `(${scoreTag(vol)})은 높지만 ` + emphasize('수익성') + `(${scoreTag(prof)})은 낮고` : emphasize('수익성') + `(${scoreTag(prof)})은 높지만 ` + emphasize('변동성') + `(${scoreTag(vol)})은 낮아`} 일부 조건에만 부합합니다.`;
    } else {
      message += `❌ ${name}은 ${emphasize('변동성')}(${scoreTag(vol)}), ${emphasize('수익성')}(${scoreTag(prof)}) 모두 낮아 적합하지 않을 수 있습니다.`;
    }
  } else if (profile === 'neutral') {
    message += `${emphasize('중립형 투자자', styleMap.neutral)}는 ${emphasize('수익성과 안정성')}의 균형을 추구합니다.<br/>리스크를 적절히 통제하면서도 안정적인 수익을 기대합니다.<br/><br/>`;
    if (prof >= 50 && stab >= 50) {
      message += `✅ ${name}은 ${emphasize('수익성')}(${scoreTag(prof)})과 ${emphasize('안정성')}(${scoreTag(stab)}) 모두 적절하여 중립형 투자자에게 적합합니다.`;
    } else if (prof >= 50 || stab >= 50) {
      message += `⚠️ ${name}은 ${prof >= 50 ? emphasize('수익성') + `(${scoreTag(prof)})은 적절하지만 ` + emphasize('안정성') + `(${scoreTag(stab)})은 부족하고` : emphasize('안정성') + `(${scoreTag(stab)})은 높지만 ` + emphasize('수익성') + `(${scoreTag(prof)})은 부족하여`} 일부 조건만 충족합니다.`;
    } else {
      message += `❌ ${name}은 ${emphasize('수익성')}(${scoreTag(prof)})과 ${emphasize('안정성')}(${scoreTag(stab)}) 모두 낮아 부적합할 수 있습니다.`;
    }
  } else {
    message += `${emphasize('안정형 투자자', styleMap.conservative)}는 ${emphasize('높은 안정성')}과 ${emphasize('낮은 수급 리스크')}를 가장 중요하게 생각합니다.<br/>예측 가능한 수익과 안정된 투자 환경을 선호합니다.<br/><br/>`;
    if (stab >= 70 && supply <= 40) {
      message += `✅ ${name}은 ${emphasize('안정성')}(${scoreTag(stab)})이 높고 ${emphasize('수급 리스크')}(${scoreTag(supply)})가 낮아 매우 적합합니다.`;
    } else if (stab >= 70 || supply <= 40) {
      message += `⚠️ ${name}은 ${stab >= 70 ? emphasize('안정성') + `(${scoreTag(stab)})은 높지만 ` + emphasize('수급 리스크') + `(${scoreTag(supply)})는 높고` : emphasize('수급 리스크') + `(${scoreTag(supply)})는 낮지만 ` + emphasize('안정성') + `(${scoreTag(stab)})은 낮아`} 일부 조건만 충족합니다.`;
    } else {
      message += `❌ ${name}은 ${emphasize('안정성')}(${scoreTag(stab)})과 ${emphasize('수급 리스크')}(${scoreTag(supply)}) 모두 낮아 안정형 투자자에겐 부적합할 수 있습니다.`;
    }
  }
  return message;
};

const RiskScoreSelector = ({ scores, companyName }) => {
  const [selectedProfile, setSelectedProfile] = useState('aggressive');

  const score = selectedProfile ? calculateScore(scores, selectedProfile) : null;
  const riskLevel = score !== null ? getRiskLevel(score) : '';
  const color = score !== null ? getColor(score) : '#888';
  const description = selectedProfile ? getAnalysis(score, selectedProfile, companyName, scores) : '';

  const data = [
    { name: 'risk', value: score },
    { name: 'rest', value: 100 - score },
  ];

  const profileButtons = [
    { key: 'aggressive', label: '공격형' },
    { key: 'neutral', label: '중립형' },
    { key: 'conservative', label: '안정형' },
  ];

  return (
    <section className='total-risk-analysis'>
      <h1>
        🎯 투자자 성향별 종합 리스크 분석
      </h1>

      <div className="tab-menus" style={{ marginBottom: 20 }}>
        {profileButtons.map(({ key, label }) => (
          <span
            key={key}
            className={`tab-risk ${selectedProfile === key ? 'btn-color' : ''}`}
            onClick={() => setSelectedProfile(key)}
          >
            {label}
          </span>
        ))}
      </div>

      {score !== null && (
        <div className='total-risk-analysis-wrap'>
          <div className='total-risk-analysis-chart-wrap'>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey='value'
                  startAngle={90}
                  endAngle={-270}
                  innerRadius='65%'
                  outerRadius='100%'
                  cornerRadius={4}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? color : '#ededed'} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              color: color,
              fontWeight: 'bold',
            }}>
              <p>{score.toFixed(1)}</p>
              <span>{riskLevel}</span>
            </div>
          </div>

          <div dangerouslySetInnerHTML={{ __html: description }}/>
        </div>
      )}
    </section>
  );
};

export default RiskScoreSelector;