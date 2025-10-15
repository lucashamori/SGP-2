"use client";

import React, { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// server action
import { cadastrarProduto, getUnidades } from "@/actions/produto";

type UnidadeOption = {
  id: string;
  descricao: string;
};

export function FormularioProduto({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const router = useRouter();
  const [descricao, setDescricao] = useState("");
  const [unidade, setUnidade] = useState<string>("");
  const [valor, setValor] = useState<string>("0.00");
  const [quantidade, setQuantidade] = useState<string>(" "); // NOVO: Estado para a quantidade
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [unidades, setUnidades] = useState<UnidadeOption[]>([]);
  const [loadingUnidades, setLoadingUnidades] = useState(true);

  // Carrega unidades do servidor
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingUnidades(true);
      try {
        const res = await getUnidades();
        if (!mounted) return;
        if (res?.success) {
          setUnidades(res.data || []);
          if ((res.data || []).length > 0) {
            setUnidade(String(res.data[0].id));
          }
        }
      } catch (err) {
        console.error("Erro ao chamar getUnidades:", err);
      } finally {
        if (mounted) setLoadingUnidades(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Funções para limpar a entrada do usuário
  function handleValorChange(raw: string) {
    const cleaned = raw.replace(/[^0-9.,]/g, "").replace(",", ".");
    setValor(cleaned);
  }

  function handleQuantidadeChange(raw: string) {
    // Permite apenas números inteiros para quantidade
    const cleaned = raw.replace(/[^0-9]/g, "");
    setQuantidade(cleaned || "0");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Validações
    if (!descricao.trim() || !unidade) {
      alert("Descrição e Unidade de Medida são obrigatórias.");
      return;
    }
    const parsedValor = Number(valor.replace(",", "."));
    if (Number.isNaN(parsedValor) || parsedValor < 0) {
      alert("Valor unitário inválido.");
      return;
    }
    const parsedQtd = Number(quantidade);
    if (Number.isNaN(parsedQtd) || parsedQtd < 0 || !Number.isInteger(parsedQtd)) {
      alert("Quantidade inicial inválida. Deve ser um número inteiro positivo.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      descricao: descricao.trim(),
      unidade_medida_id_unidade_medida: unidade,
      valor_unitario: parsedValor.toFixed(2),
      qtd_produto: parsedQtd, // NOVO: Enviando a quantidade para a action
    };

    startTransition(async () => {
      try {
        const res = await cadastrarProduto(payload);
        if (res?.success) {
          // Limpa o formulário
          setDescricao("");
          setValor("0.00");
          setQuantidade("0");
          if (unidades.length > 0) setUnidade(unidades[0].id);
          router.refresh();
          alert(res.message ?? "Produto cadastrado com sucesso.");
        } else {
          alert(res?.message ?? "Erro ao cadastrar produto.");
        }
      } catch (err) {
        alert("Erro inesperado ao cadastrar produto.");
      } finally {
        setIsSubmitting(false);
      }
    });
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <h1 className="text-xl font-bold text-center">Cadastro de Produto</h1>

        <div className="grid gap-2">
          <Label htmlFor="descricao">Descrição</Label>
          <Input id="descricao" name="descricao" type="text" placeholder="Ex: Parafuso 3/8" required maxLength={45} value={descricao} onChange={(e) => setDescricao(e.target.value)} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="unidade">Unidade de Medida</Label>
          <Select value={unidade} onValueChange={setUnidade} disabled={loadingUnidades}>
            <SelectTrigger>
              <SelectValue placeholder={loadingUnidades ? "Carregando..." : "Selecione a unidade"} />
            </SelectTrigger>
            <SelectContent>
              {unidades.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {`${u.id} — ${u.descricao}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
                <Label htmlFor="qtd_produto">Quantidade Inicial</Label>
                <Input id="qtd_produto" name="qtd_produto" placeholder="0" type="text"  required value={quantidade} onChange={(e) => handleQuantidadeChange(e.target.value)} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="valor_unitario">Valor unitário (R$)</Label>
                <Input id="valor_unitario" name="valor_unitario" type="text" placeholder="0,00" required value={valor} onChange={(e) => handleValorChange(e.target.value)} />
            </div>
        </div>

        <div className="pt-2">
          <Button className="w-full" type="submit" disabled={isSubmitting || isPending}>
            {isSubmitting || isPending ? "Cadastrando..." : "Cadastrar Produto"}
          </Button>
        </div>
      </form>
    </div>
  );
}
