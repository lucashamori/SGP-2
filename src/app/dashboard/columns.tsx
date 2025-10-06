"use client"

import { ColumnDef } from "@tanstack/react-table"

// O tipo foi atualizado para refletir a saída da nossa função getClientesData
export type ClienteData = {
  nome: string
  cpf_cnpj: string // Agora é string (convertido de BigInt para exibição)
  telefone: string // Agora é string (convertido de BigInt para exibição)
  totalPedidos: number // Novo nome do campo
}

export const columns: ColumnDef<ClienteData>[] = [
  {
    accessorKey: "nome",
    header: "Nome",
  },
  {
    accessorKey: "cpf_cnpj", // Chave corrigida para o nome do campo
    header: "CPF/CNPJ",
    cell: ({ row }) => {
        // Exemplo simples de formatação (você pode adicionar máscaras aqui)
        const document = row.getValue("cpf_cnpj") as string;
        // Se o número tiver 14 dígitos, assumimos que é CNPJ. Se não, é CPF.
        return document.length > 11 ? document.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5') : document.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    },
  },
  {
    accessorKey: "telefone",
    header: "Telefone",
    cell: ({ row }) => {
        const phone = row.getValue("telefone") as string;
        // Formata para (XX) XXXXX-XXXX
        return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    },
  },
  {
    accessorKey: "totalPedidos", // Chave corrigida para o novo nome
    header: "Total de Pedidos",
    cell: ({ row }) => {
        const pedidos = parseFloat(row.getValue("totalPedidos"));
        return pedidos.toLocaleString('pt-BR'); // Garante que a exibição seja um número formatado
    }
  },
]
