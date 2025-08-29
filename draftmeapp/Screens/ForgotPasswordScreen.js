import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../supabaseClient';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('email'); // 'email' ou 'success'

  const validateEmail = () => {
    if (!email.trim()) {
      Alert.alert('Erro', 'Email é obrigatório');
      return false;
    }
    if (!email.includes('@')) {
      Alert.alert('Erro', 'Email inválido');
      return false;
    }
    return true;
  };

  const handleResetPassword = async () => {
    if (!validateEmail()) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://your-app.com/reset-password', // URL do seu app
      });

      if (error) {
        Alert.alert('Erro', error.message);
        return;
      }

      // Também salvar na tabela de recuperação para controle interno
      const codigo = Math.random().toString(36).substring(2, 8).toUpperCase();
      const expiracao = new Date();
      expiracao.setHours(expiracao.getHours() + 1); // Expira em 1 hora

      await supabase
        .from('tb_recuperacao')
        .insert([
          {
            email: email,
            codigo: codigo,
            expiracao: expiracao.toISOString(),
          }
        ]);

      setStep('success');

    } catch (error) {
      Alert.alert('Erro', 'Erro inesperado: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <LinearGradient
        colors={['#6A4CFF', '#8A58FF', '#4C6EF5']}
        style={styles.container}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Email Enviado!</Text>
          <Text style={styles.successMessage}>
            Enviamos um link de recuperação para {email}.
            {'\n\n'}
            Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
          </Text>

          <TouchableOpacity 
            style={styles.button} 
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.buttonText}>Voltar ao Login</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.resendButton} 
            onPress={() => setStep('email')}
          >
            <Text style={styles.resendButtonText}>Enviar novamente</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#6A4CFF', '#8A58FF', '#4C6EF5']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Recuperar Senha</Text>
          <Text style={styles.subtitle}>
            Digite seu email para receber um link de recuperação
          </Text>
          
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#999"
            />
          </View>

          <TouchableOpacity 
            style={[styles.button, loading && styles.disabledButton]} 
            onPress={handleResetPassword}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Enviando...' : 'Enviar Link'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Voltar ao Login</Text>
          </TouchableOpacity>
        </View>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#E0E0FF',
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 24,
  },
  successMessage: {
    fontSize: 16,
    color: '#E0E0FF',
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 24,
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
  button: {
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
  buttonText: {
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
  resendButton: {
    padding: 15,
    alignItems: 'center',
  },
  resendButtonText: {
    color: '#E0E0FF',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

