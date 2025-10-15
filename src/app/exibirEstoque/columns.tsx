"use client";

import { ColumnDef } from "@tanstack/react-table";
// ATENÇÃO: Você precisará criar o componente EstoqueActionsCell
// import { EstoqueActionsCell } from "@/components/estoque-actions-cell";

// Placeholder para as ações enquanto o componente real não é criado
const EstoqueActionsCell = ({ estoque }: { estoque: EstoqueData }) => (
  <div className="text-gray-400">Ações Indisponíveis</div>
);

// O tipo de dados reflete o retorno da sua action `getEstoqueFlat`
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
  {
    accessorKey: "produto_descricao",
    header: () => <div className="text-left font-semibold">Produto</div>,
    cell: ({ row }) => (
      <div className="text-left font-medium">{row.original.produto_descricao}</div>
    ),
  },
  {
    accessorKey: "qtd_produto",
    header: () => <div className="text-center font-semibold">Qtd. em Estoque</div>,
    cell: ({ row }) => (
      <div className="text-center">{row.original.qtd_produto}</div>
    ),
  },
  {
    accessorKey: "qtd_reservada",
    header: () => <div className="text-center font-semibold">Qtd. Reservada</div>,
    cell: ({ row }) => (
      <div className="text-center">{row.original.qtd_reservada}</div>
    ),
  },
   {
    accessorKey: "produto_unidade_label",
    header: () => <div className="text-left font-semibold">Unidade</div>,
    cell: ({ row }) => (
      <div className="text-left">{row.original.produto_unidade_label || "UN"}</div>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-right font-semibold">Ações</div>,
    cell: ({ row }) => (
      <div className="text-right">
        {/* Aqui você usará o componente de ações específico para estoque */}
        <EstoqueActionsCell estoque={row.original} />
      </div>
    ),
  },
];
