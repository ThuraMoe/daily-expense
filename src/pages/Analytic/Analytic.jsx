import {
	Button,
	Col,
	Container,
	Form,
	Row,
} from "react-bootstrap";
import { useEffect, useState } from "react";
import * as Utils from "../../utils/Utils";
import {
	endAt,
	get,
	getDatabase,
	orderByKey,
	query,
	ref,
	startAt,
} from "firebase/database";
import { app } from "../../firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import categoryList from "../../utils/CategoryList";
import DailyCostLineChart from "../../components/NivoChart/DailyCostLineChart";
import CategoryCostBarChart from "../../components/NivoChart/CategoryCostBarChart";
import CategoryCostPieChart from "../../components/NivoChart/CategoryCostPieChart";
import MonthlyTotalComparison from "./MontlyTotalComparison";
import dayjs from "dayjs";

const Analytic = () => {

	const [selectedMonth, setSelectedMonth] = useState(dayjs().format("YYYY-MM"));
	const [dailyExpenseData, setDailyExpenseData] = useState([]);
	const [categoryExpenseData, setCategoryExpenseData] = useState([]);
	const [categoryExpenseForPie, setCategoryExpenseForPie] = useState([]);
	const [currentMonthTotal, setCurrentMonthTotal] = useState(0);

	// categorize total comparison
	const [selectedMonthCategorizedExpenses, setSelectedMonthCategorizedExpenses] = useState([]);
	const [prevMonthCategorizedExpenses, setPrevMonthCategorizedExpenses] = useState([]);

	// previous month data
	const [prevMonthTotal, setPrevMonthTotal] = useState(0);

	// get user data
	const { currentUser } = useAuth();

	useEffect(() => {
		fetchCurrentMonthExpenses();
		fetchPrevMonthExpenses();
	}, [selectedMonth]);

	const fromDateChangeHandler = (e) => {
		if (e.target.value !== "") {
			setSelectedMonth(e.target.value);
		}
	};

	const fetchDataWithRange = async (startDate, endDate) => {
		let expensesArray = {};
		const db = getDatabase(app);
		const expenseRef = ref(
			db,
			`expenses/users/${currentUser.uid}/daily-expenses`
		);
		const q = query(
			expenseRef,
			orderByKey(), // Order by the date keys
			startAt(startDate), // Start at the specified fromDate (inclusive)
			endAt(endDate) // End at the specified toDate (inclusive)
		);

		const snapshot = await get(q);
		if (snapshot.exists() && snapshot.hasChildren()) {
			const expensesData = snapshot.val();
			// Firebase returns an object for ordered queries.
			// Convert it to an array if you need to iterate over it easily.
			expensesArray = Object.keys(expensesData).map((key) => ({
				date: key, // The date is the key
				...expensesData[key], // The actual expense data for that date
			}));
		}
		return expensesArray;
	};

	const fetchPrevMonthExpenses = async () => {
		const [prevFromDate, prevToDate] = Utils.getPrevMonthBasedOnSelectedDate(selectedMonth);
		console.log('previous start date is ', prevFromDate, ' and end date is ', prevToDate);
		const expensesArray = await fetchDataWithRange(prevFromDate, prevToDate);
		if (expensesArray.length > 0) {
			let totalAmount = 0;

			// Initialize aggregated expenses with 0 for all categories in categoryList
			const cateorizedExpenses = [];
			categoryList.forEach((category) => {
				cateorizedExpenses[category] = {
					category: category,
					total: 0,
				};
			});

			expensesArray.forEach((expense) => {
				// iterate each item under the same date
				for (const key in expense) {
					// skip date key
					if (key != "date") {
						const expenseItem = expense[key];
						const category = expenseItem.category;
						const amount = expenseItem.amount;
						const currency = expenseItem.currency;
						const amountInUsd = Utils.convertToUsd(amount, currency);
						totalAmount += amountInUsd;

						if(cateorizedExpenses.hasOwnProperty(category)) {
							cateorizedExpenses[category].total += amountInUsd;
						}
					}
				}
			});
			setPrevMonthCategorizedExpenses(cateorizedExpenses);
			console.log('prev month categorize expense total', cateorizedExpenses);
			setPrevMonthTotal(totalAmount.toFixed(2));
		} else {
			setPrevMonthTotal(0.00);
		}
	};

	const fetchCurrentMonthExpenses = async () => {
		const [fromDate, toDate] = Utils.getSelectedMonthDateRange(selectedMonth);
		console.log('selected start date is ', fromDate, ' and end date is ', toDate);
		const expensesArray = await fetchDataWithRange(fromDate, toDate);
		if (expensesArray.length > 0) {
			// Initialize aggregated expenses with 0 for all categories in categoryList
			const totalExpenseByCategory = [];
			categoryList.forEach((category) => {
				totalExpenseByCategory[category] = {
					category: category,
					total: 0,
				};
			});

			const summaryByDate = [];
			let totalExpense = 0;
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
						const amountInUsd = Utils.convertToUsd(amount, currency);
						totalExpense += amountInUsd;

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
			setSelectedMonthCategorizedExpenses(totalExpenseByCategory)
			setCurrentMonthTotal(totalExpense);


			// prepare data to show bar chart
			const dailyTotal = Object.values(summaryByDate).map((item) => ({
				x: item.date,
				y: `${item.subTotal}`,
			}));
			const prepareData = [
				{
					id: "Total Cost",
					data: dailyTotal,
				},
			];
			setDailyExpenseData(prepareData);

			// convert the aggregated object data for pie chart
			const dataForPieChart = Object.values(totalExpenseByCategory)
				.map((item) => {
					const randomColor =
						colorsArray[
							Math.floor(Math.random() * colorsArray.length)
						];
					return {
						id: item.category,
						label: item.category,
						value: item.total.toFixed(2),
						color: randomColor,
					};
				})
				.sort((a, b) => a.value - b.value);
			setCategoryExpenseForPie(dataForPieChart);
		} else {
			setDailyExpenseData([]);
			setCategoryExpenseData([]);
			setCurrentMonthTotal(0);
		}
	};

	const categorizedExpenseComparison = () => {
		const selectedMonthData = selectedMonthCategorizedExpenses;
		const prevMonthData = prevMonthCategorizedExpenses;
		console.log(selectedMonthData, prevMonthData);
		// convert the aggregated object to an array as requested for bar chart
		
		const colorsArray = [
			"#f58b00ff",
			"#ff5100ff",
			"#ff0800ff",
			"#ff4800ff",
			"#ff8c00ff",
			"#ff5e00ff",
		];
		const totalExpenseForCategory = Object.values(
			totalExpenseByCategory
		)
			.map((item) => {
				const randomColor =
					colorsArray[
						Math.floor(Math.random() * colorsArray.length)
					];
				return {
					categoryName: item.category,
					totalCost: parseFloat(item.total.toFixed(2)),
					color: randomColor,
				};
			})
			.sort((a, b) => a.totalCost - b.totalCost);
		console.log(totalExpenseForCategory);
		setCategoryExpenseData(totalExpenseForCategory);
	}

	return (
		<Container>
			<Row>
				<Col md={10} xs={12}>
					<h3>Analytics</h3>
				</Col>
				<Col md={2} xs={12}>
					<Form.Control
						id="fromDate"
						aria-label="from"
						aria-describedby="dateRangeLabel"
						type="month"
						value={selectedMonth}
						onChange={(e) => fromDateChangeHandler(e)}
					/>
				</Col>
			</Row>
			<Row>
				<Col xs={12} md={12}>
					<Button>Daily {}</Button>
				</Col>
			</Row>
			<Row className="vh-50 justify-content-center align-items-center">
				<Col xs={12} md={6} lg={4} className="d-flex justify-content-center align-items-center">
					<MonthlyTotalComparison
						currentMonthTotal={currentMonthTotal}
						prevMonthTotal={prevMonthTotal}
					/>
				</Col>
				<Col xs={12} md={6}>
					<CategoryCostPieChart data={categoryExpenseForPie} />
				</Col>
			</Row>
			<Row>
				<Col xs={12} md={12}>
					<CategoryCostBarChart categoryExpense={categoryExpenseData}/>
				</Col>
				<Col xs={12} md={12}>
					<DailyCostLineChart dailyExpenses={dailyExpenseData} />
				</Col>
			</Row>
		</Container>
	);
};

export default Analytic;
