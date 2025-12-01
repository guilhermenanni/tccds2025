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
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../api/client';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';

interface Comentario {
  id_comentario: number;
  texto_comentario: string;
  autor: string;
}

interface PostagemDetalhe {
  id_postagem: number;
  texto_postagem: string;
  img_postagem?: string | null;
  categoria?: string | null;
  tag?: string | null;
  curtidas_count?: number;
  comentarios_count?: number;
  autor: string;
  avatar?: string | null;
  tipo_autor: 'usuario' | 'time';
}

const PostDetailsScreen = ({ route, navigation }: any) => {
  const { id_postagem } = route.params;
  const [postagem, setPostagem] = useState<PostagemDetalhe | null>(null);
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [loading, setLoading] = useState(true);
  const [comentarioTexto, setComentarioTexto] = useState('');
  const [sending, setSending] = useState(false);
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const loadData = async () => {
    try {
      const postResponse = await api.get('/postagens');
      const post = (postResponse.data.data || []).find(
        (p: any) => p.id_postagem === id_postagem
      );

      if (post) {
        setPostagem({
          id_postagem: post.id_postagem,
          texto_postagem: post.texto_postagem,
          img_postagem: post.img_postagem ?? null,
          categoria: post.categoria ?? null,
          tag: post.tag ?? null,
          curtidas_count: post.curtidas_count ?? 0,
          comentarios_count: post.comentarios_count ?? 0,
          autor: post.autor,
          avatar: post.avatar ?? null,
          tipo_autor: post.tipo_autor as 'usuario' | 'time',
        });
      } else {
        setPostagem(null);
      }

      const comentariosResponse = await api.get(
        `/comentarios/postagem/${id_postagem}`
      );
      setComentarios(comentariosResponse.data.data || []);
    } catch (e) {
      console.log('Erro ao carregar detalhes da postagem:', e);
      Alert.alert(
        'Erro',
        'Não foi possível carregar os detalhes da postagem e comentários.'
      );
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

      const response = await api.post(
        `/comentarios/postagem/${id_postagem}`,
        { texto_comentario: comentarioTexto.trim() }
      );

      const novo = response.data.data as {
        id_comentario: number;
        texto_comentario: string;
        autor: string;
      };

      setComentarios((prev) => [
        {
          id_comentario: novo.id_comentario,
          texto_comentario: novo.texto_comentario,
          autor: novo.autor,
        },
        ...prev,
      ]);
      setComentarioTexto('');
    } catch (e) {
      console.log('Erro ao enviar comentário:', e);
      Alert.alert('Erro', 'Não foi possível enviar o comentário.');
    } finally {
      setSending(false);
    }
  };

  const renderComentario = ({ item }: { item: Comentario }) => (
    <View style={styles.commentBox}>
      <Text style={styles.commentAutor}>{item.autor}</Text>
      <Text style={styles.commentText}>{item.texto_comentario}</Text>
    </View>
  );

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

  // padding pra não colar na barra de navegação quando o teclado tá FECHADO
  const bottomSafe = Math.max(insets.bottom, 6);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding" // funciona bem nos dois
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.backButtonText}>{'< Voltar'}</Text>
              </TouchableOpacity>
            </View>

            {/* Conteúdo + comentários */}
            <FlatList
              style={styles.list}
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
              contentContainerStyle={{ paddingBottom: 16 }}
              keyboardShouldPersistTaps="handled"
            />

            {/* Barra de comentário */}
            <View
              style={[
                styles.commentInputBox,
                { paddingBottom: bottomSafe },
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
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PostDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#182d46ff',
  },
  inner: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
  },
  error: {
    color: '#F87171',
    textAlign: 'center',
  },
  header: {
    paddingTop: 16,
    paddingHorizontal: 12,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  backButtonText: {
    color: '#E5E7EB',
    fontSize: 16,
    fontWeight: '500',
  },
  list: {
    flex: 1,
  },
  commentBox: {
    marginHorizontal: 12,
    marginBottom: 8,
    backgroundColor: '#111827',
    borderRadius: 8,
    padding: 10,
  },
  commentAutor: {
    color: '#E5E7EB',
    fontWeight: '600',
    marginBottom: 2,
  },
  commentText: {
    color: '#D1D5DB',
  },
  commentInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
    backgroundColor: '#111827',
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#1F2937',
    borderRadius: 999,
    paddingHorizontal: 14,
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
