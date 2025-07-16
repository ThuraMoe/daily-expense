import { useNavigate } from "react-router-dom";
import { Col, Row, Table } from "react-bootstrap";
import { NO_DATA_ERR_MSG } from "../../utils/Constant";
import categoryList from "../../utils/CategoryList";
import classes from "../../styles/common.module.css";

const DailyExpenseSummary = ({summaryExpense}) => {
    const navigate = useNavigate();

    // for no data colspan
    const colSpan = categoryList.length + 2;

    const dateDetailHandler = (date) => {
		navigate(`/?date=${date}`);
	}

    return (
        <>
            <Row>
                <Col xs={12}>
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Total</th>
                                {categoryList.map((category, idx) => (
                                    <th key={idx}>{category}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {summaryExpense.length == 0 && (
                                <tr>
                                    <td colSpan={ colSpan }>{NO_DATA_ERR_MSG}</td>
                                </tr>
                            )}
                            {summaryExpense &&
                                summaryExpense.map((expense, idx) => (
                                    <tr key={idx}>
                                        <td>
                                            <div className={classes["date-click"]} onClick={() => dateDetailHandler(expense.date)}>
                                                {expense.date}
                                            </div>
                                        </td>
                                        <td className={classes.total}>
                                            {expense.subTotal}
                                        </td>
                                        {
                                            // Map over the categoryList to ensure order and presence of all categories
                                            categoryList.map((category, idx) => {
                                                    const eachCategory = expense.sumByCategory[category];
                                                    const amount = eachCategory.total;
                                                    return (
                                                        <td key={idx} className={classes["align-center"]}>
                                                            {amount > 0 ? `$${amount.toFixed(2)}` : " "}
                                                        </td>
                                                    );
                                                }
                                            )
                                        }
                                    </tr>
                                ))}
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </>
    )
}

export default DailyExpenseSummary;