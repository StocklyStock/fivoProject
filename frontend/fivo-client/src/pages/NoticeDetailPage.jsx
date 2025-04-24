import { useParams, useLoaderData, Link, useNavigate } from "react-router-dom";


const NoticeDetailPage = () => {
    const navigate = useNavigate();
    const {id} = useParams();
    const {value} = useParams();
    const notice = useLoaderData();

    return (
        <section className="notice-detail">
            <div>
                <h1>{notice.email} {notice.location.country}</h1>
                <div><p>{notice.name.last}</p></div>
            </div>
            <Link to="/notices">뒤로 가기</Link>
        </section>
    );
}

const noticeLoader = async ({ params }) => {
    console.log("noticeLoader에 전달된 파라미터 값은?:", params);
    const res = await fetch(`https://api.randomuser.me/?nat=US&results=100&seed=abc`);
    const data = await res.json();
    const notices = data.results;
    console.log(notices);

    const target = notices.find(n => n.login.uuid === params.id);
    if (!target) {
        throw new Response("Not Found", { status: 404 });
    }
    return target;
};

export {NoticeDetailPage as default, noticeLoader};