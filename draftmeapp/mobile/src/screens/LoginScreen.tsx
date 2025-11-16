import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';

const LoginScreen = ({ navigation }: any) => {
  const { login, tipoSelecionado, setTipoSelecionado } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleLogin = async () => {
    setErro(null);
    if (!email || !senha) {
      setErro('Preencha email e senha');
      return;
    }
    setLoading(true);
    try {
      await login({ email, senha });
    } catch (e: any) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.box}>
        <Text style={styles.logo}>DraftMe</Text>
        <Text style={styles.subtitle}>Encontre seletivas, mostre seu talento.</Text>

        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleButton, tipoSelecionado === 'usuario' && styles.toggleButtonActive]}
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
            style={[styles.toggleButton, tipoSelecionado === 'time' && styles.toggleButtonActive]}
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

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#9CA3AF"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#9CA3AF"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />

        {erro && <Text style={styles.erro}>{erro}</Text>}

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#F9FAFB" />
          ) : (
            <Text style={styles.buttonText}>Entrar</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Novo no DraftMe?</Text>
        </View>
        <View style={styles.footerRow}>
          <TouchableOpacity onPress={() => navigation.navigate('RegisterUser')}>
            <Text style={styles.link}>Cadastrar como jogador</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.footerRow}>
          <TouchableOpacity onPress={() => navigation.navigate('RegisterTeam')}>
            <Text style={styles.link}>Cadastrar como time</Text>
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
  },
  box: {
    marginHorizontal: 24,
    padding: 24,
    backgroundColor: '#0B1120',
    borderRadius: 24,
  },
  logo: {
    color: '#F9FAFB',
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#020617',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#F9FAFB',
    marginBottom: 12,
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
  erro: {
    color: '#F97316',
    marginBottom: 8,
  },
  footerRow: {
    marginTop: 8,
    alignItems: 'center',
  },
  footerText: {
    color: '#9CA3AF',
  },
  link: {
    color: '#38BDF8',
    fontWeight: '500',
  },
  toggleRow: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 999,
    backgroundColor: '#020617',
    padding: 4,
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
