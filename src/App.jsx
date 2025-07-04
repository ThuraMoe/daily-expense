import "./App.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container } from "react-bootstrap";
import AddExpense from "./components/expenses/AddExpense";
import ListExpense from "./components/expenses/ListExpense";
import { useState } from "react";

function App() {
	const [isOpen, setIsOpen] = useState(false);
	const [isSave, setIsSave] = useState(false);

	const openExpenseModal = () => setIsOpen(true);
	const closeExpenseModal = () => setIsOpen(false);
	const saveExpenseData = () => setIsSave(true);
	const resetIsSave = () => setIsSave(false);

	return (
		<>
			<Container>
				<AddExpense onModalOpen={isOpen} onModalClose={closeExpenseModal} onModalSave={saveExpenseData}/>
				<br />
				<ListExpense onNewExpense={openExpenseModal} onIsSave={isSave} onResetSave={resetIsSave} />
			</Container>
		</>
	);
}

export default App;
