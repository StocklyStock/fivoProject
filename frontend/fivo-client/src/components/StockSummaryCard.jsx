import React from 'react';

const StockSummaryCard = ({ data }) => {
  if (!data) return null;

  const {
    price, change, change_rate,
    open, high, low,
    previous_close, volume, trade_amount,
  } = data;

  const isUp = change > 0;
  const color = isUp ? 'red' : change < 0 ? 'blue' : 'black';
  const sign = isUp ? '+' : change < 0 ? '' : '';

  // ✅ 현재가 대비 색상 반환 함수
  const getColorByPrice = (target) => {
    if (target > price) return 'red';
    if (target < price) return 'blue';
    return 'black';
  };

  const now = new Date();
  const formattedDate = `${now.getFullYear()}-${(now.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now
    .getHours()
    .toString()
    .padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  return (
    <>
      {/* 기준 시각 */}
      <div className='standard-time'>{formattedDate} 기준</div>
      <section className='stock-summery-card'>

        {/* 왼쪽 - 현재가 + 등락률 */}
        <div className="current-stock">
          <div className="price">
            {price.toLocaleString()}
          </div>
          <div style={{ fontSize: 16, fontWeight: 500, color }}>
            {isUp ? '▲' : change < 0 ? '▼' : ''}{' '}
            {Math.abs(change).toLocaleString()} ({sign}
            {Math.abs(change_rate).toFixed(2)}%)
          </div>
        </div>

        {/* 오른쪽 - 표 형식 정보 */}
        <div className="stock-info">
          <h1><strong>전일</strong> <span>{previous_close.toLocaleString()}</span></h1>
          <h1><strong>고가</strong> <span style={{ color: getColorByPrice(high) }}>{high.toLocaleString()}</span></h1>
          <h1><strong>시가</strong> <span style={{ color: getColorByPrice(open) }}>{open.toLocaleString()}</span></h1>
          <h1><strong>저가</strong> <span style={{ color: getColorByPrice(low) }}>{low.toLocaleString()}</span></h1>
          <h1><strong>거래량</strong> <span>{volume.toLocaleString()}</span></h1>
          <h1>
            <strong>거래대금(원)</strong>
            <span>
              {(trade_amount / 100000000).toFixed(0)}억{' '}
              {Math.round((trade_amount % 100000000) / 10000)}만
            </span>
          </h1>
          
        </div>
      </section>
    </>
  );
};

export default StockSummaryCard;
