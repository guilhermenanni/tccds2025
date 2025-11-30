// mobile/src/screens/CreatePostScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

interface CreatePostScreenProps {
  navigation: any;
}

// Formata só números em DD/MM/AAAA
const formatDateBR = (value: string): string => {
  const digits = value.replace(/\D/g, ''); // só número
  let result = '';

  if (digits.length <= 2) {
    result = digits;
  } else if (digits.length <= 4) {
    result = `${digits.slice(0, 2)}/${digits.slice(2)}`;
  } else {
    result = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
  }

  return result;
};

// Converte DD/MM/AAAA -> YYYY-MM-DD (pro MySQL)
const toSqlDate = (value: string): string => {
  const [d, m, y] = value.split('/');
  if (d && m && y && y.length === 4) {
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return value; // fallback se estiver zoado
};

// Formata só números em HH:MM
const formatTime = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  let result = '';

  if (digits.length <= 2) {
    result = digits;
  } else {
    result = `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
  }

  return result;
};

// Converte HH:MM -> HH:MM:00 (TIME no MySQL)
const toSqlTime = (value: string): string => {
  const [h, m] = value.split(':');
  if (h && m) {
    return `${h.padStart(2, '0')}:${m.padStart(2, '0')}:00`;
  }
  return value;
};

const CATEGORIAS = ['Geral', 'Futebol', 'Basquete', 'Vôlei', 'Futsal'];
const NIVEIS = ['Geral', 'Iniciante', 'Intermediário', 'Avançado'];

const CreatePostScreen: React.FC<CreatePostScreenProps> = ({ navigation }) => {
  const { tipoSelecionado } = useAuth(); // 'usuario' ou 'time'

  const ehUsuario = tipoSelecionado === 'usuario';
  const ehTime = tipoSelecionado === 'time';

  // Regra:
  // - Usuário: só POSTAGEM
  // - Time: pode alternar entre POSTAGEM e SELETIVA
  const [modoTime, setModoTime] = useState<'postagem' | 'seletiva'>('postagem');

  const criandoPost = ehUsuario || (ehTime && modoTime === 'postagem');
  const criandoSeletiva = ehTime && modoTime === 'seletiva';

  // Campos para POSTAGEM
  const [texto_postagem, setTextoPostagem] = useState('');
  const [categoriaPostagem, setCategoriaPostagem] = useState('');
  const [tagPostagem, setTagPostagem] = useState('');

  // Imagem da postagem
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);
  const [imagemBase64, setImagemBase64] = useState<string | null>(null);

  // Campos para SELETIVA (apenas time)
  const [tituloSeletiva, setTituloSeletiva] = useState('');
  const [descricaoSeletiva, setDescricaoSeletiva] = useState(''); // "sobre"
  const [localSeletiva, setLocalSeletiva] = useState(''); // "localizacao"
  const [cidadeSeletiva, setCidadeSeletiva] = useState(''); // "cidade"
  const [dataSeletiva, setDataSeletiva] = useState(''); // DD/MM/AAAA
  const [horaSeletiva, setHoraSeletiva] = useState(''); // HH:MM
  const [categoriaSeletiva, setCategoriaSeletiva] = useState('Geral');
  const [nivelSeletiva, setNivelSeletiva] = useState('Geral');

  const [dropdownCategoriaAberto, setDropdownCategoriaAberto] = useState(false);
  const [dropdownNivelAberto, setDropdownNivelAberto] = useState(false);

  const [carregando, setCarregando] = useState(false);

  const tituloTela = criandoPost ? 'Criar postagem' : 'Criar seletiva';
  const textoBotao = criandoPost ? 'Publicar' : 'Criar seletiva';

  const limparCamposPostagem = () => {
    setTextoPostagem('');
    setCategoriaPostagem('');
    setTagPostagem('');
    setImagemPreview(null);
    setImagemBase64(null);
  };

  const limparCamposSeletiva = () => {
    setTituloSeletiva('');
    setDescricaoSeletiva('');
    setLocalSeletiva('');
    setCidadeSeletiva('');
    setDataSeletiva('');
    setHoraSeletiva('');
    setCategoriaSeletiva('Geral');
    setNivelSeletiva('Geral');
  };

  const escolherImagem = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permissão negada',
          'Precisamos de acesso às fotos para enviar imagens.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });

      if (result.canceled) {
        return;
      }

      const asset = result.assets[0];
      setImagemPreview(asset.uri);

      if (asset.base64) {
        const base64String = `data:image/jpeg;base64,${asset.base64}`;
        setImagemBase64(base64String);
      } else {
        setImagemBase64(null);
      }
    } catch (err) {
      console.log('Erro ao selecionar imagem:', err);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  };

  const handleCreatePost = async () => {
    if (!texto_postagem.trim()) {
      Alert.alert('Aviso', 'Digite algum texto para a postagem.');
      return;
    }

    setCarregando(true);
    try {
      await api.post('/postagens', {
        texto_postagem: texto_postagem.trim(),
        categoria: categoriaPostagem || null,
        tag: tagPostagem || null,
        img_postagem: imagemBase64 || null, // imagem opcional
      });

      limparCamposPostagem();
      Alert.alert('Sucesso', 'Postagem criada com sucesso!');
      navigation.goBack();
    } catch (error: any) {
      console.error('Erro ao criar postagem:', error?.response?.data || error);
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.erro ||
        'Não foi possível criar a postagem.';
      Alert.alert('Erro', msg);
    } finally {
      setCarregando(false);
    }
  };

const handleCreateSeletiva = async () => {
  // Campos obrigatórios segundo o backend:
  // título, sobre, localizacao, data, hora
  if (
    !tituloSeletiva.trim() ||
    !descricaoSeletiva.trim() ||
    !localSeletiva.trim() ||
    !dataSeletiva.trim() ||
    !horaSeletiva.trim()
  ) {
    Alert.alert(
      'Aviso',
      'Preencha título, sobre, localização, data e horário da seletiva.'
    );
    return;
  }

  // Validação da data da seletiva (DD/MM/AAAA)
  const [diaStr, mesStr, anoStr] = dataSeletiva.trim().split('/');
  const dia = Number(diaStr);
  const mes = Number(mesStr);
  const ano = Number(anoStr);

  if (
    !diaStr ||
    !mesStr ||
    !anoStr ||
    anoStr.length !== 4 ||
    Number.isNaN(dia) ||
    Number.isNaN(mes) ||
    Number.isNaN(ano)
  ) {
    Alert.alert('Aviso', 'Data da seletiva inválida. Use o formato dd/mm/aaaa.');
    return;
  }

  const dataObjeto = new Date(ano, mes - 1, dia);
  if (
    Number.isNaN(dataObjeto.getTime()) ||
    dataObjeto.getDate() !== dia ||
    dataObjeto.getMonth() !== mes - 1 ||
    dataObjeto.getFullYear() !== ano
  ) {
    Alert.alert('Aviso', 'Data da seletiva inválida.');
    return;
  }

  // Validação do horário da seletiva (HH:MM)
  const [horaStr, minutoStr] = horaSeletiva.trim().split(':');
  const hora = Number(horaStr);
  const minuto = Number(minutoStr);

  if (
    !horaStr ||
    !minutoStr ||
    Number.isNaN(hora) ||
    Number.isNaN(minuto) ||
    hora < 0 ||
    hora > 23 ||
    minuto < 0 ||
    minuto > 59
  ) {
    Alert.alert(
      'Aviso',
      'Horário da seletiva inválido. Use um horário entre 00:00 e 23:59.'
    );
    return;
  }

  // Verifica se a combinação data + horário está no passado
  const agora = new Date();
  const dataHoraSeletiva = new Date(ano, mes - 1, dia, hora, minuto, 0, 0);
  if (dataHoraSeletiva.getTime() < agora.getTime()) {
    Alert.alert(
      'Aviso',
      'A data/horário da seletiva não pode estar no passado.'
    );
    return;
  }

  const dataSql = toSqlDate(dataSeletiva.trim());
  const horaSql = toSqlTime(horaSeletiva.trim());

  const categoriaFinal = categoriaSeletiva || 'Geral';
  const subcategoriaFinal = nivelSeletiva || 'Geral';
  const cidadeFinal =
    cidadeSeletiva.trim().length > 0
      ? cidadeSeletiva.trim()
      : localSeletiva.trim(); // fallback se o cara esquecer a cidade

  setCarregando(true);
  try {
    await api.post('/seletivas', {
      titulo: tituloSeletiva.trim(),
      sobre: descricaoSeletiva.trim(),
      localizacao: localSeletiva.trim(),
      data_seletiva: dataSql,
      hora: horaSql,
      categoria: categoriaFinal,
      subcategoria: subcategoriaFinal,
      cidade: cidadeFinal,
    });

    limparCamposSeletiva();
    Alert.alert('Sucesso', 'Seletiva criada com sucesso!');
    navigation.goBack();
  } catch (error: any) {
    console.error('Erro ao criar seletiva:', error?.response?.data || error);
    const msg =
      error?.response?.data?.message ||
      error?.response?.data?.erro ||
      'Não foi possível criar a seletiva.';
    Alert.alert('Erro', msg);
  } finally {
    setCarregando(false);
  }
};


  const handleSubmit = () => {
    if (criandoPost) {
      handleCreatePost();
    } else {
      handleCreateSeletiva();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.box}>
          {/* Se for time, mostra o seletor "Postagem | Seletiva" */}
          {ehTime && (
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  modoTime === 'postagem' && styles.toggleButtonActive,
                ]}
                onPress={() => setModoTime('postagem')}
              >
                <Text
                  style={[
                    styles.toggleButtonText,
                    modoTime === 'postagem' && styles.toggleButtonTextActive,
                  ]}
                >
                  Postagem
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  modoTime === 'seletiva' && styles.toggleButtonActive,
                ]}
                onPress={() => setModoTime('seletiva')}
              >
                <Text
                  style={[
                    styles.toggleButtonText,
                    modoTime === 'seletiva' && styles.toggleButtonTextActive,
                  ]}
                >
                  Seletiva
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.title}>{tituloTela}</Text>

          {criandoPost ? (
            <>
              {/* FORMULÁRIO DE POSTAGEM (USUÁRIO + TIME) */}
              <View style={styles.field}>
                <Text style={styles.label}>Texto da postagem</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  multiline
                  value={texto_postagem}
                  onChangeText={setTextoPostagem}
                  placeholder="Compartilhe algo com a comunidade..."
                  placeholderTextColor="#6B7280"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Categoria (opcional)</Text>
                <TextInput
                  style={styles.input}
                  value={categoriaPostagem}
                  onChangeText={setCategoriaPostagem}
                  placeholder="Ex.: Futebol, Basquete..."
                  placeholderTextColor="#6B7280"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Tag (opcional)</Text>
                <TextInput
                  style={styles.input}
                  value={tagPostagem}
                  onChangeText={setTagPostagem}
                  placeholder="Ex.: #sub17, #feminino..."
                  placeholderTextColor="#6B7280"
                />
              </View>

              {/* Imagem da postagem */}
              <View style={styles.field}>
                <Text style={styles.label}>Imagem (opcional)</Text>
                <View style={styles.imageRow}>
                  <TouchableOpacity
                    style={styles.imageButton}
                    onPress={escolherImagem}
                  >
                    <Text style={styles.imageButtonText}>
                      {imagemPreview ? 'Trocar imagem' : 'Selecionar imagem'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {imagemPreview && (
                  <View style={styles.imagePreviewBox}>
                    <Image
                      source={{ uri: imagemPreview }}
                      style={styles.imagePreview}
                      resizeMode="cover"
                    />
                  </View>
                )}
              </View>
            </>
          ) : (
            <>
              {/* FORMULÁRIO DE SELETIVA (APENAS TIME) */}
              <View style={styles.field}>
                <Text style={styles.label}>Título da seletiva</Text>
                <TextInput
                  style={styles.input}
                  value={tituloSeletiva}
                  onChangeText={setTituloSeletiva}
                  placeholder="Ex.: Peneira sub-17"
                  placeholderTextColor="#6B7280"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Sobre</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  multiline
                  value={descricaoSeletiva}
                  onChangeText={setDescricaoSeletiva}
                  placeholder="Explique como funciona a seletiva..."
                  placeholderTextColor="#6B7280"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Localização (campo, ginásio...)</Text>
                <TextInput
                  style={styles.input}
                  value={localSeletiva}
                  onChangeText={setLocalSeletiva}
                  placeholder="Ex.: Estádio Municipal, Quadra do Bairro..."
                  placeholderTextColor="#6B7280"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Cidade</Text>
                <TextInput
                  style={styles.input}
                  value={cidadeSeletiva}
                  onChangeText={setCidadeSeletiva}
                  placeholder="Ex.: São José dos Campos"
                  placeholderTextColor="#6B7280"
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.field, styles.fieldHalf]}>
                  <Text style={styles.label}>Data</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={dataSeletiva}
                    onChangeText={(text) => setDataSeletiva(formatDateBR(text))}
                    placeholder="DD/MM/AAAA"
                    placeholderTextColor="#6B7280"
                    maxLength={10}
                  />
                </View>

                <View style={[styles.field, styles.fieldHalf]}>
                  <Text style={styles.label}>Horário</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={horaSeletiva}
                    onChangeText={(text) => setHoraSeletiva(formatTime(text))}
                    placeholder="HH:MM"
                    placeholderTextColor="#6B7280"
                    maxLength={5}
                  />
                </View>
              </View>

              {/* Dropdowns de categoria e nível */}
              <View style={styles.row}>
                <View style={[styles.field, styles.fieldHalf]}>
                  <Text style={styles.label}>Categoria</Text>
                  <TouchableOpacity
                    style={styles.dropdown}
                    onPress={() =>
                      setDropdownCategoriaAberto((prev) => !prev)
                    }
                  >
                    <Text style={styles.dropdownText}>{categoriaSeletiva}</Text>
                  </TouchableOpacity>
                  {dropdownCategoriaAberto && (
                    <View style={styles.dropdownList}>
                      {CATEGORIAS.map((cat) => (
                        <TouchableOpacity
                          key={cat}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setCategoriaSeletiva(cat);
                            setDropdownCategoriaAberto(false);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>{cat}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                <View style={[styles.field, styles.fieldHalf]}>
                  <Text style={styles.label}>Nível</Text>
                  <TouchableOpacity
                    style={styles.dropdown}
                    onPress={() => setDropdownNivelAberto((prev) => !prev)}
                  >
                    <Text style={styles.dropdownText}>{nivelSeletiva}</Text>
                  </TouchableOpacity>
                  {dropdownNivelAberto && (
                    <View style={styles.dropdownList}>
                      {NIVEIS.map((nivel) => (
                        <TouchableOpacity
                          key={nivel}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setNivelSeletiva(nivel);
                            setDropdownNivelAberto(false);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>{nivel}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            </>
          )}

          <TouchableOpacity
            style={[styles.button, carregando && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={carregando}
          >
            {carregando ? (
              <ActivityIndicator size="small" color="#F9FAFB" />
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
    padding: 16,
  },
  box: {
    backgroundColor: '#213e60',
    borderRadius: 16,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F9FAFB',
    marginBottom: 16,
  },
  field: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#F9FAFB',
    backgroundColor: '#020617',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  button: {
    marginTop: 16,
    backgroundColor: '#e28e45',
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#F9FAFB',
    fontSize: 16,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  fieldHalf: {
    flex: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: '#111827',
    padding: 4,
    borderRadius: 999,
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 999,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#e28e45',
  },
  toggleButtonText: {
    color: '#9CA3AF',
    fontWeight: '500',
  },
  toggleButtonTextActive: {
    color: '#F9FAFB',
    fontWeight: '600',
  },
  imageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageButton: {
    backgroundColor: '#111827',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  imageButtonText: {
    color: '#F9FAFB',
    fontWeight: '500',
    fontSize: 14,
  },
  imagePreviewBox: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#374151',
  },
  imagePreview: {
    width: '100%',
    height: 200,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#020617',
    justifyContent: 'center',
  },
  dropdownText: {
    color: '#F9FAFB',
    fontSize: 14,
  },
  dropdownList: {
    marginTop: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
    backgroundColor: '#020617',
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  dropdownItemText: {
    color: '#E5E7EB',
    fontSize: 14,
  },
});
