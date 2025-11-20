import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const LoginScreen = ({ navigation }: any) => {
  const { login, tipoSelecionado, setTipoSelecionado, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  const handleLogin = async () => {
    setErro(null);

    if (!email || !senha) {
      setErro('Preencha email e senha.');
      return;
    }

    try {
      await login({ email, senha });
      // Não precisa navegar aqui: o AppNavigator reage ao token
    } catch (e: any) {
      setErro(e.message || 'Erro ao fazer login.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.box}>
        <Text style={styles.logo}>DraftMe</Text>

        <Text style={styles.subtitle}>Entre para jogar o próximo jogo da sua vida</Text>

        {/* Toggle Usuário / Time */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              tipoSelecionado === 'usuario' && styles.toggleButtonActive,
            ]}
            onPress={() => setTipoSelecionado('usuario')}
          >
            <Text
              style={[
                styles.toggleText,
                tipoSelecionado === 'usuario' && styles.toggleTextActive,
              ]}
            >
              Jogador
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleButton,
              tipoSelecionado === 'time' && styles.toggleButtonActive,
            ]}
            onPress={() => setTipoSelecionado('time')}
          >
            <Text
              style={[
                styles.toggleText,
                tipoSelecionado === 'time' && styles.toggleTextActive,
              ]}
            >
              Time
            </Text>
          </TouchableOpacity>
        </View>

        {/* Campo de e-mail */}
        <View style={styles.field}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            placeholder={
              tipoSelecionado === 'usuario'
                ? 'seuemail@exemplo.com'
                : 'contato@seutime.com'
            }
            placeholderTextColor="#6B7280"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        {/* Campo de senha */}
        <View style={styles.field}>
          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="********"
            placeholderTextColor="#6B7280"
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
          />
        </View>

        {erro && <Text style={styles.errorText}>{erro}</Text>}

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#F9FAFB" />
          ) : (
            <Text style={styles.buttonText}>Entrar</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Ainda não tem conta?</Text>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate(
                tipoSelecionado === 'usuario' ? 'RegisterUser' : 'RegisterTeam',
              )
            }
          >
            <Text style={styles.footerLink}>
              {tipoSelecionado === 'usuario'
                ? 'Cadastrar jogador'
                : 'Cadastrar time'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    width: '90%',
    backgroundColor: '#020617',
  },
  logo: {
    fontSize: 32,
    fontWeight: '800',
    color: '#F9FAFB',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    color: '#E5E7EB',
    marginBottom: 6,
    fontSize: 14,
  },
  input: {
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#F9FAFB',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#22C55E',
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#F9FAFB',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#F87171',
    marginBottom: 8,
    fontSize: 13,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 4,
  },
  footerText: {
    color: '#9CA3AF',
    fontSize: 13,
  },
  footerLink: {
    color: '#22C55E',
    fontSize: 13,
    fontWeight: '600',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#020617',
    borderColor: '#374151',
    borderWidth: 1,
    borderRadius: 999,
    padding: 4,
    marginBottom: 20,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 999,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#22C55E',
  },
  toggleText: {
    color: '#9CA3AF',
    fontWeight: '500',
  },
  toggleTextActive: {
    color: '#F9FAFB',
  },
});
