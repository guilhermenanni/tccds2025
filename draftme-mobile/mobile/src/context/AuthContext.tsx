import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { api } from '../api/client';

type TipoUsuario = 'usuario' | 'time';

interface Usuario {
  id_usuario: number;
  nm_usuario: string;
  email_usuario: string;
  img_usuario?: string | null;
}

interface Time {
  id_time: number;
  nm_time: string;
  email_time: string;
  escudo_time?: string | null;
}

interface AuthContextType {
  token: string | null;
  user: Usuario | Time | null;

  tipoSelecionado: TipoUsuario;
  setTipoSelecionado: (tipo: TipoUsuario) => void;

  login: (credentials: { email: string; senha: string }) => Promise<void>;
  registerUsuario: (dados: {
    nm_usuario: string;
    email_usuario: string;
    senha_usuario: string;
    cpf_usuario: string;
    dt_nasc_usuario: string; // formato: YYYY-MM-DD
    tel_usuario: string;
  }) => Promise<void>;
  registerTime: (dados: {
    nm_time: string;
    email_time: string;
    senha_time: string;
    cnpj_time: string;
    tel_time: string;
  }) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<Usuario | Time | null>(null);
  const [tipoSelecionado, setTipoSelecionado] = useState<TipoUsuario>('usuario');
  const [loading, setLoading] = useState(false);

  // 🔑 Sempre que o token mudar, atualiza o header Authorization do axios
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const login = async ({ email, senha }: { email: string; senha: string }) => {
    setLoading(true);
    try {
      if (tipoSelecionado === 'usuario') {
        const response = await api.post('/auth/login/usuario', {
          email_usuario: email.trim().toLowerCase(),
          senha_usuario: senha,
        });

        const data = response.data;

        setToken(data.token);
        setUser({
          id_usuario: data.usuario.id_usuario,
          nm_usuario: data.usuario.nm_usuario,
          email_usuario: data.usuario.email_usuario,
          img_usuario: data.usuario.img_usuario ?? null,
        });
      } else {
        const response = await api.post('/auth/login/time', {
          email_time: email.trim().toLowerCase(),
          senha_time: senha,
        });

        const data = response.data;

        setToken(data.token);
        setUser({
          id_time: data.time.id_time,
          nm_time: data.time.nm_time,
          email_time: data.time.email_time,
          escudo_time: data.time.escudo_time ?? null,
        });
      }
    } catch (err: any) {
      console.error('Erro no login:', err?.response?.data || err.message);
      const mensagem =
        err?.response?.data?.message ||
        err?.response?.data?.erro ||
        'Erro ao fazer login. Verifique seus dados.';
      throw new Error(mensagem);
    } finally {
      setLoading(false);
    }
  };

  const registerUsuario: AuthContextType['registerUsuario'] = async (dados) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register/usuario', dados);
      const data = response.data;

      setToken(data.token);
      setUser({
        id_usuario: data.usuario.id_usuario,
        nm_usuario: data.usuario.nm_usuario,
        email_usuario: data.usuario.email_usuario,
        img_usuario: data.usuario.img_usuario ?? null,
      });
    } catch (err: any) {
      console.error('Erro ao registrar usuário:', err?.response?.data || err.message);
      const mensagem =
        err?.response?.data?.message ||
        err?.response?.data?.erro ||
        'Erro ao registrar jogador.';
      throw new Error(mensagem);
    } finally {
      setLoading(false);
    }
  };

  const registerTime: AuthContextType['registerTime'] = async (dados) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register/time', dados);
      const data = response.data;

      setToken(data.token);
      setUser({
        id_time: data.time.id_time,
        nm_time: data.time.nm_time,
        email_time: data.time.email_time,
        escudo_time: data.time.escudo_time ?? null,
      });
    } catch (err: any) {
      console.error('Erro ao registrar time:', err?.response?.data || err.message);
      const mensagem =
        err?.response?.data?.message ||
        err?.response?.data?.erro ||
        'Erro ao registrar time.';
      throw new Error(mensagem);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        tipoSelecionado,
        setTipoSelecionado,
        login,
        registerUsuario,
        registerTime,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
