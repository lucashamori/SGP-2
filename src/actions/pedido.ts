"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/* =====================================================
 * Função utilitária: serialização segura (BigInt, Decimal)
 * ===================================================== */
function serializePrisma(data: any) {
  return JSON.parse(
    JSON.stringify(data, (key, value) => {
      if (typeof value === "bigint") return Number(value);
      if (value?.constructor?.name === "Decimal") return Number(value);
      return value;
    })
  );
}

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
        valor_unitario: p.valor_unitario
          ? p.valor_unitario.toString()
          : "0.00",
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
 * Função: cadastrarPedido (corrigida e com logs)
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

      const prodId = BigInt(produto_id_produto);
      const unidId = BigInt(produto_unidade_medida_id_unidade_medida);
      const empId = BigInt(empresa_id_empresa);

      // 🔍 Buscar estoque
      const estoqueAtual = await tx.estoque.findFirst({
        where: {
          produto_id_produto: prodId,
          produto_unidade_medida_id_unidade_medida: unidId,
        },
        select: {
          id_estoque: true,
          qtd_produto: true,
        },
      });

      if (!estoqueAtual) {
        console.error("[ERRO] Estoque não encontrado para o produto:", prodId);
        throw new Error("Item de estoque não encontrado para este produto.");
      }

      const qtdDisponivel = Number(estoqueAtual.qtd_produto);
      if (qtdDisponivel < qtd_comprada_item) {
        throw new Error(`Estoque insuficiente. Disponível: ${qtdDisponivel}`);
      }

      // 🧾 Atualizar estoque
      console.log(
        `[ACTION] Atualizando estoque ID ${estoqueAtual.id_estoque}: -${qtd_comprada_item}`
      );

      await tx.estoque.update({
        where: { id_estoque: estoqueAtual.id_estoque },
        data: {
          qtd_produto: qtdDisponivel - qtd_comprada_item,
          Usuario_Alteracao: "SYSTEM_PEDIDO",
          Data_Hora_Alteracao: new Date(),
        },
      });

      // 🧾 Criar pedido
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
        produto_id_produto: prodId,
        produto_unidade_medida_id_unidade_medida: unidId,
        empresa_id_empresa: empId,
      };

      const novoPedido = await tx.pedido.create({ data: dataForPrisma });
      console.log("[ACTION] Pedido criado com sucesso:", novoPedido.id_pedido);

      return novoPedido;
    });

    const pedidoSerializado = serializePrisma(pedidoItem);

    revalidatePath("/pedidos");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Pedido cadastrado e estoque atualizado!",
      data: pedidoSerializado,
    };
  } catch (error: any) {
    console.error("[ACTION] cadastrarPedido ERRO:", error);
    return {
      success: false,
      message: `Erro ao cadastrar pedido: ${error.message}`,
    };
  }
}

/* =====================================================
 * Função: getPedidosAgrupadosPorCliente
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
        tipo_cliente_id_tipo_cliente: true,
        endereco: true,
      },
    });

    const clienteMap = new Map(
      clientes.map((c) => [
        String(c.id_cliente),
        {
          nome: c.nome_reduzido ?? "N/A",
          tipo_cliente:
            c.tipo_cliente_id_tipo_cliente === BigInt(10001)
              ? "Pessoa Física"
              : c.tipo_cliente_id_tipo_cliente === BigInt(10002)
              ? "Pessoa Jurídica"
              : "—",
          endereco: c.endereco ?? "—",
        },
      ])
    );

    const dataFinal = pedidosAgrupados.map((pedido) => {
      const info =
        clienteMap.get(String(pedido.cliente_id_cliente)) || {
          nome: "Cliente Excluído",
          tipo_cliente: "—",
          endereco: "—",
        };

      return {
        cliente_nome: info.nome,
        tipo_cliente: info.tipo_cliente,
        endereco: info.endereco,
        qtd_pedidos: pedido._count.id_pedido || 0,
        valor_total: (Number(pedido._sum.valor_total_item) || 0).toFixed(2),
      };
    });

    return { success: true, data: serializePrisma(dataFinal) };
  } catch (error: any) {
    console.error("[ACTION] getPedidosAgrupadosPorCliente:", error);
    return {
      success: false,
      message: "Erro ao buscar dados agregados de pedidos.",
    };
  }
}
