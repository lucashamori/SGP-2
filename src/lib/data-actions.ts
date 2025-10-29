"use server"

import { prisma } from "@/lib/prisma"

// Mapeamento reverso para converter o ID do tipo de cliente de volta para texto
const CLIENTE_TYPE_TEXT_MAP: { [key: number]: string } = {
  10001: "Pessoa Física",
  10002: "Pessoa Jurídica",
}

export async function getClientesData() {
  try {
    const clientes = await prisma.cliente.findMany({
      select: {
        id_cliente: true,
        empresa_id_empresa: true,
        tipo_cliente_id_tipo_cliente: true, // <-- CERTIFIQUE-SE QUE ESTÁ AQUI
        nome: true,
        nome_reduzido: true,
        cpf_cnpj: true,
        telefone: true, // Prisma usa 'tefelone' por causa do @map
        endereco: true,
        tipoClienteIdFK: true, // Campo mapeado @map("tipo_cliente")
        pedido: { select: { id_pedido: true } },
      },
      orderBy: { nome: 'asc' }
    });

    // Converte BigInts para string e monta o objeto final
    return clientes.map(cliente => ({
      id_cliente: cliente.id_cliente.toString(),
      empresa_id_empresa: cliente.empresa_id_empresa.toString(),
      tipo_cliente_id_tipo_cliente: cliente.tipo_cliente_id_tipo_cliente.toString(), // <-- ADICIONE AQUI
      nome: cliente.nome,
      nome_reduzido: cliente.nome_reduzido,
      cpf_cnpj: cliente.cpf_cnpj.toString(),
      telefone: cliente.telefone.toString(),
      endereco: cliente.endereco,
      // Usando tipoClienteIdFK para obter o texto "Pessoa Física"/"Jurídica"
      tipo_cliente: CLIENTE_TYPE_TEXT_MAP[Number(cliente.tipoClienteIdFK)] || "Indefinido",
      totalPedidos: cliente.pedido.length,
    }));
  } catch (error) {
    console.error("ERRO AO BUSCAR DADOS DE CLIENTES:", error);
    return [];
  }
}