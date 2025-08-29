import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import { theme } from '../styles/theme';
import { supabase } from '../supabaseClient';

export default function LoginScreen({ navigation }) {
  const [formData, setFormData] = useState({
    email: '',
    senha: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!formData.email.includes('@')) {
      newErrors.email = 'Email inválido';
    }
    
    if (!formData.senha.trim()) {
      newErrors.senha = 'Senha é obrigatória';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // 1. Fazer login no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.senha,
      });

      if (authError) {
        Alert.alert('Erro', 'Email ou senha incorretos');
        return;
      }

      // 2. Verificar se é jogador ou time
      const { data: userData, error: userError } = await supabase
        .from('tb_usuario')
        .select('*')
        .eq('email_usuario', formData.email)
        .single();

      const { data: teamData, error: teamError } = await supabase
        .from('tb_time')
        .select('*')
        .eq('email_time', formData.email)
        .single();

      let userType = null;
      let userInfo = null;

      if (userData && !userError) {
        userType = 'player';
        userInfo = userData;
      } else if (teamData && !teamError) {
        userType = 'team';
        userInfo = teamData;
      }

      if (!userType) {
        Alert.alert('Erro', 'Usuário não encontrado no sistema');
        return;
      }

      // 3. Navegar para a tela principal com os dados do usuário
      navigation.navigate('Main', { 
        userType, 
        userInfo,
        email: formData.email 
      });

    } catch (error) {
      Alert.alert('Erro', 'Erro inesperado: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <LinearGradient
          colors={[theme.colors.gradientStart, theme.colors.gradientMiddle, theme.colors.gradientEnd]}
          style={styles.gradient}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Bem-vindo de volta!</Text>
              <Text style={styles.subtitle}>Entre na sua conta DraftMe</Text>
            </View>

            {/* Login Form */}
            <Card style={styles.formCard} variant="elevated">
              <View style={styles.form}>
                <Input
                  label="Email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  leftIcon="📧"
                  error={errors.email}
                />
                
                <Input
                  label="Senha"
                  placeholder="Sua senha"
                  value={formData.senha}
                  onChangeText={(value) => handleInputChange('senha', value)}
                  secureTextEntry
                  leftIcon="🔒"
                  error={errors.senha}
                />

                <Button
                  title="Entrar"
                  onPress={handleLogin}
                  loading={loading}
                  size="large"
                  icon="🚀"
                  style={styles.loginButton}
                />
              </View>
            </Card>

            {/* Actions */}
            <View style={styles.actions}>
              <Button
                title="Esqueceu a senha?"
                onPress={() => navigation.navigate('ForgotPassword')}
                variant="ghost"
                size="small"
              />
              
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>ou</Text>
                <View style={styles.dividerLine} />
              </View>

              <Button
                title="Criar nova conta"
                onPress={() => navigation.navigate('Register')}
                variant="outline"
                size="large"
                icon="⭐"
                style={styles.registerButton}
              />
            </View>
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>
    </>
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
    padding: theme.spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing['2xl'],
  },
  title: {
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textOnDark,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.typography.fontSize.lg,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontWeight: theme.typography.fontWeight.medium,
  },
  formCard: {
    marginBottom: theme.spacing.xl,
  },
  form: {
    gap: theme.spacing.sm,
  },
  loginButton: {
    marginTop: theme.spacing.md,
  },
  actions: {
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: theme.spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dividerText: {
    color: 'rgba(255, 255, 255, 0.7)',
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.typography.fontSize.sm,
  },
  registerButton: {
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 2,
  },
});

