import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  History,
  PieChart,
  PackageSearch,
  User,
  ChevronLeft,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import optirackLogo from "@/assets/optirack-logo.png";

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Análise de SKUs",
    url: "/skus",
    icon: Package,
  },
  {
    title: "Histórico",
    url: "/historico",
    icon: History,
  },
  {
    title: "Distribuição ABC",
    url: "/distribuicao-abc",
    icon: PieChart,
  },
  {
    title: "Pares de Afinidade",
    url: "/afinidade",
    icon: Package,
  },
  {
    title: "Estoque",
    url: "/estoque",
    icon: PackageSearch,
  },
  {
    title: "Perfil",
    url: "/perfil",
    icon: User,
  },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, toggleSidebar } = useSidebar();

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon" className="border-r border-neutral-200">
      <SidebarHeader className="border-b border-neutral-200 p-4">
        <div className="flex items-center gap-2">
          <img src={optirackLogo} alt="OptiRack" className="h-8 w-8" />
          {state !== "collapsed" && (
            <span className="text-lg font-medium text-neutral-900">OptiRack</span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {state !== "collapsed" && (
            <SidebarGroupLabel className="text-neutral-500">Menu</SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.url)}
                    isActive={isActive(item.url)}
                    tooltip={state === "collapsed" ? item.title : undefined}
                    className={
                      isActive(item.url)
                        ? "bg-primary-100 text-primary-500 font-medium hover:bg-primary-100"
                        : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                    }
                  >
                    <item.icon className="h-5 w-5" />
                    {state !== "collapsed" && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Toggle button at bottom */}
      <div className="mt-auto border-t border-neutral-200 p-2">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-neutral-50 transition-colors text-neutral-600"
        >
          <ChevronLeft
            className={`h-5 w-5 transition-transform ${
              state === "collapsed" ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>
    </Sidebar>
  );
}
