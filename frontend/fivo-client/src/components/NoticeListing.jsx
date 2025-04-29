import { Link } from "react-router-dom";

const NoticeListing = ({notice}) => {
    return (
        <li>  
            <Link to={`/notices/${notice.login.uuid}`} state={{notice}}>
                <h1>[공지] {notice.name.last} <span>{notice.dob.date}</span></h1>
            </Link>
        </li>
    );
}
export default NoticeListing;