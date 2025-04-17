import React, { useState } from 'react';
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
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

const getAnalysis = (score, profile, company, scores) => {
  const name = company ?? '이 종목';
  let message = `${name}의 종합 리스크 점수는 ${score.toFixed(1)}점입니다.\n\n`;

  if (profile === 'aggressive') {
    message += '공격형 투자자는 "높은 수익성과 변동성"을 가장 중시합니다.\n';
    const isVolHigh = scores.volatility >= 60;
    const isProfHigh = scores.profitability >= 60;

    if (isVolHigh && isProfHigh) {
      message += `✅ ${name}은 변동성과 수익성이 모두 높아 매우 적합합니다. (변동성: ${scores.volatility}, 수익성: ${scores.profitability})\n`;
    } else if (isVolHigh || isProfHigh) {
      message += `⚠️ ${name}은 ${isVolHigh ? '변동성은 높지만 수익성이 낮고' : '수익성은 높지만 변동성이 낮아'} 절반만 부합합니다.\n`;
    } else {
      message += `❌ ${name}은 변동성과 수익성이 모두 낮아 부적합할 수 있습니다.\n`;
    }
  } else if (profile === 'neutral') {
    message += '중립형 투자자는 수익성과 안정성의 균형을 중요시합니다.\n';
    const isProfitMid = scores.profitability >= 50;
    const isStabilityMid = scores.stability >= 50;

    if (isProfitMid && isStabilityMid) {
      message += `✅ ${name}은 수익성과 안정성이 모두 적절하여 적합합니다.\n`;
    } else if (isProfitMid || isStabilityMid) {
      message += `⚠️ ${name}은 ${isProfitMid ? '수익성은 적절하지만 안정성이 부족하고' : '안정성은 좋지만 수익성이 부족합니다.'}\n`;
    } else {
      message += `❌ ${name}은 수익성과 안정성 모두 낮은 편입니다.\n`;
    }
  } else {
    message += '안정형 투자자는 높은 안정성과 낮은 리스크를 중시합니다.\n';
    const isStableHigh = scores.stability >= 70;
    const isSupplyLow = scores.supplyRisk <= 40;

    if (isStableHigh && isSupplyLow) {
      message += `✅ ${name}은 안정성이 높고 수급 리스크가 낮아 적합합니다.\n`;
    } else if (isStableHigh || isSupplyLow) {
      message += `⚠️ ${name}은 ${isStableHigh ? '안정성은 높지만 수급 리스크가 높고' : '수급 리스크는 낮지만 안정성이 부족합니다.'}\n`;
    } else {
      message += `❌ ${name}은 안정성과 수급 리스크 모두 낮아 부적합할 수 있습니다.\n`;
    }
  }

  return message;
};

const RiskScoreSelector = ({ scores, companyName }) => {
  const [selectedProfile, setSelectedProfile] = useState(null);

  const score = selectedProfile ? calculateScore(scores, selectedProfile) : null;
  const riskLevel = score !== null ? getRiskLevel(score) : '';
  const color = score !== null ? getColor(score) : '#888';
  const description = selectedProfile ? getAnalysis(score, selectedProfile, companyName, scores) : '';

  return (
    <div style={{ marginTop: 40 }}>
      <h3 style={{ marginBottom: 12 }}>🎯 투자자 성향별 종합 리스크 점수</h3>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <button onClick={() => setSelectedProfile('aggressive')}>공격형</button>
        <button onClick={() => setSelectedProfile('neutral')}>중립형</button>
        <button onClick={() => setSelectedProfile('conservative')}>안정형</button>
      </div>

      {score !== null && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: '#f8f9fa',
            border: '1px solid #ccc',
            borderRadius: 10,
            padding: 20,
            position: 'relative',
          }}
        >
          <ResponsiveContainer width="100%" height={200}>
            <RadialBarChart
              cx="50%"
              cy="100%"
              innerRadius="60%"
              outerRadius="100%"
              startAngle={180}
              endAngle={0}
              barSize={20}
              data={[{ name: 'riskScore', value: score, fill: color }]}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar background dataKey="value" cornerRadius={10} />
            </RadialBarChart>
          </ResponsiveContainer>

          <div style={{ marginTop: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 600, color }}>{score.toFixed(1)}</div>
            <div style={{ fontSize: 14, fontWeight: 500, color }}>{riskLevel}</div>
          </div>

          <div
            style={{
              marginTop: 20,
              background: '#fff',
              padding: '14px 16px',
              borderRadius: 8,
              border: '1px solid #ddd',
              whiteSpace: 'pre-line',
              width: '100%',
              fontSize: 14,
              lineHeight: 1.6,
            }}
          >
            {description}
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskScoreSelector;
