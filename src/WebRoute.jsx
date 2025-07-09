import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ListExpense from "./components/expenses/ListExpense";
import SummaryExpense from "./components/expenses/SummaryExpense";
import RootLayout from "./components/RootLayout";

const WebRoute = () => {
	const router = createBrowserRouter([
		{
			path: "/",
			element: <RootLayout />,
			children: [
				{ path: "/", element: <ListExpense /> },
				{ path: "/summary", element: <SummaryExpense /> },
			],
		},
	]);

	return <RouterProvider router={router} />;
};

export default WebRoute;
