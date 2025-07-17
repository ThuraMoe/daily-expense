import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ExpenseOverview from "./pages/ExpenseOverview/ExpenseOverview";
import ExpenseManagement from "./pages/ExpenseManagement/ExpensesManagement";
import Layout from "./components/Layout/Layout";
import Login from "./components/Auth/Login";
import User from "./pages/Profile/User";
import CategoryList from "./pages/Category/CategoryList";
import Analytic from "./pages/Analytic/Analytic";

const router = createBrowserRouter([
	{
		path: "/",
		element: <Layout />,
		children: [
			{ path: "/", element: <ExpenseManagement /> },
			{ path: "/overview", element: <ExpenseOverview /> },
			{ path: "/analytic", element: <Analytic /> },
			{ path: "/category", element: <CategoryList /> },
			{ path: "/profile", element: <User /> }
		],
	},
	{
		// This route is separate and will not use the Layout, thus no Header
		path: "/login",
		element: <Login />,
	},
]);
const WebRoute = () => {
	return <RouterProvider router={router} />;
};

export default WebRoute;
