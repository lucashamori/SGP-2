// src/actions/estoque.ts
"use server";

import { prisma } from "@/lib/prisma";

/**
 * Busca linhas de estoque e normaliza o payload para o client.
 */
export async function getEstoqueFlat() {
  try {
    const rows = await prisma.estoque.findMany({
      include: {
        produto: {
          include: {
            // se você tiver relation com unidade_medida no produto:
            // unidade_medida: true,
          },
        },
        // empresa: true, // descomente se houver relação
      },
      orderBy: [{ produto_id_produto: "asc" }],
    });

    // debug temporário
    console.log("[ACTION] getEstoqueFlat rows:", rows.length);

    const payload = rows.map((r: any) => {
      // formata decimal para string (mantém padrão)
      const qtd_produto = r.qtd_produto !== null && r.qtd_produto !== undefined ? String(r.qtd_produto) : "0";
      const qtd_reservada = r.qtd_reservada !== null && r.qtd_reservada !== undefined ? String(r.qtd_reservada) : "0";

      // pega label da unidade se existir (prioriza relação, depois campo do produto)
      let unidadeLabel = "";
      if (r.produto?.unidade_medida_id_unidade_medida) {
        unidadeLabel = String(r.produto.unidade_medida_id_unidade_medida);
      } else if (r.produto_unidade_medida_id_unidade_medida) {
        unidadeLabel = String(r.produto_unidade_medida_id_unidade_medida);
      }

      return {
        id_estoque: String(r.id_estoque ?? ""),
        produto_id_produto: String(r.produto_id_produto ?? ""),
        produto_unidade_medida_id_unidade_medida: String(r.produto_unidade_medida_id_unidade_medida ?? ""),
        qtd_produto,
        qtd_reservada,
        empresa_id_empresa: r.empresa_id_empresa ? String(r.empresa_id_empresa) : null,
        produto_descricao: String(r.produto?.descricao ?? r.produto_descricao ?? "—"),
        produto_unidade_label: unidadeLabel || "",
      };
    });

    return { success: true, data: payload };
  } catch (error: any) {
    console.error("[ACTION] getEstoqueFlat ERROR:", error);
    return { success: false, message: "Erro ao buscar estoque." };
  }
}
