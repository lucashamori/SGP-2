"use server"

import { prisma } from "@/lib/prisma" 

// Mapeamento dos IDs da tabela sgp.tipo_cliente (sgp_tipo_cliente.sql)
// Pessoa Física = 10001 | Pessoa Jurídica = 10002
const CLIENTE_TYPE_ID_MAP = {
  "Pessoa Física": 10001,
  "Pessoa Jurídica": 10002,
}

// Assumindo um ID de empresa padrão para desenvolvimento, pois o campo é NOT NULL
const EMPRESA_PADRAO_ID = 10001; 

type CadastroData = {
  nome: string;
  nome_reduzido?: string; // Campo opcional
  cpf_cnpj: string; 
  endereco: string;
  telefone: string; 
  tipo_cliente: "Pessoa Física" | "Pessoa Jurídica";
}

export async function cadastrarCliente(data: CadastroData) {
  
  // 1. CONVERSÃO DE TIPOS E VALIDAÇÃO BÁSICA
  let cpfCnpjBigInt: bigint;
  let telefoneBigInt: bigint;

  try {
    // Campos BigInt devem ser convertidos explicitamente
    cpfCnpjBigInt = BigInt(data.cpf_cnpj.replace(/[.-]/g, '')); // Remove pontos/traços se existirem
    telefoneBigInt = BigInt(data.telefone.replace(/[()-\s]/g, ''));
  } catch (e) {
    return { success: false, message: "CPF/CNPJ ou Telefone inválido. Utilize apenas números." };
  }
  
  // 2. OBTÉM OS IDs DA CHAVE ESTRANGEIRA (FK)
  const tipoClienteId = CLIENTE_TYPE_ID_MAP[data.tipo_cliente];
  if (!tipoClienteId) {
    return { success: false, message: "Tipo de cliente inválido." };
  }

  try {
    // Para PKs compostas, o ID precisa ser fornecido. Usamos Date.now() + um random para simular um ID único.
    const newId = BigInt(Date.now());

    await prisma.cliente.create({
      data: {
        // CHAVES PRIMÁRIAS/ESTRANGEIRAS (BIGINT)
        id_cliente: newId, 
        empresa_id_empresa: BigInt(EMPRESA_PADRAO_ID),
        tipo_cliente_id_tipo_cliente: BigInt(tipoClienteId),

        // CAMPOS DE DADOS
        nome: data.nome,
        nome_reduzido: data.nome_reduzido || data.nome, // Usa nome completo como fallback
        cpf_cnpj: cpfCnpjBigInt, 
        endereco: data.endereco,
        telefone: telefoneBigInt, // Mapeado para 'tefelone' no DB

        // Campo de dados 'tipo_cliente' que existe na sua tabela (tipoClienteIdFK no schema.prisma)
        tipoClienteIdFK: BigInt(tipoClienteId), 

        // Os campos de auditoria (Usuario_Inclusao, Data_Hora_Inclusao) usam @default do Prisma
      },
    });

    return { success: true, message: "Cliente cadastrado com sucesso!" };

  } catch (error) {
    console.error("ERRO NO BANCO DE DADOS:", error);
    return { success: false, message: "Erro na base de dados. Verifique logs do servidor." };
  }
}
