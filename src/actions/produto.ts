// ./src/actions/produto.ts
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

type ProdutoCreateData = {
  descricao: string;
  unidade_medida_id_unidade_medida: string | number; // serializável
  valor_unitario: string | number; // enviar como "12.50" ou number
};

type ProdutoUpdateData = ProdutoCreateData;

/** Helper simples para limpar entrada numérica */
function somenteNumeros(input: unknown): string {
  return String(input ?? "").replace(/[^0-9.,-]/g, "").replace(",", ".");
}

/**
 * Cadastra um novo produto.
 * - recebe strings (serializáveis) do cliente
 * - valida existência da unidade de medida (FK)
 * - converte ids para BigInt e valor para string com 2 casas decimais
 */
export async function cadastrarProduto(data: ProdutoCreateData) {
  console.log("[ACTION] cadastrarProduto", data);

  // validações básicas
  if (!data.descricao || String(data.descricao).trim().length === 0) {
    return { success: false, message: "Descrição é obrigatória." };
  }

  // converte valor
  const valorRaw = somenteNumeros(data.valor_unitario);
  const valorNum = Number(valorRaw);
  if (Number.isNaN(valorNum) || valorNum < 0) {
    return { success: false, message: "Valor unitário inválido." };
  }
  // formato final como string "12.50"
  const valorFormatted = valorNum.toFixed(2);

  // converte unidade para BigInt e verifica se existe
  let unidadeIdBigInt: bigint;
  try {
    unidadeIdBigInt = BigInt(String(data.unidade_medida_id_unidade_medida));
  } catch (e) {
    return { success: false, message: "ID da unidade inválido." };
  }

  try {
    // verifica existência da unidade (evita erro P2003 e dá mensagem amigável)
    const unidadeExists = await prisma.unidade_medida.findUnique({
      where: { id_unidade_medida: unidadeIdBigInt },
      select: { id_unidade_medida: true },
    });
    if (!unidadeExists) {
      return { success: false, message: `Unidade de medida ${String(data.unidade_medida_id_unidade_medida)} não encontrada.` };
    }

    // Gerar newId (atenção: seu model tem PK composta [id_produto, unidade_medida_id_unidade_medida])
    const newId = BigInt(Date.now());

    await prisma.produto.create({
      data: {
        id_produto: newId,
        descricao: String(data.descricao).slice(0, 45),
        unidade_medida_id_unidade_medida: unidadeIdBigInt,
        unidadeMedidaIdFK: unidadeIdBigInt,
        // passar string para Decimal é aceito pelo Prisma
        valor_unitario: valorFormatted,
      },
    });

    revalidatePath("/estoque");
    return { success: true, message: "Produto cadastrado com sucesso." };
  } catch (error: any) {
    console.error("[ACTION] ERRO cadastrarProduto:", error);

    // FK constraint when unit id doesn't exist will usually be P2003,
    // mas agora checamos antes. Mantemos o handling por segurança.
    if (error?.code === "P2003") {
      return { success: false, message: "Unidade de medida não encontrada (FK)." };
    }
    return { success: false, message: "Erro ao cadastrar produto. Verifique o log do servidor." };
  }
}

/**
 * Atualiza um produto (por id_produto).
 * identifiers.id_produto deve ser serializável (string|number)
 */
