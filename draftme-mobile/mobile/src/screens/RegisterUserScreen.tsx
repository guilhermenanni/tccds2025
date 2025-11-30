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

const RegisterUserScreen = ({ navigation }: any) => {
  const { registerUsuario } = useAuth();

  const [nm_usuario, setNome] = useState('');
  const [email_usuario, setEmail] = useState('');
  const [senha_usuario, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const [cpf_usuario, setCpf] = useState('');
  const [dt_nasc_usuario, setDtNasc] = useState(''); // dd/mm/aaaa na UI
  const [tel_usuario, setTelefone] = useState('');

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // --- Máscaras e validações de input ---

  const handleCpfChange = (value: string) => {
    const onlyDigits = value.replace(/\D/g, '').slice(0, 11); // só número, max 11
    setCpf(onlyDigits);
  };

  const handleTelefoneChange = (value: string) => {
    const onlyDigits = value.replace(/\D/g, '').slice(0, 11); // só número, max 11
    setTelefone(onlyDigits);
  };

  const handleDtNascChange = (value: string) => {
    let digits = value.replace(/\D/g, '').slice(0, 8); // ddmmaaaa
    let formatted = '';

    if (digits.length <= 2) {
      formatted = digits;
    } else if (digits.length <= 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    } else {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    }

    setDtNasc(formatted);
  };

const validarCampos = () => {
  if (!nm_usuario.trim()) return 'Informe o nome.';
  if (!email_usuario.trim()) return 'Informe o e-mail.';
  if (!email_usuario.includes('@')) return 'E-mail inválido.';
  if (senha_usuario.length < 6) return 'A senha deve ter pelo menos 6 caracteres.';
  if (senha_usuario !== confirmarSenha) return 'As senhas não conferem.';
  if (cpf_usuario.length !== 11) return 'CPF deve ter 11 dígitos numéricos.';
  if (tel_usuario.length < 10) return 'Telefone deve ter DDD + número.';
  if (dt_nasc_usuario.length !== 10) return 'Data de nascimento inválida. Use dd/mm/aaaa.';

  const [dia, mes, ano] = dt_nasc_usuario.split('/');
  if (!dia || !mes || !ano || ano.length !== 4) {
    return 'Data de nascimento inválida.';
  }

  const d = Number(dia);
  const m = Number(mes);
  const a = Number(ano);
  const anoAtual = new Date().getFullYear();

  if (d < 1 || d > 31 || m < 1 || m > 12 || a < 1900 || a > anoAtual) {
    return 'Data de nascimento inválida.';
  }

  return null;
};


  const handleRegister = async () => {
    setErro(null);

    const erroValidacao = validarCampos();
    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }

    const [dia, mes, ano] = dt_nasc_usuario.split('/');
    const dtISO = `${ano}-${mes}-${dia}`; // formato que o backend espera (YYYY-MM-DD)

    try {
      setLoading(true);
      await registerUsuario({
        nm_usuario: nm_usuario.trim(),
        email_usuario: email_usuario.trim().toLowerCase(),
        senha_usuario,
        cpf_usuario,
        dt_nasc_usuario: dtISO,
        tel_usuario,
      });

      // Se chegou aqui, cadastrou e já logou => volta pra tela anterior ou vai pro app
      // Se o AppNavigator já usa token, ele vai cair nas telas principais automaticamente
    } catch (e: any) {
      setErro(e.message || 'Erro ao registrar jogador.');
    } finally {
      setLoading(false);
    }
  };

  const botaoDesabilitado = loading;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.box}>
            <Text style={styles.title}>Cadastro de jogador</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Nome completo</Text>
              <TextInput
                style={styles.input}
                value={nm_usuario}
                onChangeText={setNome}
                placeholder="Seu nome"
                placeholderTextColor="#6B7280"
                maxLength={80}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>E-mail</Text>
              <TextInput
                style={styles.input}
                value={email_usuario}
                onChangeText={setEmail}
                placeholder="seuemail@exemplo.com"
                placeholderTextColor="#6B7280"
                keyboardType="email-address"
                autoCapitalize="none"
                maxLength={120}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.field, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>CPF</Text>
                <TextInput
                  style={styles.input}
                  value={cpf_usuario}
                  onChangeText={handleCpfChange}
                  placeholder="Somente números"
                  placeholderTextColor="#6B7280"
                  keyboardType="numeric"
                  maxLength={11}
                />
              </View>

              <View style={[styles.field, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Data de nascimento</Text>
                <TextInput
                  style={styles.input}
                  value={dt_nasc_usuario}
                  onChangeText={handleDtNascChange}
                  placeholder="dd/mm/aaaa"
                  placeholderTextColor="#6B7280"
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Telefone</Text>
              <TextInput
                style={styles.input}
                value={tel_usuario}
                onChangeText={handleTelefoneChange}
                placeholder="DDD + número"
                placeholderTextColor="#6B7280"
                keyboardType="numeric"
                maxLength={11}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Senha</Text>
              <TextInput
                style={styles.input}
                value={senha_usuario}
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

export default RegisterUserScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#182d46ff',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
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
  row: {
    flexDirection: 'row',
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
