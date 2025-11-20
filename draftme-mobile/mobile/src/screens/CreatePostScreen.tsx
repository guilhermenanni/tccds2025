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

    const sizeBytes = result.base64.length * 0.75; // aproximação: base64 ~ 4/3 do binário

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
  const [data_seletiva, setDataSeletiva] = useState(''); // dd/mm/aaaa
  const [hora, setHora] = useState(''); // hh:mm
  const [categoriaSel, setCategoriaSel] = useState('');
  const [subcategoria, setSubcategoria] = useState('');

  const ehUsuario = tipoSelecionado === 'usuario';

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão', 'Precisamos de acesso à galeria para selecionar uma imagem.');
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

  const formatarDataParaISO = (dataBr: string) => {
    const onlyDigits = dataBr.replace(/\D/g, '');
    if (onlyDigits.length !== 8) return null;
    const dia = onlyDigits.slice(0, 2);
    const mes = onlyDigits.slice(2, 4);
    const ano = onlyDigits.slice(4, 8);
    return `${ano}-${mes}-${dia}`;
  };

  const validarPostagem = () => {
    if (!texto_postagem.trim()) return 'Digite o texto da postagem.';
    return null;
  };

  const validarSeletiva = () => {
    if (!titulo.trim()) return 'Informe o título da seletiva.';
    if (!cidade.trim()) return 'Informe a cidade.';
    if (!data_seletiva.trim()) return 'Informe a data da seletiva.';
    if (!hora.trim()) return 'Informe o horário da seletiva.';
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
      Alert.alert('Erro', 'Não foi possível criar a postagem.');
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
      Alert.alert('Erro', 'Você precisa estar logado como time.');
      return;
    }

    const dataISO = formatarDataParaISO(data_seletiva);
    if (!dataISO) {
      Alert.alert('Atenção', 'Data inválida. Use dd/mm/aaaa.');
      return;
    }

    try {
      setLoading(true);

      await api.post(
        '/seletivas',
        {
          titulo: titulo.trim(),
          sobre: sobre.trim() || null,
          localizacao: localizacao.trim() || null,
          cidade: cidade.trim(),
          data_seletiva: dataISO,
          hora: hora.trim(),
          categoria: categoriaSel.trim() || null,
          subcategoria: subcategoria.trim() || null,
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
      Alert.alert('Erro', 'Não foi possível criar a seletiva.');
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.box}>
          <Text style={styles.title}>
            {ehUsuario ? 'Criar postagem' : 'Criar seletiva'}
          </Text>

          {ehUsuario ? (
            <>
              <View style={styles.field}>
                <Text style={styles.label}>Texto da postagem</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Conte algo, descreva a oportunidade..."
                  placeholderTextColor="#6B7280"
                  multiline
                  value={texto_postagem}
                  onChangeText={setTexto}
                  maxLength={500}
                />
                <Text style={styles.charCounter}>
                  {texto_postagem.length}/500
                </Text>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Categoria (opcional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Geral, oportunidade, aviso..."
                  placeholderTextColor="#6B7280"
                  value={categoriaPost}
                  onChangeText={setCategoriaPost}
                  maxLength={40}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Tag (opcional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="#atacante, #teste, etc."
                  placeholderTextColor="#6B7280"
                  value={tag}
                  onChangeText={setTag}
                  maxLength={30}
                />
              </View>
            </>
          ) : (
            <>
              <View style={styles.field}>
                <Text style={styles.label}>Título da seletiva</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Peneira sub-20"
                  placeholderTextColor="#6B7280"
                  value={titulo}
                  onChangeText={setTitulo}
                  maxLength={80}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Descrição</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Explique como será a seletiva..."
                  placeholderTextColor="#6B7280"
                  multiline
                  value={sobre}
                  onChangeText={setSobre}
                  maxLength={600}
                />
                <Text style={styles.charCounter}>{sobre.length}/600</Text>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Localização</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Campo, endereço, etc."
                  placeholderTextColor="#6B7280"
                  value={localizacao}
                  onChangeText={setLocalizacao}
                  maxLength={120}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Cidade</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: São José dos Campos"
                  placeholderTextColor="#6B7280"
                  value={cidade}
                  onChangeText={setCidade}
                  maxLength={60}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.field, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>Data</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="dd/mm/aaaa"
                    placeholderTextColor="#6B7280"
                    value={data_seletiva}
                    onChangeText={(value) => {
                      let digits = value.replace(/\D/g, '').slice(0, 8);
                      let formatted = '';
                      if (digits.length <= 2) {
                        formatted = digits;
                      } else if (digits.length <= 4) {
                        formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
                      } else {
                        formatted = `${digits.slice(0, 2)}/${digits.slice(
                          2,
                          4
                        )}/${digits.slice(4)}`;
                      }
                      setDataSeletiva(formatted);
                    }}
                    keyboardType="numeric"
                    maxLength={10}
                  />
                </View>

                <View style={[styles.field, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.label}>Hora</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="hh:mm"
                    placeholderTextColor="#6B7280"
                    value={hora}
                    onChangeText={(value) => {
                      let digits = value.replace(/\D/g, '').slice(0, 4);
                      let formatted = '';
                      if (digits.length <= 2) {
                        formatted = digits;
                      } else {
                        formatted = `${digits.slice(0, 2)}:${digits.slice(2)}`;
                      }
                      setHora(formatted);
                    }}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Categoria (opcional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: sub-20, profissional..."
                  placeholderTextColor="#6B7280"
                  value={categoriaSel}
                  onChangeText={setCategoriaSel}
                  maxLength={40}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Subcategoria (opcional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: campo, society, futsal..."
                  placeholderTextColor="#6B7280"
                  value={subcategoria}
                  onChangeText={setSubcategoria}
                  maxLength={40}
                />
              </View>
            </>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>Imagem (opcional)</Text>
            <TouchableOpacity
              style={styles.imageButton}
              onPress={handlePickImage}
            >
              <Text style={styles.imageButtonText}>
                {imagemLocal ? 'Trocar imagem' : 'Selecionar da galeria'}
              </Text>
            </TouchableOpacity>
            {imagemLocal && (
              <Image source={{ uri: imagemLocal }} style={styles.preview} />
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
              <Text style={styles.buttonText}>
                {ehUsuario ? 'Publicar postagem' : 'Criar seletiva'}
              </Text>
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
    backgroundColor: '#020617',
  },
  scroll: {
    flexGrow: 1,
  },
  box: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    backgroundColor: '#0B1120',
    borderRadius: 24,
    padding: 16,
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
    backgroundColor: '#020617',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#F9FAFB',
    fontSize: 14,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCounter: {
    color: '#6B7280',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
  },
  imageButton: {
    backgroundColor: '#111827',
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: 'center',
    marginTop: 4,
  },
  imageButtonText: {
    color: '#E5E7EB',
    fontSize: 13,
    fontWeight: '500',
  },
  preview: {
    marginTop: 8,
    width: '100%',
    height: 180,
    borderRadius: 16,
  },
  button: {
    backgroundColor: '#22C55E',
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
