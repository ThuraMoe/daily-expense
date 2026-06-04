import { Col, Figure, Image, Row } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";


const User = () => {
    const {currentUser} = useAuth();
    console.log(currentUser)
    return (
        <>
            <Row>
                <Col md={12}>
                    <Figure>
                        <Image src={currentUser.photoURL} roundedCircle />
                        <Figure.Caption>
                            <h3>{currentUser.displayName}</h3>
                        </Figure.Caption>
                    </Figure>
                    <br/>
                    {currentUser.email}
                </Col>
            </Row>
            <Row>
                <Col xs={12}>
                    <p>Which currencies will you use</p>
                </Col>
            </Row>
        </>
    )
}

export default User;