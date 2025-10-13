"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { deleteCliente, updateCliente } from "@/actions/cliente";
import { ClienteEditForm } from "./cliente-edit-form";
import { ClienteData } from "@/app/exibirClientes/columns";
import { useRouter } from "next/navigation";

export function CellActions({ cliente }: { cliente: ClienteData }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Observação: envie STRINGS (serializáveis). A action no servidor converte para BigInt.
  const handleUpdate = async (data: ClienteData) => {
    setIsSubmitting(true);

    const identifiers = {
      id_cliente: String(data.id_cliente),
      empresa_id_empresa: String(data.empresa_id_empresa),
    };

    try {
      const result = await updateCliente(identifiers, {
        nome: data.nome,
        nome_reduzido: data.nome_reduzido,
        cpf_cnpj: String(data.cpf_cnpj ?? ""),
        endereco: data.endereco ?? "",
        telefone: String(data.telefone ?? ""),
        tipo_cliente: (data.tipo_cliente as "Pessoa Física" | "Pessoa Jurídica") ?? "Pessoa Física",
      });

      if (result.success) {
        setIsEditDialogOpen(false);
        // atualiza dados da página de forma suave
        startTransition(() => router.refresh());
      } else {
        alert(`Erro ao atualizar: ${result.message}`);
      }
    } catch (err) {
      console.error("Erro ao atualizar cliente:", err);
      alert("Erro inesperado ao atualizar cliente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Tem certeza que deseja excluir o cliente "${cliente.nome}"?`)) return;

    // chamar a server action em uma transition para melhor UX
    startTransition(async () => {
      try {
        const result = await deleteCliente({
          id_cliente: String(cliente.id_cliente),
          empresa_id_empresa: String(cliente.empresa_id_empresa),
        });

        if (!result.success) {
          alert(`Erro ao excluir: ${result.message}`);
          return;
        }

        // sucesso: atualiza a página/componente
        router.refresh();
      } catch (err) {
        console.error("Erro ao excluir cliente:", err);
        alert("Erro inesperado ao excluir cliente.");
      }
    });
  };

  return (
    <>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cliente: {cliente.nome}</DialogTitle>
          </DialogHeader>
          <ClienteEditForm
            cliente={cliente}
            onSubmit={handleUpdate}
            onCancel={() => setIsEditDialogOpen(false)}
            isSubmitting={isSubmitting || isPending}
          />
        </DialogContent>
      </Dialog>

      <TooltipProvider delayDuration={100}>
        <div className="flex items-center justify-end gap-2">
          {/* EDIT */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => setIsEditDialogOpen(true)}>
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Editar Cliente</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Editar Cliente</p>
            </TooltipContent>
          </Tooltip>

          {/* DELETE */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                className="text-red-600 hover:text-red-700"
                disabled={isPending}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Excluir Cliente</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Excluir Cliente</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </>
  );
}
