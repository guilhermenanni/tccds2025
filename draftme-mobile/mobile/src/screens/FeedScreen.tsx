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
  autor: string | null;
  avatar?: string | null;
  curtidas_count: number;
  comentarios_count: number;
}

const FeedScreen = ({ navigation }: any) => {
  const [data, setData] = useState<Postagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // PEGAR TOKEN PRA ENVIAR NAS REQUISIÇÕES QUE PRECISAM DE AUTH
  const { logout, token } = useAuth();

  const fetchData = async () => {
    try {
      const response = await api.get('/postagens');

      const posts = (response.data.data || []).map((item: any) => ({
        id_postagem: item.id_postagem,
        texto_postagem: item.texto_postagem ?? '',
        img_postagem: item.img_postagem ?? null,
        categoria: item.categoria ?? null,
        tag: item.tag ?? null,
        autor: item.autor ?? 'Autor desconhecido',
        avatar: item.avatar ?? null,
        curtidas_count: item.curtidas_count ?? 0,
        comentarios_count: item.comentarios_count ?? 0,
      }));

      setData(posts);
    } catch (e) {
      console.log('Erro ao carregar postagens', e);
      Alert.alert('Erro', 'Não foi possível carregar o feed.');
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

  // --- CURTIR POSTAGEM (com token) ---
  const handleLikePost = async (id_postagem: number) => {
    if (!token) {
      Alert.alert('Atenção', 'Você precisa estar logado para curtir.');
      return;
    }

    // otimista: sobe 1 na hora
    setData((prev) =>
      prev.map((p) =>
        p.id_postagem === id_postagem
          ? { ...p, curtidas_count: p.curtidas_count + 1 }
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
      // se sua API devolver o total exato de curtidas, dá pra atualizar aqui
    } catch (e) {
      console.log('Erro ao curtir postagem', e);
      // rollback
      setData((prev) =>
        prev.map((p) =>
          p.id_postagem === id_postagem
            ? { ...p, curtidas_count: Math.max(0, p.curtidas_count - 1) }
            : p
        )
      );
      Alert.alert('Erro', 'Não foi possível registrar a curtida.');
    }
  };

  // --- COMENTAR (leva pra tela de detalhes) ---
  const handleCommentPost = (id_postagem: number) => {
    navigation.navigate('PostDetails', {
      id_postagem,
      focusComment: true,
    });
  };

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
              onPress={() =>
                navigation.navigate('PostDetails', {
                  id_postagem: item.id_postagem,
                })
              }
              // novos handlers
              onLike={() => handleLikePost(item.id_postagem)}
              onComment={() => handleCommentPost(item.id_postagem)}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#22C55E"
            />
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
  logoImage: {
    width: 150,
    height: 50,
  },
  logout: {
    color: '#F97316',
    fontWeight: '500',
    fontSize: 16,
  },
});
