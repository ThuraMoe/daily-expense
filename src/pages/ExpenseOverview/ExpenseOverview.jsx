import { useEffect, useState } from "react";
import * as Utils from "../../utils/Utils.js";
import { Col, InputGroup, Row, Form, Container } from "react-bootstrap";
import {
	endAt,
	get,
	getDatabase,
	orderByKey,
	query,
	ref,
	startAt,
} from "firebase/database";
import { app } from "../../firebaseConfig.js";
import classes from "../../styles/common.module.css";
import DailyExpenseSummary from "./DailyExpenseSummary.jsx";
import categoryList from "../../utils/CategoryList.js";
import CategoryExpenseDetails from "./CategoryExpenseDetails.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import DailyCostLineChart from "../../components/NivoChart/DailyCostLineChart.jsx";

const ExpenseOverview = () => {
	const [fromDate, setFromDate] = useState("");
	const [toDate, setToDate] = useState("");
	const [summaryExpense, setSummaryExpense] = useState([]);
	const [totalExpense, setTotalExpense] = useState([]);
	const [rangeTotal, setRangeTotal] = useState(0);
	const [filteredCategoryExpenses, setfilteredCategoryExpenses] = useState([]);
	const [currentView, setCurrentView] = useState('daily');
	const [activeCategory, setActiveCategory] = useState(null);
	const [dailyExpenses, setDailyExpenses] = useState([]);

	// get user data
	const {currentUser} = useAuth();

	// to calculate from, to date when component start
	useEffect(() => {
		// calculate 26(prev month) to 25(current month)
		const [from, to] = Utils.calculateFromToDate();
		setFromDate(from);
		setToDate(to);
	}, []);

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
		const expenseRef = ref(db, `expenses/users/${currentUser.uid}/daily-expenses`);
		const q = query(
			expenseRef,
			orderByKey(), // Order by the date keys
			startAt(fromDate), // Start at the specified fromDate (inclusive)
			endAt(toDate) // End at the specified toDate (inclusive)
		);

		const snapshot = await get(q);
		if (snapshot.exists() && snapshot.hasChildren()) {
			const expensesData = snapshot.val();
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

			const dailyTotal = Object.values(summaryByDate).map((item) => ({
				x: item.date,
				y: `${item.subTotal}`
			}));
			console.log(dailyTotal);
			const prepareData = [
				{
					id: "Total Cost",
					data: dailyTotal
				}
			]
			setDailyExpenses(prepareData);
			
			// convert the aggregated object to an array as requested
			const totalExpenseForCategory = Object.values(totalExpenseByCategory).map((item) => ({
				category: item.category,
				totalAmount: parseFloat(item.total.toFixed(2)),
			})).sort((a, b) => b.totalAmount - a.totalAmount);
			setTotalExpense(totalExpenseForCategory);
		} else {
			setSummaryExpense([]);
		}

		// set view to daily
		setCurrentView('daily');
	};

	const categoryClickHandler = async (selectedCategory) => {
		const categoryToSearch = selectedCategory;

		// set active category name
		setActiveCategory(selectedCategory);

		// show all category data for selected date
		const db = getDatabase(app);
		const expenseRef = ref(db, `expenses/users/${currentUser.uid}/daily-expenses`);

		// search by category query
		const q = query(
			expenseRef,
			orderByKey(), // Order by the date keys
			startAt(fromDate), // Start at the specified fromDate (inclusive)
			endAt(toDate) // End at the specified toDate (inclusive)
		);
		// execute query
		const snapshot = await get(q);
		if (snapshot.exists()) {
			const expenseByCategory = snapshot.val();

			// convert expense object to array for easier use
			const formattedData = Object.entries(expenseByCategory).map(
				([key, value]) => ({ date: key, ...value })
			);

			// extract only selected category data
			const filteredData = [];
			formattedData.forEach((data) => {
				for(const key in data) {
					if(key !== 'date') {
						const row = data[key];
						if(row.category === categoryToSearch) {							
							filteredData.push({date: data['date'], ...row});
						}
					}
				}
			});
			setfilteredCategoryExpenses(filteredData);

			// show category view
			setCurrentView('category');
		}
	}

	return (
		<>
			<Container>
				<Row>
					<Col md={8} xs={12}>
						<h3>Summary</h3>
					</Col>
					<Col md={4} xs={12}>
						<InputGroup className="mb-3">
							<InputGroup.Text id="dateRangeLabel">
								Date Range
							</InputGroup.Text>
							<Form.Control
								id="fromDate"
								aria-label="from"
								aria-describedby="dateRangeLabel"
								type="date"
								value={fromDate}
								onChange={(e) => fromDateChangeHandler(e)}
							/>
							<Form.Control
								id="toDate"
								aria-label="to"
								aria-describedby="dateRangeLabel"
								type="date"
								value={toDate}
								onChange={(e) => toDateChangeHandler(e)}
							/>
						</InputGroup>
					</Col>
				</Row>
				<Row>
					<Col xs={12}>
						<div className={`${classes["category-click"]} ${classes["category-total"]}`} onClick={fetchExpenseByDateRange}>
							Total <br/> {rangeTotal} $
						</div>
						{totalExpense &&
							totalExpense.map((cat, idx) => {
								const isActive = cat.category === activeCategory;
								const itemClasses = `${classes["category-click"]} ${isActive ? classes["category-active"] : ''}`
								return (
									<div className={itemClasses} key={idx} onClick={() => categoryClickHandler(cat.category)}>
										{cat.category} <br/> {cat.totalAmount} $
									</div>
								)
							})
						}
					</Col>
				</Row>
				<Row className="mb-4">
					<Col xs={12}>
						<DailyCostLineChart dailyExpenses={dailyExpenses} />
					</Col>
				</Row>
				{
					currentView == 'daily' ? (
						<DailyExpenseSummary summaryExpense={summaryExpense} />
					) : (
						<CategoryExpenseDetails filteredExpenses={filteredCategoryExpenses} />
					)
				}
				


			</Container>
		</>
	);
};

export default ExpenseOverview;
