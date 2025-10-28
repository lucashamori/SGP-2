"use client"; // Necessário para usar hooks como useState e useRouter

import { useState } from "react";
import { useRouter } from "next/navigation"; // Para redirecionamento
import { signInWithEmailAndPassword } from "firebase/auth"; // Função de login do Firebase
import { auth } from "@/lib/firebase"; // Importa a instância de auth configurada
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null); // Para mostrar mensagens de erro
  const [isLoading, setIsLoading] = useState(false); // Para feedback no botão
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Previne o recarregamento padrão da página
    setError(null); // Limpa erros anteriores
    setIsLoading(true);

    try {
      // Tenta fazer login com o Firebase Auth
      await signInWithEmailAndPassword(auth, email, password);
      
      // Sucesso! Redireciona para o dashboard ou página principal
      router.push("/dashboard"); // Ajuste a rota se necessário

    } catch (firebaseError: any) {
      // Trata erros comuns do Firebase Auth
      console.error("Erro de login:", firebaseError);
      if (firebaseError.code === 'auth/invalid-credential' || firebaseError.code === 'auth/user-not-found' || firebaseError.code === 'auth/wrong-password') {
        setError("E-mail ou senha inválidos.");
      } else if (firebaseError.code === 'auth/invalid-email') {
         setError("Formato de e-mail inválido.");
      }
       else {
        setError("Ocorreu um erro ao fazer login. Tente novamente.");
      }
      setIsLoading(false); // Libera o botão em caso de erro
    }
    // Não precisa de finally aqui, pois o redirecionamento já acontece no sucesso
  };

  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Entre na sua conta</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Entre com o seu email para acessar sua conta
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@exemplo.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)} // Atualiza o estado do email
            disabled={isLoading}
          />
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Senha</Label>
            {/* Link Esqueceu Senha (funcionalidade a implementar separadamente) */}
            <a href="#" className="ml-auto text-sm underline-offset-4 hover:underline">
              Esqueceu sua senha?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)} // Atualiza o estado da senha
            disabled={isLoading}
          />
        </div>

        {/* Mostra mensagem de erro, se houver */}
        {error && <p className="text-sm font-medium text-red-500">{error}</p>}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Entrando..." : "Entrar"} {/* Feedback visual no botão */}
        </Button>
        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          {/* Linha divisória ou texto "OU" podem ir aqui se houver outros métodos de login */}
        </div>
        {/* Botão de login com Google (exemplo, funcionalidade a implementar separadamente)
        <Button variant="outline" className="w-full" type="button" disabled={isLoading}>
          Entrar com Google
        </Button>
        */}
      </div>
      <div className="text-center text-sm text-muted-foreground">
        Desenvolvido por Lucas Mori
      </div>
    </form>
  );
}
