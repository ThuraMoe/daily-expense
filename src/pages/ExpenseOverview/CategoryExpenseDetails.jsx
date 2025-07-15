import { Col, Row, Table } from "react-bootstrap";
import { NO_DATA_ERR_MSG } from "../../utils/Constant";


const CategoryExpenseDetails = ({filteredExpenses}) => {
    return (
        <>
            <Row>
                <Col xs={12}>
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Title</th>
                                <th>Amount</th>
                                
                            </tr>
                        </thead>
                        <tbody>
                            {filteredExpenses.length == 0 && (
                                <tr>
                                    <td colSpan={3}>{NO_DATA_ERR_MSG}</td>
                                </tr>
                            )}
                            {
                                filteredExpenses && 
                                    filteredExpenses.map((expense, idx) => (
                                        <tr key={idx}>
                                            <td>{expense.date}</td>
                                            <td>{expense.name}</td>
                                            <td>{`${expense.amount} ${expense.currency}`}</td>
                                        </tr>
                                    ))
                            }
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </>
    )
}

export default CategoryExpenseDetails;