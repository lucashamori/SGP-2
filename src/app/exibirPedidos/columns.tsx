"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CellActions } from "@/components/cliente-actions-cell";

export type PedidoCliente = {
  cliente_nome: string;
  qtd_pedidos: number;
  valor_total: string;
  tipo_cliente: string;
  endereco: string;
};

// Função utilitária para formatar valores monetários
function formatarValor(value: string): string {
  const num = parseFloat(value);
  if (isNaN(num)) return "—";
  return num.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export const columns: ColumnDef<PedidoCliente>[] = [
  // Coluna de Seleção
 

  // Coluna Cliente (com ordenação)
  {
    accessorKey: "cliente_nome",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Cliente
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="pl-4">{row.original.cliente_nome}</div>,
  },

  // Coluna Quantidade de Pedidos
  {
    accessorKey: "qtd_pedidos",
    header: () => <div className="text-center">Qtd. Pedidos</div>,
    cell: ({ row }) => (
      <div className="text-center">{row.original.qtd_pedidos ?? 0}</div>
    ),
  },

  // Coluna Valor Total
  {
  accessorKey: "valor_total",
  header: ({ column }) => (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="text-right w-full justify-end"
    >
      Valor Total (R$)
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  ),
  cell: ({ row }) => (
    <div className="text-right font-medium pr-4">
      {Number(row.original.valor_total).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      })}
    </div>
  ),
},

  // Coluna Tipo de Cliente
  {
    accessorKey: "tipo_cliente",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Tipo
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.original.tipo_cliente}</div>,
  },

  // Coluna Endereço
  {
    accessorKey: "endereco",
    header: "Endereço",
    cell: ({ row }) => <div>{row.original.endereco || "—"}</div>,
  },

  // Coluna de Ações
  
];
