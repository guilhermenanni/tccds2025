import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, RefreshControl, SafeAreaView, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { api } from '../api/client';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';

interface Postagem {
  id_postagem: number;
  texto_postagem: string;
  img_postagem?: string | null;
  categoria?: string | null;
  tag?: string | null;
  autor: string;
  avatar?: string | null;
  tipo_autor: 'usuario' | 'time';
  curtidas_count: number;
  comentarios_count: number;
}

const FeedScreen = ({ navigation }: any) => {
  const [data, setData] = useState<Postagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { logout } = useAuth();

  const fetchData = async () => {
    try {
      const response = await api.get('/postagens');
      setData(response.data.data || []);
    } catch (e) {
      console.log('Erro ao carregar postagens', e);
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>DraftMe</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Sair</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#22C55E" />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => String(item.id_postagem)}
          renderItem={({ item }) => (
            <PostCard
              autor={item.autor}
              avatar={item.avatar}
              texto_postagem={item.texto_postagem}
              categoria={item.categoria}
              tag={item.tag}
              img_postagem={item.img_postagem}
              curtidas_count={item.curtidas_count}
              comentarios_count={item.comentarios_count}
              onPress={() => navigation.navigate('PostDetails', { id_postagem: item.id_postagem })}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22C55E" />
          }
        />
      )}
    </SafeAreaView>
  );
};

export default FeedScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    color: '#F9FAFB',
    fontSize: 20,
    fontWeight: '700',
  },
  logout: {
    color: '#F97316',
    fontWeight: '500',
  },
});
