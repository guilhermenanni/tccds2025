import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const RegisterTeamScreen = ({ navigation }: any) => {
  const { registerTime } = useAuth();

  const [nm_time, setNome] = useState('');
  const [email_time, setEmail] = useState('');
  const [senha_time, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [time_cnpj, setCnpj] = useState('');
  const [categoria_time, setCategoria] = useState('');
  const [esporte_time, setEsporte] = useState('futebol');

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleCnpjChange = (value: string) => {
    const onlyDigits = value.replace(/\D/g, '').slice(0, 14); 
    setCnpj(onlyDigits);
  };

  const validarCampos = () => {
    if (!nm_time.trim()) return 'Informe o nome do time.';
    if (!email_time.trim()) return 'Informe o e-mail.';
    if (!email_time.includes('@')) return 'E-mail inválido.';
    if (senha_time.length < 6) return 'A senha deve ter pelo menos 6 caracteres.';
    if (senha_time !== confirmarSenha) return 'As senhas não conferem.';
    if (time_cnpj.length !== 14) return 'CNPJ deve ter 14 dígitos numéricos.';
    if (!categoria_time.trim()) return 'Informe a categoria do time.';
    if (!esporte_time.trim()) return 'Informe o esporte.';
    return null;
  };

  const handleRegister = async () => {
    setErro(null);

    const erroValidacao = validarCampos();
    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }

    try {
      setLoading(true);
      await registerTime({
        nm_time: nm_time.trim(),
        email_time: email_time.trim().toLowerCase(),
        senha_time,
        time_cnpj,
        categoria_time,
        esporte_time,
      });
    } catch (e: any) {
      setErro(e.message || 'Erro ao registrar time.');
    } finally {
      setLoading(false);
    }
  };

  const botaoDesabilitado = loading;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 20}
      >
        <ScrollView
          contentContainerStyle={[styles.container, { paddingBottom: 60 }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.box}>
            <Text style={styles.title}>Cadastro de time</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Nome do time</Text>
              <TextInput
                style={styles.input}
                value={nm_time}
                onChangeText={setNome}
                placeholder="Nome do time"
                placeholderTextColor="#6B7280"
                maxLength={80}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>E-mail</Text>
              <TextInput
                style={styles.input}
                value={email_time}
                onChangeText={setEmail}
                placeholder="contato@seutime.com"
                placeholderTextColor="#6B7280"
                keyboardType="email-address"
                autoCapitalize="none"
                maxLength={120}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>CNPJ</Text>
              <TextInput
                style={styles.input}
                value={time_cnpj}
                onChangeText={handleCnpjChange}
                placeholder="Somente números"
                placeholderTextColor="#6B7280"
                keyboardType="numeric"
                maxLength={14}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Categoria</Text>
              <TextInput
                style={styles.input}
                value={categoria_time}
                onChangeText={setCategoria}
                placeholder="Sub-20, profissional..."
                placeholderTextColor="#6B7280"
                maxLength={40}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Esporte</Text>
              <TextInput
                style={styles.input}
                value={esporte_time}
                onChangeText={setEsporte}
                placeholder="futebol, futsal..."
                placeholderTextColor="#6B7280"
                maxLength={40}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Senha</Text>
              <TextInput
                style={styles.input}
                value={senha_time}
                onChangeText={setSenha}
                placeholder="********"
                placeholderTextColor="#6B7280"
                secureTextEntry
                maxLength={32}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Confirmar senha</Text>
              <TextInput
                style={styles.input}
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
                placeholder="********"
                placeholderTextColor="#6B7280"
                secureTextEntry
                maxLength={32}
              />
            </View>

            {erro && <Text style={styles.erro}>{erro}</Text>}

            <TouchableOpacity
              style={[styles.button, botaoDesabilitado && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={botaoDesabilitado}
            >
              {loading ? (
                <ActivityIndicator color="#F9FAFB" />
              ) : (
                <Text style={styles.buttonText}>Cadastrar</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.back}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backText}>Voltar para o login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterTeamScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#182d46ff',
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  box: {
    backgroundColor: '#0B1120',
    borderRadius: 24,
    padding: 24,
  },
  title: {
    color: '#F9FAFB',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  field: {
    marginBottom: 12,
  },
  label: {
    color: '#E5E7EB',
    marginBottom: 4,
    fontSize: 14,
  },
  input: {
    backgroundColor: '#020617',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#374151',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#e28e45',
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
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
