"use client";

import React, { useState, useEffect, useContext, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase'; // Importa sua instância de auth
import { AuthContext } from './authContext';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Estado inicial de carregamento

  useEffect(() => {
    // Listener do Firebase que é chamado quando o estado de auth muda (login/logout)
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Atualiza o estado do usuário
      setLoading(false);    // Marca que o carregamento inicial terminou
      console.log("Auth State Changed:", currentUser ? currentUser.email : "No user");
    });

    // Limpa o listener quando o componente é desmontado
    return () => unsubscribe();
  }, []); // Roda apenas uma vez na montagem

  // Fornece o estado (user, loading) para os componentes filhos
  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
