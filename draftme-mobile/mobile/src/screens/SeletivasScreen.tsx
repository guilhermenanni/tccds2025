// mobile/src/screens/SeletivasScreen.tsx

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
  img_time?: string | null;
}

const SeletivasScreen: React.FC = () => {
  const { token, tipoSelecionado } = useAuth();
  const ehUsuario = tipoSelecionado === 'usuario';

  const [seletivas, setSeletivas] = useState<Seletiva[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [expandidaId, setExpandidaId] = useState<number | null>(null);
  const [inscritasIds, setInscritasIds] = useState<number[]>([]);
  const [inscrevendoId, setInscrevendoId] = useState<number | null>(null);

  const [filtroCategoria, setFiltroCategoria] = useState<string | null>(null);

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

      const todas: Seletiva[] = todasRes.data?.data || [];
      setSeletivas(todas);

      if (ehUsuario && minhasRes && minhasRes.data?.data) {
        const ids = (minhasRes.data.data as any[]).map(
          (s) => s.id_seletiva as number
        );
        setInscritasIds(ids);
      } else {
        setInscritasIds([]);
      }
    } catch (e: any) {
      console.log(
        'Erro ao carregar seletivas:',
        e?.response?.data || e.message
      );
      Alert.alert('Erro', 'Não foi possível carregar as seletivas.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    carregarSeletivas();
  }, [tipoSelecionado, token]);

  const onRefresh = async () => {
    setRefreshing(true);
    await carregarSeletivas();
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
      console.log(
        'Erro ao se inscrever na seletiva:',
        e?.response?.data || e.message
      );
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

  const toggleExpandir = (id_seletiva: number) => {
    LayoutAnimation.easeInEaseOut();
    setExpandidaId((prev) => (prev === id_seletiva ? null : id_seletiva));
  };

  const categorias = Array.from(
    new Set(
      seletivas
        .map((s) => s.categoria)
        .filter((c): c is string => !!c && c.trim().length > 0)
    )
  );

  const seletivasFiltradas = filtroCategoria
    ? seletivas.filter((s) => s.categoria === filtroCategoria)
    : seletivas;

  const renderItem = ({ item }: { item: Seletiva }) => {
    const expandida = expandidaId === item.id_seletiva;
    const inscrito = estaInscrito(item.id_seletiva);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => toggleExpandir(item.id_seletiva)}
      >
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.titulo}>{item.titulo}</Text>
            <Text style={styles.time}>{item.nm_time}</Text>
            <Text style={styles.meta}>
              {item.cidade} • {formatarDataBr(item.data_seletiva)} • {item.hora}
            </Text>
            {!!item.categoria && (
              <Text style={styles.categoria}>{item.categoria}</Text>
            )}
          </View>
        </View>

        {expandida && (
          <View style={styles.detalhes}>
            {!!item.sobre && <Text style={styles.sobre}>{item.sobre}</Text>}
            {!!item.localizacao && (
              <Text style={styles.local}>
                Local:{' '}
                <Text style={styles.localValor}>{item.localizacao}</Text>
              </Text>
            )}
            {!!item.subcategoria && (
              <Text style={styles.local}>
                Tipo:{' '}
                <Text style={styles.localValor}>{item.subcategoria}</Text>
              </Text>
            )}

            {ehUsuario ? (
              <View style={styles.actionsRow}>
                {inscrito ? (
                  <TouchableOpacity
                    style={[styles.inscreverButton, styles.cancelarButton]}
                    onPress={() => handleCancelarInscricao(item.id_seletiva)}
                    disabled={inscrevendoId === item.id_seletiva}
                  >
                    {inscrevendoId === item.id_seletiva ? (
                      <ActivityIndicator color="#F9FAFB" />
                    ) : (
                      <Text style={styles.inscreverText}>
                        Cancelar inscrição
                      </Text>
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
            ) : (
              <Text style={styles.infoTime}>
                (Faça login como jogador para se inscrever)
              </Text>
            )}
          </View>
        )}

        {!expandida && (
          <Text style={styles.verMais}>Toque para ver mais detalhes...</Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderFiltroCategoria = () => {
    if (!categorias.length) return null;

    return (
      <View style={styles.filtrosContainer}>
        <Text style={styles.filtrosLabel}>Filtrar por categoria:</Text>
        <View style={styles.filtrosRow}>
          <TouchableOpacity
            style={[
              styles.filtroChip,
              !filtroCategoria && styles.filtroChipAtivo,
            ]}
            onPress={() => setFiltroCategoria(null)}
          >
            <Text style={styles.filtroChipTexto}>Todas</Text>
          </TouchableOpacity>
          {categorias.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.filtroChip,
                filtroCategoria === cat && styles.filtroChipAtivo,
              ]}
              onPress={() => setFiltroCategoria(cat)}
            >
              <Text style={styles.filtroChipTexto}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#e28e45" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Seletivas disponíveis</Text>
      {renderFiltroCategoria()}
      <FlatList
        data={seletivasFiltradas}
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
            <Text style={styles.emptyText}>
              Nenhuma seletiva disponível no momento.
            </Text>
          </View>
        }
        contentContainerStyle={
          seletivasFiltradas.length === 0 ? { flexGrow: 1 } : undefined
        }
      />
    </SafeAreaView>
  );
};

export default SeletivasScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#182d46ff',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#F9FAFB',
    fontSize: 20,
    fontWeight: '700',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  card: {
    backgroundColor: '#213e60',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#14263b',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titulo: {
    color: '#F9FAFB',
    fontSize: 16,
    fontWeight: '600',
  },
  time: {
    color: '#e28e45',
    fontSize: 13,
    marginTop: 2,
  },
  meta: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 4,
  },
  categoria: {
    color: '#e28e45',
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
  },
  inscreverButton: {
    flex: 1,
    backgroundColor: '#e28e45',
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
    marginTop: 8,
    color: '#9CA3AF',
    fontSize: 12,
  },
  verMais: {
    color: '#6B7280',
    fontSize: 11,
    marginTop: 8,
  },
  filtrosContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filtrosLabel: {
    color: '#E5E7EB',
    fontSize: 13,
    marginBottom: 4,
  },
  filtrosRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filtroChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#374151',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  filtroChipAtivo: {
    backgroundColor: '#213e60',
    borderColor: '#e28e45',
  },
  filtroChipTexto: {
    color: '#E5E7EB',
    fontSize: 12,
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
