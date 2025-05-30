import "./App.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container } from "react-bootstrap";
import AddExpense from "./components/expenses/AddExpense";
import ListExpense from "./components/expenses/ListExpense";
import { useState } from "react";

function App() {
	const [isOpen, setIsOpen] = useState(false);

	const openExpenseModal = () => setIsOpen(true);
	const closeExpenseModal = () => setIsOpen(false);

	return (
		<>
			<Container>
				<AddExpense onModalOpen={isOpen} onModalClose={closeExpenseModal} />
				<br />
				<ListExpense onNewExpense={openExpenseModal} />
			</Container>
		</>
	);
}

export default App;
