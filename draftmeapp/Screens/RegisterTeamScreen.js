import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../supabaseClient';

export default function RegisterTeamScreen({ navigation }) {
  const [formData, setFormData] = useState({
    nomeTime: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    cnpj: '',
    categoria: 'Amador',
    esporte: 'Futebol',
    sobre: '',
    localizacao: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCNPJ = (cnpj) => {
    return cnpj.replace(/\D/g, '').slice(0, 14);
  };

  const validateForm = () => {
    if (!formData.nomeTime.trim()) {
      Alert.alert('Erro', 'Nome do time é obrigatório');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Erro', 'Email é obrigatório');
      return false;
    }
    if (!formData.email.includes('@')) {
      Alert.alert('Erro', 'Email inválido');
      return false;
    }
    if (formData.senha.length < 6) {
      Alert.alert('Erro', 'Senha deve ter pelo menos 6 caracteres');
      return false;
    }
    if (formData.senha !== formData.confirmarSenha) {
      Alert.alert('Erro', 'Senhas não coincidem');
      return false;
    }
    if (formData.cnpj && formatCNPJ(formData.cnpj).length !== 14) {
      Alert.alert('Erro', 'CNPJ deve ter 14 dígitos ou deixe em branco');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // 1. Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.senha,
      });

      if (authError) {
        Alert.alert('Erro', authError.message);
        return;
      }

      // 2. Inserir dados na tabela tb_time
      const { error: dbError } = await supabase
        .from('tb_time')
        .insert([
          {
            nm_time: formData.nomeTime,
            email_time: formData.email,
            time_cnpj: formatCNPJ(formData.cnpj) || null,
            categoria_time: formData.categoria,
            senha_time: formData.senha, // Em produção, usar hash
            esporte_time: formData.esporte,
            sobre_time: formData.sobre || null,
            localizacao_time: formData.localizacao || null,
          }
        ]);

      if (dbError) {
        Alert.alert('Erro', 'Erro ao salvar dados: ' + dbError.message);
        return;
      }

      Alert.alert(
        'Sucesso!', 
        'Time cadastrado com sucesso! Verifique seu email para confirmar a conta.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login')
          }
        ]
      );

    } catch (error) {
      Alert.alert('Erro', 'Erro inesperado: ' + error.message);
    } finally {
      setLoading(false);
    }
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
          <Text style={styles.title}>Cadastro de Time</Text>
          
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Nome do time"
              value={formData.nomeTime}
              onChangeText={(value) => handleInputChange('nomeTime', value)}
              placeholderTextColor="#999"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Email do time"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#999"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Senha (mín. 6 caracteres)"
              value={formData.senha}
              onChangeText={(value) => handleInputChange('senha', value)}
              secureTextEntry
              placeholderTextColor="#999"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Confirmar senha"
              value={formData.confirmarSenha}
              onChangeText={(value) => handleInputChange('confirmarSenha', value)}
              secureTextEntry
              placeholderTextColor="#999"
            />
            
            <TextInput
              style={styles.input}
              placeholder="CNPJ (opcional - apenas números)"
              value={formData.cnpj}
              onChangeText={(value) => handleInputChange('cnpj', formatCNPJ(value))}
              keyboardType="numeric"
              placeholderTextColor="#999"
            />

            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Categoria:</Text>
              <Picker
                selectedValue={formData.categoria}
                style={styles.picker}
                onValueChange={(value) => handleInputChange('categoria', value)}
              >
                <Picker.Item label="Amador" value="Amador" />
                <Picker.Item label="Semi-Profissional" value="Semi-Profissional" />
                <Picker.Item label="Profissional" value="Profissional" />
                <Picker.Item label="Juvenil" value="Juvenil" />
                <Picker.Item label="Infantil" value="Infantil" />
              </Picker>
            </View>

            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Esporte:</Text>
              <Picker
                selectedValue={formData.esporte}
                style={styles.picker}
                onValueChange={(value) => handleInputChange('esporte', value)}
              >
                <Picker.Item label="Futebol" value="Futebol" />
                <Picker.Item label="Basquete" value="Basquete" />
                <Picker.Item label="Vôlei" value="Vôlei" />
              </Picker>
            </View>
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Sobre o time (opcional)"
              value={formData.sobre}
              onChangeText={(value) => handleInputChange('sobre', value)}
              multiline
              numberOfLines={3}
              placeholderTextColor="#999"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Localização (opcional)"
              value={formData.localizacao}
              onChangeText={(value) => handleInputChange('localizacao', value)}
              placeholderTextColor="#999"
            />
          </View>

          <TouchableOpacity 
            style={[styles.registerButton, loading && styles.disabledButton]} 
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.registerButtonText}>
              {loading ? 'Cadastrando...' : 'Criar Time'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Voltar</Text>
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
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',
  },
  form: {
    marginBottom: 30,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
  registerButton: {
    backgroundColor: '#4C6EF5',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 40,
    marginBottom: 20,
    shadowColor: '#4C6EF5',
    shadowOpacity: 0.7,
    shadowRadius: 5,
    elevation: 5,
  },
  disabledButton: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  backButton: {
    padding: 15,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

