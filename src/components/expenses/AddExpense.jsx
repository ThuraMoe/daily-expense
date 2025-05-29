import { useState } from "react";
import app from "../../firebaseConfig";
import { getDatabase, ref, set, push } from "firebase/database";
import { Row, Col, Form, Button } from "react-bootstrap";

const AddExpense = () => {
	let [expenseName, setExpenseName] = useState("");
	let [expenseAmount, setExpenseAmount] = useState("");

	const addExpenseHandler = async () => {
		const db = getDatabase(app);
		const newDocRef = push(ref(db, "expenses/daily-expenses"));
		set(newDocRef, {
			name: expenseName,
			amount: expenseAmount,
		})
			.then(() => {
				alert("Document successfully written!");
			})
			.catch((error) => {
				console.error("Error writing document: ", error);
			});
	};

	return (
		<Form>
			<Form.Group className="mb-3" controlId="Form.ExpenseTitle">
				<Form.Label>Expense Title</Form.Label>
				<Form.Control
					type="text"
					placeholder="Enter Expense Name"
					value={expenseName}
					onChange={(e) => {
						setExpenseName(e.target.value);
					}}
				/>
			</Form.Group>
			<Form.Group className="mb-3" controlId="Form.ExpenseAmount">
				<Form.Label>Expense Amount</Form.Label>
				<Form.Control
					type="number"
					placeholder="Enter Expense Amount"
					value={expenseAmount}
					onChange={(e) => {
						setExpenseAmount(e.target.value);
					}}
				/>
			</Form.Group>
            <Button variant="primary" onClick={addExpenseHandler}>Add Expense</Button>
		</Form>
	);
};
export default AddExpense;
