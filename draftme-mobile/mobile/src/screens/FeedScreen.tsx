// mobile/src/screens/FeedScreen.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  SafeAreaView,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
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
  curtidas_count: number;
  comentarios_count: number;
  likedByUser?: boolean;
}

const FeedScreen = ({ navigation }: any) => {
  const [data, setData] = useState<Postagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { logout, token } = useAuth();

  const fetchData = async () => {
    try {
      setLoading(true);

      const response = await api.get('/postagens');

      const posts: Postagem[] = (response.data.data || []).map((item: any) => ({
        id_postagem: item.id_postagem,
        texto_postagem: item.texto_postagem ?? '',
        img_postagem: item.img_postagem ?? null,
        categoria: item.categoria ?? null,
        tag: item.tag ?? null,
        // garante que nunca vai ficar vazio
        autor: item.autor && item.autor.trim().length > 0 ? item.autor : 'Usuário',
        avatar: item.avatar ?? null,
        curtidas_count: item.curtidas_count ?? 0,
        comentarios_count: item.comentarios_count ?? 0,
        likedByUser: false,
      }));

      setData(posts);
    } catch (error) {
      console.log('Erro ao buscar postagens', error);
      Alert.alert('Erro', 'Não foi possível carregar as postagens.');
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

  const handleLikePost = async (id_postagem: number) => {
    if (!token) {
      Alert.alert('Atenção', 'Você precisa estar logado para curtir.');
      return;
    }

    const postAtual = data.find((p) => p.id_postagem === id_postagem);
    if (!postAtual) return;

    if (postAtual.likedByUser) {
      // já curtiu nessa sessão
      return;
    }

    // atualização otimista
    setData((prev) =>
      prev.map((p) =>
        p.id_postagem === id_postagem
          ? {
              ...p,
              likedByUser: true,
              curtidas_count: p.curtidas_count + 1,
            }
          : p
      )
    );

    try {
      await api.post(
        `/postagens/${id_postagem}/curtir`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (e) {
      console.log('Erro ao curtir postagem', e);
      // rollback
      setData((prev) =>
        prev.map((p) =>
          p.id_postagem === id_postagem
            ? {
                ...p,
                likedByUser: false,
                curtidas_count: Math.max(0, p.curtidas_count - 1),
              }
            : p
        )
      );
      Alert.alert('Erro', 'Não foi possível registrar a curtida.');
    }
  };

  const handleCommentPost = (id_postagem: number) => {
    navigation.navigate('PostDetails', {
      id_postagem,
      focusComment: true,
    });
  };

  const hasPosts = data.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('../../assets/logo-draftme.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Sair</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#e28e45" />
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
              liked={item.likedByUser}
              onPress={() =>
                navigation.navigate('PostDetails', {
                  id_postagem: item.id_postagem,
                })
              }
              onLike={() => handleLikePost(item.id_postagem)}
              onComment={() => handleCommentPost(item.id_postagem)}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#e28e45"
            />
          }
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>Nenhuma postagem ainda</Text>
                <Text style={styles.emptySubtitle}>
                  Quando jogadores e times começarem a publicar, tudo aparece
                  aqui no feed.
                </Text>
              </View>
            ) : null
          }
          contentContainerStyle={!hasPosts ? styles.emptyContent : undefined}
        />
      )}
    </SafeAreaView>
  );
};

export default FeedScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#182d46ff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoImage: {
    width: 150,
    height: 90,
  },
  logout: {
    color: '#e28e45',
    fontWeight: '500',
    fontSize: 16,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyContainer: {
    alignItems: 'center',
  },
  emptyTitle: {
    color: '#F9FAFB',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
  },
});
