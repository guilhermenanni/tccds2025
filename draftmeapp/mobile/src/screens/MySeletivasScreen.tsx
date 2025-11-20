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
} from 'react-native';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

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

const MySeletivasScreen: React.FC = () => {
  const { token, tipoSelecionado } = useAuth();
  const [seletivas, setSeletivas] = useState<Seletiva[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const ehUsuario = tipoSelecionado === 'usuario';

  const carregarMinhasSeletivas = async () => {
    if (!token || !ehUsuario) {
      setSeletivas([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await api.get('/seletivas/minhas', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSeletivas(res.data.data || []);
    } catch (e: any) {
      console.log(
        'Erro ao carregar minhas seletivas:',
        e?.response?.data || e.message
      );
      Alert.alert('Erro', 'Não foi possível carregar suas seletivas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarMinhasSeletivas();
  }, [token, tipoSelecionado]);

  const onRefresh = async () => {
    setRefreshing(true);
    await carregarMinhasSeletivas();
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

  const renderItem = ({ item }: { item: Seletiva }) => {
    return (
      <View style={styles.card}>
        <Text style={styles.titulo}>{item.titulo}</Text>
        <Text style={styles.time}>{item.nm_time}</Text>
        <Text style={styles.meta}>
          {item.cidade} • {formatarDataBr(item.data_seletiva)} • {item.hora}
        </Text>
        {item.categoria && (
          <Text style={styles.categoria}>{item.categoria}</Text>
        )}
        {item.sobre && (
          <Text style={styles.sobre} numberOfLines={4}>
            {item.sobre}
          </Text>
        )}
      </View>
    );
  };

  if (!ehUsuario) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.headerTitle}>Minhas seletivas</Text>
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>
            Faça login como jogador para ver suas seletivas.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#22C55E" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Minhas seletivas</Text>

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
            Você ainda não está inscrito em nenhuma seletiva.
          </Text>
        }
      />
    </SafeAreaView>
  );
};

export default MySeletivasScreen;

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
  sobre: {
    color: '#D1D5DB',
    fontSize: 13,
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
});
