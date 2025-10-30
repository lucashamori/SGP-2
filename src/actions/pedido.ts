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
 * CORREÇÃO: Garante que o valor unitário seja string e remove o typo '_'
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
        valor_unitario: p.valor_unitario ? p.valor_unitario.toString() : "0.00",
        unidade_medida_id_unidade_medida: String(
          p.unidade_medida_id_unidade_medida
        ),
      })),
    }; // <-- CORREÇÃO: O '_' foi removido daqui
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
 */
export async function cadastrarPedido(payload: PedidoPayload) {
  console.log("[ACTION] cadastrarPedido recebido:", payload);

  try {
    // 1. Gera os IDs únicos para o pedido (agrupador)
    const newPedidoId = BigInt(Date.now());

    // 2. Converte os dados do payload para os tipos do schema (BigInt, Decimal)
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
      produto_id_produto: BigInt(payload.produto_id_produto),
      produto_unidade_medida_id_unidade_medida: BigInt(payload.produto_unidade_medida_id_unidade_medida),

      // Chave da Empresa (FK)
      empresa_id_empresa: BigInt(payload.empresa_id_empresa),
    };

    // 3. Cria a entrada única na tabela 'pedido'
    const pedidoItem = await prisma.pedido.create({
      data: dataForPrisma,
    });

    console.log("[ACTION] Item de pedido criado:", pedidoItem.id_pedido);

    // 4. Atualiza o cache
    revalidatePath("/pedidos");
    revalidatePath("/dashboard"); 

    // 5. --- CORREÇÃO ---
    // Serializa o objeto de retorno.
    // Converte BigInt/Decimal/Date para string antes de enviar ao Client Component
    const serializablePedidoItem = {
      ...pedidoItem,
      id_pedido: pedidoItem.id_pedido.toString(),
      numero_pedido: pedidoItem.numero_pedido.toString(),
      // 'qtd_comprada_item' e 'valor_total_item' vêm como Decimal
      qtd_comprada_item: pedidoItem.qtd_comprada_item.toString(),
      valor_total_item: pedidoItem.valor_total_item.toString(),
      // IDs de Chave Estrangeira vêm como BigInt
      produto_id_produto: pedidoItem.produto_id_produto.toString(),
      produto_unidade_medida_id_unidade_medida: pedidoItem.produto_unidade_medida_id_unidade_medida.toString(),
      cliente_id_cliente: pedidoItem.cliente_id_cliente.toString(),
      cliente_empresa_id_empresa: pedidoItem.cliente_empresa_id_empresa.toString(),
      cliente_tipo_cliente_id_tipo_cliente: pedidoItem.cliente_tipo_cliente_id_tipo_cliente.toString(),
      empresa_id_empresa: pedidoItem.empresa_id_empresa.toString(),
      // Datas vêm como objeto Date
      data_pedido: pedidoItem.data_pedido.toISOString(),
      Data_Hora_Inclusao: pedidoItem.Data_Hora_Inclusao.toISOString(),
      // Campos nulos não precisam de conversão
      Data_Hora_Alteracao: pedidoItem.Data_Hora_Alteracao ? pedidoItem.Data_Hora_Alteracao.toISOString() : null,
    };

    return { 
      success: true, 
      message: "Pedido cadastrado com sucesso!", 
      data: serializablePedidoItem // <-- Retorna o objeto seguro
    };

  } catch (error: any) {
    console.error("[ACTION] cadastrarPedido:", error);
    if (error.code === 'P2002') {
       return { success: false, message: "Erro: Violação de chave única. Ocorreu um conflito ao tentar gerar o ID do pedido." };
    }
    return { success: false, message: `Erro ao cadastrar pedido: ${error.message}` };
  }
}

