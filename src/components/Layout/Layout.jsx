import { Container } from "react-bootstrap";
import { useState } from "react";
import Header from "./Header";
import AddExpense from "../expenses/AddExpense";
import ListExpense from "../expenses/ListExpense";

const Layout = () => {
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
                <AddExpense
                    onModalOpen={isOpen}
                    onModalClose={closeExpenseModal}
                    onModalSave={saveExpenseData}
                    onSelectDate={selectedDate}
                />
                <br />
                <ListExpense
                    onNewExpense={openExpenseModal}
                    onIsSave={isSave}
                    onResetSave={resetIsSave}
                />
            </Container>
        </>
	);
};

export default Layout;
