import { getPedidosAgrupadosPorCliente } from "@/actions/pedido";
import { PedidosTable } from "@/app/exibirPedidos/data-table";
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

export const dynamic = "force-dynamic"; // garante atualização ao vivo no deploy (Vercel etc.)

export default async function ExibirPedidosPage() {
  // Busca os dados do action
  const result = await getPedidosAgrupadosPorCliente();
  const data = result.success ? result.data : [];
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

            {/* Tabela principal */}
            <PedidosTable data={data} />

          </main>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
