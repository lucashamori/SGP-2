"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Retorna lista de clientes para uso em selects
 * CORREÇÃO: Seleciona as 3 chaves do cliente, pois são necessárias
 * para criar o pedido.
 */
export async function getClientes() {
  try {
    const clientes = await prisma.cliente.findMany({
      select: {
        id_cliente: true,
        nome_reduzido: true,
        empresa_id_empresa: true,
        tipo_cliente_id_tipo_cliente: true,
      },
      orderBy: { nome_reduzido: "asc" },
    });

    return {
      success: true,
      data: clientes.map((c) => ({
        id_cliente: String(c.id_cliente),
        nome_reduzido: c.nome_reduzido ?? "",
        empresa_id_empresa: String(c.empresa_id_empresa),
        tipo_cliente_id_tipo_cliente: String(c.tipo_cliente_id_tipo_cliente),
      })),
    };
  } catch (error: any) {
    console.error("[ACTION] getClientes:", error);
    return { success: false, message: "Erro ao buscar clientes." };
  }
}

/**
 * Retorna lista de produtos disponíveis
 * CORREÇÃO: Garante que o valor unitário seja string
 */
export async function getProdutos() {
  try {
    const produtos = await prisma.produto.findMany({
      select: {
        id_produto: true,
        descricao: true,
        valor_unitario: true,
        unidade_medida_id_unidade_medida: true,
      },
      orderBy: { descricao: "asc" },
    });

    return {
      success: true,
      data: produtos.map((p) => ({
        id_produto: String(p.id_produto),
        descricao: p.descricao,
      	// Converte o Decimal do Prisma para string
        valor_unitario: p.valor_unitario ? p.valor_unitario.toString() : "0.00",
        unidade_medida_id_unidade_medida: String(
          p.unidade_medida_id_unidade_medida
        ),
      })),
    };
  } catch (error: any) {
    console.error("[ACTION] getProdutos:", error);
    return { success: false, message: "Erro ao buscar produtos." };
  }
}

// Define o tipo do payload que o formulário VAI enviar
type PedidoPayload = {
  cliente_id_cliente: string;
  cliente_empresa_id_empresa: string;
  cliente_tipo_cliente_id_tipo_cliente: string;
  produto_id_produto: string;
  produto_unidade_medida_id_unidade_medida: string;
  empresa_id_empresa: string; // A FK direta da empresa
  qtd_comprada_item: number;
  valor_total_item: string;
}

/**
 * Cadastra um novo ITEM de pedido (baseado no schema.prisma real)
 * --- ATUALIZADO: Corrige a busca e atualização do estoque ---
 */
