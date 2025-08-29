import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../supabaseClient';

export default function CreatePostScreen({ navigation, route }) {
  const { userType, userInfo } = route.params || {};
  const [formData, setFormData] = useState({
    texto: '',
    categoria: 'Geral',
    tag: '',
    imagem: null,
  });
  const [loading, setLoading] = useState(false);

  const categorias = ['Geral', 'Treino', 'Jogo', 'Recrutamento', 'Evento', 'Conquista'];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Erro', 'Precisamos de permissão para acessar suas fotos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        setFormData(prev => ({
          ...prev,
          imagem: result.assets[0]
        }));
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao selecionar imagem: ' + error.message);
    }
  };

  const uploadImage = async (imageUri) => {
    try {
      // Simular upload - em produção, usar Supabase Storage
      // Por enquanto, retornar a URI local
      return imageUri;
    } catch (error) {
      throw new Error('Erro ao fazer upload da imagem');
    }
  };

  const validateForm = () => {
    if (!formData.texto.trim() && !formData.imagem) {
      Alert.alert('Erro', 'Adicione um texto ou uma imagem para a postagem');
      return false;
    }
    if (userType !== 'team') {
      Alert.alert('Erro', 'Apenas times podem criar postagens');
      return false;
    }
    return true;
  };

  const handleCreatePost = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      let imageUrl = null;
      
      // Upload da imagem se existir
      if (formData.imagem) {
        imageUrl = await uploadImage(formData.imagem.uri);
      }

      // Criar postagem no banco
      const { error } = await supabase
        .from('tb_postagem')
        .insert([
          {
            texto_postagem: formData.texto.trim() || null,
            img_postagem: imageUrl,
            categoria: formData.categoria,
            tag: formData.tag.trim() || null,
            id_time: userInfo.id_time,
          }
        ]);

      if (error) {
        Alert.alert('Erro', 'Erro ao criar postagem: ' + error.message);
        return;
      }

      Alert.alert(
        'Sucesso!', 
        'Postagem criada com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );

    } catch (error) {
      Alert.alert('Erro', 'Erro inesperado: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      imagem: null
    }));
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#6A4CFF', '#8A58FF', '#4C6EF5']}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>← Voltar</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Nova Postagem</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{userInfo?.nm_time || 'Time'}</Text>
              <Text style={styles.userType}>Postando como time</Text>
            </View>

            <TextInput
              style={styles.textInput}
              placeholder="O que você quer compartilhar?"
              value={formData.texto}
              onChangeText={(value) => handleInputChange('texto', value)}
              multiline
              numberOfLines={4}
              placeholderTextColor="#999"
            />

            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Categoria:</Text>
              <Picker
                selectedValue={formData.categoria}
                style={styles.picker}
                onValueChange={(value) => handleInputChange('categoria', value)}
              >
                {categorias.map(categoria => (
                  <Picker.Item 
                    key={categoria} 
                    label={categoria} 
                    value={categoria} 
                  />
                ))}
              </Picker>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Tag (opcional, ex: treino, jogo)"
              value={formData.tag}
              onChangeText={(value) => handleInputChange('tag', value)}
              placeholderTextColor="#999"
            />

            <View style={styles.imageSection}>
              <Text style={styles.sectionTitle}>Imagem (opcional)</Text>
              
              {formData.imagem ? (
                <View style={styles.imageContainer}>
                  <Image 
                    source={{ uri: formData.imagem.uri }} 
                    style={styles.selectedImage} 
                  />
                  <TouchableOpacity 
                    style={styles.removeImageButton}
                    onPress={removeImage}
                  >
                    <Text style={styles.removeImageText}>✕ Remover</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.imagePickerButton}
                  onPress={pickImage}
                >
                  <Text style={styles.imagePickerText}>📷 Adicionar Imagem</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.createButton, loading && styles.disabledButton]} 
            onPress={handleCreatePost}
            disabled={loading}
          >
            <Text style={styles.createButtonText}>
              {loading ? 'Publicando...' : 'Publicar'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 30,
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
  form: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
  },
  userInfo: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  userType: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#333',
    textAlignVertical: 'top',
    height: 100,
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  pickerLabel: {
    fontSize: 16,
    color: '#333',
    marginTop: 10,
    marginBottom: 5,
    fontWeight: '500',
  },
  picker: {
    height: 50,
    color: '#333',
  },
  imageSection: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 10,
  },
  imageContainer: {
    alignItems: 'center',
  },
  selectedImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  removeImageButton: {
    backgroundColor: '#ff4757',
    borderRadius: 5,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  removeImageText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  imagePickerButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 30,
    alignItems: 'center',
  },
  imagePickerText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  createButton: {
    backgroundColor: '#4C6EF5',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 40,
    shadowColor: '#4C6EF5',
    shadowOpacity: 0.7,
    shadowRadius: 5,
    elevation: 5,
  },
  disabledButton: {
    opacity: 0.6,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

