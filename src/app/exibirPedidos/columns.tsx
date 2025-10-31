"use client";

import { ColumnDef } from "@tanstack/react-table";

// Define o tipo baseado nos dados do action
export type PedidoCliente = {
  cliente_nome: string;
  qtd_pedidos: number;
  valor_total: string;
};

// Colunas da tabela
export const columns: ColumnDef<PedidoCliente>[] = [
  {
    accessorKey: "cliente_nome",
    header: "Cliente",
    cell: ({ row }) => (
      <span className="font-medium text-gray-800">
        {row.getValue("cliente_nome")}
      </span>
    ),
  },
  {
    accessorKey: "qtd_pedidos",
    header: "Qtd. Pedidos",
    cell: ({ row }) => (
      <span className="text-center block">
        {row.getValue("qtd_pedidos")}
      </span>
    ),
  },
  {
    accessorKey: "valor_total",
    header: "Valor Total (R$)",
    cell: ({ row }) => {
      const valor = parseFloat(row.getValue("valor_total"));
      return (
        <span className="text-green-700 font-semibold">
          {valor.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </span>
      );
    },
  },
];
