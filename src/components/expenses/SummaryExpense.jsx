import { useEffect, useState } from "react";
import * as Utils from "../../Utils/Utils.js";
import { Col, InputGroup, Row, Form, Container, Table } from "react-bootstrap";
import {
	endAt,
	get,
	getDatabase,
	orderByKey,
	query,
	ref,
	startAt,
} from "firebase/database";
import categoryList from "./Category.jsx";
import app from "../../firebaseConfig.js";

const NO_DATA_ERR_MSG = "There has no data";

const SummaryExpense = () => {
	const [fromDate, setFromDate] = useState(null);
	const [toDate, setToDate] = useState(null);
    const [summaryExpense, setSummaryExpense] = useState([]);

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
			console.log(
				"user is selected from Date ",
				fromDate,
				" and to Date ",
				toDate
			);
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
			console.log(snapshot.val());
			// Firebase returns an object for ordered queries.
			// Convert it to an array if you need to iterate over it easily.
			const expensesArray = Object.keys(expensesData).map((key) => ({
				date: key, // The date is the key
				...expensesData[key], // The actual expense data for that date
			}));
			console.log("Expenses within date range:", expensesArray);
			// Initialize aggregated expenses with 0 for all categories in categoryList
			const aggregatedExpenses = [];
			categoryList.forEach((category) => {
				aggregatedExpenses[category] = { category: category, total: 0 };
			});
			console.log(aggregatedExpenses);
            const summaryByDate = [];
			expensesArray.forEach((expense) => {
                let totalCategoryExpense = 0;
				const date = expense.date;
				console.log("expense ", expense);

                // iterate each item under the same date
				for (const key in expense) {
					// skip date key
					if (key != "date") {
						const expenseItem = expense[key];
						const category = expenseItem.category;
						const amount = expenseItem.amount;
						const currency = expenseItem.currency;
						const amountInUsd = Utils.convertToUsd(amount, currency);

                        // If the category doesn't exist in aggregatedExpenses yet, initialize it to 0.
                        // Then add the current expense amount. This handles all categories dynamically.
                        if (aggregatedExpenses.hasOwnProperty(category)) {
                            aggregatedExpenses[category].total += amountInUsd;
                            totalCategoryExpense += amountInUsd;
                        }
					}
				}
                // push it to summary array after format
                summaryByDate.push({
                    date: date,
                    sumByCategory: aggregatedExpenses, 
                    subTotal: totalCategoryExpense.toFixed(2)
                });
			});
			console.log("final ");
            console.log(summaryByDate);
            setSummaryExpense(summaryByDate);
		} else {
			setSummaryExpense([]);
		}
	};

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
                <Row>
				<Col xs={12}>
					<Table striped bordered hover>
						<thead>
							<tr>
								<th>Date</th>
								<th>Total</th>
								{
                                    categoryList.map((category) => (
                                        <th>{category}</th>
                                    ))
                                }
							</tr>
						</thead>
						<tbody>
							{summaryExpense.length == 0 && (
								<tr>
									<td colSpan={4}>{NO_DATA_ERR_MSG}</td>
								</tr>
							)}
							{summaryExpense &&
								summaryExpense.map((expense) => (
                                    <tr key={expense.date}>
                                        <td>{expense.date}</td>
                                        <td>{expense.subTotal}</td>
                                        {
                                            // Map over the categoryList to ensure order and presence of all categories
                                            // categoryList.map((category) => {
                                            //     const categoryTile = expense.sumByCategory[category];
                                            //     const amount = 0;
                                            //     console.log(categoryTile);
                                            //     return (
                                            //         <td key={`${expense.date}-${category}`}>
                                            //             {amount > 0 ? `$${amount.toFixed(2)}` : '-'} {/* Display amount or '-' */}
                                            //         </td>
                                            //     );
                                            // })
                                        }
                                    </tr>
                                ))
                            }
						</tbody>
					</Table>
				</Col>
			</Row>
			</Container>
		</>
	);
};

export default SummaryExpense;
