import { useState } from "react";
import {
  BarChart3,
  ChevronRight,
  CreditCard,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  Settings,
  Sparkles,
  Wallet,
} from "lucide-react";
import { signOut } from "firebase/auth";

import { auth } from "@/firebaseConfig";
import { NavLink, Outlet } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import AddExpenseModal from "@/components/AddExpenseModal";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const navigationItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Expenses", icon: Wallet, path: "/expenses" },
  { label: "Income", icon: CreditCard, path: "/income" },
  { label: "Analytics", icon: BarChart3, path: "/analytics" },
  { label: "Settings", icon: Settings, path: "/settings" },
];

const quickActions = [
  { label: "Add Expense", icon: PlusCircle },
  { label: "Review Trends", icon: Sparkles },
];

/**
 * AppShell
 *
 * Main layout wrapper for all authenticated pages. Renders the sidebar navigation,
 * header bar, and the routed page content area via an Outlet.
 *
 * @returns {JSX.Element} The app shell layout.
 */
const AppShell = () => {
  const { currentUser } = useAuth();
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const userLabel =
    currentUser?.displayName || currentUser?.email || "Guest User";
  const userEmail = currentUser?.email || "";
  const userInitials =
    userLabel
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part: string) => part[0]?.toUpperCase())
      .join("") || "GU";

  /**
   * handleSignOut
   *
   * Signs the current user out of Firebase. The ProtectedRoute in WebRoute.tsx
   * will automatically redirect to /login once auth state clears.
   *
   * @returns {Promise<void>}
   */
  const handleSignOut = async () => {
    await signOut(auth);
  };

  return (
    // ── sidebar-07 pattern: variant="inset" + collapsible="offcanvas" ──
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="offcanvas">

        {/* ── Header ── */}
        <SidebarHeader className="px-3 py-4">
          <div className="flex items-center gap-3 rounded-2xl bg-sidebar-primary/10 px-3 py-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
              <Wallet className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold tracking-tight">
                Daily Expense
              </p>
              <p className="text-xs text-sidebar-foreground/70">
                Personal finance command center
              </p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarSeparator />

        {/* ── Content ── */}
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <NavLink to={item.path} end={item.path === "/"}>
                      {({ isActive }) => (
                        <SidebarMenuButton isActive={isActive} tooltip={item.label}>
                          <item.icon />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      )}
                    </NavLink>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="space-y-2">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    onClick={action.label === "Add Expense" ? () => setExpenseModalOpen(true) : undefined}
                    className="flex w-full items-center justify-between rounded-2xl border border-sidebar-border/80 bg-background/80 px-3 py-3 text-left transition-colors hover:border-sidebar-primary/30 hover:bg-sidebar-accent"
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sidebar-primary/10 text-sidebar-primary">
                        <action.icon className="h-4 w-4" />
                      </span>
                      <span className="text-sm font-medium">{action.label}</span>
                    </span>
                    <ChevronRight className="h-4 w-4 text-sidebar-foreground/50" />
                  </button>
                ))}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* ── Footer ── */}
        <SidebarFooter className="px-3 py-4">
          <div className="flex items-center gap-3 rounded-2xl border border-sidebar-border/80 bg-background/80 px-3 py-3">
            <Avatar className="h-10 w-10 shrink-0 border border-sidebar-border/80">
              <AvatarFallback className="bg-sidebar-primary/15 text-xs font-semibold text-sidebar-primary">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{userLabel}</p>
              <p className="truncate text-xs text-sidebar-foreground/70">
                {userEmail}
              </p>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="shrink-0 rounded-xl p-2 text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      {/* ── Main area — sidebar-07 inset pattern ── */}
      <SidebarInset>
        {/* Header lives INSIDE SidebarInset in sidebar-07 */}
        <header className="flex h-16 shrink-0 items-center gap-2 px-4 md:px-12">
          <SidebarTrigger className="-ml-1" />
          <div className="ml-auto">
            <Button
              size="sm"
              className="rounded-xl px-3 shadow-sm sm:px-4"
              onClick={() => setExpenseModalOpen(true)}
            >
              <PlusCircle className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Add Expense</span>
            </Button>
          </div>
        </header>

        {/* Page content */}
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 md:pl-8">
          <Outlet />
        </div>
      </SidebarInset>
      <AddExpenseModal
        open={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
      />
    </SidebarProvider>
  );
};

export default AppShell;