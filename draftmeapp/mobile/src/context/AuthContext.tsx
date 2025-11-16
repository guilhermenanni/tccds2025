import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api/client';
import axios from 'axios';

type UserType = 'usuario' | 'time';

interface AuthUser {
  id: number;
  nome: string;
  email: string;
  tipo: UserType;
  avatar?: string | null;
}

interface AuthContextData {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  tipoSelecionado: UserType;
  setTipoSelecionado: (tipo: UserType) => void;
  login: (params: { email: string; senha: string }) => Promise<void>;
  registerUsuario: (payload: any) => Promise<void>;
  registerTime: (payload: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tipoSelecionado, setTipoSelecionado] = useState<UserType>('usuario');

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('@draftme:token');
        const storedUser = await AsyncStorage.getItem('@draftme:user');
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
      } catch (e) {
        console.log('Erro ao carregar auth:', e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const login = async ({ email, senha }: { email: string; senha: string }) => {
    const path =
      tipoSelecionado === 'usuario'
        ? '/auth/login/usuario'
        : '/auth/login/time';

    const payload =
      tipoSelecionado === 'usuario'
        ? { email_usuario: email, senha_usuario: senha }
        : { email_time: email, senha_time: senha };

    try {
      const response = await api.post(path, payload);
      const data = response.data;
      const raw = data.usuario || data.time;

      const authUser: AuthUser = {
        id: raw.id_usuario || raw.id_time,
        nome: raw.nm_usuario || raw.nm_time,
        email: raw.email_usuario || raw.email_time,
        tipo: tipoSelecionado,
        avatar: raw.img_usuario || raw.img_time || null,
      };

      setUser(authUser);
      setToken(data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

      await AsyncStorage.setItem('@draftme:token', data.token);
      await AsyncStorage.setItem('@draftme:user', JSON.stringify(authUser));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Erro ao fazer login');
      }
      throw new Error('Erro ao fazer login');
    }
  };

  const registerUsuario = async (payload: any) => {
    try {
      const response = await api.post('/auth/register/usuario', payload);
      const data = response.data;
      const raw = data.usuario;

      const authUser: AuthUser = {
        id: raw.id_usuario,
        nome: raw.nm_usuario,
        email: raw.email_usuario,
        tipo: 'usuario',
        avatar: raw.img_usuario || null,
      };

      setUser(authUser);
      setToken(data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

      await AsyncStorage.setItem('@draftme:token', data.token);
      await AsyncStorage.setItem('@draftme:user', JSON.stringify(authUser));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Erro ao cadastrar jogador');
      }
      throw new Error('Erro ao cadastrar jogador');
    }
  };

  const registerTime = async (payload: any) => {
    try {
      const response = await api.post('/auth/register/time', payload);
      const data = response.data;
      const raw = data.time;

      const authUser: AuthUser = {
        id: raw.id_time,
        nome: raw.nm_time,
        email: raw.email_time,
        tipo: 'time',
        avatar: raw.img_time || null,
      };

      setUser(authUser);
      setToken(data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

      await AsyncStorage.setItem('@draftme:token', data.token);
      await AsyncStorage.setItem('@draftme:user', JSON.stringify(authUser));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Erro ao cadastrar time');
      }
      throw new Error('Erro ao cadastrar time');
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    delete api.defaults.headers.common['Authorization'];
    await AsyncStorage.removeItem('@draftme:token');
    await AsyncStorage.removeItem('@draftme:user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        tipoSelecionado,
        setTipoSelecionado,
        login,
        registerUsuario,
        registerTime,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
