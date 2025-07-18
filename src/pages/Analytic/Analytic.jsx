import { Card, Col, Container, Form, InputGroup, Row } from "react-bootstrap";
import { useEffect, useState } from "react";
import * as Utils from "../../utils/Utils";
import { endAt, get, getDatabase, orderByKey, query, ref, startAt } from "firebase/database";
import { app } from "../../firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import categoryList from "../../utils/CategoryList";
import DailyCostLineChart from "../../components/NivoChart/DailyCostLineChart";
import CategoryCostBarChart from "../../components/NivoChart/CategoryCostBarChart";

const Analytic = () => {
	// calculate 26(prev month) to 25(current month)
	const [from, to] = Utils.calculateFromToDate();
	const [fromDate, setFromDate] = useState(from);
	const [toDate, setToDate] = useState(to);
	const [dailyExpenseData, setDailyExpenseData] = useState([]);
	const [categoryExpenseData, setCategoryExpenseData] = useState([]);
	const [totalExpenseAmount, setTotalExpenseAmount] = useState(0);

	// get user data
	const {currentUser} = useAuth();

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
						const amountInUsd = Utils.convertToUsd(amount,currency);

						// If the category doesn't exist in aggregatedExpenses yet, initialize it to 0.
						// Then add the current expense amount. This handles all categories dynamically.
						if (aggregatedExpenses.hasOwnProperty(category)) {
							aggregatedExpenses[category].total += amountInUsd;
							totalExpenseByCategory[category].total += amountInUsd;
							totalCategoryExpense += amountInUsd;
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
			console.log(summaryByDate);
			

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
			setDailyExpenseData(prepareData);
			
			// convert the aggregated object to an array as requested
			let totalExpense = 0;
			const colorsArray = ["#f58b00ff", "#ff5100ff", "#ff0800ff", "#ff4800ff", "#ff8c00ff", "#ff5e00ff"];
			const totalExpenseForCategory = Object.values(totalExpenseByCategory).map((item) => {
				const randomColor = colorsArray[Math.floor(Math.random() * colorsArray.length)];
				totalExpense += parseFloat(item.total.toFixed(2));
				return ({
					categoryName: item.category,
					totalCost: parseFloat(item.total.toFixed(2)),
					color: randomColor
				})}
			).sort((a, b) => a.totalCost - b.totalCost);
			
			setCategoryExpenseData(totalExpenseForCategory);
			setTotalExpenseAmount(totalExpense);
		} else {
			setDailyExpenseData([]);
			setCategoryExpenseData([]);
			setTotalExpenseAmount(0);
		}


	};

	return (
		<Container>
			<Row>
				<Col md={8} xs={12}>
					<h3>Analytics</h3>
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
			<Row >
				<Col xs="auto">
					<h4 style={{color: "#e40202ff"}}>Total: ${totalExpenseAmount.toFixed(2)}</h4>
				</Col>
			</Row>
			<Row>
				<Col xs={6} md={6}>
					<CategoryCostBarChart categoryExpense={categoryExpenseData}/>
				</Col>
			
				<Col xs={6} md={6}>
					<DailyCostLineChart dailyExpenses={dailyExpenseData} />
				</Col>
			</Row>
		</Container>
	);
};

export default Analytic;
