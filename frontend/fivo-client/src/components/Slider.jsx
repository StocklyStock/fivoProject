import {Swiper, SwiperSlide} from "swiper/react";
import "swiper/swiper-bundle.css";
import {Navigation, Pagination, Scrollbar, A11y} from "swiper/modules";
const Slider = () => {
    return (
        <section className="main-banner">
            <Swiper>
                <SwiperSlide><h1>주식정보는 <p>FIVO</p></h1></SwiperSlide>
                <SwiperSlide><h1>모든 주식이 여기에!<p>FIVO</p></h1></SwiperSlide>
            </Swiper>
        </section>
    );
}

export default Slider;