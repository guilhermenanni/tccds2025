import React, { createContext, useContext, useState } from 'react';

// Define o tipo de dados que o AuthContext vai gerenciar
interface AuthContextType {
  login: (credentials: { email: string, senha: string }) => Promise<void>;
  tipoSelecionado: 'usuario' | 'time';
  setTipoSelecionado: (tipo: 'usuario' | 'time') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC = ({ children }) => {
  const [tipoSelecionado, setTipoSelecionado] = useState<'usuario' | 'time'>('usuario');

  const login = async ({ email, senha }: { email: string; senha: string }) => {
    // Lógica de login aqui, usando o `email` e `senha`
    // Você pode integrar a lógica com a API de login do seu backend
    console.log('Login', { email, senha });
  };

  return (
    <AuthContext.Provider value={{ login, tipoSelecionado, setTipoSelecionado }}>
      {children}
    </AuthContext.Provider>
  );
};
