"use client";

import { useRouter } from "next/navigation"; // Importar useRouter
import { signOut } from "firebase/auth"; // Importar signOut
import { auth } from "@/lib/firebase"; // Importar auth
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

// Interface para as props do componente
interface NavUserProps {
  user: {
    name: string;
    email: string;
    avatar: string;
  } | null;
  // REMOVIDO: onLogout não é mais necessário como prop
}

export function NavUser({ user }: NavUserProps) {
  const { isMobile } = useSidebar();
  const router = useRouter(); // Hook para redirecionamento

  // Se não houver usuário, não renderiza nada
  if (!user) {
    return null;
  }

  // NOVA: Função de logout movida para dentro do componente
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Redireciona para a página de login (raiz) após o logout
      router.push("/");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      alert("Erro ao tentar sair. Tente novamente.");
    }
  };


  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">
                  {user.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
               <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                 <Avatar className="h-8 w-8 rounded-lg">
                   <AvatarImage src={user.avatar} alt={user.name} />
                   <AvatarFallback className="rounded-lg">
                     {user.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'U'}
                   </AvatarFallback>
                 </Avatar>
                 <div className="grid flex-1 text-left text-sm leading-tight">
                   <span className="truncate font-medium">{user.name}</span>
                   <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                 </div>
               </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem disabled>
                <Sparkles className="mr-2 h-4 w-4" />
                <span>Upgrade to Pro</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
               <DropdownMenuItem disabled>
                <BadgeCheck className="mr-2 h-4 w-4" />
                <span>Account</span>
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Billing</span>
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <Bell className="mr-2 h-4 w-4" />
                <span>Notifications</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            {/* CORREÇÃO: onClick agora chama a função handleLogout interna */}
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:bg-red-100 focus:text-red-700 dark:focus:bg-red-900/50 dark:focus:text-red-400">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

