import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';

const RegisterTeamScreen = ({ navigation }: any) => {
  const { registerTime } = useAuth();
  const [nm_time, setNome] = useState('');
  const [email_time, setEmail] = useState('');
  const [senha_time, setSenha] = useState('');
  const [time_cnpj, setCnpj] = useState('');
  const [categoria_time, setCategoria] = useState('');
  const [esporte_time, setEsporte] = useState('futebol');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleRegister = async () => {
    setErro(null);
    if (!nm_time || !email_time || !senha_time || !time_cnpj) {
      setErro('Preencha todos os campos obrigatórios');
      return;
    }
    setLoading(true);
    try {
      await registerTime({
        nm_time,
        email_time,
        senha_time,
        time_cnpj,
        categoria_time,
        esporte_time,
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
          <Text style={styles.title}>Cadastro de Time</Text>

          <TextInput
            style={styles.input}
            placeholder="Nome do time"
            placeholderTextColor="#9CA3AF"
            value={nm_time}
            onChangeText={setNome}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#9CA3AF"
            value={email_time}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            value={senha_time}
            onChangeText={setSenha}
          />
          <TextInput
            style={styles.input}
            placeholder="CNPJ (somente números)"
            placeholderTextColor="#9CA3AF"
            value={time_cnpj}
            onChangeText={setCnpj}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Categoria (ex: Sub-15, Sub-17)"
            placeholderTextColor="#9CA3AF"
            value={categoria_time}
            onChangeText={setCategoria}
          />
          <TextInput
            style={styles.input}
            placeholder="Esporte (padrão: futebol)"
            placeholderTextColor="#9CA3AF"
            value={esporte_time}
            onChangeText={setEsporte}
          />

          {erro && <Text style={styles.erro}>{erro}</Text>}

          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#F9FAFB" />
            ) : (
              <Text style={styles.buttonText}>Criar conta de time</Text>
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

export default RegisterTeamScreen;

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
