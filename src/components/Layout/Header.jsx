import { Container, Nav, Navbar } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";

const Header = () => {
	return (
		<Navbar expand="lg" className="bg-body-tertiary">
			<Container fluid>
				<LinkContainer to="/">
					<Navbar.Brand>
						<i>My Expenses</i>
					</Navbar.Brand>
				</LinkContainer>
				<Navbar.Toggle aria-controls="basic-navbar-nav" />
				<Navbar.Collapse id="basic-navbar-nav">
					<Nav className="me-auto">
						<LinkContainer to="/">
							<Nav.Link>Daily List</Nav.Link>
						</LinkContainer>
						<LinkContainer to="/summary">
							<Nav.Link>Summary</Nav.Link>
						</LinkContainer>
					</Nav>
				</Navbar.Collapse>
			</Container>
		</Navbar>
	);
};
export default Header;
