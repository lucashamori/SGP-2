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
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DataTable } from "./data-table"; // Usando a cópia local
import { columns, EstoqueData } from "./columns";
import { getEstoqueFlat } from "@/actions/estoque";

// 1. Função de busca de dados para a TABELA de estoque
async function getData(): Promise<EstoqueData[]> {
  const result = await getEstoqueFlat();
  // A action retorna um objeto { success, data }, então pegamos o array de dados
  return result.data || [];
}

export default async function Page() {
  // 2. Busca os dados da tabela de estoque
  const data = await getData();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
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
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            {/* Cabeçalho do Conteúdo com Título e Botão de Ação */}
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-2xl">Estoque de Produtos</h1>
                {/* Botão para adicionar novo item ao estoque/produto */}
                <Link href="/cadastrarProduto">
                    <Button>Adicionar Produto</Button>
                </Link>
            </div>

            {/* Tabela de Dados */}
            <div className="rounded-lg border shadow-sm">
                <DataTable 
                columns={columns} 
                data={data} 
                rowIdKey="id_estoque" // Chave primária do estoque
                />
            </div>
        </main>

      </SidebarInset>
    </SidebarProvider>
  );
}
