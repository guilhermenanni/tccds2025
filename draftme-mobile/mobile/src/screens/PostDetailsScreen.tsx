import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, FlatList, TextInput, TouchableOpacity, Alert } from 'react-native';
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

const PostDetailsScreen = ({ route }: any) => {
  const { id_postagem } = route.params;
  const [postagem, setPostagem] = useState<any>(null);
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [loading, setLoading] = useState(true);
  const [comentarioTexto, setComentarioTexto] = useState('');
  const { user } = useAuth();

  const loadData = async () => {
    try {
      const postResponse = await api.get('/postagens');
      const post = (postResponse.data.data || []).find((p: any) => p.id_postagem === id_postagem);
      setPostagem(post || null);

      const comentariosResponse = await api.get(`/comentarios/postagem/${id_postagem}`);
      setComentarios(comentariosResponse.data.data || []);
    } catch (e) {
      console.log('Erro ao carregar detalhes da postagem', e);
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
      await api.post('/comentarios', {
        id_postagem,
        texto_comentario: comentarioTexto.trim(),
      });
      setComentarioTexto('');
      loadData();
    } catch (e) {
      console.log('Erro ao comentar', e);
      Alert.alert('Erro', 'Não foi possível enviar o comentário');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator color="#22C55E" />
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
        contentContainerStyle={{ paddingBottom: 80 }}
      />
      <View style={styles.commentInputBox}>
        <TextInput
          style={styles.commentInput}
          placeholder="Adicionar comentário..."
          placeholderTextColor="#9CA3AF"
          value={comentarioTexto}
          onChangeText={setComentarioTexto}
        />
        <TouchableOpacity style={styles.commentButton} onPress={handleComentar}>
          <Text style={styles.commentButtonText}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PostDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
  },
  error: {
    color: '#F97316',
  },
  commentBox: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#0B1120',
  },
  commentAutor: {
    color: '#F9FAFB',
    fontWeight: '600',
    marginBottom: 2,
  },
  commentText: {
    color: '#E5E7EB',
  },
  commentInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#111827',
    backgroundColor: '#020617',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#0B1120',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#F9FAFB',
    marginRight: 8,
  },
  commentButton: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  commentButtonText: {
    color: '#F9FAFB',
    fontWeight: '600',
  },
});
