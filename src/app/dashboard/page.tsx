import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Users, Package, PackageOpen } from "lucide-react";
import { DataTable } from "@/app/dashboard/data-table";
import { columns, ClienteData } from "@/app/dashboard/columns"; // Import corrigido para ClienteData
import { getClientesData } from "@/lib/data-actions"; // Importa a função para a tabela
import {
  getTotalClientes,
  getValorTotalEstoque,
  getTotalPedidos,
} from "@/lib/dashboard-actions"; // Importa as funções para os cards

// 1. Função de busca de dados para a TABELA
async function getData(): Promise<ClienteData[]> {
  // Chamada ao banco de dados REAL!
  const clientes = await getClientesData();
  return clientes;
}

// Função auxiliar para formatar valores monetários em BRL
const formatCurrency = (value: number) => {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

// CORREÇÃO: A função Page foi marcada como 'async'
export default async function Page() {
  // 2. Busca de todos os dados (tabela e cards) em paralelo para otimizar o carregamento.
  const [data, totalClientes, totalPedidos, valorTotalEstoque] = await Promise.all([
    getData(), // Tabela de clientes
    getTotalClientes(),
    getTotalPedidos(), // Card Clientes (Contagem)
    getValorTotalEstoque(), // Card Produtos (Valor Total)
  ]);
  // NOTE: 'data' é o array de clientes para a tabela.
  // 'totalClientes' é o número total de clientes (ex: 13).
  // 'valorTotalEstoque' é a soma do valor dos produtos em estoque (ex: 12238.27).

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
                  <BreadcrumbLink href="#">
                    Sistema de Gerenciamento de Pedidos
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Dados</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 container mx-auto max-w-10xl">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  Clientes
                  <Users className="ml-auto w-4 h-4" />
                </CardTitle>
                <CardDescription>
                  Lista de clientes cadastrados no sistema.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-base sm:text-lg font-bold">
                  {/* VALOR DINÂMICO DO BANCO */}
                  
                  {totalClientes.toLocaleString("pt-BR")} clientes
                </p>
              </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        Vendas
                        <PackageOpen className="ml-auto w-4 h-4" />
                    </CardTitle>
                    <CardDescription>Total de Pedidos realizados no sistema.</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* CORREÇÃO: Substitua o valor estático pelo dinâmico */}
                    <p className="text-base sm:text-lg font-bold">
                        {totalPedidos.toLocaleString("pt-BR")} pedidos
                    </p>
                </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  Produtos
                  <Package className="ml-auto w-4 h-4" />
                </CardTitle>
                <CardDescription>
                  Lista de valores dos produtos em estoque.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-base sm:text-lg font-bold">
                  {/* VALOR DINÂMICO DO BANCO */}
                  {formatCurrency(valorTotalEstoque)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabela (logo abaixo dos cards) */}
          <div className="container mx-auto py-4 px-0">
            <DataTable columns={columns} data={data} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
