import { Outlet } from "react-router-dom";
import Layout from "./Layout/Layout";
import Header from "./Layout/Header";

const RootLayout = () => {
    return (
        <>
            <Header/>
            <Layout/>
            {/* <Outlet/> */}
        </>
    )
}

export default RootLayout;