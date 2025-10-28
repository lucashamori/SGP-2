import ProtectedRoute from '@/context/protectedRoute';
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { DataTable } from "./data-table"; // Usa a nova data-table local
import { columns } from "./columns";
import { getEstoqueFlat } from "@/actions/estoque"; // Action para buscar dados de estoque

export default async function PageExibirEstoque() {
  // Busca os dados do estoque. A action retorna um objeto { success, data }.
  const response = await getEstoqueFlat();
  const data = response.success ? response.data : [];

  return (
  <ProtectedRoute>
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">
                  Sistema de Gerenciamento de Pedidos
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Exibir Estoque</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold md:text-2xl">Estoque</h1>
            <Link href="/cadastroProdutos">
              <Button>Cadastrar Novo Produto</Button>
            </Link>
          </div>
          
          <DataTable columns={columns} data={data} />
          
        </main>
      </SidebarInset>
    </SidebarProvider>
  </ProtectedRoute>
  );
}

