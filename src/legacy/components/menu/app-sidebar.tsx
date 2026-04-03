import {
	CalendarRange,
	LayoutDashboard,
	Calendar1,
	CalendarDays,
	Settings,
	GitCompare,
	HandCoins,
	TrendingUp,
	Cog,
	LogOut,
} from "lucide-react";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import logo from "@/assets/new-logo.png";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "../ui/button";

// Menu items.
const items = [
	{
		title: "Overview",
		url: "/",
		icon: LayoutDashboard,
	},
	{
		title: "Daily",
		url: "#",
		icon: Calendar1,
	},
	{
		title: "Weekly",
		url: "#",
		icon: CalendarDays,
	},
	{
		title: "Monthly",
		url: "#",
		icon: CalendarRange,
	},
	{
		title: "Compare",
		url: "#",
		icon: GitCompare,
	},
	{
		title: "Balance",
		url: "#",
		icon: HandCoins,
	},
	{
		title: "Analysis",
		url: "#",
		icon: TrendingUp,
	},
	{
		title: "Settings",
		url: "#",
		icon: Cog,
	},
];

export function AppSidebar() {
	return (
		<Sidebar>
			<SidebarHeader className="flex flex-col items-center justify-center space-y-2 py-4">
				<span>Daily Expense</span>
				<Avatar>
					<AvatarImage src="" />
					<AvatarFallback>Avatar</AvatarFallback>
				</Avatar>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Daily Expense Tracker</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{items.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild>
										<a href={item.url}>
											<item.icon />
											<span>{item.title}</span>
										</a>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter className="flex flex-col items-center justify-center space-y-2 py-4">
				<Button
					variant="ghost"
					className="w-full justify-start text-muted-foreground hover:text-foreground"
					onClick={() => console.log("Logging out...")} 
				>
					<LogOut className="mr-3 h-4 w-4" />
					Logout
				</Button>
			</SidebarFooter>
		</Sidebar>
	);
}
