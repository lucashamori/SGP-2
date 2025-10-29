// src/app/exibirEstoque/page.tsx

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
import { columns, EstoqueData } from "./columns"; // Importe o tipo EstoqueData
import { getEstoqueFlat } from "@/actions/estoque"; // Action para buscar dados de estoque

// CORREÇÃO: Garante que a função SEMPRE retorna EstoqueData[]
async function getData(): Promise<EstoqueData[]> {
  try {
    const response = await getEstoqueFlat();
    // Se a action foi bem-sucedida E retornou dados, use os dados. Senão, array vazio.
    return response.success && response.data ? response.data : [];
  } catch (error) {
    console.error("Erro ao buscar dados de estoque na página:", error);
    return []; // Retorna array vazio em caso de erro na chamada da action
  }
}

export default async function PageExibirEstoque() {
  const data = await getData(); // Agora 'data' será sempre um array

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
              <Link href="/cadastroProdutos"> {/* Verifique a URL correta */}
                <Button>Cadastrar Novo Produto</Button>
              </Link>
            </div>

            {/* A DataTable agora recebe um array garantido */}
            <DataTable columns={columns} data={data} />

          </main>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}