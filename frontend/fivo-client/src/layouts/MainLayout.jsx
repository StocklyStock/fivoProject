import Footer from "../components/Footer";
import Header from "../components/Header";
import { Outlet } from "react-router-dom";
import NavbarResponsive from "../components/NavBarResonsive";

const MainLayout = () => {
    return (
        <>
            <Header />
            <Outlet />
            <Footer />
            <NavbarResponsive />
        </>
    );
}

export default MainLayout;