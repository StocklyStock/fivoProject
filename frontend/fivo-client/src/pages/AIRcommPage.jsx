import {useState}  from "react";

const AIRecommPage = () => {
    const [selectedMenu, setSelectedMenu] = useState("TOP5");
    return (
        <section className="ai-recomm-wrap">
            <div className="tab-menus">
                <span
                className={`tab-top5 ${selectedMenu==='TOP5'? 'btn-color':''}`}
                onClick={() => setSelectedMenu('TOP5')}
                >
                TOP5
                </span>
                <span
                className={`tab-risk ${selectedMenu==='사용자맞춤추천'?'btn-color':''}`}
                onClick={() => setSelectedMenu('사용자맞춤추천')}
                >
                사용자맞춤 추천
                </span>
                <span
                className={`tab-risk ${selectedMenu==='커스터마이징추천'?'btn-color':''}`}
                onClick={() => setSelectedMenu('커스터마이징추천')}
                >
                커스터마이징 추천
                </span>
                <span
                className={`tab-risk ${selectedMenu==='보유종목리포트'?'btn-color':''}`}
                onClick={() => setSelectedMenu('보유종목리포트')}
                >
                보유종목 리포트
                </span>
            </div>

            <h1>종목 제목</h1> {/* 종목 제목 */}

            {/* 주식 요약 카드 */}
            <>
                <div className='standard-time'>2025-04-16 기준</div>
                <section className='stock-summery-card'>

                    {/* 왼쪽 - 현재가 + 등락률 */}
                    <div className="current-stock">
                        <div className="price">
                            123,456
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 500/*, color*/ }}>
                            ▲+12%(등락률 표시부분)
                        </div>
                    </div>

                    {/* 오른쪽 - 표 형식 정보 */}
                    <div className="stock-info">
                    <h1><strong>전일</strong> <span>2,025</span></h1>
                    <h1><strong>고가</strong> <span style={{ color: 'red' }}>1,234</span></h1>
                    <h1><strong>시가</strong> <span style={{ color: 'blue' }}>5,678</span></h1>
                    <h1><strong>저가</strong> <span style={{ color: 'blue' }}>1,357</span></h1>
                    <h1><strong>거래량</strong> <span>2,468</span></h1>
                    <h1>
                        <strong>거래대금(원)</strong>
                        <span>
                        1억
                        5000만
                        </span>
                    </h1>
                    
                    </div>
                    </section>
            </>
        </section>
    );
}
export default AIRecommPage;