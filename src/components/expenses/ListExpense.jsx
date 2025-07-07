import { useEffect, useState } from "react";
import app from "../../firebaseConfig";
import { getDatabase, ref, get, remove } from "firebase/database";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Table from "react-bootstrap/Table";
import { Button, Form } from "react-bootstrap";
import dayjs from "dayjs";
import categoryList from "./Category";

import classes from './ListExpense.module.css';

const NO_DATA_ERR_MSG = "There has no data";
const KHR_TO_USD_RATE = 4000;

const ListExpense = (props) => {
	let [expenses, setExpenses] = useState([]);
	let [categoryExpense, setCategoryExpense] = useState([]);
	let [dailyTotal, setDailyTotal] = useState(0);
	let [expenseDate, setExpenseDate] = useState(dayjs().format("YYYY-MM-DD"));

	useEffect(() => {
		getExpenses();

		if (props.onIsSave) {
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

	const convertToUsd = (amount, currency) => {
		const numericAmount = parseFloat(amount);
		if (isNaN(numericAmount)) {
			return 0;
		}

		if (currency === "usd") {
			return numericAmount;
		} else if (currency === "khr") {
			return numericAmount / KHR_TO_USD_RATE;
		}
		return 0;
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
			console.log("expenses ", expenses);

			// Initialize aggregated expenses with 0 for all categories in categoryList
			const aggregatedExpenses = [];
			categoryList.forEach((category) => {
				aggregatedExpenses[category] = { category: category, total: 0 };
			});
			
			let totalCategoryExpense = 0;
			expenses.forEach((expense) => {
				const category = expense.category;
				const amount = expense.amount;
				const currency = expense.currency;
				const amountInUsd = convertToUsd(amount, currency);
				// console.log('amount in usd ', amountInUsd);

				// If the category doesn't exist in aggregatedExpenses yet, initialize it to 0.
				// Then add the current expense amount. This handles all categories dynamically.
				if (aggregatedExpenses.hasOwnProperty(category)) {
					aggregatedExpenses[category].total += amountInUsd;
					totalCategoryExpense += amountInUsd;
				}
			});
			setDailyTotal(totalCategoryExpense.toFixed(2));
			console.log("aggrage ", aggregatedExpenses);

			// convert the aggregated object to an array as requested
			const totalExpenseForCategory = Object.values(aggregatedExpenses).map(item => ({
				category: item.category,
				totalAmount: parseFloat(item.total.toFixed(2))
			}));
			console.log(totalExpenseForCategory);
			setCategoryExpense(totalExpenseForCategory);
			setExpenses(expenses);
		} else {
			setCategoryExpense([]);
			setExpenses([]);
		}
	};

	const deleteHandler = async (key) => {
		const db = getDatabase(app);
		const expenseRef = ref(db, `expenses/daily-expenses/${expenseDate}/${key}`);
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
					<div className={classes.category}>{dailyTotal}</div>
					{categoryExpense &&
						categoryExpense.map((cat, idx) => {
							return <div className={classes.category} key={idx}>{cat.category} : {cat.totalAmount}</div>;
						})
					}
				</Col>
			</Row>
			<Row>
				<Col xs={12}>
					<Table striped bordered hover>
						<thead>
							<tr>
								<th>Category</th>
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
											<td>{expense.category}</td>
											<td>{expense.name}</td>
											<td>{expense.amount} ({expense.currency.toUpperCase()})</td>
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
