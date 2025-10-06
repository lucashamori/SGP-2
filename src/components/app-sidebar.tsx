"use client"

import * as React from "react"
import {
  
  Factory,
  Users,
  GalleryVerticalEnd,
  LayoutDashboard,
  Package,
  Settings2,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "Lucas Mori",
    email: "lucas@mori.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Lucas Mori",
      logo: GalleryVerticalEnd,
      plan: "Sistema de Gerenciamento de Produtos",
    },
    
  ],
  navMain: [
    
    {
      title: "Dashboard",
      url: "dashboard",
      icon: LayoutDashboard,
      isActive: true,
      items: [
        {
          title: "Página Principal",
          url: "dashboard",
        },
      ],
    },
    
    {
      title: "Clientes",
      url: "clientes",
      icon: Users,
      isActive: true,
      items: [
        {
          title: "Cadastrar Clientes",
          url: "cadastroClientes",
        },
        {
          title: "Exibir Clientes",
          url: "cadastroClientes",
        },
      ],
    },

    {
      title: "Empresas",
      url: "#",
      icon: Factory,
      isActive: true,
      items: [
        {
          title: "Cadastrar Empresas",
          url: "#",
        },
        {
          title: "Exibir Empresas",
          url: "cadastroEmpresas",
        },
        
      ],
    },
    {
      title: "Produtos",
      url: "#",
      icon: Package,
      items: [
        {
          title: "Produtos",
          url: "vendas",
        },
        
      ],
    },
    
    {
      title: "Configurações",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
