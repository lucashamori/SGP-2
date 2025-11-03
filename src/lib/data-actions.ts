"use server";

import { prisma } from "@/lib/prisma";
import { getPedidosAgrupadosPorCliente } from "@/actions/pedido";

// Mapeamento reverso para converter o ID do tipo de cliente de volta para texto
const CLIENTE_TYPE_TEXT_MAP: { [key: number]: string } = {
  10001: "Pessoa Física",
  10002: "Pessoa Jurídica",
};

// Definição dos tipos
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
        tipoClienteIdFK: true,
        pedido: { select: { id_pedido: true } },
      },
      orderBy: { nome: "asc" },
    });

    // Converte BigInts para string e monta o objeto final
    return clientes.map((cliente) => ({
      id_cliente: cliente.id_cliente.toString(),
      empresa_id_empresa: cliente.empresa_id_empresa.toString(),
      tipo_cliente_id_tipo_cliente: cliente.tipo_cliente_id_tipo_cliente.toString(),
      nome: cliente.nome,
      nome_reduzido: cliente.nome_reduzido,
      cpf_cnpj: cliente.cpf_cnpj.toString(),
      telefone: cliente.telefone.toString(),
      endereco: cliente.endereco,
      tipo_cliente:
        CLIENTE_TYPE_TEXT_MAP[Number(cliente.tipoClienteIdFK)] || "Indefinido",
      totalPedidos: cliente.pedido.length,
    }));
  } catch (error) {
    console.error("ERRO AO BUSCAR DADOS DE CLIENTES:", error);
    return [];
  }
}

export async function getPedidosData(): Promise<PedidoAgrupado[]> {
  try {
    const response = await getPedidosAgrupadosPorCliente();

    if (!response.success) {
      console.error("[ACTION] getPedidosData:", response.message);
      return [];
    }

    // Retorna apenas o array de dados no formato esperado pela tabela
    return response.data.map((pedido: PedidoAgrupado) => ({
      cliente_nome: pedido.cliente_nome,
      qtd_pedidos: pedido.qtd_pedidos,
      valor_total: pedido.valor_total,
      tipo_cliente: pedido.tipo_cliente,
      endereco: pedido.endereco,
    }));
  } catch (error: any) {
    console.error("[ACTION] getPedidosData error:", error);
    return [];
  }
}
