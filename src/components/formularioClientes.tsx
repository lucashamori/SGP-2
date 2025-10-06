"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select" 

type DocumentType = "cpf" | "cnpj"

export function Formulario({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  
  const [documentType, setDocumentType] = useState<DocumentType>("cpf")
  
  // --- INÍCIO DA LÓGICA DE VARIÁVEIS COM IF/ELSE ---
  
  // Declarando todas as variáveis que serão definidas no bloco if/else
  let labelText: string;
  let inputId: string;
  let inputPlaceholder: string;
  let maxLength: number;
  let tipoCliente: string;

  if (documentType === "cpf") {
    // Valores para CPF (Pessoa Física)
    labelText = "CPF";
    inputId = "cpf";
    inputPlaceholder = "116.393.898-79";
    maxLength = 11;
    tipoCliente = "Pessoa Física";
  } else {
    // Valores para CNPJ (Pessoa Jurídica)
    labelText = "CNPJ";
    inputId = "cnpj";
    inputPlaceholder = "00.000.000/0001-00";
    maxLength = 14;
    tipoCliente = "Pessoa Jurídica";
  }
  
  const inputType = "text"; // Esta variável permanece estática
  
  // --- FIM DA LÓGICA DE VARIÁVEIS COM IF/ELSE ---

  const handleDocumentChange = (value: string) => {
    // Esta função dispara o recálculo das variáveis no próximo render
    setDocumentType(value as DocumentType)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      
      const formData = new FormData(event.currentTarget);
      const data = Object.fromEntries(formData.entries());
      
      // A variável tipoCliente (calculada acima com if/else) é adicionada aqui:
      const dadosCompletos = {
          ...data,
          tipo_cliente: tipoCliente, 
      };
      
      console.log("Dados prontos para envio:", dadosCompletos);
      
      // ... (Restante da lógica de envio para o backend)
  };


  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit}> 
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-xl font-bold">Cadastro de Clientes</h1>
          </div>
          <div className="flex flex-col gap-6">
            
            {/* Campo Nome */}
            <div className="grid gap-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                name="nome"
                type="text"
                placeholder="Lucas Mori"
                required
              />
            </div>

            {/* Campo Nome reduzido */}
            <div className="grid gap-2">
              <Label htmlFor="nome">Nome reduzido</Label>
              <Input
                id="nome"
                name="nome"
                type="text"
                placeholder="Mori"
                required
              />
            </div>
            
            {/* CAMPO DE DOCUMENTO (SELECT E INPUT LADO A LADO) */}
            <div className="grid gap-2">
              {/* Usa a Label calculada com if/else */}
              <Label htmlFor={inputId}>{labelText}</Label> 
              
              <div className="flex gap-2">
                
                {/* Select */}
                <div className="w-1/3">
                    <Select defaultValue={documentType} onValueChange={handleDocumentChange}>
                        <SelectTrigger className="w-full"> 
                            <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="cpf">CPF</SelectItem>
                            <SelectItem value="cnpj">CNPJ</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Input com as propriedades calculadas com if/else */}
                <div className="w-2/3">
                    <Input
                        id={inputId} 
                        name="cpf_cnpj"
                        type={inputType}
                        placeholder={inputPlaceholder}
                        required
                        maxLength={maxLength} 
                    />
                </div>
              </div>
            </div>
            
            {/* Campos Endereço e Telefone */}
            <div className="grid gap-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                name="endereco"
                type="text"
                placeholder="Alameda Zurique 393"
                required
              />

            </div>
             <div className="grid gap-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                name="telefone"
                type="tel"
                placeholder="35992445674"
                required
              />
            </div>

            <Button type="submit" className="w-full">
              Cadastrar
            </Button>
          </div>
          
        </div>
      </form>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary  ">
        Desenvolvido por Lucas Mori
      </div>
    </div>
  )
}