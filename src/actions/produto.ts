// ./src/actions/produto.ts
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

// --- TIPOS DE DADOS ---

type ProdutoCreateData = {
  descricao: string;
  unidade_medida_id_unidade_medida: string | number;
  valor_unitario: string | number;
  qtd_produto: string | number; // Quantidade inicial no estoque
};

type ProdutoUpdateIdentifiers = {
    id_produto: bigint;
    unidade_medida_id_unidade_medida: bigint;
}

// A atualização de um produto não altera sua unidade de medida nem seu estoque
type ProdutoUpdateData = Omit<ProdutoCreateData, "unidade_medida_id_unidade_medida" | "qtd_produto">;

type EstoqueUpdateIdentifiers = {
    id_estoque: bigint;
    produto_id_produto: bigint;
    produto_unidade_medida_id_unidade_medida: bigint;
}

type EstoqueUpdateData = {
    qtd_produto: string | number;
    qtd_reservada: string | number;
}


// --- FUNÇÕES DE AÇÃO (CRUD COMPLETO) ---

/**
 * Cadastra um novo produto E cria sua entrada inicial no estoque com a quantidade informada.
 */
export async function cadastrarProduto(data: ProdutoCreateData) {
  console.log("[ACTION] cadastrarProduto", data);

  // Validações
  if (!data.descricao || String(data.descricao).trim().length === 0) {
    return { success: false, message: "Descrição é obrigatória." };
  }
  const valorNum = Number(String(data.valor_unitario).replace(",", "."));
  if (Number.isNaN(valorNum) || valorNum < 0) {
    return { success: false, message: "Valor unitário inválido." };
  }
  const qtdNum = Number(String(data.qtd_produto).replace(",", "."));
  if (Number.isNaN(qtdNum) || qtdNum < 0 || !Number.isInteger(qtdNum)) {
    return { success: false, message: "Quantidade inicial inválida. Use um número inteiro." };
  }
  const valorFormatted = valorNum.toFixed(2);
  let unidadeIdBigInt: bigint;
  try {
    unidadeIdBigInt = BigInt(String(data.unidade_medida_id_unidade_medida));
  } catch (e) {
    return { success: false, message: "ID da unidade inválido." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const unidadeExists = await tx.unidade_medida.findUnique({
        where: { id_unidade_medida: unidadeIdBigInt },
      });
      if (!unidadeExists) {
        throw new Error(`Unidade de medida ${String(data.unidade_medida_id_unidade_medida)} não encontrada.`);
      }

      const newIdProduto = BigInt(Date.now());
      const novoProduto = await tx.produto.create({
        data: {
          id_produto: newIdProduto,
          descricao: String(data.descricao).slice(0, 45),
          unidade_medida_id_unidade_medida: unidadeIdBigInt,
          unidadeMedidaIdFK: unidadeIdBigInt,
          valor_unitario: valorFormatted,
        },
      });

      const newIdEstoque = BigInt(Date.now() + 1);
      await tx.estoque.create({
          data: {
              id_estoque: newIdEstoque,
              qtd_produto: qtdNum,
              qtd_reservada: 0,
              produto_id_produto: novoProduto.id_produto,
              produto_unidade_medida_id_unidade_medida: novoProduto.unidade_medida_id_unidade_medida,
          }
      });
    });

    revalidatePath("/exibirEstoque");
    return { success: true, message: "Produto e estoque inicial cadastrados com sucesso." };

  } catch (error: any) {
    console.error("[ACTION] ERRO cadastrarProduto:", error);
    if (error.message.includes("Unidade de medida")) {
        return { success: false, message: error.message };
    }
    return { success: false, message: "Erro ao cadastrar produto. Verifique o log do servidor." };
  }
}


/**
 * Atualiza os detalhes de um produto (descrição e valor). Não altera o estoque.
 */
export async function updateProduto(
  identifiers: ProdutoUpdateIdentifiers,
  data: ProdutoUpdateData
) {
  console.log("[ACTION] updateProduto", { identifiers, data });

  if (!data.descricao || String(data.descricao).trim().length === 0) {
    return { success: false, message: "Descrição é obrigatória." };
  }
  const valorNum = Number(String(data.valor_unitario).replace(",", "."));
  if (Number.isNaN(valorNum) || valorNum < 0) {
    return { success: false, message: "Valor unitário inválido." };
  }
  const valorFormatted = valorNum.toFixed(2);

  try {
    await prisma.produto.update({
      where: {
        id_produto_unidade_medida_id_unidade_medida: {
          id_produto: identifiers.id_produto,
          unidade_medida_id_unidade_medida: identifiers.unidade_medida_id_unidade_medida,
        },
      },
      data: {
        descricao: String(data.descricao).slice(0, 45),
        valor_unitario: valorFormatted,
        Usuario_Alteracao: "SYSTEM_UPDATE",
        Data_Hora_Alteracao: new Date(),
      },
    });

    revalidatePath("/exibirEstoque");
    return { success: true, message: "Detalhes do produto atualizados com sucesso." };
  } catch (error: any) {
    console.error("[ACTION] ERRO updateProduto:", error);
    if (error.code === 'P2025') {
        return { success: false, message: "Produto não encontrado para atualizar." };
    }
    return { success: false, message: "Erro ao atualizar produto." };
  }
}


