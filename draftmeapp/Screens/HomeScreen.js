import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  StatusBar,
  Dimensions 
} from 'react-native';
import Button from '../components/Button';
import { theme } from '../styles/theme';

const { width, height } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <View style={styles.container}>
        {/* Container principal baseado no site */}
        <View style={styles.content}>
          
          {/* Seção azul lateral (simulando o ::before do site) */}
          <View style={styles.sideSection}>
            <Text style={styles.welcomeTitle}>Seja bem-vindo ao nosso app!</Text>
            <Text style={styles.welcomeDescription}>
              Se você for um jogador, clique abaixo:
            </Text>
            <Button
              title="Entrar"
              onPress={() => navigation.navigate('Register')}
              variant="outline"
              style={styles.welcomeButton}
            />
          </View>
          
          {/* Seção principal */}
          <View style={styles.mainSection}>
            <Text style={styles.mainTitle}>Entrar aqui!</Text>
            
            <Text style={styles.mainDescription}>
              Se for um time entre aqui por favor :)
            </Text>
            
            <Button
              title="Time"
              onPress={() => navigation.navigate('Login')}
              variant="primary"
              style={styles.mainButton}
            />
            
            <Text style={styles.switchText}>
              Já tem uma conta?{' '}
              <Text 
                style={styles.switchLink}
                onPress={() => navigation.navigate('Login')}
              >
                Faça login
              </Text>
            </Text>
          </View>
        </View>
        
        {/* Logo/Branding */}
        <View style={styles.brandingContainer}>
          <Text style={styles.appName}>DraftMe</Text>
          <Text style={styles.tagline}>Conectando atletas e times</Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,  // #EFEFEF como no site
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  
  content: {
    backgroundColor: theme.colors.backgroundCard,  // #FFFFFF
    borderRadius: 15,                              // Mesmo raio do site
    width: '100%',
    maxWidth: 400,
    height: height * 0.5,
    flexDirection: 'row',
    position: 'relative',
    ...theme.shadows.lg,                          // Sombra do site
  },
  
  // Seção lateral azul (simulando o ::before do CSS)
  sideSection: {
    backgroundColor: theme.colors.primary,        // #0D1936
    width: '40%',
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
    padding: theme.spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  welcomeTitle: {
    fontSize: theme.typography.fontSize['2xl'],   // 24px como no site
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textOnDark,              // Branco
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    textTransform: 'capitalize',                 // Como no site
  },
  
  welcomeDescription: {
    fontSize: theme.typography.fontSize.sm,      // 14px como no site
    fontWeight: theme.typography.fontWeight.light, // 300 como no site
    color: theme.colors.textOnDark,
    textAlign: 'center',
    lineHeight: 20,                              // line-height: 30px adaptado
    marginBottom: theme.spacing.lg,
  },
  
  welcomeButton: {
    backgroundColor: 'transparent',
    borderColor: theme.colors.white,
    borderWidth: 1,
    width: 120,                                  // width: 150px adaptado
    minHeight: 40,                               // Menor que o padrão
    paddingHorizontal: 20,
  },
  
  // Seção principal
  mainSection: {
    flex: 1,
    padding: theme.spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  mainTitle: {
    fontSize: theme.typography.fontSize['2xl'],   // 24px
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,                 // #0D1936
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    textTransform: 'capitalize',
  },
  
  mainDescription: {
    fontSize: theme.typography.fontSize.sm,      // 14px
    color: theme.colors.textSecondary,           // #7f8c8d equivalente
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  
  mainButton: {
    width: 120,                                  // width: 150px adaptado
    minHeight: 40,
    marginBottom: theme.spacing.lg,
  },
  
  switchText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  
  switchLink: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
    textDecorationLine: 'underline',
  },
  
  // Branding
  brandingContainer: {
    marginTop: theme.spacing.xl,
    alignItems: 'center',
  },
  
  appName: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  
  tagline: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

