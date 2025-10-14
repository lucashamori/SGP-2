"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellActions } from "@/components/cliente-actions-cell";

export type ClienteData = {
  id_cliente: string;
  empresa_id_empresa: string;
  nome: string;
  nome_reduzido: string;
  cpf_cnpj: string;
  telefone: string;
  endereco: string;
  tipo_cliente: string;
  totalPedidos: number;
};

// Função utilitária para formatar CPF ou CNPJ
function formatarCpfCnpj(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 11) {
    // CPF: 000.000.000-00
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  } else if (digits.length === 14) {
    // CNPJ: 00.000.000/0000-00
    return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  }
  return value;
}

// Função utilitária para formatar telefone
function formatarTelefone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 11) {
    // (XX) XXXXX-XXXX
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  } else if (digits.length === 10) {
    // (XX) XXXX-XXXX
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  return value;
}

export const columns: ColumnDef<ClienteData>[] = [
  {
    accessorKey: "nome",
    header: () => <div className="text-left font-semibold">Nome</div>,
    cell: ({ row }) => (
      <div className="text-left">{row.original.nome || "—"}</div>
    ),
  },
  {
    accessorKey: "cpf_cnpj",
    header: () => <div className="text-left font-semibold">CPF / CNPJ</div>,
    cell: ({ row }) => (
      <div className="text-left">
        {formatarCpfCnpj(row.original.cpf_cnpj || "")}
      </div>
    ),
  },
  {
    accessorKey: "telefone",
    header: () => <div className="text-left font-semibold">Telefone</div>,
    cell: ({ row }) => (
      <div className="text-left">
        {formatarTelefone(row.original.telefone || "")}
      </div>
    ),
  },
  {
    accessorKey: "endereco",
    header: () => <div className="text-left font-semibold">Endereço</div>,
    cell: ({ row }) => (
      <div className="text-left">{row.original.endereco || "—"}</div>
    ),
  },
  {
    accessorKey: "tipo_cliente",
    header: () => <div className="text-left font-semibold">Tipo</div>,
    cell: ({ row }) => (
      <div className="text-left">{row.original.tipo_cliente}</div>
    ),
  },
  {
    accessorKey: "totalPedidos",
    header: () => (
      <div className="text-left font-semibold">Total de Pedidos</div>
    ),
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.totalPedidos ?? 0}
      </div>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-right font-semibold">Ações</div>,
    cell: ({ row }) => (
      <div className="text-right">
        <CellActions cliente={row.original} />
      </div>
    ),
  },
];
