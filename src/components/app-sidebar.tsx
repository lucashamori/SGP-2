"use client"
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth"; 
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/authContext";
import * as React from "react"
import {
  Users,
  GalleryVerticalEnd,
  LayoutDashboard,
  Package,
  Store,
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
          url: "exibirClientes",
        },
      ],
    },

    {
      title: "Produtos",
      url: "#",
      icon: Package,
      isActive: true,
      items: [
        {
          title: "Cadastrar Produtos",
          url: "cadastroProdutos",
        },
        {
          title: "Exibir Estoque",
          url: "exibirEstoque",
        },
        
      ],
    },
    {
      title: "Pedidos",
      url: "#",
      icon: Store,
      items: [
        {
          title: "Efetuar Pedido",
          url: "pedidos",
        },
       
      ],
    },
  ],
  
}



export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  
  const { user } = useAuth();
  const router = useRouter(); // Para a função de logout

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/"); // Redireciona para login após sair
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      alert("Erro ao tentar sair.");
    }
  };

    const userDataForNav = user ? {
    name: user.displayName || user.email || "Usuário Anônimo", // Fallback se nome/email não existirem
    email: user.email || "", // Pega o email real do Firebase
    avatar: user.photoURL || "/avatar-placeholder.png", // Usa foto do Firebase ou placeholder (ajuste o caminho!)
  } : null;
  
  
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userDataForNav} onLogout={handleLogout} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
