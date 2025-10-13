// ./src/actions/cliente.ts
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const CLIENTE_TYPE_ID_MAP: Record<string, number> = {
  "Pessoa Física": 10001,
  "Pessoa Jurídica": 10002,
};

const EMPRESA_PADRAO_ID = 10001;

type CadastroData = {
  nome: string;
  nome_reduzido?: string;
  cpf_cnpj: string;
  endereco: string;
  telefone: string;
  tipo_cliente: "Pessoa Física" | "Pessoa Jurídica";
};

type UpdateData = {
  nome: string;
  nome_reduzido?: string;
  cpf_cnpj: string;
  endereco: string;
  telefone: string;
  tipo_cliente: "Pessoa Física" | "Pessoa Jurídica";
};

/** Helper: limpa e retorna só dígitos */
function somenteDigitos(input: string): string {
  return String(input ?? "").replace(/\D/g, "");
}

/**
 * Atualiza um cliente com validação de comprimento do CPF/CNPJ:
 * - Pessoa Física => 11 dígitos
 * - Pessoa Jurídica => 14 dígitos
 */
export async function updateCliente(
  identifiers: {
    id_cliente: string | number;
    empresa_id_empresa: string | number;
    tipo_cliente_id_tipo_cliente?: string | number;
  },
  data: UpdateData
) {
  console.log("[AÇÃO NO SERVIDOR] Recebido para ATUALIZAR:", { identifiers, data });

  // Valida tipo_cliente
  const tipoClienteId = CLIENTE_TYPE_ID_MAP[data.tipo_cliente];
  if (!tipoClienteId) return { success: false, message: "Tipo de cliente inválido." };

  // Limpa CPF/CNPJ e telefone (somente dígitos)
  const cpfRaw = somenteDigitos(data.cpf_cnpj);
  const telefoneRaw = somenteDigitos(data.telefone);

  // Validação de tamanho específica
  if (data.tipo_cliente === "Pessoa Física") {
    if (cpfRaw.length !== 11) {
      return { success: false, message: "CPF inválido: deve conter exatamente 11 dígitos." };
    }
  } else {
    // Pessoa Jurídica
    if (cpfRaw.length !== 14) {
      return { success: false, message: "CNPJ inválido: deve conter exatamente 14 dígitos." };
    }
  }

  // Converte para BigInt com segurança (aqui já sabemos que só tem dígitos)
  let cpfCnpjBigInt: bigint;
  let telefoneBigInt: bigint;
  try {
    cpfCnpjBigInt = BigInt(cpfRaw);
    telefoneBigInt = telefoneRaw ? BigInt(telefoneRaw) : BigInt(0);
  } catch (e) {
    return { success: false, message: "CPF/CNPJ ou Telefone inválido. Utilize apenas números." };
  }

  // converte identifiers para BigInt (interno)
  let id_cliente: bigint;
  let empresa_id_empresa: bigint;
  let tipo_cliente_id_tipo_cliente: bigint | undefined;
  try {
    id_cliente = BigInt(String(identifiers.id_cliente));
    empresa_id_empresa = BigInt(String(identifiers.empresa_id_empresa));
    if (identifiers.tipo_cliente_id_tipo_cliente !== undefined) {
      tipo_cliente_id_tipo_cliente = BigInt(String(identifiers.tipo_cliente_id_tipo_cliente));
    }
  } catch (e) {
    return { success: false, message: "Identificadores inválidos." };
  }

  try {
    const whereClause: any = {
      id_cliente,
      empresa_id_empresa,
    };
    if (tipo_cliente_id_tipo_cliente !== undefined) {
      whereClause.tipo_cliente_id_tipo_cliente = tipo_cliente_id_tipo_cliente;
    }

    const updateResult = await prisma.cliente.updateMany({
      where: whereClause,
      data: {
        nome: data.nome,
        nome_reduzido: data.nome_reduzido || data.nome,
        cpf_cnpj: cpfCnpjBigInt,
        endereco: data.endereco,
        telefone: telefoneBigInt,
        tipo_cliente_id_tipo_cliente: BigInt(tipoClienteId),
      },
    });

    if (updateResult.count === 0) {
      return { success: false, message: "Registro não encontrado para atualizar." };
    }

    revalidatePath("/exibirClientes");
    return { success: true, message: "Cliente atualizado com sucesso!" };
  } catch (error: any) {
    console.error("ERRO DETALHADO DO PRISMA (ATUALIZAR):", error);
    if (error?.code === "P2025") {
      return { success: false, message: "Registro não encontrado para atualizar." };
    }
    return { success: false, message: "Erro na base de dados ao atualizar." };
  }
}