/**
 * Exclui um produto E sua entrada correspondente no estoque.
 */
export async function deleteProduto(identifiers: ProdutoUpdateIdentifiers) {
  console.log("[ACTION] deleteProduto", identifiers);

  try {
    await prisma.$transaction(async (tx) => {
        // Primeiro, exclui o registro de estoque
        await tx.estoque.deleteMany({
            where: {
                produto_id_produto: identifiers.id_produto,
                produto_unidade_medida_id_unidade_medida: identifiers.unidade_medida_id_unidade_medida,
            }
        });
        // Depois, exclui o produto
        await tx.produto.delete({
            where: {
                id_produto_unidade_medida_id_unidade_medida: {
                    id_produto: identifiers.id_produto,
                    unidade_medida_id_unidade_medida: identifiers.unidade_medida_id_unidade_medida,
                }
            }
        });
    });

    revalidatePath("/exibirEstoque");
    return { success: true, message: "Produto e estoque excluídos com sucesso." };
  } catch (error: any) {
    console.error("[ACTION] ERRO deleteProduto:", error);
    if (error?.code === "P2003") {
      return { success: false, message: "Não foi possível excluir: este produto possui pedidos registrados." };
    }
     if (error.code === 'P2025') {
        return { success: false, message: "Produto não encontrado para exclusão." };
    }
    return { success: false, message: "Erro ao excluir produto." };
  }
}

/**
 * Atualiza a quantidade de um item no estoque.
 */
export async function updateEstoque(
  identifiers: EstoqueUpdateIdentifiers,
  data: EstoqueUpdateData
) {
  console.log("[ACTION] updateEstoque", { identifiers, data });

  const qtdProdutoNum = Number(String(data.qtd_produto).replace(",", "."));
  const qtdReservadaNum = Number(String(data.qtd_reservada).replace(",", "."));

  if (Number.isNaN(qtdProdutoNum) || qtdProdutoNum < 0 || Number.isNaN(qtdReservadaNum) || qtdReservadaNum < 0) {
    return { success: false, message: "Valores de quantidade inválidos." };
  }

  try {
    await prisma.estoque.update({
      where: {
        id_estoque_produto_id_produto_produto_unidade_medida_id_unidade_medida: {
          id_estoque: identifiers.id_estoque,
          produto_id_produto: identifiers.produto_id_produto,
          produto_unidade_medida_id_unidade_medida: identifiers.produto_unidade_medida_id_unidade_medida,
        },
      },
      data: {
        qtd_produto: qtdProdutoNum,
        qtd_reservada: qtdReservadaNum,
        Usuario_Alteracao: "SYSTEM_UPDATE",
        Data_Hora_Alteracao: new Date(),
      },
    });

    revalidatePath("/exibirEstoque");
    return { success: true, message: "Estoque atualizado com sucesso." };
  } catch (error: any) {
    console.error("[ACTION] ERRO updateEstoque:", error);
    if (error.code === 'P2025') {
        return { success: false, message: "Item de estoque não encontrado para atualizar." };
    }
    return { success: false, message: "Erro ao atualizar estoque." };
  }
}


// --- FUNÇÕES AUXILIARES (READ) ---

/**
 * Lista todas as unidades de medida cadastradas, serializando para o cliente.
 */
export async function getUnidades() {
  try {
    const unidades = await prisma.unidade_medida.findMany({
      // CORREÇÃO: Ordenando por ID em vez de descrição
      orderBy: { id_unidade_medida: "asc" },
    });

    const payload = unidades.map((u) => ({
      id: String(u.id_unidade_medida),
      descricao: u.descricao,
    }));

    return { success: true, data: payload };
  } catch (error: any) {
    console.error("[ACTION] ERRO getUnidades:", error);
    return { success: false, message: "Erro ao buscar unidades." };
  }
}



export async function getProdutos() {
  try {
    const produtos = await prisma.produto.findMany({
      orderBy: { id_produto: "asc" },
      include: {
        // se você tiver relação unidade_medida no produto, inclua:
        // unidade_medida: true,
      },
    });

    const payload = produtos.map((p: any) => ({
      id: String(p.id_produto),
      descricao: String(p.descricao ?? ""),
      // valor_unitario pode ser Decimal -> string
      valor_unitario: p.valor_unitario !== undefined && p.valor_unitario !== null ? String(p.valor_unitario) : "0.00",
      unidade_medida_id_unidade_medida: p.unidade_medida_id_unidade_medida ? String(p.unidade_medida_id_unidade_medida) : "",
    }));

    return { success: true, data: payload };
  } catch (error: any) {
    console.error("[ACTION] getProdutos:", error);
    return { success: false, message: "Erro ao buscar produtos." };
  }
}


