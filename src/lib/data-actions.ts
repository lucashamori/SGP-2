"use server"

import { prisma } from "@/lib/prisma"

// Mapeamento reverso para converter o ID do tipo de cliente de volta para texto
const CLIENTE_TYPE_TEXT_MAP: { [key: number]: string } = {
  10001: "Pessoa Física",
  10002: "Pessoa Jurídica",
}

export async function getClientesData() {
  try {
    const clientes = await prisma.cliente.findMany({
      select: {
        // Chaves primárias/estrangeiras necessárias para as ações
        id_cliente: true,
        empresa_id_empresa: true,
        tipo_cliente_id_tipo_cliente: true,

        // Dados para exibição e para o formulário de edição
        nome: true,
        nome_reduzido: true,
        cpf_cnpj: true, 
        endereco: true,
        telefone: true, 
        pedido: { select: { id_pedido: true } },
      },
      orderBy: { nome: 'asc' }
    });

    // Converte todos os BigInts para string para segurança no frontend
    return clientes.map(cliente => ({
      id_cliente: cliente.id_cliente.toString(),
      empresa_id_empresa: cliente.empresa_id_empresa.toString(),
      nome: cliente.nome,
      nome_reduzido: cliente.nome_reduzido,
      cpf_cnpj: cliente.cpf_cnpj.toString(),
      telefone: cliente.telefone.toString(),
      endereco: cliente.endereco,
      // Converte o ID do tipo de cliente para o texto correspondente
      tipo_cliente: CLIENTE_TYPE_TEXT_MAP[Number(cliente.tipo_cliente_id_tipo_cliente)] || "Indefinido",
      totalPedidos: cliente.pedido.length,
    }));
  } catch (error) {
    console.error("ERRO AO BUSCAR DADOS DE CLIENTES:", error);
    return [];
  }
}