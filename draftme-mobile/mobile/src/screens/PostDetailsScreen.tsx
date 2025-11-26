// mobile/src/screens/PostDetailsScreen.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../api/client';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';

interface Comentario {
  id_comentario: number;
  texto_comentario: string;
  data_comentario: string;
  autor: string;
  avatar?: string | null;
  tipo_autor: 'usuario' | 'time';
}

const PostDetailsScreen = ({ route, navigation }: any) => {
  const { id_postagem } = route.params;
  const [postagem, setPostagem] = useState<any>(null);
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [loading, setLoading] = useState(true);
  const [comentarioTexto, setComentarioTexto] = useState('');
  const [sending, setSending] = useState(false);
  const { user } = useAuth();
  const insets = useSafeAreaInsets(); // respeita a barra inferior

  const loadData = async () => {
    try {
      const postResponse = await api.get('/postagens');
      const post = (postResponse.data.data || []).find(
        (p: any) => p.id_postagem === id_postagem
      );
      setPostagem(post || null);

      const comentariosResponse = await api.get(
        `/comentarios/postagem/${id_postagem}`
      );
      setComentarios(comentariosResponse.data.data || []);
    } catch (e) {
      console.log('Erro ao carregar detalhes da postagem', e);
      Alert.alert('Erro', 'Não foi possível carregar os detalhes da postagem.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id_postagem]);

  const handleComentar = async () => {
    if (!user) {
      Alert.alert('Atenção', 'Você precisa estar logado para comentar.');
      return;
    }
    if (!comentarioTexto.trim()) {
      return;
    }

    try {
      setSending(true);
      await api.post('/comentarios', {
        id_postagem,
        texto_comentario: comentarioTexto.trim(),
      });

      setComentarioTexto('');
      await loadData();
    } catch (e: any) {
      console.log('Erro ao comentar', e?.response || e);

      if (e?.response?.status === 401) {
        Alert.alert(
          'Sessão expirada',
          'Faça login novamente para comentar.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login'),
            },
          ]
        );
      } else {
        Alert.alert('Erro', 'Não foi possível enviar o comentário.');
      }
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator color="#e28e45" />
        </View>
      </SafeAreaView>
    );
  }

  if (!postagem) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.error}>Postagem não encontrada.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderComentario = ({ item }: { item: Comentario }) => (
    <View style={styles.commentBox}>
      <Text style={styles.commentAutor}>{item.autor}</Text>
      <Text style={styles.commentText}>{item.texto_comentario}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ListHeaderComponent={
          <PostCard
            autor={postagem.autor}
            avatar={postagem.avatar}
            texto_postagem={postagem.texto_postagem}
            categoria={postagem.categoria}
            tag={postagem.tag}
            img_postagem={postagem.img_postagem}
            curtidas_count={postagem.curtidas_count}
            comentarios_count={postagem.comentarios_count}
          />
        }
        data={comentarios}
        keyExtractor={(item) => String(item.id_comentario)}
        renderItem={renderComentario}
        contentContainerStyle={{
          paddingBottom: 160 + insets.bottom, // espaço pra não ficar atrás do input
        }}
      />

      <View
        style={[
          styles.commentInputBox,
          { paddingBottom: 8 + insets.bottom }, // sobe acima da barra de gestos
        ]}
      >
        <TextInput
          style={styles.commentInput}
          placeholder="Adicionar comentário..."
          placeholderTextColor="#9CA3AF"
          value={comentarioTexto}
          onChangeText={setComentarioTexto}
        />
        <TouchableOpacity
          style={styles.commentButton}
          onPress={handleComentar}
          disabled={sending}
        >
          {sending ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.commentButtonText}>Enviar</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PostDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#182d46ff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
  },
  error: {
    color: '#F87171',
    textAlign: 'center',
  },
  commentBox: {
    marginHorizontal: 12,
    marginBottom: 8,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#14263b',
    backgroundColor: '#111827',
  },
  commentAutor: {
    color: '#e28e45',
    fontWeight: '600',
    marginBottom: 4,
  },
  commentText: {
    color: '#E5E7EB',
  },
  commentInputBox: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 16, // base, sobrescrita pelo insets.bottom no componente
    backgroundColor: '#182d46ff',
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#14263b',
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#182d46ff',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#F9FAFB',
    marginRight: 8,
  },
  commentButton: {
    backgroundColor: '#e28e45',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  commentButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
