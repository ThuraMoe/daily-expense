import { Outlet } from "react-router-dom";
import Header from "./Header";
import { AppSidebar } from "@/components/menu/app-sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const Layout = () => {
	return (
		<>
			{/* <Header />
			<br/>
            <Container>
			    <Outlet/>
            </Container> */}
			<SidebarProvider>
				<AppSidebar />
				<main>
					<SidebarTrigger />
					{/* <Outlet /> */}
				</main>
			</SidebarProvider>
		</>
	);
};

export default Layout;
