import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Users, Package, PackageOpen } from "lucide-react"
import { DataTable } from "@/app/dashboard/data-table"
import { columns, Payment } from "@/app/dashboard/columns"


async function getData(): Promise<Payment[]> {
  // Fetch data from your API here.
  return [
    {
      nome:" Lucas Mori",
      cpf: 11627467696,
      telefone: 35992445675,
      pedidos: 5,
    },
    {
      nome:" Adilson",
      cpf: 11667766699,
      telefone: 35992445675,
      pedidos: 30,
    },
    {
      nome:" Lucas Mori",
      cpf: 11223344556,
      telefone: 35992445675,
      pedidos: 5,
    },
    // ... adicione mais dados de exemplo se quiser
  ]
}

// CORREÇÃO: A função Page foi marcada como 'async'
export default async function Page() {
    const data = await getData()

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
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
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
                <p className="text-base sm:text-lg font-bold">234 clientes</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  Vendas
                  <PackageOpen className="ml-auto w-4 h-4" />
                </CardTitle>
                <CardDescription>
                  Vendas nos últimos 30 dias.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-base sm:text-lg font-bold">R$ 123.000.00</p>
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
                <p className="text-base sm:text-lg font-bold">R$ 12.238.27</p>
              </CardContent>
            </Card>

          </div>
          {/* Ocultado o div com min-h-[100vh] para que a tabela seja visível abaixo */}
          {/* <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" /> */}
          <div className="container mx-auto py-10">
            <DataTable columns={columns} data={data} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}