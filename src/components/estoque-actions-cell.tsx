"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { deleteProduto, updateEstoque } from "@/actions/produto";
import { EstoqueEditForm } from "./estoqueEditForm";
import { EstoqueData } from "@/app/exibirEstoque/columns";

export function EstoqueActionsCell({ estoque }: { estoque: EstoqueData }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleUpdate = async (data: { nome: string; qtd_produto: string; qtd_reservada: string; valor_unitario?: string }) => {
  setIsSubmitting(true);
  const identifiers = {
    id_estoque: String(estoque.id_estoque),
    produto_id_produto: String(estoque.produto_id_produto),
    produto_unidade_medida_id_unidade_medida: String(estoque.produto_unidade_medida_id_unidade_medida),
  };

  try {
    // Se sua server action updateEstoque aceita nome/valor, envie-os.
    // Caso o update seja dividido entre produto e estoque, adapte conforme sua action.
    const result = await updateEstoque(identifiers, {
      nome: data.nome,
      qtd_produto: data.qtd_produto,
      qtd_reservada: data.qtd_reservada,
      valor_unitario: data.valor_unitario,
    });

    if (result.success) {
      setIsEditDialogOpen(false);
      startTransition(() => router.refresh());
    } else {
      alert(`Erro ao atualizar estoque: ${result.message}`);
    }
  } catch (err) {
    console.error("Erro ao atualizar estoque:", err);
    alert("Erro inesperado ao atualizar estoque.");
  } finally {
    setIsSubmitting(false);
  }
};
  const handleDelete = async () => {
    if (!window.confirm(`Tem certeza que deseja excluir o produto "${estoque.produto_descricao}"?`)) return;
    startTransition(async () => {
      try {
        const result = await deleteProduto({
          id_produto: String(estoque.produto_id_produto),
          unidade_medida_id_unidade_medida: String(estoque.produto_unidade_medida_id_unidade_medida),
        });
        if (!result.success) {
          alert(`Erro ao excluir: ${result.message}`);
          return;
        }
        router.refresh();
      } catch (err) {
        console.error("Erro ao excluir produto:", err);
        alert("Erro inesperado ao excluir produto.");
      }
    });
  };

  return (
    <>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Estoque: {estoque.produto_descricao}</DialogTitle>
          </DialogHeader>
          <EstoqueEditForm
            estoque={estoque}
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

          {/* EXCLUIR */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={handleDelete}
                disabled={isPending}
                className="font-semibold"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Excluir Produto</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Excluir Produto</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </>
  );
}
