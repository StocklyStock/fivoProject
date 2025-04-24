import {useState, useEffect} from "react";
import NoticeListing from "./NoticeListing";

const NoticeListings = () => {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotices = async () => {
            const apiUrl = "https://api.randomuser.me/?nat=US&results=100&seed=abc";
            try {
                const res = await fetch(apiUrl);
                const data = await res.json();
                console.log("가져온 데이터:", data.results);
                setNotices(data.results);
            } catch(error) {
                console.log("데이터 불러오는 중에 에러 발생", error);
            } finally { 
                setLoading(false);
            }   
        }
        fetchNotices();
    }, []);

    return (
        <div>
            {loading ? (
                <h1>로딩 중...</h1>
            ):(
                <ul>
                    {notices?.map((notice) => (
                        <NoticeListing notice={notice} key={notice.login.uuid}  />
                    ))}
                </ul>
            )}
            
        </div>
    );
}
export default NoticeListings;