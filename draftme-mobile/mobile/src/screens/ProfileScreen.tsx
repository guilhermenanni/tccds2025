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
  curtidas_count?: number;
  comentarios_count?: number;
}

type TipoPerfil = 'usuario' | 'time';

interface PerfilNormalizado {
  tipo: TipoPerfil;
  id: number;
  nome: string;
  email: string;
  telefone?: string | null;
  imagem?: string | null;
  sobre?: string | null;
}

// helper de formatação de telefone
const formatTelefone = (valor?: string | null) => {
  if (!valor) return '';
  const d = valor.replace(/\D/g, '').slice(0, 11);

  if (d.length <= 2) {
    return d;
  }
  if (d.length <= 6) {
    return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  }
  if (d.length <= 10) {
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  }
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

const ProfileScreen: React.FC<any> = ({ navigation }) => {
  const { user, tipoSelecionado, token, logout } = useAuth();
  const [perfil, setPerfil] = useState<PerfilNormalizado | null>(null);
  const [postagens, setPostagens] = useState<Postagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);

  const [nomeEdit, setNomeEdit] = useState('');
  const [telEdit, setTelEdit] = useState(''); // guarda só dígitos
  const [sobreEdit, setSobreEdit] = useState('');
  const [imgLocal, setImgLocal] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const ehTime = tipoSelecionado === 'time';
  const ehUsuario = tipoSelecionado === 'usuario';

  const carregarPerfilEPosts = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      if (ehTime && 'id_time' in user) {
        const id_time = Number(user.id_time);

        const [perfilRes, postsRes] = await Promise.all([
          api.get(`/usuarios/time/${id_time}`),
          api.get(`/usuarios/time/${id_time}/postagens`),
        ]);

        const raw = perfilRes.data.data || perfilRes.data;
        const perfilNorm: PerfilNormalizado = {
          tipo: 'time',
          id: raw.id_time,
          nome: raw.nm_time,
          email: raw.email_time,
          telefone: raw.tel_time ?? null,
          imagem: raw.img_time ?? null,
          sobre: raw.sobre_time ?? raw.sobre ?? null,
        };

        setPerfil(perfilNorm);
        setNomeEdit(perfilNorm.nome);
        setTelEdit((perfilNorm.telefone || '').replace(/\D/g, '').slice(0, 11));
        setSobreEdit(perfilNorm.sobre || '');
        setImgLocal(null);

        const listaPosts: Postagem[] = (postsRes.data.data || []).map(
          (p: any) => ({
            id_postagem: p.id_postagem,
            texto_postagem: p.texto_postagem,
            img_postagem: p.img_postagem ?? null,
            categoria: p.categoria ?? null,
            tag: p.tag ?? null,
            curtidas_count: p.curtidas_count ?? 0,
            comentarios_count: p.comentarios_count ?? 0,
          })
        );

        setPostagens(listaPosts);
      } else if (ehUsuario && 'id_usuario' in user) {
        const id_usuario = Number(user.id_usuario);

        const [perfilRes, postsRes] = await Promise.all([
          api.get(`/usuarios/usuario/${id_usuario}`),
          api.get(`/usuarios/usuario/${id_usuario}/postagens`),
        ]);

        const raw = perfilRes.data.data || perfilRes.data;
        const perfilNorm: PerfilNormalizado = {
          tipo: 'usuario',
          id: raw.id_usuario,
          nome: raw.nm_usuario,
          email: raw.email_usuario,
          telefone: raw.tel_usuario ?? null,
          imagem: raw.img_usuario ?? null,
          sobre: raw.sobre ?? null,
        };

        setPerfil(perfilNorm);
        setNomeEdit(perfilNorm.nome);
        setTelEdit((perfilNorm.telefone || '').replace(/\D/g, '').slice(0, 11));
        setSobreEdit(perfilNorm.sobre || '');
        setImgLocal(null);

        const listaPosts: Postagem[] = (postsRes.data.data || []).map(
          (p: any) => ({
            id_postagem: p.id_postagem,
            texto_postagem: p.texto_postagem,
            img_postagem: p.img_postagem ?? null,
            categoria: p.categoria ?? null,
            tag: p.tag ?? null,
            curtidas_count: p.curtidas_count ?? 0,
            comentarios_count: p.comentarios_count ?? 0,
          })
        );

        setPostagens(listaPosts);
      }
    } catch (error: any) {
      console.log(
        'Erro ao carregar perfil/postagens:',
        error?.response?.data || error.message
      );
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
        setImgLocal(
          `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`
        );
      } else if (asset.uri) {
        setImgLocal(asset.uri);
      }
    }
  };

  const handleSalvarEdicao = async () => {
    if (!perfil || !token) return;

    try {
      setSalvando(true);

      if (perfil.tipo === 'usuario') {
        const payload: any = {
          nm_usuario: nomeEdit,
          tel_usuario: telEdit || null, // só dígitos
          sobre: sobreEdit || null,
        };
        if (imgLocal) {
          payload.img_usuario = imgLocal;
        }

        await api.put(`/usuarios/usuario/${perfil.id}`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        const payload: any = {
          nm_time: nomeEdit,
          tel_time: telEdit || null, // só dígitos
          sobre_time: sobreEdit || null,
        };
        if (imgLocal) {
          payload.img_time = imgLocal;
        }

        await api.put(`/usuarios/time/${perfil.id}`, payload, {
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

  const handleChangeTelEdit = (value: string) => {
    const onlyDigits = value.replace(/\D/g, '').slice(0, 11);
    setTelEdit(onlyDigits);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e28e45" />
      </SafeAreaView>
    );
  }

  if (!perfil) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={{ color: '#E5E7EB' }}>Nenhum perfil encontrado.</Text>
      </SafeAreaView>
    );
  }

  const imagemMostrar = imgLocal || perfil.imagem || null;

  const Header = (
    <View style={styles.header}>
      <View style={styles.row}>
        {imagemMostrar ? (
          <Image source={{ uri: imagemMostrar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>
              {perfil.nome?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>
        )}

        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{perfil.nome}</Text>
          <Text style={styles.email}>{perfil.email}</Text>
          {!editando && perfil.telefone && (
            <Text style={styles.phone}>
              {formatTelefone(perfil.telefone)}
            </Text>
          )}
          {!editando && perfil.sobre && (
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
              {perfil.tipo === 'time' ? 'Nome do time' : 'Seu nome'}
            </Text>
            <TextInput
              style={styles.editInput}
              value={nomeEdit}
              onChangeText={setNomeEdit}
              placeholder={
                perfil.tipo === 'time' ? 'Nome do time' : 'Seu nome completo'
              }
              placeholderTextColor="#6B7280"
              maxLength={80}
            />
          </View>

          <View style={styles.editField}>
            <Text style={styles.editLabel}>Telefone</Text>
            <TextInput
              style={styles.editInput}
              value={formatTelefone(telEdit)}
              onChangeText={handleChangeTelEdit}
              placeholder="(11) 91234-5678"
              placeholderTextColor="#6B7280"
              keyboardType="numeric"
              maxLength={15} // por causa da máscara visual
            />
          </View>

          <View style={styles.editField}>
            <Text style={styles.editLabel}>Sobre</Text>
            <TextInput
              style={[styles.editInput, styles.editTextArea]}
              value={sobreEdit}
              onChangeText={setSobreEdit}
              placeholder={
                perfil.tipo === 'time'
                  ? 'Fale sobre o time, história, objetivos...'
                  : 'Conte um pouco sobre você'
              }
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
        {perfil.tipo === 'time' ? 'Postagens do time' : 'Suas postagens'}
      </Text>
    </View>
  );

  const autorPerfil = perfil.nome;
  const avatarPerfil = perfil.imagem || null;

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ListHeaderComponent={Header}
        data={postagens}
        keyExtractor={(item) => item.id_postagem.toString()}
        renderItem={({ item }) => (
          <PostCard
            autor={autorPerfil}
            avatar={avatarPerfil}
            texto_postagem={item.texto_postagem}
            categoria={item.categoria}
            tag={item.tag}
            img_postagem={item.img_postagem}
            curtidas_count={item.curtidas_count ?? 0}
            comentarios_count={item.comentarios_count ?? 0}
            onPress={() =>
              navigation.navigate('PostDetails', {
                id_postagem: item.id_postagem,
              })
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
            {perfil.tipo === 'time'
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
    marginBottom: 2,
  },
  phone: {
    color: '#D1D5DB',
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
    backgroundColor: '#213e60',
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