export async function updateProduto(
  identifiers: { id_produto: string | number; unidade_medida_id_unidade_medida?: string | number },
  data: ProdutoUpdateData
) {
  console.log("[ACTION] updateProduto", { identifiers, data });

  // validações básicas
  if (!data.descricao || String(data.descricao).trim().length === 0) {
    return { success: false, message: "Descrição é obrigatória." };
  }
  const valorRaw = somenteNumeros(data.valor_unitario);
  const valorNum = Number(valorRaw);
  if (Number.isNaN(valorNum) || valorNum < 0) {
    return { success: false, message: "Valor unitário inválido." };
  }
  const valorFormatted = valorNum.toFixed(2);

  // converte ids
  let id_produto: bigint;
  let unidadeIdBigInt: bigint;
  try {
    id_produto = BigInt(String(identifiers.id_produto));
    unidadeIdBigInt = BigInt(String(data.unidade_medida_id_unidade_medida));
  } catch (e) {
    return { success: false, message: "Identificador inválido." };
  }

  try {
    // valida unidade existe
    const unidadeExists = await prisma.unidade_medida.findUnique({
      where: { id_unidade_medida: unidadeIdBigInt },
      select: { id_unidade_medida: true },
    });
    if (!unidadeExists) {
      return { success: false, message: `Unidade de medida ${String(data.unidade_medida_id_unidade_medida)} não encontrada.` };
    }

    const updateRes = await prisma.produto.updateMany({
      where: { id_produto },
      data: {
        descricao: String(data.descricao).slice(0, 45),
        unidade_medida_id_unidade_medida: unidadeIdBigInt,
        unidadeMedidaIdFK: unidadeIdBigInt,
        valor_unitario: valorFormatted,
      },
    });

    if (updateRes.count === 0) {
      return { success: false, message: "Produto não encontrado para atualizar." };
    }

    revalidatePath("/estoque");
    return { success: true, message: "Produto atualizado com sucesso." };
  } catch (error: any) {
    console.error("[ACTION] ERRO updateProduto:", error);
    return { success: false, message: "Erro ao atualizar produto. Verifique o log do servidor." };
  }
}

/**
 * Exclui um produto por id_produto.
 */
export async function deleteProduto(identifiers: { id_produto: string | number }) {
  console.log("[ACTION] deleteProduto", identifiers);

  let id_produto: bigint;
  try {
    id_produto = BigInt(String(identifiers.id_produto));
  } catch (e) {
    return { success: false, message: "Identificador inválido." };
  }

  try {
    const delRes = await prisma.produto.deleteMany({ where: { id_produto } });
    if (delRes.count === 0) {
      return { success: false, message: "Produto não encontrado para exclusão." };
    }
    revalidatePath("/estoque");
    return { success: true, message: "Produto excluído com sucesso." };
  } catch (error: any) {
    console.error("[ACTION] ERRO deleteProduto:", error);
    if (error?.code === "P2003") {
      return { success: false, message: "Não foi possível excluir: existem registros dependentes (estoque/pedidos)." };
    }
    return { success: false, message: "Erro ao excluir produto. Verifique o log do servidor." };
  }
}

/**
 * Retorna estoque agrupado por empresa.
 * Observação: seu schema atual precisa ter empresa_id_empresa no model estoque para fazer agrupamento por empresa.
 */
export async function getEstoquePorEmpresa() {
  console.log("[ACTION] getEstoquePorEmpresa");

  try {
    const rows = await prisma.estoque.findMany({
      include: {
        produto: true,
      },
    });

    // Agrupa por empresa_id_empresa se esse campo existir; senão usa 'global'
    const grouped: Record<string, any[]> = {};
    for (const r of rows) {
      const empresaKey = (r as any).empresa_id_empresa ? String((r as any).empresa_id_empresa) : "global";
      if (!grouped[empresaKey]) grouped[empresaKey] = [];
      grouped[empresaKey].push(r);
    }

    return { success: true, data: grouped };
  } catch (error: any) {
    console.error("[ACTION] ERRO getEstoquePorEmpresa:", error);
    return { success: false, message: "Erro ao buscar estoque." };
  }
}

/**
 * Lista unidades (serializadas)
 */
export async function getUnidades() {
  try {
    const unidades = await prisma.unidade_medida.findMany({
      orderBy: { id_unidade_medida: "asc" },
    });

    const payload = unidades.map((u) => ({
      id: String((u as any).id_unidade_medida),
      descricao: (u as any).descricao ?? "",
      descricao_reduzida: (u as any).descricao_reduzida ?? "",
      ativo: (u as any).ativo ?? 0,
    }));

    return { success: true, data: payload };
  } catch (error: any) {
    console.error("[ACTION] ERRO getUnidades:", error);
    return { success: false, message: "Erro ao buscar unidades." };
  }
}
