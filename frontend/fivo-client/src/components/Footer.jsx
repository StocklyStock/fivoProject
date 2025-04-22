import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot, faEnvelope, faPhone } from "@fortawesome/free-solid-svg-icons";


const Footer = () => {
    return (
        <footer>
            <div className="w1200">
                <div>
                    <h1 className="zen-dots-regular footer-logo">FIVO</h1>
                    <ul>
                        <li><FontAwesomeIcon icon={faLocationDot} />서울특별시 구로구 디지털로 1234호 (구로동, FIVO-PROJECT 타워 2차)</li>
                        <li><FontAwesomeIcon icon={faPhone} />02-2345-1234</li>
                        <li><FontAwesomeIcon icon={faEnvelope} />fivo@mail.com</li>
                    </ul>
                </div>
                <nav>
                    <div>   
                        <NavLink to="/about">회사 소개</NavLink>
                        <NavLink to="/faq">자주 묻는 질문</NavLink>
                        <NavLink>1:1 문의</NavLink>
                    </div>
                    <div>
                        <NavLink>공지사항</NavLink>
                        <NavLink to="/terms">이용약관</NavLink>
                        <NavLink to="/policy">개인정보처리방침</NavLink>
                    </div>
                </nav>
            </div>
            <address>
                주소 : 서울특별시 구로구 디지털로 1234호 (구로동, FIVO-PROJECT 타워 2차)<br/>
                사업자번호 : 123-45-6789 통신판매신고번호 : 2025-서울 구로-1234호
            </address>    
        </footer>
    );
}

export default Footer;