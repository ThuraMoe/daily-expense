import { useEffect, useState } from "react";
import app from "../../firebaseConfig";
import { getDatabase, ref, set, push } from "firebase/database";
import {
	Row,
	Col,
	Form,
	Button,
	Alert,
	Modal,
	InputGroup,
} from "react-bootstrap";
import dayjs from "dayjs";

const AddExpense = (props) => {
	const categoryList = [
		"Food",
		"Transportation",
		"Healthcare",
		"Family & Friends",
		"Trip",
	];
	const [category, setCategory] = useState("Food");
	const [expenseName, setExpenseName] = useState("");
	const [expenseAmount, setExpenseAmount] = useState("");
	const [currency, setCurrency] = useState("usd");
	const [expenseDate, setExpenseDate] = useState(
		dayjs().format("YYYY-MM-DD")
	);
	const [isSave, setIsSave] = useState(false);
	const [show, setShow] = useState(false);

	useEffect(() => {setShow(props.onModalOpen)},[props.onModalOpen])

	const addExpenseHandler = async () => {
		const db = getDatabase(app);
		const newDocRef = push(
			ref(db, `expenses/daily-expenses/${expenseDate}`)
		);
		set(newDocRef, {
			name: expenseName,
			amount: expenseAmount,
			currency: currency,
			category: category,
		})
			.then(() => {
				console.log("Document successfully written!");
				setExpenseAmount("");
				setExpenseName("");
				setIsSave(true);
				// state lifting to parents
				props.onModalSave();
			})
			.catch((error) => {
				console.error("Error writing document: ", error);
				setIsSave(false);
			});
	};

	const onCloseHandler = () => props.onModalClose();

	return (
		<Modal show={show} onHide={onCloseHandler}>
			<Modal.Header closeButton>
				<Modal.Title>Add Expense</Modal.Title>
			</Modal.Header>

			<Modal.Body>
				<Form>
					{isSave && <Alert>Data is saved!</Alert>}
					<Form.Group className="mb-3" controlId="Form.ExpenseTitle">
						<Form.Label>Title</Form.Label>
						<Form.Control
							type="text"
							placeholder="Enter Expense Name"
							value={expenseName}
							onChange={(e) => {
								setExpenseName(e.target.value);
								setIsSave(false);
							}}
						/>
					</Form.Group>

					<Form.Group className="mb-3" controlId="Form.Category">
						<Form.Label>Category</Form.Label>
						<Form.Select
							aria-label="category"
							value={category}
							onChange={(e) => {
								setCategory(e.target.value);
							}}
						>
							{categoryList.map((cat) => (
								<option key={cat} value={cat}>
									{cat}
								</option>
							))}
						</Form.Select>
					</Form.Group>

					<Form.Group className="mb-3" controlId="Form.ExpenseAmount">
						<Form.Label>Amount</Form.Label>
						<InputGroup>
							<Form.Control
								type="number"
								placeholder="Enter Expense Amount"
								value={expenseAmount}
								onChange={(e) => {
									setExpenseAmount(e.target.value);
								}}
								style={{ width: "80%" }}
							/>
							<Form.Select
								aria-label="currency"
								style={{ width: "20%" }}
								value={currency}
								onChange={(e) => {
									setCurrency(e.target.value);
								}}
							>
								<option value="usd">USD</option>
								<option value="riel">Riel</option>
								<option value="mmk">MMK</option>
							</Form.Select>
						</InputGroup>
					</Form.Group>

					<Form.Group className="mb-3" controlId="Form.DatePicker">
						<Form.Label>Choose Date</Form.Label>
						<Form.Control
							type="date"
							value={expenseDate}
							onChange={(e) => setExpenseDate(e.target.value)}
						/>
					</Form.Group>
				</Form>
			</Modal.Body>

			<Modal.Footer>
				<Button variant="secondary" onClick={onCloseHandler}>Close</Button>
				<Button variant="primary" onClick={addExpenseHandler}>
					Save Expense
				</Button>
			</Modal.Footer>
		</Modal>
	);
};
export default AddExpense;
