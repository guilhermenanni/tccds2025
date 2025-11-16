import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import PostCard from '../components/PostCard';

interface Postagem {
  id_postagem: number;
  texto_postagem: string;
  img_postagem?: string | null;
  categoria?: string | null;
  tag?: string | null;
  data_postagem: string;
}

const ProfileScreen = () => {
  const { user } = useAuth();
  const [perfil, setPerfil] = useState<any>(null);
  const [postagens, setPostagens] = useState<Postagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [sobre, setSobre] = useState('');
  const [nome, setNome] = useState('');
  const [imagem, setImagem] = useState('');

  const loadPerfil = async () => {
    if (!user) return;
    try {
      let perfilResponse;
      let postsResponse;

      if (user.tipo === 'usuario') {
        perfilResponse = await api.get(`/usuarios/usuario/${user.id}`);
        postsResponse = await api.get(`/usuarios/usuario/${user.id}/postagens`);
      } else {
        perfilResponse = await api.get(`/usuarios/time/${user.id}`);
        postsResponse = await api.get(`/usuarios/time/${user.id}/postagens`);
      }

      setPerfil(perfilResponse.data.data);
      setPostagens(postsResponse.data.data || []);

      if (user.tipo === 'usuario') {
        setNome(perfilResponse.data.data.nm_usuario);
        setSobre(perfilResponse.data.data.sobre || '');
        setImagem(perfilResponse.data.data.img_usuario || '');
      } else {
        setNome(perfilResponse.data.data.nm_time);
        setSobre(perfilResponse.data.data.sobre_time || '');
        setImagem(perfilResponse.data.data.img_time || '');
      }
    } catch (e) {
      console.log('Erro ao carregar perfil', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPerfil();
  }, [user]);

  const handleSalvar = async () => {
    if (!user) return;
    try {
      if (user.tipo === 'usuario') {
        await api.put(`/usuarios/usuario/${user.id}`, {
          nm_usuario: nome,
          sobre,
          img_usuario: imagem || null,
        });
      } else {
        await api.put(`/usuarios/time/${user.id}`, {
          nm_time: nome,
          sobre_time: sobre,
          img_time: imagem || null,
        });
      }
      Alert.alert('Sucesso', 'Perfil atualizado');
      setEditando(false);
      loadPerfil();
    } catch (e) {
      console.log('Erro ao atualizar perfil', e);
      Alert.alert('Erro', 'Não foi possível atualizar o perfil');
    }
  };

  const renderPost = ({ item }: { item: Postagem }) => (
    <PostCard
      autor={nome}
      avatar={imagem}
      texto_postagem={item.texto_postagem}
      categoria={item.categoria}
      tag={item.tag}
      img_postagem={item.img_postagem}
      curtidas_count={0}
      comentarios_count={0}
    />
  );

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.error}>Você precisa estar logado.</Text>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator color="#22C55E" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ListHeaderComponent={
          <View style={styles.headerBox}>
            {imagem ? (
              <Image source={{ uri: imagem }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{nome.charAt(0).toUpperCase()}</Text>
              </View>
            )}
            {editando ? (
              <>
                <TextInput
                  style={styles.input}
                  value={nome}
                  onChangeText={setNome}
                  placeholder="Nome"
                  placeholderTextColor="#9CA3AF"
                />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={sobre}
                  onChangeText={setSobre}
                  placeholder="Sobre"
                  placeholderTextColor="#9CA3AF"
                  multiline
                />
                <TextInput
                  style={styles.input}
                  value={imagem}
                  onChangeText={setImagem}
                  placeholder="URL da imagem de perfil"
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity style={styles.button} onPress={handleSalvar}>
                  <Text style={styles.buttonText}>Salvar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonSecondary} onPress={() => setEditando(false)}>
                  <Text style={styles.buttonSecondaryText}>Cancelar</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.nome}>{nome}</Text>
                <Text style={styles.tipo}>{user.tipo === 'usuario' ? 'Jogador' : 'Time'}</Text>
                {!!sobre && <Text style={styles.sobre}>{sobre}</Text>}
                <TouchableOpacity style={styles.button} onPress={() => setEditando(true)}>
                  <Text style={styles.buttonText}>Editar perfil</Text>
                </TouchableOpacity>
              </>
            )}
            <Text style={styles.sectionTitle}>Postagens</Text>
          </View>
        }
        data={postagens}
        keyExtractor={(item) => String(item.id_postagem)}
        renderItem={renderPost}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
  },
  headerBox: {
    padding: 16,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#E5E7EB',
    fontSize: 32,
    fontWeight: '700',
  },
  nome: {
    color: '#F9FAFB',
    fontSize: 20,
    fontWeight: '700',
  },
  tipo: {
    color: '#9CA3AF',
    marginBottom: 8,
  },
  sobre: {
    color: '#E5E7EB',
    textAlign: 'center',
    marginVertical: 8,
  },
  sectionTitle: {
    color: '#F9FAFB',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    alignSelf: 'flex-start',
  },
  error: {
    color: '#F97316',
    textAlign: 'center',
    marginTop: 40,
  },
  input: {
    width: '100%',
    backgroundColor: '#020617',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#F9FAFB',
    marginBottom: 8,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#22C55E',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 999,
    marginTop: 8,
  },
  buttonText: {
    color: '#F9FAFB',
    fontWeight: '600',
  },
  buttonSecondary: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  buttonSecondaryText: {
    color: '#9CA3AF',
  },
});
