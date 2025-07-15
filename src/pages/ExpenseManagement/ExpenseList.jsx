import { useEffect, useState } from "react";
import app from "../../firebaseConfig";
import {
	getDatabase,
	ref,
	get,
	remove,
	query,
	orderByChild,
	equalTo,
	update,
} from "firebase/database";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Table from "react-bootstrap/Table";
import { Button, Form, InputGroup } from "react-bootstrap";
import dayjs from "dayjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEraser, faFilePen, faFloppyDisk, faSquarePlus, faXmark } from "@fortawesome/free-solid-svg-icons";
import * as Utils from "../../utils/Utils";
import classes from "../../styles/common.module.css";
import { useSearchParams } from "react-router-dom";
import { NO_DATA_ERR_MSG } from "../../utils/Constant";
import categoryList from "../../utils/CategoryList";
import * as Constant from "../../utils/Constant";


const ExpenseList = (props) => {
	const [expenses, setExpenses] = useState([]);
	const [categoryExpense, setCategoryExpense] = useState([]);
	const [dailyTotal, setDailyTotal] = useState(0);
	const [expenseDate, setExpenseDate] = useState(
		dayjs().format("YYYY-MM-DD")
	);
	const [searchParams, setSearchParams] = useSearchParams();

	// for editable part
	const [editRowId, setEditRowId] = useState(null);
	const [category, setCategory] = useState();
	const [expenseName, setExpenseName] = useState("");
	const [expenseAmount, setExpenseAmount] = useState("");
	const [currency, setCurrency] = useState(Constant.CURRENCY[0]);
	const [expenseKey, setExpenseKey] = useState(null);

	useEffect(() => {
		// Get the value of the 'date' parameter
    	const dateFromUrl = searchParams.get('date');
		if(dateFromUrl) {
			setExpenseDate(dateFromUrl);
		}
		console.log('date from url ', dateFromUrl);

		getExpenses();

		if (props.onIsSave) {
			props.onResetSave();
		}
	}, [expenseDate, props.onIsSave]);

	const addNewExpenseHandler = () => props.onNewExpense(expenseDate);

	const showExpenseForSelectedDate = (e) => {
		if (e.target.value != "") {
			setDailyTotal(0);
			setExpenseDate(e.target.value);
		}
	};

	const getExpenses = async () => {
		const db = getDatabase(app);
		console.log("expenseDate ", expenseDate);
		const expenseRef = ref(db, `expenses/daily-expenses/${expenseDate}`);
		const snapshot = await get(expenseRef);
		if (snapshot.exists() && snapshot.hasChildren()) {
			console.log(snapshot.val());
			const expenses = Object.entries(snapshot.val()).map(
				([key, value]) => ({
					key: key,
					...value,
				})
			);

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
				const amountInUsd = Utils.convertToUsd(amount, currency);
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
			const totalExpenseForCategory = Object.values(
				aggregatedExpenses
			).map((item) => ({
				category: item.category,
				totalAmount: parseFloat(item.total.toFixed(2)),
			}));
			console.log(totalExpenseForCategory);
			setCategoryExpense(totalExpenseForCategory);
			setExpenses(expenses);
		} else {
			setCategoryExpense([]);
			setExpenses([]);
		}
	};

	const searchByCategory = async (cat) => {
		const categoryToSearch = cat.category;

		// show all category data for selected date
		const db = getDatabase(app);
		const expenseRef = ref(db, `expenses/daily-expenses/${expenseDate}`);

		// search by category query
		const q = query(
			expenseRef,
			orderByChild("category"),
			equalTo(categoryToSearch)
		);
		// execute query
		const snapshot = await get(q);
		console.log(snapshot.val());
		if (snapshot.exists()) {
			const expenseByCategory = snapshot.val();

			// convert expense object to array for easier use
			const filteredExpense = Object.entries(expenseByCategory).map(
				([key, value]) => ({ key: key, ...value })
			);
			setExpenses(filteredExpense);
		}
	};

	const editExpenseHandler = (expense) => {
		const key = expense.key;
		const defaultCategory = expense.category;
		const expName = expense.name;
		const amount = expense.amount;
		const currency = expense.currency;

		// set original value
		setEditRowId(key);
		setExpenseKey(key);
		setCategory(defaultCategory);
		setExpenseName(expName);
		setExpenseAmount(amount);
		setCurrency(currency);
	};

	const updateExpenseHandler = async () => {
		const db = getDatabase(app);
		const updateExpenseRef = ref(
			db,
			`expenses/daily-expenses/${expenseDate}/${expenseKey}`
		);

		// updated data
		const updatedData = {
			name: expenseName,
			category: category,
			amount: expenseAmount,
			currency: currency,
		};

		// update data
		await update(updateExpenseRef, updatedData);

		// close editable box
		setEditRowId(null);

		// call expense data again
		getExpenses();
	};

	const cancelEditHandler = () => {
		setEditRowId(false);
	};

	const deleteHandler = async (key) => {
		const db = getDatabase(app);
		const expenseRef = ref(
			db,
			`expenses/daily-expenses/${expenseDate}/${key}`
		);
		await remove(expenseRef, null);
		getExpenses();
	};

	return (
		<>
			<Row>
				<Col md={8} xs={12}>
					<h3>List of Expenses</h3>
				</Col>
				<Col md={2} xs={8}>
					<Form.Control
						id="expense-date"
						type="date"
						value={expenseDate}
						onChange={(e) => showExpenseForSelectedDate(e)}
					/>
				</Col>
				<Col md={2} xs={4}>
					<Button onClick={addNewExpenseHandler}>
						<FontAwesomeIcon icon={faSquarePlus} />
					</Button>
				</Col>
			</Row>
			<Row>
				<Col md={12}>
					<div
						className={`${classes["category-click"]} ${classes["category-total"]}`}
						onClick={getExpenses}
					>
						Total: {dailyTotal} $
					</div>
					{categoryExpense &&
						categoryExpense.map((cat, idx) => {
							return cat.totalAmount > 0 ? (
								<div
									className={classes["category-click"]}
									key={idx}
									onClick={() => searchByCategory(cat)}
								>
									{cat.category} : {cat.totalAmount} $
								</div>
							) : (
								""
							);
						})}
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
									<td colSpan={4}>{NO_DATA_ERR_MSG}</td>
								</tr>
							)}
							{expenses &&
								expenses.map((expense) => {
									return (
										<tr key={expense.key}>
											{
												editRowId === expense.key ? (
													<>
														<td>
															<Form.Select
																aria-label="category"
																value={category}
																onChange={(e) => {
																	setCategory(
																		e.target.value
																	);
																}}
															>
																{categoryList.map(
																	(cat) => (
																		<option
																			key={cat}
																			value={cat}
																		>
																			{cat}
																		</option>
																	)
																)}
															</Form.Select>
														</td>
														<td>
															<Form.Control
																type="text"
																placeholder="Enter Expense Name"
																value={expenseName}
																onChange={(e) =>
																	setExpenseName(
																		e.target.value
																	)
																}
																autoFocus
															/>
														</td>
														<td>
															<InputGroup>
																<Form.Control
																	type="number"
																	placeholder="Enter Expense Amount"
																	value={
																		expenseAmount
																	}
																	onChange={(e) => {
																		setExpenseAmount(
																			e.target
																				.value
																		);
																	}}
																	style={{
																		width: "80%",
																	}}
																/>
																<Form.Select
																	aria-label="currency"
																	style={{
																		width: "20%",
																	}}
																	value={currency}
																	onChange={(e) => {
																		setCurrency(
																			e.target
																				.value
																		);
																	}}
																>
																	{
																		Constant.CURRENCY.map((curr, idx) => (
																			<option key={idx} value={curr}>{curr}</option>
																		))
																	}
																</Form.Select>
															</InputGroup>
														</td>
														<td>
															<Button
																variant="primary"
																size="sm"
																onClick={
																	updateExpenseHandler
																}
															>
																<FontAwesomeIcon
																	icon={
																		faFloppyDisk
																	}
																/>
															</Button>{" "}
															&nbsp;
															<Button
																variant="dark"
																size="sm"
																onClick={
																	cancelEditHandler
																}
															>
																<FontAwesomeIcon
																	icon={faXmark}
																/>
															</Button>
														</td>
													</>
												) : (
													<>
														<td>{expense.category}</td>
														<td>{expense.name}</td>
														<td>{`${expense.amount} ${expense.currency}`}</td>
														<td>
															<Button
																variant="primary"
																size="sm"
																onClick={() =>
																	editExpenseHandler(
																		expense
																	)
																}
															>
																<FontAwesomeIcon
																	icon={faFilePen}
																/>
															</Button>{" "}
															&nbsp;
															<Button
																variant="danger"
																size="sm"
																onClick={() =>
																	deleteHandler(
																		expense.key
																	)
																}
															>
																<FontAwesomeIcon
																	icon={faEraser}
																/>
															</Button>
														</td>
													</>
												)
											}
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

export default ExpenseList;
