import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';

const RegisterUserScreen = ({ navigation }: any) => {
  const { registerUsuario } = useAuth();
  const [nm_usuario, setNome] = useState('');
  const [email_usuario, setEmail] = useState('');
  const [senha_usuario, setSenha] = useState('');
  const [cpf_usuario, setCpf] = useState('');
  const [dt_nasc_usuario, setDtNasc] = useState('');
  const [tel_usuario, setTelefone] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleRegister = async () => {
    setErro(null);
    if (!nm_usuario || !email_usuario || !senha_usuario || !cpf_usuario || !dt_nasc_usuario) {
      setErro('Preencha todos os campos obrigatórios');
      return;
    }
    setLoading(true);
    try {
      await registerUsuario({
        nm_usuario,
        email_usuario,
        senha_usuario,
        cpf_usuario,
        dt_nasc_usuario,
        tel_usuario,
      });
    } catch (e: any) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.box}>
          <Text style={styles.title}>Cadastro de Jogador</Text>

          <TextInput
            style={styles.input}
            placeholder="Nome completo"
            placeholderTextColor="#9CA3AF"
            value={nm_usuario}
            onChangeText={setNome}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#9CA3AF"
            value={email_usuario}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            value={senha_usuario}
            onChangeText={setSenha}
          />
          <TextInput
            style={styles.input}
            placeholder="CPF (somente números)"
            placeholderTextColor="#9CA3AF"
            value={cpf_usuario}
            onChangeText={setCpf}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Data de nascimento (YYYY-MM-DD)"
            placeholderTextColor="#9CA3AF"
            value={dt_nasc_usuario}
            onChangeText={setDtNasc}
          />
          <TextInput
            style={styles.input}
            placeholder="Telefone (opcional)"
            placeholderTextColor="#9CA3AF"
            value={tel_usuario}
            onChangeText={setTelefone}
            keyboardType="phone-pad"
          />

          {erro && <Text style={styles.erro}>{erro}</Text>}

          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#F9FAFB" />
            ) : (
              <Text style={styles.buttonText}>Criar conta</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>Voltar para o login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RegisterUserScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  box: {
    marginHorizontal: 24,
    padding: 24,
    backgroundColor: '#0B1120',
    borderRadius: 24,
  },
  title: {
    color: '#F9FAFB',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
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
  back: {
    marginTop: 16,
    alignItems: 'center',
  },
  backText: {
    color: '#38BDF8',
  },
});
