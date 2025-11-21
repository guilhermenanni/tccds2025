// mobile/src/screens/CreatePostScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

const MAX_WIDTH = 1920; // largura máxima da imagem
const MAX_SIZE_BYTES = 1.5 * 1024 * 1024; // ~1.5 MB
const QUALITY_STEPS = [0.7, 0.5, 0.3];

// Qualquer imagem -> base64 comprimido
const processImageToBase64 = async (uri: string): Promise<string | null> => {
  for (const quality of QUALITY_STEPS) {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [
        {
          resize: { width: MAX_WIDTH },
        },
      ],
      {
        compress: quality,
        format: ImageManipulator.SaveFormat.JPEG,
        base64: true,
      }
    );

    if (!result.base64) continue;

    // aproximação: base64 ~ 4/3 do binário
    const sizeBytes = result.base64.length * 0.75;

    if (sizeBytes <= MAX_SIZE_BYTES) {
      return `data:image/jpeg;base64,${result.base64}`;
    }
  }

  return null; // Mesmo na menor qualidade ficou enorme
};

const CreatePostScreen: React.FC = () => {
  const { tipoSelecionado, token } = useAuth();

  const [imagemLocal, setImagemLocal] = useState<string | null>(null);
  const [imagemBase64, setImagemBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // POSTAGEM (usuário)
  const [texto_postagem, setTexto] = useState('');
  const [categoriaPost, setCategoriaPost] = useState('');
  const [tag, setTag] = useState('');

  // SELETIVA (time)
  const [titulo, setTitulo] = useState('');
  const [sobre, setSobre] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [cidade, setCidade] = useState('');
  const [dataSeletiva, setDataSeletiva] = useState(''); // yyyy-mm-dd
  const [hora, setHora] = useState(''); // hh:mm
  const [categoriaSel, setCategoriaSel] = useState('');
  const [subcategoria, setSubcategoria] = useState('');

  const ehUsuario = tipoSelecionado === 'usuario';

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permissão',
        'Precisamos de acesso à galeria para selecionar uma imagem.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      base64: false,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setImagemLocal(asset.uri);

      const base64 = await processImageToBase64(asset.uri);

      if (!base64) {
        Alert.alert(
          'Imagem muito grande',
          'Essa imagem está muito pesada. Tente recortar ou usar uma versão menor.'
        );
        setImagemLocal(null);
        setImagemBase64(null);
        return;
      }

      setImagemBase64(base64);
    }
  };

  const validarPostagem = (): string | null => {
    if (!texto_postagem.trim()) {
      return 'Escreva algo para postar.';
    }
    return null;
  };

  const validarSeletiva = (): string | null => {
    if (!titulo.trim()) return 'Informe um título para a seletiva.';
    if (!sobre.trim()) return 'Descreva a seletiva em "sobre".';
    if (!cidade.trim()) return 'Informe a cidade.';
    if (!dataSeletiva.trim()) return 'Informe a data da seletiva.';
    if (!hora.trim()) return 'Informe o horário.';
    return null;
  };

  const handleCreatePost = async () => {
    const erro = validarPostagem();
    if (erro) {
      Alert.alert('Atenção', erro);
      return;
    }
    if (!token) {
      Alert.alert('Erro', 'Você precisa estar logado para postar.');
      return;
    }

    try {
      setLoading(true);

      await api.post(
        '/postagens',
        {
          texto_postagem: texto_postagem.trim(),
          categoria: categoriaPost || null,
          tag: tag || null,
          img_postagem: imagemBase64 || null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert('Sucesso', 'Postagem criada com sucesso!');
      setTexto('');
      setCategoriaPost('');
      setTag('');
      setImagemLocal(null);
      setImagemBase64(null);
    } catch (e: any) {
      console.log('Erro ao criar postagem:', e?.response?.data || e.message);
      Alert.alert(
        'Erro',
        e?.response?.data?.message || 'Não foi possível criar a postagem.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSeletiva = async () => {
    const erro = validarSeletiva();
    if (erro) {
      Alert.alert('Atenção', erro);
      return;
    }
    if (!token) {
      Alert.alert('Erro', 'Você precisa estar logado para criar seletivas.');
      return;
    }

    try {
      setLoading(true);

      await api.post(
        '/seletivas',
        {
          titulo: titulo.trim(),
          sobre: sobre.trim(),
          localizacao: localizacao || null,
          cidade: cidade.trim(),
          data: dataSeletiva.trim(),
          hora: hora.trim(),
          categoria: categoriaSel || null,
          subcategoria: subcategoria || null,
          img_time: imagemBase64 || null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert('Sucesso', 'Seletiva criada com sucesso!');
      setTitulo('');
      setSobre('');
      setLocalizacao('');
      setCidade('');
      setDataSeletiva('');
      setHora('');
      setCategoriaSel('');
      setSubcategoria('');
      setImagemLocal(null);
      setImagemBase64(null);
    } catch (e: any) {
      console.log('Erro ao criar seletiva:', e?.response?.data || e.message);
      Alert.alert(
        'Erro',
        e?.response?.data?.message || 'Não foi possível criar a seletiva.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (ehUsuario) {
      handleCreatePost();
    } else {
      handleCreateSeletiva();
    }
  };

  const tituloTela = ehUsuario ? 'Criar postagem' : 'Criar seletiva';
  const textoBotao = ehUsuario ? 'Publicar' : 'Criar seletiva';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.box}>
          <Text style={styles.title}>{tituloTela}</Text>

          {/* Campos diferentes pra usuário x time */}
          {ehUsuario ? (
            <>
              <View style={styles.field}>
                <Text style={styles.label}>Texto da postagem</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={texto_postagem}
                  onChangeText={setTexto}
                  multiline
                  placeholder="Compartilhe algo com a comunidade..."
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Categoria (opcional)</Text>
                <TextInput
                  style={styles.input}
                  value={categoriaPost}
                  onChangeText={setCategoriaPost}
                  placeholder="Ex: Notícias, Treino, Motivação..."
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Tag (opcional)</Text>
                <TextInput
                  style={styles.input}
                  value={tag}
                  onChangeText={setTag}
                  placeholder="Ex: sub20, peneira, atacante..."
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </>
          ) : (
            <>
              <View style={styles.field}>
                <Text style={styles.label}>Título da seletiva</Text>
                <TextInput
                  style={styles.input}
                  value={titulo}
                  onChangeText={setTitulo}
                  placeholder="Ex: Peneira sub-17 2025"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Sobre</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={sobre}
                  onChangeText={setSobre}
                  multiline
                  placeholder="Descreva como será a seletiva, requisitos, etc."
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Local</Text>
                <TextInput
                  style={styles.input}
                  value={localizacao}
                  onChangeText={setLocalizacao}
                  placeholder="Ex: Estádio Municipal de São José"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Cidade</Text>
                <TextInput
                  style={styles.input}
                  value={cidade}
                  onChangeText={setCidade}
                  placeholder="Cidade"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.field, { flex: 1, marginRight: 4 }]}>
                  <Text style={styles.label}>Data</Text>
                  <TextInput
                    style={styles.input}
                    value={dataSeletiva}
                    onChangeText={setDataSeletiva}
                    placeholder="AAAA-MM-DD"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                <View style={[styles.field, { flex: 1, marginLeft: 4 }]}>
                  <Text style={styles.label}>Hora</Text>
                  <TextInput
                    style={styles.input}
                    value={hora}
                    onChangeText={setHora}
                    placeholder="HH:MM"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Categoria (opcional)</Text>
                <TextInput
                  style={styles.input}
                  value={categoriaSel}
                  onChangeText={setCategoriaSel}
                  placeholder="Ex: Sub-17, Sub-20..."
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Subcategoria (opcional)</Text>
                <TextInput
                  style={styles.input}
                  value={subcategoria}
                  onChangeText={setSubcategoria}
                  placeholder="Ex: Masculino, Feminino, Misto..."
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>
              {ehUsuario ? 'Imagem da postagem (opcional)' : 'Escudo / imagem da seletiva (opcional)'}
            </Text>
            <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
              <Text style={styles.imagePickerText}>
                {imagemLocal ? 'Trocar imagem' : 'Selecionar imagem'}
              </Text>
            </TouchableOpacity>

            {imagemLocal && (
              <Image source={{ uri: imagemLocal }} style={styles.previewImage} />
            )}
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#F9FAFB" />
            ) : (
              <Text style={styles.buttonText}>{textoBotao}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreatePostScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#182d46ff',
  },
  scroll: {
    flexGrow: 1,
  },
  box: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    backgroundColor: '#213e60',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#14263b',
  },
  title: {
    color: '#F9FAFB',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  field: {
    marginBottom: 14,
  },
  label: {
    color: '#E5E7EB',
    marginBottom: 4,
    fontSize: 14,
  },
  input: {
    backgroundColor: '#202020ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#F9FAFB',
    fontSize: 14,
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  imagePicker: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#ffffffff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  imagePickerText: {
    color: '#E5E7EB',
    fontSize: 13,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginTop: 8,
  },
  button: {
    backgroundColor: '#e28e45',
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: {
    color: '#F9FAFB',
    fontWeight: '600',
    fontSize: 15,
  },
});
