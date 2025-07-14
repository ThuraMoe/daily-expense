import { useEffect, useState } from "react";
import * as Utils from "../../utils/Utils.js";
import { Col, InputGroup, Row, Form, Container, Table } from "react-bootstrap";
import {
	endAt,
	equalTo,
	get,
	getDatabase,
	orderByChild,
	orderByKey,
	query,
	ref,
	startAt,
} from "firebase/database";
import app from "../../firebaseConfig.js";
import classes from "../../styles/common.module.css";
import DailyExpenseSummary from "./DailyExpenseSummary.jsx";
import categoryList from "../../utils/CategoryList.js";

const ExpenseOverview = () => {
	const [fromDate, setFromDate] = useState(null);
	const [toDate, setToDate] = useState(null);
	const [summaryExpense, setSummaryExpense] = useState([]);
	const [totalExpense, setTotalExpense] = useState([]);
	const [rangeTotal, setRangeTotal] = useState(0);
	const [filteredCategoryExpenses, setfilteredCategoryExpenses] = useState([]);

	// to calculate from, to date when component start
	useEffect(() => {
		// calculate from, to date
		calculateFromToDate();
	}, []);

	// calculate 26(prev month) to 25(current month)
	const calculateFromToDate = () => {
		const now = new Date();

		// calculate 26th of the previous month
		const start = new Date(now.getFullYear(), now.getMonth() - 1, 26);

		// calculate 25th of the current month
		const end = new Date(now.getFullYear(), now.getMonth(), 25);

		// convert to Y-m-d format
		const stDate = Utils.dateFormatHelper(start);
		const enDate = Utils.dateFormatHelper(end);

		// set date as state
		setFromDate(stDate);
		setToDate(enDate);
	};

	// fetch data again when user changed the date
	useEffect(() => {
		// need to fetch data when both date exists in correct
		if (fromDate && toDate && fromDate < toDate) {
			fetchExpenseByDateRange();
		}
	}, [fromDate, toDate]);

	const fromDateChangeHandler = (e) => {
		if (e.target.value !== "") {
			setFromDate(e.target.value);
		}
	};

	const toDateChangeHandler = (e) => {
		if (e.target.value !== "") {
			setToDate(e.target.value);
		}
	};

	const fetchExpenseByDateRange = async () => {
		const db = getDatabase(app);
		const expenseRef = ref(db, `expenses/daily-expenses`);
		const q = query(
			expenseRef,
			orderByKey(), // Order by the date keys
			startAt(fromDate), // Start at the specified fromDate (inclusive)
			endAt(toDate) // End at the specified toDate (inclusive)
		);

		const snapshot = await get(q);
		if (snapshot.exists() && snapshot.hasChildren()) {
			const expensesData = snapshot.val();
			console.log("fetch expenses by date range");
			console.log(snapshot.val());
			// Firebase returns an object for ordered queries.
			// Convert it to an array if you need to iterate over it easily.
			const expensesArray = Object.keys(expensesData).map((key) => ({
				date: key, // The date is the key
				...expensesData[key], // The actual expense data for that date
			}));

			// Initialize aggregated expenses with 0 for all categories in categoryList
			const totalExpenseByCategory = [];
			categoryList.forEach((category) => {
				totalExpenseByCategory[category] = { category: category, total: 0 };
			});
			
			const summaryByDate = [];
			let sumAllCategory = 0;
			expensesArray.forEach((expense) => {
				let totalCategoryExpense = 0;
				const date = expense.date;

				// Initialize aggregated expenses with 0 for all categories in categoryList
				const aggregatedExpenses = [];
				categoryList.forEach((category) => {
					aggregatedExpenses[category] = {
						category: category,
						total: 0,
					};
				});

				// iterate each item under the same date
				for (const key in expense) {
					// skip date key
					if (key != "date") {
						const expenseItem = expense[key];
						const category = expenseItem.category;
						const amount = expenseItem.amount;
						const currency = expenseItem.currency;
						const amountInUsd = Utils.convertToUsd(
							amount,
							currency
						);

						// If the category doesn't exist in aggregatedExpenses yet, initialize it to 0.
						// Then add the current expense amount. This handles all categories dynamically.
						if (aggregatedExpenses.hasOwnProperty(category)) {
							aggregatedExpenses[category].total += amountInUsd;
							totalExpenseByCategory[category].total += amountInUsd;
							totalCategoryExpense += amountInUsd;
							sumAllCategory += amountInUsd;
						}
					}
				}
				// push it to summary array after format
				summaryByDate.push({
					date: date,
					sumByCategory: aggregatedExpenses,
					subTotal: totalCategoryExpense.toFixed(2),
				});
			});
			setSummaryExpense(summaryByDate);
			setRangeTotal(sumAllCategory.toFixed(2));
			
			// convert the aggregated object to an array as requested
			const totalExpenseForCategory = Object.values(totalExpenseByCategory).map((item) => ({
				category: item.category,
				totalAmount: parseFloat(item.total.toFixed(2)),
			}));
			setTotalExpense(totalExpenseForCategory);
		} else {
			setSummaryExpense([]);
		}
	};

	const categoryClickActionHandler = async (selectedCategory) => {
		console.log("he is clicked ", selectedCategory);
		const categoryToSearch = selectedCategory;

		// show all category data for selected date
		const db = getDatabase(app);
		const expenseRef = ref(db, `expenses/daily-expenses`);

		// search by category query
		const q = query(
			expenseRef,
			orderByKey(), // Order by the date keys
			startAt(fromDate), // Start at the specified fromDate (inclusive)
			endAt(toDate) // End at the specified toDate (inclusive)
		);
		// execute query
		const snapshot = await get(q);
		console.log(snapshot.val());
		if (snapshot.exists()) {
			const expenseByCategory = snapshot.val();

			// convert expense object to array for easier use
			const formattedData = Object.entries(expenseByCategory).map(
				([key, value]) => ({ date: key, ...value })
			);
			console.log('formattedData ', formattedData);

			// extract only selected category data
			const filteredData = [];
			formattedData.forEach((data) => {
				
				for(const key in data) {
					if(key !== 'date') {
						const row = data[key];
						if(row.category === categoryToSearch) {
							console.log(row.category, " == ", categoryToSearch);
							
							filteredData.push([row, {date: data['date']}]);
						}
					}
				}
			});
			console.log('final filtereddata ');
			console.log(filteredData);
			// setExpenses(filteredExpense);
		}
	}

	return (
		<>
			<Container>
				<Row>
					<Col md={8} xs={12}>
						<h3>Summary</h3>
					</Col>
					<Col md={4} xs={8}>
						<InputGroup size="sm" className="mb-3">
							<InputGroup.Text id="inputGroup-sizing-sm">
								Date Range
							</InputGroup.Text>
							<Form.Control
								aria-label="from"
								aria-describedby="inputGroup-sizing-sm"
								type="date"
								value={fromDate}
								onChange={(e) => fromDateChangeHandler(e)}
							/>
							<Form.Control
								aria-label="to"
								aria-describedby="inputGroup-sizing-sm"
								type="date"
								value={toDate}
								onChange={(e) => toDateChangeHandler(e)}
							/>
						</InputGroup>
					</Col>
				</Row>
				
				<DailyExpenseSummary 
					summaryExpense={summaryExpense} 
					totalExpense={totalExpense} 
					rangeTotal={rangeTotal} 
					onAction={categoryClickActionHandler}
				/>

			</Container>
		</>
	);
};

export default ExpenseOverview;
