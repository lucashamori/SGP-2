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
  descricao_reduzida: string;
  ativo: number;
};

export function FormularioProduto({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const router = useRouter();
  const [descricao, setDescricao] = useState("");
  const [unidade, setUnidade] = useState<string>(""); // selecionado
  const [valor, setValor] = useState<string>("0.00");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [unidades, setUnidades] = useState<UnidadeOption[]>([]);
  const [loadingUnidades, setLoadingUnidades] = useState(true);

  // Carrega unidades do servidor (server action)
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingUnidades(true);
      try {
        const res = await getUnidades();
        if (!mounted) return;
        if (res?.success) {
          setUnidades(res.data || []);
          // seleciona a primeira por padrão, se existir
          if ((res.data || []).length > 0) {
            setUnidade(String(res.data[0].id));
          }
        } else {
          console.error("Falha ao carregar unidades:", res?.message);
        }
      } catch (err) {
        console.error("Erro ao chamar getUnidades:", err);
      } finally {
        if (mounted) setLoadingUnidades(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Limpa entrada do valor (mantém dígitos e ponto/virgula)
  function handleValorChange(raw: string) {
    const cleaned = raw.replace(/[^0-9.,]/g, "").replace(",", ".");
    setValor(cleaned);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // validações básicas
    if (!descricao.trim()) {
      alert("Descrição é obrigatória.");
      return;
    }
    if (!unidade) {
      alert("Selecione uma unidade de medida.");
      return;
    }
    const parsed = Number(String(valor).replace(",", "."));
    if (Number.isNaN(parsed) || parsed < 0) {
      alert("Valor unitário inválido.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      descricao: descricao.trim(),
      unidade_medida_id_unidade_medida: String(unidade), // envia string (server converte para BigInt)
      valor_unitario: String(parsed.toFixed(2)),
    };

    startTransition(async () => {
      try {
        const res = await cadastrarProduto(payload);
        if (res?.success) {
          // limpar formulário e atualizar UI
          setDescricao("");
          setValor("0.00");
          // se ainda houver unidades, selecionar a primeira
          if (unidades.length > 0) setUnidade(unidades[0].id);
          // atualiza rota / lista (server action também chama revalidatePath)
          router.refresh();
          alert(res.message ?? "Produto cadastrado com sucesso.");
        } else {
          alert(res?.message ?? "Erro ao cadastrar produto.");
        }
      } catch (err) {
        console.error("Erro ao cadastrar produto:", err);
        alert("Erro inesperado ao cadastrar produto.");
      } finally {
        setIsSubmitting(false);
      }
    });
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-xl font-bold">Cadastro de Produto</h1>
          </div>

          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Input
                id="descricao"
                name="descricao"
                type="text"
                placeholder="Ex: Parafuso 3/8"
                required
                maxLength={45}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="unidade">Unidade de Medida</Label>
              <div className="flex gap-2 items-center">
                <div className="w-1/2">
                  <Select value={unidade} onValueChange={(v) => setUnidade(v)} disabled={loadingUnidades}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={loadingUnidades ? "Carregando..." : "Selecione a unidade"} />
                    </SelectTrigger>
                    <SelectContent>
                      {unidades.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {/* Exibe: [id] descricao_reduzida - descricao */}
                          {`${u.id} — ${u.descricao}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-1/2 text-sm text-muted-foreground">
                  <div>ID selecionado: <strong>{unidade || "—"}</strong></div>
                  <div className="mt-1">Ex: {unidades.length > 0 ? `${unidades[0].id} — ${unidades[0].descricao}` : "Nenhuma unidade"}</div>
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="valor_unitario">Valor unitário</Label>
              <Input
                id="valor_unitario"
                name="valor_unitario"
                type="text"
                placeholder="0.00"
                required
                value={valor}
                onChange={(e) => handleValorChange(e.target.value)}
                className="col-span-3"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setDescricao("");
                  setValor("0.00");
                  if (unidades.length > 0) setUnidade(unidades[0].id);
                }}
                disabled={isSubmitting || isPending}
              >
                Limpar
              </Button>
              <Button type="submit" disabled={isSubmitting || isPending}>
                {isSubmitting || isPending ? "Cadastrando..." : "Cadastrar Produto"}
              </Button>
            </div>
          </div>
        </div>
      </form>

      <div className="text-center text-xs text-muted-foreground">
        Desenvolvido por Lucas Mori
      </div>
    </div>
  );
}
