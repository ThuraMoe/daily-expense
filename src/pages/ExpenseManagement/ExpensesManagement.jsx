import { Container } from "react-bootstrap";
import { useEffect, useState } from "react";
import ExpenseForm from "./ExpenseForm";
import ExpenseList from "./ExpenseList";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ExpenseManagement = () => {
    const navigate = useNavigate();

    const {currentUser, loading} = useAuth();
	const [isOpen, setIsOpen] = useState(false);
	const [isSave, setIsSave] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);

    useEffect(() => {
        if(!currentUser) {
            navigate("/login");
        }
    }, []);

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
