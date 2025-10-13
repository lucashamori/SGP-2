// ... imports ...

// O tipo foi atualizado para usar id_cliente
export type ClienteData = {
      id_cliente: string 
      nome: string
      cpf_cnpj: string
      telefone: string
      totalPedidos: number
    }
    
    
    // O esquema de validação também é atualizado
    const UpdateClienteSchema = z.object({
      id_cliente: z.string(), // <-- MUDANÇA
      nome: z.string().min(1, { message: "O nome é obrigatório." }),
      // ... resto do schema
    });
    
    // ... tipo State ...
    
    // --- AÇÃO DE ATUALIZAR CLIENTE ---
    export async function updateCliente(id_cliente: string, prevState: State, formData: FormData) { // <-- MUDANÇA
      const validatedFields = UpdateClienteSchema.safeParse({
        id_cliente, // <-- MUDANÇA
        // ... resto da validação
      });
    
      // ...
    
      try {
        await prisma.cliente.update({
          where: { id_cliente }, // <-- MUDANÇA
          data: {
            // ... dados
          },
        });
      } catch (error) { /* ... */ }
    
      revalidatePath("/exibirClientes");
      redirect("/exibirClientes");
    }
    
    // --- AÇÃO DE DELETAR CLIENTE ---
    export async function deleteCliente(id_cliente: string) { // <-- MUDANÇA
      try {
        await prisma.cliente.delete({
          where: { id_cliente }, // <-- MUDANÇA
        });
        revalidatePath("/exibirClientes");
        return { message: "Cliente deletado com sucesso." };
      } catch (error) { /* ... */ }
    }
    
    // --- FUNÇÃO DE BUSCA (para a página de edição) ---
    export async function getClienteById(id_cliente: string): Promise<ClienteData | null> { // <-- MUDANÇA
        try {
            const cliente = await prisma.cliente.findUnique({
                where: { id_cliente }, // <-- MUDANÇA
            });
    
            if (!cliente) return null;
    
            return {
                id_cliente: cliente.id_cliente, // <-- MUDANÇA
                nome: cliente.nome,
                cpf_cnpj: cliente.cpf_cnpj.toString(),
                telefone: cliente.telefone.toString(),
                totalPedidos: 0,
            };
        } catch (error) { /* ... */ }
    }