export async function cadastrarPedido(payload: PedidoPayload) {
  console.log("[ACTION] cadastrarPedido recebido:", payload);

  try {
    // 1. --- INÍCIO DA TRANSAÇÃO ---
    const pedidoItem = await prisma.$transaction(async (tx) => {
      
      // 2. Define as chaves e a quantidade
      const { 
        produto_id_produto, 
        produto_unidade_medida_id_unidade_medida, 
        qtd_comprada_item,
        empresa_id_empresa // Esta ainda é necessária para o 'pedido'
      } = payload;
      
      const prodIdBigInt = BigInt(produto_id_produto);
      const unidIdBigInt = BigInt(produto_unidade_medida_id_unidade_medida);
      const empIdBigInt = BigInt(empresa_id_empresa);

      // 3. --- CORREÇÃO: Mudar de findUnique para findFirst ---
      // 'findFirst' pode buscar por campos que não são um índice único
      const estoqueAtual = await tx.estoque.findFirst({
        where: {
          // Busca pelo produto exato
          produto_id_produto: prodIdBigInt,
          produto_unidade_medida_id_unidade_medida: unidIdBigInt,
        },
        select: { 
          id_estoque: true, // <-- Pega a CHAVE PRIMÁRIA real
          qtd_produto: true 
        }
      });

      // 4. Verifica se o estoque foi encontrado
      if (!estoqueAtual) {
        // Se o produto não tiver uma entrada de estoque, a transação falha
        throw new Error("Item de estoque não encontrado para este produto.");
      }

      // Converte a quantidade do estoque (que é Decimal) para Number
      const qtdDisponivel = Number(estoqueAtual.qtd_produto);
      if (isNaN(qtdDisponivel)) {
        throw new Error("Quantidade em estoque registrada é inválida.");
      }

      if (qtdDisponivel < qtd_comprada_item) {
        throw new Error(`Estoque insuficiente. Disponível: ${qtdDisponivel}`);
      }

      // 5. --- CORREÇÃO: Abater o estoque usando a CHAVE COMPOSTA ---
      // O erro do Prisma indica que a chave é composta por 3 campos
      await tx.estoque.update({
        where: {
          id_estoque_produto_id_produto_produto_unidade_medida_id_unidade_medida: {
            id_estoque: estoqueAtual.id_estoque,
            produto_id_produto: prodIdBigInt,
            produto_unidade_medida_id_unidade_medida: unidIdBigInt
          }
        },
        data: {
          qtd_produto: {
            decrement: qtd_comprada_item
          },
           Usuario_Alteracao: "SYSTEM_PEDIDO",
           Data_Hora_Alteracao: new Date(),
        }
      });

      // 6. Prepara os dados do PEDIDO (código original)
      const newPedidoId = BigInt(Date.now());
      const dataForPrisma = {
        id_pedido: newPedidoId,
        numero_pedido: newPedidoId, 
        data_pedido: new Date(),
        
        qtd_comprada_item: payload.qtd_comprada_item, 
        valor_total_item: payload.valor_total_item,   

        // Chaves do Cliente (FK)
        cliente_id_cliente: BigInt(payload.cliente_id_cliente),
        cliente_empresa_id_empresa: BigInt(payload.cliente_empresa_id_empresa),
        cliente_tipo_cliente_id_tipo_cliente: BigInt(payload.cliente_tipo_cliente_id_tipo_cliente),

        // Chaves do Produto (FK)
        produto_id_produto: prodIdBigInt,
        produto_unidade_medida_id_unidade_medida: unidIdBigInt,

        // Chave da Empresa (FK)
        empresa_id_empresa: empIdBigInt,
      };

      // 7. Cria o pedido
      const novoPedido = await tx.pedido.create({
        data: dataForPrisma,
      });

      console.log("[ACTION] Item de pedido criado:", novoPedido.id_pedido);
      return novoPedido; // Retorna o pedido de dentro da transação
    });
    // 8. --- FIM DA TRANSAÇÃO ---

    // 9. Atualiza o cache
    revalidatePath("/pedidos");
    revalidatePath("/dashboard"); 

    // 10. Serializa o objeto de retorno
    const serializablePedidoItem = {
      ...pedidoItem,
      id_pedido: pedidoItem.id_pedido.toString(),
      numero_pedido: pedidoItem.numero_pedido.toString(),
      qtd_comprada_item: pedidoItem.qtd_comprada_item.toString(),
      valor_total_item: pedidoItem.valor_total_item.toString(),
      produto_id_produto: pedidoItem.produto_id_produto.toString(),
      produto_unidade_medida_id_unidade_medida: pedidoItem.produto_unidade_medida_id_unidade_medida.toString(),
      cliente_id_cliente: pedidoItem.cliente_id_cliente.toString(),
      cliente_empresa_id_empresa: pedidoItem.cliente_empresa_id_empresa.toString(),
      cliente_tipo_cliente_id_tipo_cliente: pedidoItem.cliente_tipo_cliente_id_tipo_cliente.toString(),
      empresa_id_empresa: pedidoItem.empresa_id_empresa.toString(),
      data_pedido: pedidoItem.data_pedido.toISOString(),
      // CORREÇÃO: Typo de 'InSclusao' para 'Inclusao'
      Data_Hora_Inclusao: pedidoItem.Data_Hora_Inclusao.toISOString(),
      Data_Hora_Alteracao: pedidoItem.Data_Hora_Alteracao ? pedidoItem.Data_Hora_Alteracao.toISOString() : null,
    };

    return { 
      success: true, 
      message: "Pedido cadastrado e estoque atualizado!", 
      data: serializablePedidoItem
    };

  } catch (error: any) {
    console.error("[ACTION] cadastrarPedido:", error);
    if (error.code === 'P2002') { // Erro de violação de chave
       return { success: false, message: "Erro: Violação de chave única. Ocorreu um conflito ao tentar gerar o ID do pedido." };
    }
    // Retorna a mensagem de erro da transação (ex: "Estoque insuficiente" ou "Item não encontrado")
    return { success: false, message: `Erro ao cadastrar pedido: ${error.message}` };
  }
}

