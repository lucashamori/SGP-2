"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/* =====================================================
 * Função: getClientes
 * ===================================================== */
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

/* =====================================================
 * Função: getProdutos
 * ===================================================== */
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
    };
  } catch (error: any) {
    console.error("[ACTION] getProdutos:", error);
    return { success: false, message: "Erro ao buscar produtos." };
  }
}

/* =====================================================
 * Função: cadastrarPedido
 * ===================================================== */
type PedidoPayload = {
  cliente_id_cliente: string;
  cliente_empresa_id_empresa: string;
  cliente_tipo_cliente_id_tipo_cliente: string;
  produto_id_produto: string;
  produto_unidade_medida_id_unidade_medida: string;
  empresa_id_empresa: string;
  qtd_comprada_item: number;
  valor_total_item: string;
};

export async function cadastrarPedido(payload: PedidoPayload) {
  console.log("[ACTION] cadastrarPedido recebido:", payload);

  try {
    const pedidoItem = await prisma.$transaction(async (tx) => {
      const {
        produto_id_produto,
        produto_unidade_medida_id_unidade_medida,
        qtd_comprada_item,
        empresa_id_empresa,
      } = payload;

      const prodIdBigInt = BigInt(produto_id_produto);
      const unidIdBigInt = BigInt(produto_unidade_medida_id_unidade_medida);
      const empIdBigInt = BigInt(empresa_id_empresa);

      const estoqueAtual = await tx.estoque.findFirst({
        where: {
          produto_id_produto: prodIdBigInt,
          produto_unidade_medida_id_unidade_medida: unidIdBigInt,
        },
        select: {
          id_estoque: true,
          qtd_produto: true,
        },
      });

      if (!estoqueAtual) {
        throw new Error("Item de estoque não encontrado para este produto.");
      }

      const qtdDisponivel = Number(estoqueAtual.qtd_produto);
      if (qtdDisponivel < qtd_comprada_item) {
        throw new Error(`Estoque insuficiente. Disponível: ${qtdDisponivel}`);
      }

      await tx.estoque.update({
        where: {
          id_estoque_produto_id_produto_produto_unidade_medida_id_unidade_medida:
            {
              id_estoque: estoqueAtual.id_estoque,
              produto_id_produto: prodIdBigInt,
              produto_unidade_medida_id_unidade_medida: unidIdBigInt,
            },
        },
        data: {
          qtd_produto: { decrement: qtd_comprada_item },
          Usuario_Alteracao: "SYSTEM_PEDIDO",
          Data_Hora_Alteracao: new Date(),
        },
      });

      const newPedidoId = BigInt(Date.now());
      const dataForPrisma = {
        id_pedido: newPedidoId,
        numero_pedido: newPedidoId,
        data_pedido: new Date(),
        qtd_comprada_item: payload.qtd_comprada_item,
        valor_total_item: payload.valor_total_item,

        cliente_id_cliente: BigInt(payload.cliente_id_cliente),
        cliente_empresa_id_empresa: BigInt(payload.cliente_empresa_id_empresa),
        cliente_tipo_cliente_id_tipo_cliente: BigInt(
          payload.cliente_tipo_cliente_id_tipo_cliente
        ),

        produto_id_produto: prodIdBigInt,
        produto_unidade_medida_id_unidade_medida: unidIdBigInt,

        empresa_id_empresa: empIdBigInt,
      };

      const novoPedido = await tx.pedido.create({
        data: dataForPrisma,
      });

      return novoPedido;
    });

    revalidatePath("/pedidos");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Pedido cadastrado e estoque atualizado!",
      data: pedidoItem,
    };
  } catch (error: any) {
    console.error("[ACTION] cadastrarPedido:", error);
    return { success: false, message: `Erro ao cadastrar pedido: ${error.message}` };
  }
}

/* =====================================================
 * Função: getPedidosAgrupadosPorCliente (AJUSTADA)
 * ===================================================== */
export async function getPedidosAgrupadosPorCliente() {
  try {
    const pedidosAgrupados = await prisma.pedido.groupBy({
      by: ["cliente_id_cliente"],
      _count: { id_pedido: true },
      _sum: { valor_total_item: true },
    });

    const clientes = await prisma.cliente.findMany({
      select: {
        id_cliente: true,
        nome_reduzido: true,
      },
    });

    const clienteMap = new Map(
      clientes.map((c) => [String(c.id_cliente), c.nome_reduzido ?? "N/A"])
    );

    const dataFinal = pedidosAgrupados.map((pedido) => {
      const nomeCliente =
        clienteMap.get(String(pedido.cliente_id_cliente)) || "Cliente Excluído";

      return {
        cliente_nome: nomeCliente,
        qtd_pedidos: pedido._count.id_pedido || 0,
        valor_total: (Number(pedido._sum.valor_total_item) || 0).toFixed(2),
      };
    });

    return { success: true, data: dataFinal };
  } catch (error: any) {
    console.error("[ACTION] getPedidosAgrupadosPorCliente:", error);
    return { success: false, message: "Erro ao buscar dados agregados de pedidos." };
  }
}
