import { Outlet } from "react-router-dom";
import Header from "./Header";
import { Container } from "react-bootstrap";

const Layout = () => {
	return (
		<>
			<Header />
            <Container>
			    <Outlet/>
            </Container>
		</>
	);
};

export default Layout;
