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
} from 'react-native';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

interface Seletiva {
  id_seletiva: number;
  titulo: string;
  sobre: string;
  cidade: string;
  estado: string;
  data: string;
  hora: string;
  nm_time: string;
  img_time?: string | null;
}

const MySeletivasScreen = () => {
  const { token, tipoSelecionado } = useAuth();
  const [seletivas, setSeletivas] = useState<Seletiva[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const ehTime = tipoSelecionado === 'time';

  const carregarSeletivas = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/seletivas/minhas', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const lista: Seletiva[] = (response.data.data || []).map((item: any) => ({
        id_seletiva: item.id_seletiva,
        titulo: item.titulo,
        sobre: item.sobre,
        cidade: item.cidade,
        estado: item.estado,
        data: item.data,
        hora: item.hora,
        nm_time: item.nm_time,
        img_time: item.img_time ?? null,
      }));

      setSeletivas(lista);
    } catch (error) {
      console.log('Erro ao carregar seletivas do usuário/time', error);
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
  }, [tipoSelecionado]);

  const onRefresh = () => {
    setRefreshing(true);
    carregarSeletivas();
  };

  const renderItem = ({ item }: { item: Seletiva }) => (
    <View style={styles.card}>
      <Text style={styles.titulo}>{item.titulo}</Text>
      <Text style={styles.subtitulo}>
        {item.cidade} - {item.estado}
      </Text>
      <Text style={styles.info}>
        {item.data} às {item.hora}
      </Text>
      <Text style={styles.time}>{item.nm_time}</Text>
      <Text style={styles.sobre} numberOfLines={3}>
        {item.sobre}
      </Text>
    </View>
  );

  const tituloTela = ehTime ? 'Seletivas do time' : 'Minhas seletivas';
  const textoVazio = ehTime
    ? 'Seu time ainda não criou nenhuma seletiva.'
    : 'Você ainda não está inscrito em nenhuma seletiva.';

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
    marginBottom: 4,
  },
  subtitulo: {
    color: '#E5E7EB',
    fontSize: 13,
    marginBottom: 2,
  },
  info: {
    color: '#9CA3AF',
    fontSize: 12,
    marginBottom: 2,
  },
  time: {
    color: '#e28e45',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  sobre: {
    color: '#E5E7EB',
    fontSize: 13,
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
});
