// src/lib/dashboard-actions.ts
"use server"

import { prisma } from "@/lib/prisma" // Assumindo que você criou o arquivo src/lib/prisma.ts

// Métrica 1: Contagem Total de Clientes
export async function getTotalClientes() {
  try {
    const count = await prisma.cliente.count();
    return count;
  } catch (error) {
    console.error("ERRO AO CONTAR CLIENTES:", error);
    return 0; // Retorna 0 em caso de erro
  }
}

// Métrica 2: Valor Total dos Produtos em Estoque
export async function getValorTotalEstoque() {
  try {
    // 1. Busca todos os itens do estoque e os relaciona com o produto para obter o valor unitário.
    const estoqueItems = await prisma.estoque.findMany({
      select: {
        qtd_produto: true, // Quantidade em estoque (Decimal)
        produto: {
          select: {
            valor_unitario: true, // Valor unitário do produto (Decimal)
          },
        },
      },
    });

    // 2. Calcula o valor total no código (Qtd * Valor Unitário) e soma tudo.
    let valorTotal = 0;
    
    // O BigInt e Decimal precisam ser tratados como números para cálculo. 
    // Usamos parseFloat, pois o valor final não ultrapassará o limite de precisão.
    estoqueItems.forEach(item => {
      const quantidade = parseFloat(item.qtd_produto.toString());
      const valorUnitario = parseFloat(item.produto.valor_unitario.toString());
      valorTotal += quantidade * valorUnitario;
    });

    return valorTotal;

  } catch (error) {
    console.error("ERRO AO CALCULAR VALOR TOTAL DO ESTOQUE:", error);
    return 0; // Retorna 0 em caso de erro
  }
}
