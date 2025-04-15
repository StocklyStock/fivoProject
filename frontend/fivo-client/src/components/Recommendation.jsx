import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight,faChartLine } from '@fortawesome/free-solid-svg-icons';

const Recommendation = () => {
    return (
        <section className="recommendation">
            <div className="current-recomm">

                <div>
                    <h1>추천 종목<FontAwesomeIcon icon={faChartLine}/></h1>
                    <h2><strong>삼성전자</strong><span className="stock-code">(123456)</span></h2>
                    <h3><strong>65,000</strong><span className="rate-of-change">+0.5%</span></h3>
                </div>
                <div className="stock-description">
                    내용
                </div>
            </div>
            <div className="go-to-ai">
                <p>
                    AI 알고리즘이 매일 아침 5종목을 추천합니다.<br/>
                    종목 탐색의 용도로 활용할 수 있습니다.
                </p>
                <Link to="">서비스 자세히 보기 <FontAwesomeIcon icon={faArrowRight} /></Link>
            </div>
        </section>
        
    );
}

export default Recommendation;