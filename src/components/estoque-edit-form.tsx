"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
// Ações específicas do produto/estoque
import { deleteProduto, updateEstoque } from "@/actions/produto";
// Novo formulário de edição de estoque
import { EstoqueEditForm } from "./estoque-edit-form";
// Tipo de dados da tabela de estoque
import { EstoqueData } from "@/app/exibirEstoque/columns";

export function EstoqueActionsCell({ estoque }: { estoque: EstoqueData }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  /**
   * Chama a action para atualizar a quantidade em estoque.
   * Envia os dados como strings, seguindo o padrão do CellActions do cliente.
   */
  const handleUpdate = async (data: { qtd_produto: string; qtd_reservada: string; }) => {
    setIsSubmitting(true);

    const identifiers = {
      id_estoque: String(estoque.id_estoque),
      produto_id_produto: String(estoque.produto_id_produto),
      produto_unidade_medida_id_unidade_medida: String(estoque.produto_unidade_medida_id_unidade_medida),
    };

    try {
      const result = await updateEstoque(identifiers, data);

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

  /**
   * Chama a action para excluir o produto e sua entrada de estoque correspondente.
   * Envia os dados como strings, seguindo o padrão do CellActions do cliente.
   */
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
          {/* EDITAR ESTOQUE */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => setIsEditDialogOpen(true)}>
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Editar Estoque</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Editar Estoque</p></TooltipContent>
          </Tooltip>

          {/* EXCLUIR PRODUTO */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={handleDelete} disabled={isPending}>
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Excluir Produto</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Excluir Produto</p></TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </>
  );
}