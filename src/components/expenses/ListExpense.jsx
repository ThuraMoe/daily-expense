import { useEffect, useState } from "react";
import app from "../../firebaseConfig";
import { getDatabase, ref, get, remove } from "firebase/database";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Table from "react-bootstrap/Table";
import { Button, Form } from "react-bootstrap";
import dayjs from "dayjs";

const NO_DATA_ERR_MSG = "There has no data";

const ListExpense = (props) => {
	let [expenses, setExpenses] = useState([]);
	let [expenseDate, setExpenseDate] = useState(dayjs().format("YYYY-MM-DD"));

	useEffect(() => {
		getExpenses();

		if(props.onIsSave) {
			props.onResetSave();
		}
	}, [expenseDate, props.onIsSave]);

	const addNewExpenseHandler = () => props.onNewExpense();

	const showExpenseForSelectedDate = (e) => {
		if (e.target.value != "") {
			console.log("change date ", e.target.value);
			setExpenseDate(e.target.value);
		}
	};

	const getExpenses = async () => {
		const db = getDatabase(app);
		console.log("expenseDate ", expenseDate);
		const expenseRef = ref(db, `expenses/daily-expenses/${expenseDate}`);
		const snapshot = await get(expenseRef);
		console.log(snapshot);
		if (snapshot.exists() && snapshot.hasChildren()) {
			console.log(snapshot.val());
			const expenses = Object.entries(snapshot.val()).map(
				([key, value]) => ({
					key: key,
					...value,
				})
			);
			console.log(expenses);
			setExpenses(expenses);
		} else {
			setExpenses([]);
		}
	};

	const deleteHandler = async (key) => {
		const db = getDatabase(app);
		const expenseRef = ref(db, `expenses/daily-expenses/${key}`);
		await remove(expenseRef, null);
		getExpenses();
	};

	return (
		<>
			<Row>
				<Col xs={8}>
					<h3>List of Expenses</h3>
				</Col>
				<Col xs={2}>
					<Form.Control
						type="date"
						value={expenseDate}
						onChange={(e) => showExpenseForSelectedDate(e)}
					/>
				</Col>
				<Col xs={2}>
					<Button onClick={addNewExpenseHandler}>
						Add New Expense
					</Button>
				</Col>
			</Row>
			<Row>
				<Col xs={12}>
					<Table striped bordered hover>
						<thead>
							<tr>
								<th>Title</th>
								<th>Amount</th>
								<th>Action</th>
							</tr>
						</thead>
						<tbody>
							{expenses.length == 0 && (
								<tr>
									<td colSpan={3}>{NO_DATA_ERR_MSG}</td>
								</tr>
							)}
							{expenses &&
								expenses.map((expense) => {
									return (
										<tr key={expense.key}>
											<td>{expense.name}</td>
											<td>{expense.amount}</td>
											<td>
												<button>Edit</button>
												<button
													onClick={() =>
														deleteHandler(
															expense.key
														)
													}
												>
													Delete
												</button>
											</td>
										</tr>
									);
								})}
						</tbody>
					</Table>
				</Col>
			</Row>
		</>
	);
};

export default ListExpense;
