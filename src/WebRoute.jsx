import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ExpenseOverview from "./pages/ExpenseOverview/ExpenseOverview";
import ExpenseManagement from "./pages/ExpenseManagement/ExpensesManagement";
import Layout from "./components/Layout/Layout";


const router = createBrowserRouter([
	{
		path: "/",
		element: <Layout />,
		children: [
			{ path: "/", element: <ExpenseManagement /> },
			{ path: "/overview", element: <ExpenseOverview /> },
		],
	},
]);
const WebRoute = () => {
	return <RouterProvider router={router} />;
};

export default WebRoute;
