import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Alert,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../supabaseClient';

export default function CommentsScreen({ navigation, route }) {
  const { postId, userType, userInfo } = route.params || {};
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = async () => {
    try {
      const { data, error } = await supabase
        .from('tb_resposta_postagem')
        .select(`
          *,
          tb_usuario (
            nm_usuario
          )
        `)
        .eq('id_postagem', postId)
        .order('id_resposta', { ascending: true });

      if (error) {
        Alert.alert('Erro', 'Erro ao carregar comentários: ' + error.message);
        return;
      }

      setComments(data || []);
    } catch (error) {
      Alert.alert('Erro', 'Erro inesperado: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      Alert.alert('Erro', 'Digite um comentário');
      return;
    }

    if (userType !== 'player') {
      Alert.alert('Erro', 'Apenas jogadores podem comentar');
      return;
    }

    setPosting(true);
    try {
      const { error } = await supabase
        .from('tb_resposta_postagem')
        .insert([
          {
            id_usuario: userInfo.id_usuario,
            id_postagem: postId,
            texto_resposta: newComment.trim(),
          }
        ]);

      if (error) {
        Alert.alert('Erro', 'Erro ao adicionar comentário: ' + error.message);
        return;
      }

      setNewComment('');
      loadComments(); // Recarregar comentários

    } catch (error) {
      Alert.alert('Erro', 'Erro inesperado: ' + error.message);
    } finally {
      setPosting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora';
    if (diffInMinutes < 60) return `${diffInMinutes}min`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  const renderComment = ({ item }) => (
    <View style={styles.commentCard}>
      <View style={styles.commentHeader}>
        <Text style={styles.userName}>{item.tb_usuario?.nm_usuario || 'Usuário'}</Text>
        <Text style={styles.commentDate}>{formatDate(item.created_at || new Date())}</Text>
      </View>
      <Text style={styles.commentText}>{item.texto_resposta}</Text>
    </View>
  );

  return (
    <LinearGradient
      colors={['#6A4CFF', '#8A58FF', '#4C6EF5']}
      style={styles.container}
    >
      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Comentários</Text>
        </View>

        <FlatList
          data={comments}
          keyExtractor={(item) => item.id_resposta.toString()}
          renderItem={renderComment}
          contentContainerStyle={styles.commentsContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {loading ? 'Carregando comentários...' : 'Nenhum comentário ainda'}
              </Text>
              {!loading && (
                <Text style={styles.emptySubtext}>
                  Seja o primeiro a comentar!
                </Text>
              )}
            </View>
          }
        />

        {userType === 'player' && (
          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Escreva um comentário..."
              value={newComment}
              onChangeText={setNewComment}
              multiline
              maxLength={230}
              placeholderTextColor="#999"
            />
            <TouchableOpacity 
              style={[styles.sendButton, posting && styles.disabledButton]}
              onPress={handleAddComment}
              disabled={posting}
            >
              <Text style={styles.sendButtonText}>
                {posting ? '...' : 'Enviar'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {userType === 'team' && (
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              Apenas jogadores podem comentar nas postagens
            </Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  commentsContainer: {
    padding: 20,
    paddingTop: 0,
    flexGrow: 1,
  },
  commentCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  commentDate: {
    fontSize: 11,
    color: '#999',
  },
  commentText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 18,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 5,
  },
  emptySubtext: {
    color: '#E0E0FF',
    fontSize: 14,
    textAlign: 'center',
  },
  commentInputContainer: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    maxHeight: 80,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#4C6EF5',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  disabledButton: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  infoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 15,
    margin: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  infoText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
});

