"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { EstoqueActionsCell } from "@/components/estoque-actions-cell";

export type EstoqueData = {
  id_estoque: string;
  produto_id_produto: string;
  produto_unidade_medida_id_unidade_medida: string;
  qtd_produto: string;
  qtd_reservada: string;
  empresa_id_empresa: string | null;
  produto_descricao: string;
  produto_unidade_label: string;
};


export const columns: ColumnDef<EstoqueData>[] = [
  // Coluna de Seleção
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Selecionar tudo"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Selecionar linha"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  // Coluna Produto (com ordenação)
  {
    accessorKey: "produto_descricao",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Produto
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="pl-4">{row.original.produto_descricao}</div>,
  },
  // Coluna Qtd. em Estoque (com ordenação)
  {
    accessorKey: "qtd_produto",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Qtd. em Estoque
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="text-center">{row.original.qtd_produto}</div>,
  },
  // Coluna Qtd. Reservada (com ordenação)
  {
    accessorKey: "qtd_reservada",
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Qtd. Reservada
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    cell: ({ row }) => <div className="text-center">{row.original.qtd_reservada}</div>,
  },
  // Coluna Unidade
  {
    accessorKey: "produto_unidade_label",
    header: "Unidade",
    cell: ({ row }) => <div>{row.original.produto_unidade_label || "UN"}</div>,
  },
  // Coluna de Ações
  {
    id: "actions",
    header: () => <div className="text-right">Ações</div>,
    cell: ({ row }) => (
      <div className="text-right">
        <EstoqueActionsCell estoque={row.original} />
      </div>
    ),
  },
];

