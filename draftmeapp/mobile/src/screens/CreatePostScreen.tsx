import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { api } from '../api/client';

const CreatePostScreen = ({ navigation }: any) => {
  const [texto_postagem, setTexto] = useState('');
  const [categoria, setCategoria] = useState('');
  const [tag, setTag] = useState('');
  const [img_postagem, setImg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!texto_postagem) {
      Alert.alert('Atenção', 'Digite o texto da postagem');
      return;
    }
    setLoading(true);
    try {
      await api.post('/postagens', {
        texto_postagem,
        categoria: categoria || null,
        tag: tag || null,
        img_postagem: img_postagem || null,
      });
      Alert.alert('Sucesso', 'Postagem criada com sucesso');
      setTexto('');
      setCategoria('');
      setTag('');
      setImg('');
      navigation.navigate('Feed');
    } catch (e) {
      console.log('Erro ao criar postagem', e);
      Alert.alert('Erro', 'Não foi possível criar a postagem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.box}>
          <Text style={styles.title}>Criar postagem</Text>

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Compartilhe seu momento, resultados, highlights..."
            placeholderTextColor="#9CA3AF"
            value={texto_postagem}
            onChangeText={setTexto}
            multiline
            numberOfLines={4}
          />
          <TextInput
            style={styles.input}
            placeholder="Categoria (opcional)"
            placeholderTextColor="#9CA3AF"
            value={categoria}
            onChangeText={setCategoria}
          />
          <TextInput
            style={styles.input}
            placeholder="Tag (ex: atacante, goleiro)"
            placeholderTextColor="#9CA3AF"
            value={tag}
            onChangeText={setTag}
          />
          <TextInput
            style={styles.input}
            placeholder="URL da imagem (opcional)"
            placeholderTextColor="#9CA3AF"
            value={img_postagem}
            onChangeText={setImg}
          />

          <TouchableOpacity style={styles.button} onPress={handleCreate} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#F9FAFB" />
            ) : (
              <Text style={styles.buttonText}>Publicar</Text>
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
    padding: 16,
    backgroundColor: '#0B1120',
    borderRadius: 24,
  },
  title: {
    color: '#F9FAFB',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#020617',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#F9FAFB',
    marginBottom: 12,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#22C55E',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#F9FAFB',
    fontWeight: '600',
  },
});
