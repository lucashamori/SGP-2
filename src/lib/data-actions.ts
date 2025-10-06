// src/lib/data-actions.ts
"use server"

import { prisma } from "@/lib/prisma" // Assumindo que você criou o arquivo src/lib/prisma.ts

// NOTE: O Prisma gera tipos com base no seu schema.prisma. 
// O tipo 'cliente' gerado pelo Prisma tem campos BigInt e o campo mapeado 'telefone'.

export async function getClientesData() {
  try {
    // Busca todos os clientes e inclui a relação 'pedido' para contar o total de pedidos por cliente.
    const clientes = await prisma.cliente.findMany({
      select: {
        nome: true,
        cpf_cnpj: true, // É um BigInt
        telefone: true, // É um BigInt (mapeado de 'tefelone')
        pedido: { // Relacionamento com a tabela 'pedido'
          select: {
            id_pedido: true,
          },
        },
      },
      // Adicione um limite ou ordenação se o volume de dados for grande
      orderBy: {
        nome: 'asc',
      }
    });

    // Mapeamento e Formatação dos dados para o frontend
    return clientes.map(cliente => ({
      nome: cliente.nome,
      
      // Converte BigInt para string para exibição na tabela.
      // Isso é NECESSÁRIO porque o React (frontend) não lida bem com BigInts no estado ou props.
      cpf_cnpj: cliente.cpf_cnpj.toString(), 
      telefone: cliente.telefone.toString(),
      
      // Conta quantos pedidos existem para o cliente
      totalPedidos: cliente.pedido.length,
    }));

  } catch (error) {
    console.error("ERRO AO BUSCAR DADOS DE CLIENTES:", error);
    // Em caso de erro, retorna um array vazio
    return [];
  }
}
