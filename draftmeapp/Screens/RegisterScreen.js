import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function RegisterScreen({ navigation }) {
  return (
    <LinearGradient
      colors={['#6A4CFF', '#8A58FF', '#4C6EF5']}
      style={styles.container}
    >
      <Text style={styles.title}>Escolha o tipo de conta</Text>
      <Text style={styles.subtitle}>Como você quer se cadastrar no DraftMe?</Text>

      <TouchableOpacity 
        style={styles.optionButton} 
        onPress={() => navigation.navigate('RegisterPlayer')}
      >
        <Text style={styles.optionTitle}>🏃‍♂️ Jogador</Text>
        <Text style={styles.optionDescription}>
          Crie seu perfil como atleta, mostre suas habilidades e estatísticas
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.optionButton} 
        onPress={() => navigation.navigate('RegisterTeam')}
      >
        <Text style={styles.optionTitle}>⚽ Time</Text>
        <Text style={styles.optionDescription}>
          Registre seu time, recrute jogadores e divulgue suas atividades
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  optionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  optionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4C6EF5',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  backButton: {
    marginTop: 20,
    padding: 15,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

