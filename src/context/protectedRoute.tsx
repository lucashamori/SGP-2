"use client";

import React, { ReactNode, useEffect } from 'react'; // Import useEffect
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/authContext'; // Ajuste o caminho se necessário

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Só redireciona *depois* que o carregamento terminar E se não houver usuário.
    if (!loading && !user) {
      router.replace('/'); // Redireciona para a página de login
    }
  // Dependências: executa o efeito quando loading ou user mudarem
  }, [user, loading, router]);

  // CORREÇÃO: Removemos o retorno de 'null'. O componente AGORA SEMPRE renderiza os filhos.
  // Se o usuário não estiver logado após o carregamento, o useEffect cuidará
  // do redirecionamento, mas a estrutura visual (incluindo a sidebar)
  // não deve desaparecer durante esse processo.
  //
  // if (!loading && !user) {
  //  return null; // <-- Linha removida
  // }

  // Renderiza os filhos imediatamente, mantendo o layout visível durante o carregamento
  // e também quando o usuário está autenticado.
  return <>{children}</>;
};

export default ProtectedRoute;

