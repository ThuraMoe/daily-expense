import {
  BarChart3,
  ChevronRight,
  CreditCard,
  LayoutDashboard,
  PlusCircle,
  Settings,
  Sparkles,
  Wallet,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Expenses", icon: Wallet, active: false },
  { label: "Income", icon: CreditCard, active: false },
  { label: "Analytics", icon: BarChart3, active: false },
  { label: "Settings", icon: Settings, active: false },
];

const quickActions = [
  { label: "Add Expense", icon: PlusCircle },
  { label: "Review Trends", icon: Sparkles },
];

/**
 * AppShell
 *
 * Renders the main responsive app shell for the rewrite with a sidebar,
 * top bar, and placeholder content panels for future pages.
 *
 * @returns {JSX.Element} The application layout shell.
 */
const AppShell = () => {
  const { currentUser } = useAuth();
  const userLabel = currentUser?.displayName || currentUser?.email || "Guest User";
  const userInitials = userLabel
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "GU";

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fff7ed_0%,#fffdf8_38%,#f8fafc_100%)] text-foreground">
        <Sidebar collapsible="icon" variant="inset">
          <SidebarHeader className="gap-4 px-3 py-4">
            <div className="flex items-center gap-3 rounded-2xl bg-sidebar-primary/10 px-3 py-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
                <Wallet className="h-5 w-5" />
              </div>
              <div className="min-w-0 group-data-[collapsible=icon]:hidden">
                <p className="text-sm font-semibold tracking-tight">Daily Expense</p>
                <p className="text-xs text-sidebar-foreground/70">
                  Personal finance command center
                </p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarSeparator />

          <SidebarContent className="px-2 py-3">
            <SidebarGroup>
              <SidebarGroupLabel>Workspace</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton isActive={item.active} tooltip={item.label}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="space-y-2 group-data-[collapsible=icon]:hidden">
                  {quickActions.map((action) => (
                    <button
                      key={action.label}
                      className="flex w-full items-center justify-between rounded-2xl border border-sidebar-border/80 bg-background/80 px-3 py-3 text-left transition-colors hover:border-sidebar-primary/30 hover:bg-sidebar-accent"
                      type="button"
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

          <SidebarFooter className="px-3 py-4">
            <div className="flex items-center gap-3 rounded-2xl border border-sidebar-border/80 bg-background/80 px-3 py-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2">
              <Avatar className="h-10 w-10 border border-sidebar-border/80">
                <AvatarFallback className="bg-sidebar-primary/15 text-xs font-semibold text-sidebar-primary">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 group-data-[collapsible=icon]:hidden">
                <p className="truncate text-sm font-medium">{userLabel}</p>
                <p className="truncate text-xs text-sidebar-foreground/70">
                  Ready for Google auth wiring
                </p>
              </div>
            </div>
          </SidebarFooter>

          <SidebarRail />
        </Sidebar>

        <SidebarInset className="min-h-screen">
          <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur">
              <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <SidebarTrigger className="h-10 w-10 rounded-xl border border-border/70" />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
                      Task 002
                    </p>
                    <h1 className="text-lg font-semibold tracking-tight">
                      App Shell & Layout
                    </h1>
                  </div>
                </div>

                <Button className="rounded-xl px-4 shadow-sm">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Expense
                </Button>
              </div>
            </header>

            <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:py-8">
              <section className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(20rem,0.8fr)]">
                <article className="overflow-hidden rounded-[2rem] border border-border/70 bg-card shadow-sm">
                  <div className="border-b border-border/60 px-6 py-5">
                    <p className="text-sm font-semibold tracking-tight">
                      Primary Content Area
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      This placeholder is where routed page content will render in later tasks.
                    </p>
                  </div>

                  <div className="grid gap-4 p-6 md:grid-cols-2">
                    <div className="rounded-3xl border border-dashed border-border/80 bg-muted/40 p-5">
                      <p className="text-sm font-medium">Desktop-ready frame</p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        The shell uses a collapsible sidebar on wider screens while preserving a
                        clear content hierarchy.
                      </p>
                    </div>
                    <div className="rounded-3xl border border-dashed border-border/80 bg-muted/40 p-5">
                      <p className="text-sm font-medium">Mobile-ready frame</p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        The same navigation shifts into a drawer, keeping the header actions
                        accessible on small screens.
                      </p>
                    </div>
                  </div>
                </article>

                <aside className="rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm">
                  <p className="text-sm font-semibold tracking-tight">Shell Notes</p>
                  <div className="mt-4 space-y-4 text-sm text-muted-foreground">
                    <div className="rounded-2xl bg-muted/50 p-4">
                      Navigation targets are placeholders for now and will be wired during the
                      routing task.
                    </div>
                    <div className="rounded-2xl bg-muted/50 p-4">
                      The primary action stays visible in the top bar to match the planned add
                      expense modal flow.
                    </div>
                    <div className="rounded-2xl bg-muted/50 p-4">
                      User identity is read from the auth context when available and otherwise
                      falls back to a neutral guest label.
                    </div>
                  </div>
                </aside>
              </section>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AppShell;
