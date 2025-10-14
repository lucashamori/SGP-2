"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClienteData } from "@/app/exibirClientes/columns";

interface ClienteEditFormProps {
  cliente: ClienteData;
  onSubmit: (data: ClienteData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function ClienteEditForm({
  cliente,
  onSubmit,
  onCancel,
  isSubmitting,
}: ClienteEditFormProps) {
  const [formData, setFormData] = useState(cliente);

  // Helper: mantém somente dígitos
  const somenteDigitos = (input: string) => input.replace(/\D/g, "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Limita CPF/CNPJ e telefone
    if (name === "cpf_cnpj") {
      const maxLength = formData.tipo_cliente === "Pessoa Física" ? 11 : 14;
      setFormData((prev) => ({
        ...prev,
        [name]: somenteDigitos(value).slice(0, maxLength),
      }));
    } else if (name === "telefone") {
      setFormData((prev) => ({
        ...prev,
        [name]: somenteDigitos(value),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      tipo_cliente: value,
      // Reseta CPF/CNPJ se tipo mudou
      cpf_cnpj: "",
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      {/* Tipo Cliente */}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="tipo_cliente" className="text-right">
          Tipo
        </Label>
        <Select
          name="tipo_cliente"
          value={formData.tipo_cliente}
          onValueChange={handleSelectChange}
        >
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Pessoa Física">Pessoa Física</SelectItem>
            <SelectItem value="Pessoa Jurídica">Pessoa Jurídica</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Nome */}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="nome" className="text-right">
          Nome
        </Label>
        <Input
          id="nome"
          name="nome"
          value={formData.nome}
          onChange={handleChange}
          className="col-span-3"
        />
      </div>

      {/* CPF/CNPJ */}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="cpf_cnpj" className="text-right">
          CPF/CNPJ
        </Label>
        <Input
          id="cpf_cnpj"
          name="cpf_cnpj"
          value={formData.cpf_cnpj}
          onChange={handleChange}
          className="col-span-3"
          placeholder={
            formData.tipo_cliente === "Pessoa Física" ? "CPF" : "CNPJ"
          }
          maxLength={formData.tipo_cliente === "Pessoa Física" ? 11 : 14}
        />
      </div>

      {/* Telefone */}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="telefone" className="text-right">
          Telefone
        </Label>
        <Input
          id="telefone"
          name="telefone"
          value={formData.telefone}
          onChange={handleChange}
          className="col-span-3"
        />
      </div>

      {/* Endereço */}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="endereco" className="text-right">
          Endereço
        </Label>
        <Input
          id="endereco"
          name="endereco"
          value={formData.endereco}
          onChange={handleChange}
          className="col-span-3"
        />
      </div>

      {/* Botões */}
      <div className="flex justify-end gap-2 pt-4">
        <Button
          variant="outline"
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>
    </form>
  );
}
