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
import { supabase } from '../supabaseClient';

export default function RegisterPlayerScreen({ navigation }) {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    cpf: '',
    dataNascimento: '',
    telefone: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCPF = (cpf) => {
    return cpf.replace(/\D/g, '').slice(0, 11);
  };

  const formatPhone = (phone) => {
    return phone.replace(/\D/g, '').slice(0, 11);
  };

  const validateForm = () => {
    if (!formData.nome.trim()) {
      Alert.alert('Erro', 'Nome é obrigatório');
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
    if (formatCPF(formData.cpf).length !== 11) {
      Alert.alert('Erro', 'CPF deve ter 11 dígitos');
      return false;
    }
    if (!formData.dataNascimento.trim()) {
      Alert.alert('Erro', 'Data de nascimento é obrigatória');
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

      // 2. Inserir dados na tabela tb_usuario
      const { error: dbError } = await supabase
        .from('tb_usuario')
        .insert([
          {
            nm_usuario: formData.nome,
            senha_usuario: formData.senha, // Em produção, usar hash
            cpf_usuario: formatCPF(formData.cpf),
            email_usuario: formData.email,
            dt_nasc_usuario: formData.dataNascimento,
            tel_usuario: formatPhone(formData.telefone),
          }
        ]);

      if (dbError) {
        Alert.alert('Erro', 'Erro ao salvar dados: ' + dbError.message);
        return;
      }

      Alert.alert(
        'Sucesso!', 
        'Conta criada com sucesso! Verifique seu email para confirmar a conta.',
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
          <Text style={styles.title}>Cadastro de Jogador</Text>
          
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Nome completo"
              value={formData.nome}
              onChangeText={(value) => handleInputChange('nome', value)}
              placeholderTextColor="#999"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Email"
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
              placeholder="CPF (apenas números)"
              value={formData.cpf}
              onChangeText={(value) => handleInputChange('cpf', formatCPF(value))}
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Data de nascimento (AAAA-MM-DD)"
              value={formData.dataNascimento}
              onChangeText={(value) => handleInputChange('dataNascimento', value)}
              placeholderTextColor="#999"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Telefone (opcional)"
              value={formData.telefone}
              onChangeText={(value) => handleInputChange('telefone', formatPhone(value))}
              keyboardType="phone-pad"
              placeholderTextColor="#999"
            />
          </View>

          <TouchableOpacity 
            style={[styles.registerButton, loading && styles.disabledButton]} 
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.registerButtonText}>
              {loading ? 'Cadastrando...' : 'Criar Conta'}
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

