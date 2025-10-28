"use client";

import { createContext, useContext } from 'react';
import { User } from 'firebase/auth'; // Tipo do usuário do Firebase

// Define a estrutura do contexto de autenticação
interface AuthContextType {
  user: User | null;         // O objeto do usuário do Firebase (ou null se deslogado)
  loading: boolean;          // Indica se o estado de autenticação ainda está carregando
}

// Cria o contexto com valores padrão
export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true, // Começa como true até o Firebase verificar o estado
});

// Hook customizado para facilitar o uso do contexto
export const useAuth = () => {
  return useContext(AuthContext);
};
