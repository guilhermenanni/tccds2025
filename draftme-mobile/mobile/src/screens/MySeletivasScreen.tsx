// mobile/src/screens/MySeletivasScreen.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  StyleSheet,
  Alert,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

interface Seletiva {
  id_seletiva: number;
  titulo: string;
  sobre?: string | null;
  localizacao?: string | null;
  cidade?: string | null;
  data_seletiva?: string | null;
  data?: string | null; // fallback pra caso o backend mande "data"
  hora?: string | null;
  categoria?: string | null;
  subcategoria?: string | null;
  nm_time: string;
  img_time?: string | null;
}

interface Inscrito {
  id_inscricao: number;
  id_usuario: number;
  nm_usuario: string;
  email_usuario: string;
  tel_usuario?: string | null;
  img_usuario?: string | null;
  data_inscricao?: string | null;
  status?: string | null;
}

const MySeletivasScreen: React.FC = () => {
  const { token, tipoSelecionado } = useAuth();
  const ehTime = tipoSelecionado === 'time';
  const ehUsuario = tipoSelecionado === 'usuario';

  const [seletivas, setSeletivas] = useState<Seletiva[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [inscrevendoId, setInscrevendoId] = useState<number | null>(null);

  const [inscritosPorSeletiva, setInscritosPorSeletiva] = useState<
    Record<number, Inscrito[]>
  >({});
  const [carregandoInscritosId, setCarregandoInscritosId] = useState<number | null>(null);
  const [seletivaAbertaId, setSeletivaAbertaId] = useState<number | null>(null);

  const carregarSeletivas = async () => {
    if (!token) {
      setLoading(false);
      setSeletivas([]);
      return;
    }

    try {
      setLoading(true);

      const response = await api.get('/seletivas/minhas', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const lista: Seletiva[] = (response.data.data || []).map((item: any) => ({
        id_seletiva: item.id_seletiva,
        titulo: item.titulo,
        sobre: item.sobre ?? null,
        localizacao: item.localizacao ?? null,
        cidade: item.cidade ?? null,
        data_seletiva: item.data_seletiva ?? item.data ?? null,
        data: item.data ?? null,
        hora: item.hora ?? null,
        categoria: item.categoria ?? null,
        subcategoria: item.subcategoria ?? null,
        nm_time: item.nm_time,
        img_time: item.img_time ?? null,
      }));

      setSeletivas(lista);
    } catch (error: any) {
      console.log(
        'Erro ao carregar seletivas do usuário/time',
        error?.response?.data || error.message
      );
      Alert.alert(
        'Erro',
        'Não foi possível carregar suas seletivas. Tente novamente mais tarde.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    carregarSeletivas();
  }, [tipoSelecionado, token]);

  const onRefresh = () => {
    setRefreshing(true);
    carregarSeletivas();
  };

  const formatarDataBr = (valor?: string | null) => {
    if (!valor) return '';
    const d = new Date(valor);
    if (Number.isNaN(d.getTime())) return valor;
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const ano = d.getFullYear();
    return `${dia}/${mes}/${ano}`;
  };

  const handleCancelarInscricao = async (id_seletiva: number) => {
    if (!ehUsuario) return; // time não cancela inscrição
    if (!token) return;

    try {
      setInscrevendoId(id_seletiva);
      await api.delete(`/seletivas/${id_seletiva}/inscrever`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // remove da lista local
      setSeletivas((prev) => prev.filter((s) => s.id_seletiva !== id_seletiva));

      Alert.alert('Inscrição cancelada', 'Você saiu desta seletiva.');
    } catch (e: any) {
      console.log(
        'Erro ao cancelar inscrição:',
        e?.response?.data || e.message
      );
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.erro ||
        'Não foi possível cancelar a inscrição.';
      Alert.alert('Erro', msg);
    } finally {
      setInscrevendoId(null);
    }
  };

  const carregarInscritos = async (id_seletiva: number) => {
    if (!ehTime) return;
    if (!token) return;

    // se já está aberto, clicar de novo fecha
    if (seletivaAbertaId === id_seletiva && !carregandoInscritosId) {
      setSeletivaAbertaId(null);
      return;
    }

    try {
      setCarregandoInscritosId(id_seletiva);

      const response = await api.get(`/seletivas/${id_seletiva}/inscritos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const lista: Inscrito[] = (response.data.data || []).map((item: any) => ({
        id_inscricao: item.id_inscricao,
        id_usuario: item.id_usuario,
        nm_usuario: item.nm_usuario,
        email_usuario: item.email_usuario,
        data_inscricao: item.data_inscricao ?? null,
      }));

      setInscritosPorSeletiva((prev) => ({
        ...prev,
        [id_seletiva]: lista,
      }));

      setSeletivaAbertaId(id_seletiva);
    } catch (e: any) {
      console.log(
        'Erro ao carregar inscritos:',
        e?.response?.data || e.message
      );
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.erro ||
        'Não foi possível carregar os inscritos dessa seletiva.';
      Alert.alert('Erro', msg);
    } finally {
      setCarregandoInscritosId(null);
    }
  };

  const tituloTela = ehTime ? 'Seletivas do time' : 'Minhas seletivas';
  const textoVazio = ehTime
    ? 'Seu time ainda não criou nenhuma seletiva.'
    : 'Você ainda não está inscrito em nenhuma seletiva.';

  const renderItem = ({ item }: { item: Seletiva }) => {
    const dataBr =
      formatarDataBr(item.data_seletiva || item.data) || 'Data não informada';

    const inscritos = inscritosPorSeletiva[item.id_seletiva] || [];
    const aberta = seletivaAbertaId === item.id_seletiva;

    return (
      <View style={styles.card}>
        <Text style={styles.titulo}>{item.titulo}</Text>
        <Text style={styles.time}>{item.nm_time}</Text>
        <Text style={styles.info}>
          {item.localizacao || item.cidade || 'Local não informado'}
        </Text>
        <Text style={styles.info}>
          {dataBr}
          {item.hora ? ` • ${item.hora}` : ''}
        </Text>
        {!!item.categoria && (
          <Text style={styles.categoria}>{item.categoria}</Text>
        )}

        {!!item.sobre && (
          <Text style={styles.sobre} numberOfLines={3}>
            {item.sobre}
          </Text>
        )}

        {ehUsuario && (
          <TouchableOpacity
            style={[styles.button, styles.cancelarButton]}
            onPress={() => handleCancelarInscricao(item.id_seletiva)}
            disabled={inscrevendoId === item.id_seletiva}
          >
            {inscrevendoId === item.id_seletiva ? (
              <ActivityIndicator color="#F9FAFB" />
            ) : (
              <Text style={styles.buttonText}>Cancelar inscrição</Text>
            )}
          </TouchableOpacity>
        )}

        {ehTime && (
          <>
            <TouchableOpacity
              style={[styles.button, styles.inscritosButton]}
              onPress={() => carregarInscritos(item.id_seletiva)}
              disabled={carregandoInscritosId === item.id_seletiva}
            >
              {carregandoInscritosId === item.id_seletiva ? (
                <ActivityIndicator color="#F9FAFB" />
              ) : (
                <Text style={styles.buttonText}>
                  {aberta ? 'Esconder inscritos' : 'Ver inscritos'}
                </Text>
              )}
            </TouchableOpacity>

            {aberta && (
              <View style={styles.inscritosContainer}>
                {inscritos.length === 0 ? (
                  <Text style={styles.inscritoVazio}>
                    Nenhum jogador inscrito ainda.
                  </Text>
                ) : (
                  inscritos.map((inscrito) => (
                    <View
                      key={inscrito.id_inscricao}
                      style={styles.inscritoItem}
                    >
                      <Text style={styles.inscritoNome}>
                        {inscrito.nm_usuario}
                      </Text>
                      <Text style={styles.inscritoInfo}>
                        {inscrito.email_usuario}
                      </Text>
                      {inscrito.data_inscricao && (
                        <Text style={styles.inscritoInfo}>
                          Inscrito em:{' '}
                          {formatarDataBr(inscrito.data_inscricao)}
                        </Text>
                      )}
                    </View>
                  ))
                )}
              </View>
            )}
          </>
        )}
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator color="#e28e45" />
        </View>
      </SafeAreaView>
    );
  }

  if (!token) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>
            Faça login para ver {ehTime ? 'as seletivas do seu time.' : 'suas seletivas.'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{tituloTela}</Text>
      <FlatList
        data={seletivas}
        keyExtractor={(item) => String(item.id_seletiva)}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#e28e45"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{textoVazio}</Text>
          </View>
        }
        contentContainerStyle={
          seletivas.length === 0 ? { flexGrow: 1 } : undefined
        }
      />
    </SafeAreaView>
  );
};

export default MySeletivasScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#182d46ff',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#213e60',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#14263b',
    padding: 12,
    marginBottom: 10,
  },
  titulo: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  time: {
    color: '#e28e45',
    fontSize: 13,
    marginBottom: 4,
  },
  info: {
    color: '#E5E7EB',
    fontSize: 12,
  },
  categoria: {
    color: '#e28e45',
    fontSize: 12,
    marginTop: 4,
  },
  sobre: {
    color: '#E5E7EB',
    fontSize: 13,
    marginTop: 6,
  },
  button: {
    marginTop: 10,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelarButton: {
    backgroundColor: '#EF4444',
  },
  inscritosButton: {
    backgroundColor: '#2563EB',
  },
  buttonText: {
    color: '#F9FAFB',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyText: {
    color: '#9CA3AF',
    textAlign: 'center',
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  messageText: {
    color: '#9CA3AF',
    textAlign: 'center',
  },
  inscritosContainer: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1F2937',
  },
  inscritoItem: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  inscritoNome: {
    color: '#F9FAFB',
    fontSize: 13,
    fontWeight: '600',
  },
  inscritoInfo: {
    color: '#D1D5DB',
    fontSize: 12,
  },
  inscritoStatus: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 2,
  },
  inscritoVazio: {
    color: '#9CA3AF',
    fontSize: 12,
    fontStyle: 'italic',
  },
});
