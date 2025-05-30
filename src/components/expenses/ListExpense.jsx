import { useEffect, useState } from "react";
import app from "../../firebaseConfig";
import { getDatabase, ref, get, remove } from "firebase/database";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Table from "react-bootstrap/Table";
import { Button } from "react-bootstrap";

const ListExpense = (props) => {
	let [expenses, setExpenses] = useState([]);

	useEffect(() => {
		getExpenses();
	}, []);

	const addNewExpenseHandler = () => props.onNewExpense();

	const getExpenses = async () => {
		const db = getDatabase(app);
		const expenseRef = ref(db, "expenses/daily-expenses");
		const snapshot = await get(expenseRef);
		if (snapshot.exists) {
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
			alert("No data available");
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
				<Col xs={10}>
					<h3>List of Expenses</h3>
				</Col>
				<Col xs={2}>
					<Button onClick={addNewExpenseHandler}>Add New Expense</Button>
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
							{expenses.map((expense) => {
								return (
									<tr key={expense.key}>
										<td>{expense.name}</td>
										<td>{expense.amount}</td>
										<td>
											<button>Edit</button>
											<button
												onClick={() =>
													deleteHandler(expense.key)
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
