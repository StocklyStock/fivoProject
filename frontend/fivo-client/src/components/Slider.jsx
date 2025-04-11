import {Swiper, SwiperSlide} from "swiper/react";
import "swiper/swiper-bundle.css";
import {Navigation, Pagination, Scrollbar, A11y} from "swiper/modules";
const Slider = () => {
    return (
        <section className="main-banner">
            <Swiper>
                <SwiperSlide><img src="https://cdn.pixabay.com/photo/2019/08/21/07/04/maple-4420302_640.jpg" alt=""/></SwiperSlide>
                <SwiperSlide><img src="https://cdn.pixabay.com/photo/2019/08/21/07/04/maple-4420302_640.jpg" alt=""/></SwiperSlide>
            </Swiper>
        </section>
    );
}

export default Slider;