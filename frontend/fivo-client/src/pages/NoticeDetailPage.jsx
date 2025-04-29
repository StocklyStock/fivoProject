import {useLoaderData, Link} from "react-router-dom";


const NoticeDetailPage = () => {
    const notice = useLoaderData();

    return (
        <section className="notice-detail">
            <div className="content-wrap">
                <h1>{notice.email} {notice.location.country}</h1>
                <div>
                    <p>
                        {notice.name.last}<br/>
                        {notice.login.md5}<br/>
                        {notice.login.password}<br/>
                        {notice.login.salt}<br/>
                        {notice.login.sha}<br/>
                        {notice.login.username}<br/>
                        {notice.login.uuid}<br/>
                    </p>
                </div>
            </div>
            <div className="btn-wrap">
                <Link to="/notices">목 록</Link>
            </div>
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