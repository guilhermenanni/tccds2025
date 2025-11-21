// mobile/src/screens/ProfileScreen.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import PostCard from '../components/PostCard';

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
}

interface PerfilUsuario {
  id_usuario: number;
  nm_usuario: string;
  email_usuario: string;
  tel_usuario?: string | null;
  img_usuario?: string | null;
  sobre?: string | null;
}

interface PerfilTime {
  id_time: number;
  nm_time: string;
  email_time: string;
  tel_time?: string | null;
  img_time?: string | null;
  sobre?: string | null;
}

const ProfileScreen: React.FC<any> = ({ navigation }) => {
  const { user, tipoSelecionado, token, logout } = useAuth();
  const [perfil, setPerfil] = useState<PerfilUsuario | PerfilTime | null>(null);
  const [postagens, setPostagens] = useState<Postagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);

  const [nomeEdit, setNomeEdit] = useState('');
  const [telEdit, setTelEdit] = useState('');
  const [sobreEdit, setSobreEdit] = useState('');
  const [imgLocal, setImgLocal] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const ehTime = tipoSelecionado === 'time';

  const carregarPerfilEPosts = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      if (ehTime && 'id_time' in user) {
        const [perfilRes, postsRes] = await Promise.all([
          api.get(`/usuarios/time/${user.id_time}`),
          api.get(`/usuarios/time/${user.id_time}/postagens`),
        ]);

        const p: PerfilTime = perfilRes.data.data;
        setPerfil(p);
        setNomeEdit(p.nm_time);
        setTelEdit(p.tel_time || '');
        setSobreEdit(p.sobre || '');
        setPostagens(postsRes.data.data || []);
        setImgLocal(null);
      } else if (!ehTime && 'id_usuario' in user) {
        const [perfilRes, postsRes] = await Promise.all([
          api.get(`/usuarios/usuario/${user.id_usuario}`),
          api.get(`/usuarios/usuario/${user.id_usuario}/postagens`),
        ]);

        const p: PerfilUsuario = perfilRes.data.data;
        setPerfil(p);
        setNomeEdit(p.nm_usuario);
        setTelEdit(p.tel_usuario || '');
        setSobreEdit(p.sobre || '');
        setPostagens(postsRes.data.data || []);
        setImgLocal(null);
      }
    } catch (error) {
      console.log('Erro ao carregar perfil/postagens:', error);
      Alert.alert(
        'Erro',
        'Não foi possível carregar as informações do perfil. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPerfilEPosts();
  }, [user, tipoSelecionado]);

  const escolherImagem = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Permissão negada',
        'Precisamos de acesso à sua galeria para selecionar uma foto.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      if (asset.base64) {
        setImgLocal(`data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`);
      } else if (asset.uri) {
        setImgLocal(asset.uri);
      }
    }
  };

  const handleSalvarEdicao = async () => {
    if (!user || !token || !perfil) return;

    try {
      setSalvando(true);

      const payload: any = {};

      if (ehTime) {
        payload.nm_time = nomeEdit;
        payload.tel_time = telEdit || null;
        payload.sobre_time = sobreEdit || null;
        if (imgLocal) {
          payload.img_time = imgLocal;
        }
      } else {
        payload.nm_usuario = nomeEdit;
        payload.tel_usuario = telEdit || null;
        payload.sobre = sobreEdit || null;
        if (imgLocal) {
          payload.img_usuario = imgLocal;
        }
      }

      if (ehTime && 'id_time' in user) {
        await api.put(`/usuarios/time/${user.id_time}`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else if (!ehTime && 'id_usuario' in user) {
        await api.put(`/usuarios/usuario/${user.id_usuario}`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
      setEditando(false);
      carregarPerfilEPosts();
    } catch (e: any) {
      console.log('Erro ao atualizar perfil:', e?.response?.data || e.message);
      Alert.alert('Erro', 'Não foi possível atualizar o perfil.');
    } finally {
      setSalvando(false);
    }
  };

  const nome =
    ehTime && perfil && 'nm_time' in perfil
      ? perfil.nm_time
      : !ehTime && perfil && 'nm_usuario' in perfil
      ? perfil.nm_usuario
      : 'Perfil';

  const email =
    ehTime && perfil && 'email_time' in perfil
      ? perfil.email_time
      : !ehTime && perfil && 'email_usuario' in perfil
      ? perfil.email_usuario
      : '';

  const imagemPerfil =
    imgLocal ||
    (ehTime && perfil && 'img_time' in perfil
      ? perfil.img_time || null
      : !ehTime && perfil && 'img_usuario' in perfil
      ? perfil.img_usuario || null
      : null);

  const imagemMostrar = imagemPerfil || null;

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e28e45" />
      </SafeAreaView>
    );
  }

  const Header = (
    <View style={styles.header}>
      <View style={styles.row}>
        {imagemMostrar ? (
          <Image source={{ uri: imagemMostrar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>
              {nome?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>
        )}

        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{nome}</Text>
          <Text style={styles.email}>{email}</Text>
          {!editando && perfil && 'sobre' in perfil && perfil.sobre && (
            <Text style={styles.about}>{perfil.sobre}</Text>
          )}
        </View>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setEditando((prev) => !prev)}
        >
          <Text style={styles.editButtonText}>
            {editando ? 'Cancelar' : 'Editar perfil'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutButtonText}>Sair</Text>
        </TouchableOpacity>
      </View>

      {editando && (
        <View style={styles.editContainer}>
          <TouchableOpacity
            style={styles.changePhotoButton}
            onPress={escolherImagem}
          >
            <Text style={styles.changePhotoText}>
              {imgLocal ? 'Trocar foto' : 'Escolher foto de perfil'}
            </Text>
          </TouchableOpacity>

          <View style={styles.editField}>
            <Text style={styles.editLabel}>
              {ehTime ? 'Nome do time' : 'Seu nome'}
            </Text>
            <TextInput
              style={styles.editInput}
              value={nomeEdit}
              onChangeText={setNomeEdit}
              placeholder={ehTime ? 'Nome do time' : 'Seu nome'}
              placeholderTextColor="#6B7280"
              maxLength={80}
            />
          </View>

          <View style={styles.editField}>
            <Text style={styles.editLabel}>Telefone</Text>
            <TextInput
              style={styles.editInput}
              value={telEdit}
              onChangeText={(value) =>
                setTelEdit(value.replace(/\D/g, '').slice(0, 11))
              }
              placeholder="DDD + número"
              placeholderTextColor="#6B7280"
              keyboardType="numeric"
              maxLength={11}
            />
          </View>

          <View style={styles.editField}>
            <Text style={styles.editLabel}>Sobre</Text>
            <TextInput
              style={[styles.editInput, styles.editTextArea]}
              value={sobreEdit}
              onChangeText={setSobreEdit}
              placeholder="Conte um pouco sobre você"
              placeholderTextColor="#6B7280"
              multiline
              numberOfLines={3}
            />
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSalvarEdicao}
            disabled={salvando}
          >
            {salvando ? (
              <ActivityIndicator color="#F9FAFB" />
            ) : (
              <Text style={styles.saveButtonText}>Salvar alterações</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.sectionTitle}>
        {ehTime ? 'Postagens do time' : 'Suas postagens'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ListHeaderComponent={Header}
        data={postagens}
        keyExtractor={(item) => item.id_postagem.toString()}
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
              navigation.navigate('PostDetails', { id_postagem: item.id_postagem })
            }
            onComment={() =>
              navigation.navigate('PostDetails', {
                id_postagem: item.id_postagem,
                focusComment: true,
              })
            }
          />
        )}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {ehTime
              ? 'Esse time ainda não fez nenhuma postagem.'
              : 'Você ainda não postou nada.'}
          </Text>
        }
      />
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#182d46ff',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#182d46ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#E5E7EB',
    fontSize: 28,
    fontWeight: '700',
  },
  name: {
    color: '#F9FAFB',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  email: {
    color: '#9CA3AF',
    fontSize: 13,
    marginBottom: 4,
  },
  about: {
    color: '#D1D5DB',
    fontSize: 13,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  editButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#374151',
    alignItems: 'center',
  },
  editButtonText: {
    color: '#E5E7EB',
    fontSize: 14,
    fontWeight: '500',
  },
  logoutButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: '#EF4444',
  },
  logoutButtonText: {
    color: '#F9FAFB',
    fontSize: 14,
    fontWeight: '600',
  },
  editContainer: {
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
    backgroundColor: '#020617',
  },
  changePhotoButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#374151',
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  changePhotoText: {
    color: '#E5E7EB',
    fontSize: 13,
  },
  editField: {
    marginBottom: 12,
  },
  editLabel: {
    color: '#E5E7EB',
    marginBottom: 4,
    fontSize: 13,
  },
  editInput: {
    backgroundColor: '#182d46ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#F9FAFB',
    fontSize: 14,
  },
  editTextArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#e28e45',
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#F9FAFB',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    color: '#E5E7EB',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 8,
  },
  emptyText: {
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 32,
  },
});
