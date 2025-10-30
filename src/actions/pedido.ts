"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Retorna lista de clientes para uso em selects (id + nome)
 */
export async function getClientes() {
  try {
    const clientes = await prisma.cliente.findMany({
      select: {
        id_cliente: true,
        nome_reduzido: true,
      },
      orderBy: { nome_reduzido: "asc" },
    });

    return {
      success: true,
      data: clientes.map((c) => ({
        id_cliente: String(c.id_cliente),
        nome_reduzido: c.nome_reduzido,
      })),
    };
  } catch (error: any) {
    console.error("[ACTION] getClientes:", error);
    return { success: false, message: "Erro ao buscar clientes." };
  }
}

/**
 * Retorna lista de produtos disponíveis
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
        valor_unitario: p.valor_unitario ? Number(p.valor_unitario) : 0,
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

/**
 * Cadastra um novo pedido com cliente e produtos
 * Espera receber:
 * - cliente_id_cliente
 * - itens: array de objetos [{ produto_id_produto, quantidade, valor_unitario }]
 */
export async function cadastrarPedido(formData: FormData) {
  try {
    const cliente_id_cliente = Number(formData.get("cliente_id_cliente"));
    const itensRaw = formData.get("itens") as string; // JSON string com os itens

    if (!cliente_id_cliente || !itensRaw) {
      throw new Error("Cliente e itens do pedido são obrigatórios.");
    }

    const itens = JSON.parse(itensRaw);

    // Calcula total do pedido
    const valor_total = itens.reduce(
      (acc: number, item: any) =>
        acc + Number(item.quantidade) * Number(item.valor_unitario),
      0
    );

    // Cria o pedido principal
    const pedido = await prisma.pedido.create({
      data: {
        cliente_id_cliente,
        valor_total,
        data_pedido: new Date().toISOString(),
        itens_pedido: {
          create: itens.map((item: any) => ({
            produto_id_produto: Number(item.produto_id_produto),
            quantidade: Number(item.quantidade),
            valor_unitario: Number(item.valor_unitario),
            subtotal:
              Number(item.quantidade) * Number(item.valor_unitario),
          })),
        },
      },
      include: { itens_pedido: true },
    });

    // Atualiza o cache
    revalidatePath("/dashboard/pedidos");

    return { success: true, data: pedido };
  } catch (error: any) {
    console.error("[ACTION] cadastrarPedido:", error);
    return { success: false, message: "Erro ao cadastrar pedido." };
  }
}
