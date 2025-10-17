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
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
	const { currentUser } = useAuth();
	return (
		<Sidebar>
			<SidebarHeader>
				<img src={logo} width={20} height={20}/>
				<Avatar>
					<AvatarImage src={currentUser.photoURL} />
					<AvatarFallback>CN</AvatarFallback>
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
		</Sidebar>
	);
}
