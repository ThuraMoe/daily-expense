import "./App.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container } from "react-bootstrap";
import AddExpense from "./components/expenses/AddExpense";
import ListExpense from "./components/expenses/ListExpense";

function App() {
	return (
		<>
			<Container>
				<AddExpense />
				<br />
				<ListExpense />
			</Container>
		</>
	);
}

export default App;
