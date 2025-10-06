// src/actions/cliente.ts
"use server"

import { prisma } from "@/lib/prisma" 

// Mapeamento dos tipos de cliente (IDs da tabela tipo_cliente)
const CLIENTE_TYPE_MAP = {
  "Pessoa Física": 10001,
  "Pessoa Jurídica": 10002,
}

type CadastroData = {
  nome: string;
  cpf_cnpj: string; // Vai ser convertido para BigInt
  endereco: string;
  telefone: string; // Vai ser convertido para BigInt
  tipo_cliente: "Pessoa Física" | "Pessoa Jurídica";
  // Adicione outros campos necessários como empresa_id_empresa
}

const EMPRESA_PADRAO_ID = 10001; 


export async function cadastrarCliente(data: CadastroData) {
  
  // 1. Converte o CPF/CNPJ e Telefone para BigInt
  // Isso é crucial para preservar o valor exato, já que são maiores que 2^53.
  let cpfCnpjBigInt: bigint;
  let telefoneBigInt: bigint;

  try {
    cpfCnpjBigInt = BigInt(data.cpf_cnpj);
    telefoneBigInt = BigInt(data.telefone);
  } catch (e) {
    return { success: false, message: "CPF/CNPJ ou Telefone inválido. Apenas números são aceitos." };
  }
  
  // 2. Obtém o ID da chave estrangeira (FK)
  const tipoClienteId = CLIENTE_TYPE_MAP[data.tipo_cliente];

  try {
    const newCliente = await prisma.cliente.create({
      data: {
        // Campos que fazem parte da chave primária composta (também BigInts)
        id_cliente: BigInt(Date.now()), 
        empresa_id_empresa: BigInt(EMPRESA_PADRAO_ID),
        tipo_cliente_id_tipo_cliente: BigInt(tipoClienteId),

        // Campos de dados:
        nome: data.nome,
        cpf_cnpj: cpfCnpjBigInt, // BIGINT CORRIGIDO
        telefone: telefoneBigInt, // BIGINT CORRIGIDO (mapeado para 'tefelone' no DB)
        endereco: data.endereco,
        
        // FKs adicionais (BigInt)
        tipoClienteIdFK: BigInt(tipoClienteId), 
        
        // Campos de Auditoria (BigInts de data/usuário podem ser padrão se não fornecidos):
        // Seus campos de auditoria (Usuario_Inclusao, Data_Hora_Inclusao, etc.)
        // têm defaults definidos no Prisma, então não precisam ser passados.
      },
    });

    console.log("Cliente cadastrado com ID:", newCliente.id_cliente);
    return { success: true, message: "Cliente cadastrado com sucesso!" };

  } catch (error) {
    console.error("Erro ao cadastrar cliente:", error);
    // Em produção, você pode retornar uma mensagem de erro mais genérica
    return { success: false, message: "Erro na base de dados. Por favor, tente novamente." };
  }
}