/**
 * Exclui um cliente.
 * identifiers: deve receber ids serializáveis (string | number).
 * Para exclusão precisa indicar ao menos id_cliente e empresa_id_empresa; idealmente inclua tipo_cliente_id_tipo_cliente.
 */
export async function deleteCliente(
  identifiers: { id_cliente: string | number; empresa_id_empresa: string | number; tipo_cliente_id_tipo_cliente?: string | number }
) {
  console.log("[AÇÃO NO SERVIDOR] Recebido para DELETAR:", identifiers);

  let id_cliente: bigint;
  let empresa_id_empresa: bigint;
  let tipo_cliente_id_tipo_cliente: bigint | undefined;

  try {
    id_cliente = BigInt(String(identifiers.id_cliente));
    empresa_id_empresa = BigInt(String(identifiers.empresa_id_empresa));
    if (identifiers.tipo_cliente_id_tipo_cliente !== undefined) {
      tipo_cliente_id_tipo_cliente = BigInt(String(identifiers.tipo_cliente_id_tipo_cliente));
    }
  } catch (e) {
    return { success: false, message: "Identificadores inválidos." };
  }

  try {
    const whereClause: any = {
      id_cliente,
      empresa_id_empresa,
    };
    if (tipo_cliente_id_tipo_cliente !== undefined) {
      whereClause.tipo_cliente_id_tipo_cliente = tipo_cliente_id_tipo_cliente;
    }

    const deleteResult = await prisma.cliente.deleteMany({
      where: whereClause,
    });

    if (deleteResult.count === 0) {
      return { success: false, message: "Registro não encontrado para excluir." };
    }

    revalidatePath("/exibirClientes");
    return { success: true, message: "Cliente excluído com sucesso." };
  } catch (error: any) {
    console.error("ERRO DETALHADO DO PRISMA (DELETAR):", error);
    if (error?.code === "P2003") {
      return { success: false, message: "Não foi possível excluir: há registros dependentes (restrição de integridade)." };
    }
    if (error?.code === "P2025") {
      return { success: false, message: "Registro não encontrado para excluir." };
    }
    return { success: false, message: "Erro na base de dados ao excluir." };
  }
}

/**
 * Cadastrar cliente (mesma validação CPF/CNPJ aplicada)
 */
export async function cadastrarCliente(data: CadastroData) {
  console.log("[AÇÃO NO SERVIDOR] Recebido para CADASTRAR:", data);

  const tipoClienteId = CLIENTE_TYPE_ID_MAP[data.tipo_cliente];
  if (!tipoClienteId) return { success: false, message: "Tipo de cliente inválido." };

  const cpfRaw = somenteDigitos(data.cpf_cnpj);
  const telefoneRaw = somenteDigitos(data.telefone);

  if (data.tipo_cliente === "Pessoa Física") {
    if (cpfRaw.length !== 11) {
      return { success: false, message: "CPF inválido: deve conter exatamente 11 dígitos." };
    }
  } else {
    if (cpfRaw.length !== 14) {
      return { success: false, message: "CNPJ inválido: deve conter exatamente 14 dígitos." };
    }
  }

  let cpfCnpjBigInt: bigint;
  let telefoneBigInt: bigint;
  try {
    cpfCnpjBigInt = BigInt(cpfRaw);
    telefoneBigInt = telefoneRaw ? BigInt(telefoneRaw) : BigInt(0);
  } catch (e) {
    return { success: false, message: "CPF/CNPJ ou Telefone inválido. Utilize apenas números." };
  }

  try {
    const newId = BigInt(Date.now());

    await prisma.cliente.create({
      data: {
        id_cliente: newId,
        empresa_id_empresa: BigInt(EMPRESA_PADRAO_ID),
        tipo_cliente_id_tipo_cliente: BigInt(tipoClienteId),

        nome: data.nome,
        nome_reduzido: data.nome_reduzido || data.nome,
        cpf_cnpj: cpfCnpjBigInt,
        endereco: data.endereco,
        telefone: telefoneBigInt,
        tipoClienteIdFK: BigInt(tipoClienteId),
      },
    });

    revalidatePath("/exibirClientes");
    return { success: true, message: "Cliente cadastrado com sucesso!" };
  } catch (error: any) {
    console.error("ERRO NO BANCO DE DADOS (CADASTRAR):", error);
    return { success: false, message: "Erro na base de dados. Verifique logs do servidor." };
  }
}
