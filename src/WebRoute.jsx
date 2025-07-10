import { createBrowserRouter, RouterProvider } from "react-router-dom";
import SummaryExpense from "./components/expenses/SummaryExpense";
import Expenses from "./components/expenses/Expenses";
import Layout from "./components/Layout/Layout";

const router = createBrowserRouter([
	{
		path: "/",
		element: <Layout />,
		children: [
			{ path: "/", element: <Expenses /> },
			{ path: "/summary", element: <SummaryExpense /> },
		],
	},
]);
const WebRoute = () => {
	return <RouterProvider router={router} />;
};

export default WebRoute;
