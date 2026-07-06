
// import Footer from "../components/Footer";
import Header from "../components/header";
import Profile from "../components/profile";
import { Outlet } from "react-router";


export default function HomePage() {

    return (
        <div>
            <Header />
            <Profile />
            <Outlet></Outlet>
        </div>
    )
}