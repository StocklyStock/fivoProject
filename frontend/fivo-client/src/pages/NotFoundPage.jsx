import alertImg from "../assets/alert.png";
const NotFoundPage = () => {
    return (
        <section className="not-found">
            <h1>
                <img src={alertImg} alt="alert" />
                <p>페이지가 존재하지 않습니다.</p>
            </h1>
        </section>
    );
}
export default NotFoundPage;