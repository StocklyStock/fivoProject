import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight,faChartLine } from '@fortawesome/free-solid-svg-icons';

const Recommendation = () => {
    return (
        <section className="recommendation">
            <div className="card-wrapper">
                <div className="card-inner">
                    <div className="card-front current-recomm">
                        <div>
                            <h1>추천 종목<FontAwesomeIcon icon={faChartLine}/></h1>
                            <h2><strong>삼성전자</strong><span className="stock-code">(123456)</span></h2>
                            <h3><strong>65,000</strong><span className="rate-of-change">+0.5%</span></h3>
                        </div>
                        <div className="stock-description">
                            내용
                        </div>
                    </div>{/*.card-front 닫음*/}
                    <div className="card-back go-to-ai">
                        <p>
                            AI 알고리즘이 매일 아침 5종목을 추천합니다.<br/>
                            종목 탐색의 용도로 활용할 수 있습니다.
                        </p>
                        <Link to="/airecomm">서비스 자세히 보기 <FontAwesomeIcon icon={faArrowRight} /></Link>
                    </div>{/*.card-back 닫음*/}

                </div>{/*.card-inner 닫음*/}
            </div>{/*card-wrapper 닫음*/}


        </section>
        
    );
}

export default Recommendation;