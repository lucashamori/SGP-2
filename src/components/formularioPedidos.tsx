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
import { cadastrarPedido, getClientes, getProdutos } from "@/actions/pedido";

// CORREÇÃO: Tipo 'Cliente' agora inclui todas as chaves
type Cliente = {
  id_cliente: string;
  nome_reduzido: string;
  empresa_id_empresa: string;
  tipo_cliente_id_tipo_cliente: string;
};

// CORREÇÃO: Tipo 'Produto' agora inclui todas as chaves
type Produto = {
  id_produto: string;
  descricao: string;
  valor_unitario: string;
  unidade_medida_id_unidade_medida: string;
  qtd_produto?: number; // opcional — se vier do estoque
};

export function FormularioPedido({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const router = useRouter();

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);

  // Os 'Selecionados' guardam apenas o ID principal (string)
  const [clienteSelecionado, setClienteSelecionado] = useState<string>("");
  const [produtoSelecionado, setProdutoSelecionado] = useState<string>("");

  const [valorUnitario, setValorUnitario] = useState<string>("0.00");
  const [quantidade, setQuantidade] = useState<string>("0");
  const [valorTotal, setValorTotal] = useState<string>("0.00");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [loadingClientes, setLoadingClientes] = useState(true);
  const [loadingProdutos, setLoadingProdutos] = useState(true);

  // 📦 Carrega clientes (sem alterações)
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingClientes(true);
      try {
        const res = await getClientes();
        if (!mounted) return;
        if (res?.success) setClientes(res.data || []);
      } catch (err) {
        console.error("Erro ao carregar clientes:", err);
      } finally {
        if (mounted) setLoadingClientes(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // 📦 Carrega produtos (sem alterações)
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingProdutos(true);
      try {
        const res = await getProdutos();
        if (!mounted) return;
        if (res?.success) setProdutos(res.data || []);
      } catch (err) {
        console.error("Erro ao carregar produtos:", err);
      } finally {
        if (mounted) setLoadingProdutos(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // 🎯 Atualiza valor unitário ao mudar produto (sem alterações)
  useEffect(() => {
    if (produtoSelecionado) {
      const p = produtos.find((x) => x.id_produto === produtoSelecionado);
      if (p) {
        setValorUnitario(Number(p.valor_unitario).toFixed(2));
      }
    }
  }, [produtoSelecionado, produtos]); // Adicionado 'produtos' à dependência

  // 🔢 Atualiza valor total dinamicamente (sem alterações)
  useEffect(() => {
    const qtd = Number(quantidade);
    const valor = Number(valorUnitario);
    if (!isNaN(qtd) && !isNaN(valor)) {
      setValorTotal((qtd * valor).toFixed(2));
    }
  }, [quantidade, valorUnitario]);

  function handleQuantidadeChange(raw: string) {
    const cleaned = raw.replace(/[^0-9]/g, "");
    setQuantidade(cleaned || "0");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // --- CORREÇÃO: Encontra os objetos completos ---
    const cliente = clientes.find((c) => c.id_cliente === clienteSelecionado);
    const produto = produtos.find((p) => p.id_produto === produtoSelecionado);

    if (!cliente) {
      alert("Cliente inválido ou não selecionado.");
      return;
    }

    if (!produto) {
      alert("Produto inválido ou não selecionado.");
      return;
    }

    const qtd = Number(quantidade);
    const valor = Number(valorUnitario);

    if (qtd <= 0 || isNaN(qtd)) {
      alert("Quantidade inválida.");
      return;
    }

    // ⚠️ Verifica se há estoque (sem alterações)
    if (produto.qtd_produto && qtd > produto.qtd_produto) {
      alert(`Quantidade ultrapassa o estoque (${produto.qtd_produto}).`);
      return;
    }

    // --- CORREÇÃO: Constrói o payload com TODAS as chaves ---
    const payload = {
      // Chaves do Cliente
      cliente_id_cliente: cliente.id_cliente,
      cliente_empresa_id_empresa: cliente.empresa_id_empresa,
      cliente_tipo_cliente_id_tipo_cliente: cliente.tipo_cliente_id_tipo_cliente,

      // Chaves do Produto
      produto_id_produto: produto.id_produto,
      produto_unidade_medida_id_unidade_medida: produto.unidade_medida_id_unidade_medida,

      // Chave da Empresa (a FK direta em 'pedido')
      // Assumindo que a empresa do pedido é a empresa do cliente
      empresa_id_empresa: cliente.empresa_id_empresa,

      // Dados do Item
      qtd_comprada_item: qtd,
      valor_total_item: (qtd * valor).toFixed(2),
    };
    // --------------------------------------------------------

    setIsSubmitting(true);

    startTransition(async () => {
      try {
        // Envia o payload (Objeto JS), não um FormData
        const res = await cadastrarPedido(payload); 
        if (res?.success) {
          alert(res.message ?? "Pedido cadastrado com sucesso!");
          setClienteSelecionado("");
          setProdutoSelecionado("");
          setQuantidade("0");
          setValorTotal("0.00");
          setValorUnitario("0.00");
          router.refresh();
        } else {
          alert(res?.message ?? "Erro ao cadastrar pedido.");
        }
      } catch (err) {
        console.error(err);
        alert("Erro inesperado ao cadastrar pedido.");
      } finally {
        setIsSubmitting(false);
      }
    });
  }


  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <h1 className="text-xl font-bold text-center">Cadastro de Pedido</h1>

        {/* Cliente */}
            <div className="grid gap-2">
            <Label htmlFor="cliente">Cliente</Label>
            <Select 
                value={clienteSelecionado}
                onValueChange={setClienteSelecionado}
                disabled={loadingClientes}
            >
                <SelectTrigger className="w-full">
                <SelectValue
                    placeholder={loadingClientes ? "Carregando clientes..." : "Selecione o cliente"}
                />
                </SelectTrigger>
                <SelectContent>
                {clientes.map((c) => (
                    <SelectItem key={c.id_cliente} value={String(c.id_cliente)}>
                    {c.nome_reduzido}
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
            </div>

            {/* Produto */}
            <div className="grid gap-2">
            <Label htmlFor="produto">Produto</Label>
            <Select
                value={produtoSelecionado}
                onValueChange={setProdutoSelecionado}
                disabled={loadingProdutos}
            >
                <SelectTrigger className="w-full">
                <SelectValue
                    placeholder={loadingProdutos ? "Carregando produtos..." : "Selecione o produto"}
                />
                </SelectTrigger>
                <SelectContent>
                {produtos.map((p) => (
                    <SelectItem key={p.id_produto} value={String(p.id_produto)}>
                    {`${p.descricao} `}
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
            </div>

        {/* Quantidade e valor */}
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="quantidade">Quantidade</Label>
            <Input
              id="quantidade"
              type="text"
              value={quantidade}
              onChange={(e) => handleQuantidadeChange(e.target.value)}
              placeholder="0"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="valor_unitario">Valor Unitário (R$)</Label>
            <Input id="valor_unitario" type="text" value={valorUnitario} disabled />
          </div>
        </div>

        {/* Valor total */}
        <div className="grid gap-2">
          <Label htmlFor="valor_total">Valor Total (R$)</Label>
          <Input id="valor_total" type="text" value={valorTotal} disabled />
        </div>

        {/* Botão */}
        <div className="pt-2">
          <Button className="w-full" type="submit" disabled={isSubmitting || isPending}>
            {isSubmitting || isPending ? "Cadastrando..." : "Cadastrar Pedido"}
          </Button>
        </div>
      </form>
    </div>
  );
}
