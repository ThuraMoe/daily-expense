import { Container, Nav, Navbar } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { useEffect } from "react";
import logo from "../../assets/new-logo.png";

const Header = () => {
	const navigate = useNavigate();
	const {currentUser} = useAuth();

	useEffect(() => {
		if(!currentUser) {
			navigate("/login");
		}
	},  []);

	const logoutHandler = () => {
		signOut(auth).then(() => {
			navigate("/login");
		}).catch((e) => {
			alert(e.message);
		})
	}

	return (
		<Navbar expand="lg" className="bg-body-tertiary">
			<Container fluid>
				<Navbar.Brand as={NavLink} to="/">
					<img src={logo} width="50px" height="40px"/>
				</Navbar.Brand>
				<Navbar.Toggle aria-controls="basic-navbar-nav" />
				<Navbar.Collapse id="basic-navbar-nav">
					<Nav className="me-auto">
						<Nav.Link as={NavLink} to="/">Daily List</Nav.Link>
						<Nav.Link as={NavLink} to="/overview">Overview</Nav.Link>
						<Nav.Link as={NavLink} to="/category">Category</Nav.Link>
						<Nav.Link as={NavLink} to="/analytic">Analytic</Nav.Link>
					</Nav>
					<Nav className="justify-content-end">
						{
							currentUser? (
								<>
									<Nav.Link as={NavLink} to="/profile">{currentUser.displayName}</Nav.Link>
									<Nav.Link onClick={logoutHandler}>Logout</Nav.Link>
								</>
							) : (
								<Nav.Link>Loading...</Nav.Link>
							)
						}
							
					</Nav>
				</Navbar.Collapse>
			</Container>
		</Navbar>
	);
};
export default Header;
