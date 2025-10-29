// ./src/actions/produto.ts
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

// --- TIPOS DE DADOS ---

type ProdutoCreateData = {
  descricao: string;
  unidade_medida_id_unidade_medida: string | number;
  valor_unitario: string | number;
  qtd_produto: string | number; // Quantidade inicial do estoque
};

// CORREÇÃO: Identifiers agora aceitam string ou number vindos do cliente
type ProdutoIdentifiers = {
    id_produto: string | number;
    unidade_medida_id_unidade_medida: string | number;
}

// Dados para atualização do produto (sem as chaves)
type ProdutoUpdateData = Omit<ProdutoCreateData, "unidade_medida_id_unidade_medida" | "qtd_produto">;

// CORREÇÃO: Identifiers agora aceitam string ou number vindos do cliente
type EstoqueUpdateIdentifiers = {
    id_estoque: string | number;
    produto_id_produto: string | number;
    produto_unidade_medida_id_unidade_medida: string | number;
}

type EstoqueUpdateData = {
    qtd_produto: string | number;
    qtd_reservada: string | number;
}


// --- FUNÇÕES DE AÇÃO (CRUD COMPLETO) ---

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
  const valorFormatted = valorNum.toFixed(2);
  const qtdNum = Number(String(data.qtd_produto).replace(",", "."));
   if (Number.isNaN(qtdNum) || qtdNum < 0 || !Number.isInteger(qtdNum)) {
     return { success: false, message: "Quantidade inicial inválida." };
   }
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

      const newIdProduto = BigInt(Date.now()); // Simulação de ID único
      const novoProduto = await tx.produto.create({
        data: {
          id_produto: newIdProduto,
          descricao: String(data.descricao).slice(0, 45),
          unidade_medida_id_unidade_medida: unidadeIdBigInt,
          unidadeMedidaIdFK: unidadeIdBigInt,
          valor_unitario: valorFormatted,
          // Campos de auditoria usarão @default
        },
      });

      const newIdEstoque = BigInt(Date.now() + 1); // Garante ID diferente
      await tx.estoque.create({
          data: {
              id_estoque: newIdEstoque,
              qtd_produto: qtdNum, // Usa a quantidade do formulário
              qtd_reservada: 0,
              produto_id_produto: novoProduto.id_produto,
              produto_unidade_medida_id_unidade_medida: novoProduto.unidade_medida_id_unidade_medida,
              // Campos de auditoria usarão @default
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
 * Atualiza os detalhes de um produto (descrição e valor).
 */
 // CORREÇÃO: Aceita identifiers como string ou number
export async function updateProduto(
  identifiers: ProdutoIdentifiers,
  data: ProdutoUpdateData
) {
  console.log("[ACTION] updateProduto", { identifiers, data });

  // Validações
  if (!data.descricao || String(data.descricao).trim().length === 0) {
    return { success: false, message: "Descrição é obrigatória." };
  }
  const valorNum = Number(String(data.valor_unitario).replace(",", "."));
  if (Number.isNaN(valorNum) || valorNum < 0) {
    return { success: false, message: "Valor unitário inválido." };
  }
  const valorFormatted = valorNum.toFixed(2);

  // CORREÇÃO: Converte IDs para BigInt DENTRO da action
  let id_produto_bigint: bigint;
  let unidade_medida_id_unidade_medida_bigint: bigint;
  try {
      id_produto_bigint = BigInt(String(identifiers.id_produto));
      unidade_medida_id_unidade_medida_bigint = BigInt(String(identifiers.unidade_medida_id_unidade_medida));
  } catch(e) {
      return { success: false, message: "IDs de produto ou unidade inválidos."};
  }


  try {
    await prisma.produto.update({
      where: {
        id_produto_unidade_medida_id_unidade_medida: {
          // Usa os BigInts convertidos
          id_produto: id_produto_bigint,
          unidade_medida_id_unidade_medida: unidade_medida_id_unidade_medida_bigint,
        },
      },
      data: {
        descricao: String(data.descricao).slice(0, 45),
        valor_unitario: valorFormatted,
        Usuario_Alteracao: "SYSTEM_UPDATE", // Ou usuário logado
        Data_Hora_Alteracao: new Date(),
      },
    });

    revalidatePath("/exibirEstoque"); // Revalida estoque onde o produto aparece
    return { success: true, message: "Produto atualizado com sucesso." };
  } catch (error: any) {
    console.error("[ACTION] ERRO updateProduto:", error);
    if (error.code === 'P2025') { // Código de erro do Prisma para "registro não encontrado"
        return { success: false, message: "Produto não encontrado para atualizar." };
    }
    return { success: false, message: "Erro ao atualizar produto." };
  }
}


/**
 * Exclui um produto E sua entrada correspondente no estoque.
 */
 // CORREÇÃO: Aceita identifiers como string ou number
export async function deleteProduto(identifiers: ProdutoIdentifiers) {
  console.log("[ACTION] deleteProduto", identifiers);

  // CORREÇÃO: Converte IDs para BigInt DENTRO da action
  let id_produto_bigint: bigint;
  let unidade_medida_id_unidade_medida_bigint: bigint;
  try {
      id_produto_bigint = BigInt(String(identifiers.id_produto));
      unidade_medida_id_unidade_medida_bigint = BigInt(String(identifiers.unidade_medida_id_unidade_medida));
  } catch(e) {
      return { success: false, message: "IDs de produto ou unidade inválidos."};
  }

  try {
    // Usa transação para garantir que ambos (estoque e produto) sejam excluídos
    await prisma.$transaction(async (tx) => {
        // 1. Exclui a entrada do estoque primeiro (se houver)
        await tx.estoque.deleteMany({
            where: {
                produto_id_produto: id_produto_bigint,
                produto_unidade_medida_id_unidade_medida: unidade_medida_id_unidade_medida_bigint,
            }
        });
        // 2. Exclui o produto
        await tx.produto.delete({
            where: {
                id_produto_unidade_medida_id_unidade_medida: {
                    id_produto: id_produto_bigint,
                    unidade_medida_id_unidade_medida: unidade_medida_id_unidade_medida_bigint,
                }
            }
        });
    });

    revalidatePath("/exibirEstoque");
    return { success: true, message: "Produto e estoque excluídos com sucesso." };
  } catch (error: any) {
    console.error("[ACTION] ERRO deleteProduto:", error);
    // Erro comum se o produto estiver em um pedido
    if (error?.code === "P2003") {
      return { success: false, message: "Não foi possível excluir: este produto possui pedidos registrados." };
    }
     if (error.code === 'P2025') { // Erro se o produto não for encontrado
        return { success: false, message: "Produto não encontrado para exclusão." };
    }
    return { success: false, message: "Erro ao excluir produto." };
  }
}

// --- FUNÇÃO PARA ATUALIZAR ESTOQUE ---

/**
 * Atualiza a quantidade de um item no estoque.
 */
 // CORREÇÃO: Aceita identifiers como string ou number
export async function updateEstoque(
  identifiers: EstoqueUpdateIdentifiers,
  data: EstoqueUpdateData
) {
  console.log("[ACTION] updateEstoque", { identifiers, data });

  // Valida e formata as quantidades
  const qtdProdutoNum = Number(String(data.qtd_produto).replace(",", "."));
  const qtdReservadaNum = Number(String(data.qtd_reservada).replace(",", "."));

  if (Number.isNaN(qtdProdutoNum) || qtdProdutoNum < 0 || !Number.isInteger(qtdProdutoNum) ||
      Number.isNaN(qtdReservadaNum) || qtdReservadaNum < 0 || !Number.isInteger(qtdReservadaNum)) {
    return { success: false, message: "Valores de quantidade inválidos (devem ser inteiros não negativos)." };
  }

  // CORREÇÃO: Converte IDs para BigInt DENTRO da action
  let id_estoque_bigint: bigint;
  let produto_id_produto_bigint: bigint;
  let produto_unidade_medida_id_unidade_medida_bigint: bigint;
   try {
      id_estoque_bigint = BigInt(String(identifiers.id_estoque));
      produto_id_produto_bigint = BigInt(String(identifiers.produto_id_produto));
      produto_unidade_medida_id_unidade_medida_bigint = BigInt(String(identifiers.produto_unidade_medida_id_unidade_medida));
  } catch(e) {
      return { success: false, message: "IDs de estoque ou produto/unidade inválidos."};
  }


  try {
    await prisma.estoque.update({
      where: {
        // Usa a chave primária composta correta do estoque
        id_estoque_produto_id_produto_produto_unidade_medida_id_unidade_medida: {
          id_estoque: id_estoque_bigint,
          produto_id_produto: produto_id_produto_bigint,
          produto_unidade_medida_id_unidade_medida: produto_unidade_medida_id_unidade_medida_bigint,
        },
      },
      data: {
        qtd_produto: qtdProdutoNum,
        qtd_reservada: qtdReservadaNum,
        Usuario_Alteracao: "SYSTEM_UPDATE", // Ou usuário logado
        Data_Hora_Alteracao: new Date(),
      },
    });

    revalidatePath("/exibirEstoque");
    return { success: true, message: "Estoque atualizado com sucesso." };
  } catch (error: any) {
    console.error("[ACTION] ERRO updateEstoque:", error);
    if (error.code === 'P2025') { // Registro não encontrado
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
      orderBy: { id_unidade_medida: "asc" }, // Ordenado por ID
    });

    const payload = unidades.map((u) => ({
      id: String(u.id_unidade_medida), // Envia ID como string
      descricao: u.descricao,
    }));

    return { success: true, data: payload };
  } catch (error: any) {
    console.error("[ACTION] ERRO getUnidades:", error);
    return { success: false, message: "Erro ao buscar unidades." };
  }
}

