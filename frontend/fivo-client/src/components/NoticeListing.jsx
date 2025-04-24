import { Link } from "react-router-dom";

const NoticeListing = ({notice}) => {
    return (
        <li>
             <h1>{notice.name.last}</h1>
             <Link to={`/notices/${notice.login.uuid}`} state={{notice}}>가기</Link>
        </li>
    );
}
export default NoticeListing;