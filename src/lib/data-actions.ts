"use server";

import { prisma } from "@/lib/prisma";
import { getPedidosAgrupadosPorCliente } from "@/actions/pedido";
import { boolean } from "zod";

// 🔹 Mapeamento do tipo de cliente
const CLIENTE_TYPE_TEXT_MAP: Record<number, string> = {
  10001: "Pessoa Física",
  10002: "Pessoa Jurídica",
};

// 🔹 Tipos
type ClienteData = {
  id_cliente: string;
  empresa_id_empresa: string;
  tipo_cliente_id_tipo_cliente: string;
  nome: string;
  nome_reduzido: string | null;
  cpf_cnpj: string;
  telefone: string;
  endereco: string;
  tipo_cliente: string;
  totalPedidos: number;
};

type PedidoAgrupado = {
  cliente_nome: string;
  qtd_pedidos: number;
  valor_total: string;
  tipo_cliente: string;
  endereco: string;
};

// 🔹 Busca clientes ativos e seus pedidos
export async function getClientesData(): Promise<ClienteData[]> {
  try {
    const clientes = await prisma.cliente.findMany({
      select: {
        id_cliente: true,
        empresa_id_empresa: true,
        tipo_cliente_id_tipo_cliente: true,
        nome: true,
        nome_reduzido: true,
        cpf_cnpj: true,
        telefone: true,
        endereco: true,
        ativo: true, // ✅ correto
        pedido: { select: { id_pedido: true } },
      },
      where: { ativo: true },
      orderBy: { nome: "asc" },
    });

    return clientes.map((cliente) => ({
      id_cliente: String(cliente.id_cliente),
      empresa_id_empresa: String(cliente.empresa_id_empresa),
      tipo_cliente_id_tipo_cliente: String(cliente.tipo_cliente_id_tipo_cliente),
      nome: cliente.nome,
      nome_reduzido: cliente.nome_reduzido,
      cpf_cnpj: String(cliente.cpf_cnpj),
      telefone: String(cliente.telefone),
      endereco: cliente.endereco,
      tipo_cliente:
        CLIENTE_TYPE_TEXT_MAP[Number(cliente.tipo_cliente_id_tipo_cliente)] ||
        "Indefinido",
      totalPedidos: cliente.pedido.length,
    }));
  } catch (error) {
    console.error("❌ ERRO AO BUSCAR DADOS DE CLIENTES:", error);
    return [];
  }
}

// 🔹 Busca pedidos agrupados por cliente
export async function getPedidosData(): Promise<PedidoAgrupado[]> {
  try {
    const response = await getPedidosAgrupadosPorCliente();

    if (!response.success) {
      console.error("[ACTION] getPedidosData:", response.message);
      return [];
    }

    return response.data.map((pedido: PedidoAgrupado) => ({
      cliente_nome: pedido.cliente_nome,
      qtd_pedidos: pedido.qtd_pedidos,
      valor_total: pedido.valor_total,
      tipo_cliente: pedido.tipo_cliente,
      endereco: pedido.endereco,
    }));
  } catch (error) {
    console.error("[ACTION] getPedidosData error:", error);
    return [];
  }
}
