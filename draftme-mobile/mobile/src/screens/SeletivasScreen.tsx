import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  SafeAreaView,
  ActivityIndicator,
  StyleSheet,
  Alert,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Seletiva {
  id_seletiva: number;
  titulo: string;
  sobre?: string | null;
  localizacao?: string | null;
  cidade: string;
  data_seletiva: string;
  hora: string;
  categoria?: string | null;
  subcategoria?: string | null;
  nm_time: string;
}

const SeletivasScreen: React.FC = () => {
  const { tipoSelecionado, token } = useAuth();
  const [seletivas, setSeletivas] = useState<Seletiva[]>([]);
  const [inscritasIds, setInscritasIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [inscrevendoId, setInscrevendoId] = useState<number | null>(null);
  const [expandidaId, setExpandidaId] = useState<number | null>(null);

  const ehUsuario = tipoSelecionado === 'usuario';

  const carregarSeletivas = async () => {
    try {
      setLoading(true);
      const [todasRes, minhasRes] = await Promise.all([
        api.get('/seletivas'),
        ehUsuario && token
          ? api.get('/seletivas/minhas', {
              headers: { Authorization: `Bearer ${token}` },
            })
          : Promise.resolve({ data: { data: [] } }),
      ]);

      setSeletivas(todasRes.data.data || []);

      if (ehUsuario && minhasRes && minhasRes.data?.data) {
        const ids = (minhasRes.data.data as Seletiva[]).map(
          (s) => s.id_seletiva
        );
        setInscritasIds(ids);
      } else {
        setInscritasIds([]);
      }
    } catch (e: any) {
      console.log('Erro ao carregar seletivas:', e?.response?.data || e.message);
      Alert.alert('Erro', 'Não foi possível carregar as seletivas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarSeletivas();
  }, [tipoSelecionado, token]);

  const onRefresh = async () => {
    setRefreshing(true);
    await carregarSeletivas();
    setRefreshing(false);
  };

  const formatarDataBr = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const ano = d.getFullYear();
    return `${dia}/${mes}/${ano}`;
  };

  const estaInscrito = (id: number) => inscritasIds.includes(id);

  const handleInscrever = async (id_seletiva: number) => {
    if (!ehUsuario) {
      Alert.alert('Atenção', 'Apenas jogadores podem se inscrever em seletivas.');
      return;
    }
    if (!token) {
      Alert.alert('Atenção', 'Você precisa estar logado para se inscrever.');
      return;
    }

    try {
      setInscrevendoId(id_seletiva);
      await api.post(
        `/seletivas/${id_seletiva}/inscrever`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      LayoutAnimation.easeInEaseOut();
      setInscritasIds((prev) => [...prev, id_seletiva]);
      Alert.alert('Inscrição feita', 'Você se inscreveu nesta seletiva!');
    } catch (e: any) {
      console.log('Erro ao se inscrever na seletiva:', e?.response?.data || e.message);
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.erro ||
        'Não foi possível realizar a inscrição.';
      Alert.alert('Erro', msg);
    } finally {
      setInscrevendoId(null);
    }
  };

  const handleCancelarInscricao = async (id_seletiva: number) => {
    if (!ehUsuario) return;
    if (!token) return;

    try {
      setInscrevendoId(id_seletiva);
      await api.delete(`/seletivas/${id_seletiva}/inscrever`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      LayoutAnimation.easeInEaseOut();
      setInscritasIds((prev) => prev.filter((id) => id !== id_seletiva));
      Alert.alert('Inscrição cancelada', 'Você saiu desta seletiva.');
    } catch (e: any) {
      console.log('Erro ao cancelar inscrição:', e?.response?.data || e.message);
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.erro ||
        'Não foi possível cancelar a inscrição.';
      Alert.alert('Erro', msg);
    } finally {
      setInscrevendoId(null);
    }
  };

  const toggleExpandir = (id_seletiva: number) => {
    LayoutAnimation.easeInEaseOut();
    setExpandidaId((prev) => (prev === id_seletiva ? null : id_seletiva));
  };

  const renderItem = ({ item }: { item: Seletiva }) => {
    const inscrito = estaInscrito(item.id_seletiva);
    const expandida = expandidaId === item.id_seletiva;

    return (
      <View style={styles.card}>
        <TouchableOpacity onPress={() => toggleExpandir(item.id_seletiva)}>
          <Text style={styles.titulo}>{item.titulo}</Text>
          <Text style={styles.time}>{item.nm_time}</Text>
          <Text style={styles.meta}>
            {item.cidade} • {formatarDataBr(item.data_seletiva)} • {item.hora}
          </Text>
          {item.categoria && (
            <Text style={styles.categoria}>{item.categoria}</Text>
          )}
        </TouchableOpacity>

        {expandida && (
          <View style={styles.detalhes}>
            {item.sobre && (
              <Text style={styles.sobre}>{item.sobre}</Text>
            )}
            {item.localizacao && (
              <Text style={styles.local}>
                Local: <Text style={styles.localValor}>{item.localizacao}</Text>
              </Text>
            )}
            {item.subcategoria && (
              <Text style={styles.local}>
                Tipo:{' '}
                <Text style={styles.localValor}>{item.subcategoria}</Text>
              </Text>
            )}
          </View>
        )}

        {ehUsuario && (
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[
                styles.buttonSecundario,
                expandida && styles.buttonSecundarioAtivo,
              ]}
              onPress={() => toggleExpandir(item.id_seletiva)}
            >
              <Text style={styles.buttonSecundarioText}>
                {expandida ? 'Ocultar detalhes' : 'Ver detalhes'}
              </Text>
            </TouchableOpacity>

            {inscrito ? (
              <TouchableOpacity
                style={[styles.inscreverButton, styles.cancelarButton]}
                onPress={() => handleCancelarInscricao(item.id_seletiva)}
                disabled={inscrevendoId === item.id_seletiva}
              >
                {inscrevendoId === item.id_seletiva ? (
                  <ActivityIndicator color="#F9FAFB" />
                ) : (
                  <Text style={styles.inscreverText}>Cancelar inscrição</Text>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.inscreverButton}
                onPress={() => handleInscrever(item.id_seletiva)}
                disabled={inscrevendoId === item.id_seletiva}
              >
                {inscrevendoId === item.id_seletiva ? (
                  <ActivityIndicator color="#F9FAFB" />
                ) : (
                  <Text style={styles.inscreverText}>Inscrever-se</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}

        {!ehUsuario && expandida && (
          <Text style={styles.infoTime}>
            (Faça login como jogador para se inscrever)
          </Text>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#22C55E" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Seletivas</Text>

      <FlatList
        data={seletivas}
        keyExtractor={(item) => item.id_seletiva.toString()}
        renderItem={renderItem}
        contentContainerStyle={
          seletivas.length === 0 ? styles.emptyContainer : { paddingBottom: 24 }
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#22C55E"
          />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Nenhuma seletiva disponível no momento.
          </Text>
        }
      />
    </SafeAreaView>
  );
};

export default SeletivasScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  headerTitle: {
    color: '#F9FAFB',
    fontSize: 20,
    fontWeight: '700',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#0B1120',
    borderRadius: 16,
    padding: 14,
  },
  titulo: {
    color: '#F9FAFB',
    fontSize: 16,
    fontWeight: '700',
  },
  time: {
    color: '#E5E7EB',
    fontSize: 14,
    marginTop: 2,
  },
  meta: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 4,
  },
  categoria: {
    color: '#38BDF8',
    fontSize: 12,
    marginTop: 2,
  },
  detalhes: {
    marginTop: 8,
  },
  sobre: {
    color: '#D1D5DB',
    fontSize: 13,
    marginBottom: 4,
  },
  local: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  localValor: {
    color: '#E5E7EB',
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 8,
  },
  buttonSecundario: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#374151',
    paddingVertical: 8,
    alignItems: 'center',
  },
  buttonSecundarioAtivo: {
    backgroundColor: '#111827',
  },
  buttonSecundarioText: {
    color: '#E5E7EB',
    fontSize: 13,
  },
  inscreverButton: {
    flex: 1,
    backgroundColor: '#22C55E',
    borderRadius: 999,
    paddingVertical: 8,
    alignItems: 'center',
  },
  cancelarButton: {
    backgroundColor: '#EF4444',
  },
  inscreverText: {
    color: '#F9FAFB',
    fontSize: 13,
    fontWeight: '600',
  },
  infoTime: {
    color: '#6B7280',
    fontSize: 11,
    marginTop: 8,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyText: {
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
