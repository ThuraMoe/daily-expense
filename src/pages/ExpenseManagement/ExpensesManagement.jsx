import { Container } from "react-bootstrap";
import { useState } from "react";
import ExpenseForm from "./ExpenseForm";
import ExpenseList from "./ExpenseList";

const ExpenseManagement = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [isSave, setIsSave] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);

	const openExpenseModal = (dateFromChild) => {
        setSelectedDate(dateFromChild);
        setIsOpen(true);
    };
	const closeExpenseModal = () => setIsOpen(false);
	const saveExpenseData = () => setIsSave(true);
	const resetIsSave = () => setIsSave(false);

	return (
        <>
            <Container>
                <ExpenseForm
                    onModalOpen={isOpen}
                    onModalClose={closeExpenseModal}
                    onModalSave={saveExpenseData}
                    onSelectDate={selectedDate}
                />
                <ExpenseList
                    onNewExpense={openExpenseModal}
                    onIsSave={isSave}
                    onResetSave={resetIsSave}
                />
            </Container>
        </>
	);
};

export default ExpenseManagement;
