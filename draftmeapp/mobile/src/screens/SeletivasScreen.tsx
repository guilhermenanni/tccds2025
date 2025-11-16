import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, RefreshControl, SafeAreaView, ActivityIndicator, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { api } from '../api/client';
import SeletivaCard from '../components/SeletivaCard';
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
  time: {
    id_time: number;
    nm_time: string;
    img_time?: string | null;
  };
}

const SeletivasScreen = () => {
  const [data, setData] = useState<Seletiva[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  const fetchData = async () => {
    try {
      const response = await api.get('/seletivas');
      setData(response.data.data || []);
    } catch (e) {
      console.log('Erro ao carregar seletivas', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleInscrever = async (id_seletiva: number) => {
    if (!user || user.tipo !== 'usuario') {
      Alert.alert('Atenção', 'Apenas jogadores podem se inscrever em seletivas.');
      return;
    }

    try {
      await api.post(`/seletivas/${id_seletiva}/inscrever`);
      Alert.alert('Sucesso', 'Inscrição realizada com sucesso!');
    } catch (e) {
      console.log('Erro ao se inscrever', e);
      Alert.alert('Erro', 'Não foi possível realizar a inscrição.');
    }
  };

  const renderItem = ({ item }: { item: Seletiva }) => (
    <TouchableOpacity onPress={() => handleInscrever(item.id_seletiva)}>
      <SeletivaCard
        titulo={item.titulo}
        time={item.time.nm_time}
        cidade={item.cidade}
        data={item.data_seletiva}
        hora={item.hora}
        categoria={item.categoria}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Seletivas próximas</Text>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#22C55E" />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => String(item.id_seletiva)}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22C55E" />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.empty}>Nenhuma seletiva cadastrada.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default SeletivasScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    paddingTop: 8,
  },
  header: {
    color: '#F9FAFB',
    fontSize: 20,
    fontWeight: '700',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
  },
  empty: {
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
