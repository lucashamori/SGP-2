"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CellActions } from "@/components/cliente-actions-cell";

export type ClienteData = {
  id_cliente: string;
  empresa_id_empresa: string;
  tipo_cliente_id_tipo_cliente: string;
  nome: string;
  nome_reduzido: string;
  cpf_cnpj: string;
  telefone: string;
  endereco: string;
  tipo_cliente: string;
  totalPedidos: number;
};

// Funções utilitárias mantidas para formatação
function formatarCpfCnpj(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 11) {
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  } else if (digits.length === 14) {
    return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  }
  return value;
}

function formatarTelefone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  } else if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  return value;
}

export const columns: ColumnDef<ClienteData>[] = [
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
  // Coluna Nome (com ordenação)
  {
    accessorKey: "nome",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nome
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="pl-4">{row.original.nome}</div>,
  },
  // Coluna CPF/CNPJ
  {
    accessorKey: "cpf_cnpj",
    header: "CPF / CNPJ",
    cell: ({ row }) => (
      <div>{formatarCpfCnpj(row.original.cpf_cnpj || "")}</div>
    ),
  },
  // Coluna Telefone
  {
    accessorKey: "telefone",
    header: "Telefone",
    cell: ({ row }) => (
      <div>{formatarTelefone(row.original.telefone || "")}</div>
    ),
  },
  // Coluna Endereço
  {
    accessorKey: "endereco",
    header: "Endereço",
    cell: ({ row }) => <div>{row.original.endereco || "—"}</div>,
  },
  // Coluna Tipo (com ordenação)
  {
    accessorKey: "tipo_cliente",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tipo
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div>{row.original.tipo_cliente}</div>,
  },
  // Coluna Total de Pedidos
  {
    accessorKey: "totalPedidos",
    header: () => <div className="text-center">Total de Pedidos</div>,
    cell: ({ row }) => <div className="text-center">{row.original.totalPedidos ?? 0}</div>,
  },
  // Coluna de Ações
  {
    id: "actions",
    header: () => <div className="text-right">Ações</div>,
    cell: ({ row }) => (
      <div className="text-right">
        <CellActions cliente={row.original} />
      </div>
    ),
  },
];
