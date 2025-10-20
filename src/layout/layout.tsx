import { Outlet } from "react-router-dom";
import Header from "./Header";
import { AppSidebar } from "@/components/menu/app-sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const Layout = ( {children}: {children: React.ReactNode} ) => {
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
					{children}
				</main>
			</SidebarProvider>
		</>
	);
};

export default Layout;
