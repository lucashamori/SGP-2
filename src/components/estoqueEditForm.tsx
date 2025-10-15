"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { getProdutos } from "@/actions/produto"; // busca produtos do banco

export function EstoqueEditForm({
  estoque,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  estoque: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const [produtos, setProdutos] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    produto_id_produto: estoque.produto_id_produto || "",
    qtd_produto: estoque.qtd_produto || "",
    qtd_reservada: estoque.qtd_reservada || "",
    valor_unitario: estoque.valor_unitario || "",
  });

  useEffect(() => {
    async function loadProdutos() {
      const result = await getProdutos();
      if (result.success) {
        setProdutos(result.data);
      }
    }
    loadProdutos();
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 p-1 sm:p-2"
    >
      

      {/* QUANTIDADE EM ESTOQUE */}
      <div className="flex flex-col gap-1">
        <Label htmlFor="qtd_produto" className="text-sm font-medium">
          Quantidade em Estoque
        </Label>
        <Input
          id="qtd_produto"
          type="number"
          placeholder="Ex: 100"
          value={formData.qtd_produto}
          onChange={(e) => handleChange("qtd_produto", e.target.value)}
        />
      </div>

      {/* QUANTIDADE RESERVADA */}
      <div className="flex flex-col gap-1">
        <Label htmlFor="qtd_reservada" className="text-sm font-medium">
          Quantidade Reservada
        </Label>
        <Input
          id="qtd_reservada"
          type="number"
          placeholder="Ex: 5"
          value={formData.qtd_reservada}
          onChange={(e) => handleChange("qtd_reservada", e.target.value)}
        />
      </div>

      {/* VALOR UNITÁRIO */}
      <div className="flex flex-col gap-1">
        <Label htmlFor="valor_unitario" className="text-sm font-medium">
          Valor Unitário (R$)
        </Label>
        <Input
          id="valor_unitario"
          type="number"
          step="0.01"
          placeholder="Ex: 1234.56"
          value={formData.valor_unitario}
          onChange={(e) => handleChange("valor_unitario", e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Formato: 1234.56
        </p>
      </div>

      {/* BOTÕES */}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  );
}
