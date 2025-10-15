// src/actions/estoque.ts
"use server";

import { prisma } from "@/lib/prisma";

/**
 * Retorna um array "flat" de linhas de estoque com dados do produto e empresa,
 * serializando BigInt para string para uso no client.
 */
export async function getEstoqueFlat() {
  try {
    const rows = await prisma.estoque.findMany({
      include: {
        produto: true, // inclui produto (descricao, unidade_medida_id_unidade_medida, etc)
        // se existir relation empresa no estoque, inclua empresa: true
      },
      orderBy: [{ produto_id_produto: "asc" }],
    });

    // Map para formato serializável
    const payload = rows.map((r: any) => {
      return {
        id_estoque: String(r.id_estoque),
        produto_id_produto: String(r.produto_id_produto),
        produto_unidade_medida_id_unidade_medida: String(r.produto_unidade_medida_id_unidade_medida),
        qtd_produto: r.qtd_produto ? String(r.qtd_produto) : "0",
        qtd_reservada: r.qtd_reservada ? String(r.qtd_reservada) : "0",
        empresa_id_empresa: r.empresa_id_empresa ? String(r.empresa_id_empresa) : null,
        produto_descricao: r.produto?.descricao ?? "—",
        produto_unidade_label: r.produto?.unidade_medida_id_unidade_medida ? String(r.produto.unidade_medida_id_unidade_medida) : "",
      };
    });

    return { success: true, data: payload };
  } catch (error: any) {
    console.error("[ACTION] getEstoqueFlat:", error);
    return { success: false, message: "Erro ao buscar estoque." };
  }
}
