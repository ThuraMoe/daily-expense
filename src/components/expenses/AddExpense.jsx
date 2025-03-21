import { useState } from "react";
import app from "../../firebaseConfig";
import { getDatabase, ref, set, push } from "firebase/database";

const AddExpense = () => {
    let [expenseName, setExpenseName] = useState("");
    let [expenseAmount, setExpenseAmount] = useState("");

    const addExpenseHandler = async () => {
        const db = getDatabase(app);
        const newDocRef = push(ref(db, "expenses/daily-expenses"));
        set(newDocRef, {
            name: expenseName,
            amount: expenseAmount
        })
        .then(() => {
            alert("Document successfully written!");
        })
        .catch((error) => {
            console.error("Error writing document: ", error);
        });
    }

    return (
        <div>
            <input type="text" placeholder="Enter Expense Name" value={expenseName} onChange={(e) => {setExpenseName(e.target.value)}} />
            <input type="number" placeholder="Enter Expense Amount" value={expenseAmount} onChange={(e) => {setExpenseAmount(e.target.value)}} />
            <button onClick={addExpenseHandler}>Add Expense</button>
        </div>
    );
};
export default AddExpense;