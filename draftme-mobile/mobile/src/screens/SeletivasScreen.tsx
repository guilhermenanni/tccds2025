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

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
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
  const { token } = useAuth();
  const [seletivas, setSeletivas] = useState<Seletiva[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [inscrevendoId, setInscrevendoId] = useState<number | null>(null);
  const [filtroCategoria, setFiltroCategoria] = useState<string | null>(null);

  const carregarSeletivas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/seletivas');
      setSeletivas(response.data.data || []);
    } catch (error) {
      console.log('Erro ao carregar seletivas:', error);
      Alert.alert(
        'Erro',
        'Não foi possível carregar as seletivas. Tente novamente.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    carregarSeletivas();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    carregarSeletivas();
  };

  const handleToggleExpand = (id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleInscrever = async (id_seletiva: number) => {
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
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert('Sucesso', 'Inscrição realizada com sucesso!');
    } catch (error: any) {
      console.log('Erro ao inscrever:', error?.response?.data || error.message);
      Alert.alert(
        'Erro',
        error?.response?.data?.message ||
          'Não foi possível realizar a inscrição.'
      );
    } finally {
      setInscrevendoId(null);
    }
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

  const renderSeletiva = ({ item }: { item: Seletiva }) => {
    const expanded = expandedId === item.id_seletiva;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => handleToggleExpand(item.id_seletiva)}
      >
        <View style={styles.rowBetween}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={styles.titulo}>{item.titulo}</Text>
            <Text style={styles.time}>{item.nm_time}</Text>
            <Text style={styles.infoLinha}>
              {item.cidade} • {item.data_seletiva} • {item.hora}
            </Text>
            {!!item.categoria && (
              <Text style={styles.categoria}>{item.categoria}</Text>
            )}
          </View>
        </View>

        {expanded && (
          <View style={styles.detalhes}>
            {!!item.sobre && (
              <Text style={styles.sobre}>{item.sobre}</Text>
            )}
            {!!item.localizacao && (
              <Text style={styles.local}>
                Local: <Text style={styles.localValor}>{item.localizacao}</Text>
              </Text>
            )}

            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[
                  styles.buttonPrimario,
                  inscrevendoId === item.id_seletiva && styles.buttonDisabled,
                ]}
                onPress={() => handleInscrever(item.id_seletiva)}
                disabled={inscrevendoId === item.id_seletiva}
              >
                {inscrevendoId === item.id_seletiva ? (
                  <ActivityIndicator color="#F9FAFB" />
                ) : (
                  <Text style={styles.inscreverText}>Inscrever-se</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {!expanded && (
          <Text style={styles.verMais}>
            Toque para ver mais detalhes...
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderFiltroCategoria = () => {
    if (!categorias.length) {
      return null;
    }

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
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#e28e45" />
        </View>
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
        renderItem={renderSeletiva}
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
    backgroundColor: '#213e60',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#14263b',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  infoLinha: {
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
    gap: 8,
  },
  buttonPrimario: {
    flex: 1,
    backgroundColor: '#e28e45',
    borderRadius: 999,
    paddingVertical: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  cancelarButton: {
    backgroundColor: '#EF4444',
  },
  inscreverText: {
    color: '#F9FAFB',
    fontSize: 13,
    fontWeight: '600',
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
