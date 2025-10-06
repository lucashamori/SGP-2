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
  
  // 1. DEFINIÇÃO DAS PROPRIEDADES DINÂMICAS E MAXLENGTH
  const labelText = documentType === "cpf" ? "CPF" : "CNPJ"
  const inputId = documentType === "cpf" ? "cpf" : "cnpj"
  const inputPlaceholder = documentType === "cpf" ? "116.393.898-79" : "00.000.000/0001-00"
  const inputType = "text"
  // NOVO: Define o número máximo de caracteres (11 para CPF, 14 para CNPJ)
  const maxLength = documentType === "cpf" ? 11 : 14 
  
  const handleDocumentChange = (value: string) => {
    setDocumentType(value as DocumentType)
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            {/* Conteúdo omitido para brevidade */}
            <h1 className="text-xl font-bold">Cadastro de Clientes</h1>
            
          </div>
          <div className="flex flex-col gap-6">
            
            {/* Campo Nome */}
            <div className="grid gap-2">
              <Label htmlFor="nome">Nome completo</Label>
              <Input
                id="nome"
                type="text"
                placeholder="Lucas Henrique Alves Mori"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="nome">Nome reduzido</Label>
              <Input
                id="nome"
                type="text"
                placeholder="Mori"
                required
              />
            </div>
            
            {/* CAMPO DE DOCUMENTO (SELECT E INPUT LADO A LADO) */}
            <div className="grid gap-2">
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

                {/* Input com o maxLength dinâmico aplicado */}
                <div className="w-2/3">
                    <Input
                        id={inputId} 
                        type={inputType}
                        placeholder={inputPlaceholder}
                        required
                        // APLICAÇÃO DO MAXLENGTH DINÂMICO AQUI
                        maxLength={maxLength} 
                    />
                </div>
              </div>
            </div>
            
            {/* Campos Endereço e Telefone (Omitidos para brevidade) */}
            <div className="grid gap-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                type="text"
                placeholder="Alameda Zurique 32"
                required
              />

            </div>
             <div className="grid gap-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
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