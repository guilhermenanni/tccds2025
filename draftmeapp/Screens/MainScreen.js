import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../supabaseClient';

export default function MainScreen({ route, navigation }) {
  const { userType, userInfo, email } = route.params || {};

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const renderPlayerInfo = () => (
    <View style={styles.userInfo}>
      <Text style={styles.welcomeText}>Bem-vindo, {userInfo.nm_usuario}! 🏃‍♂️</Text>
      <Text style={styles.userType}>Jogador</Text>
      
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Suas Informações:</Text>
        <Text style={styles.infoText}>📧 Email: {userInfo.email_usuario}</Text>
        <Text style={styles.infoText}>📱 Telefone: {userInfo.tel_usuario || 'Não informado'}</Text>
        <Text style={styles.infoText}>🎂 Nascimento: {userInfo.dt_nasc_usuario}</Text>
        {userInfo.id_time && (
          <Text style={styles.infoText}>⚽ Time: ID {userInfo.id_time}</Text>
        )}
      </View>
    </View>
  );

  const renderTeamInfo = () => (
    <View style={styles.userInfo}>
      <Text style={styles.welcomeText}>Bem-vindo, {userInfo.nm_time}! ⚽</Text>
      <Text style={styles.userType}>Time</Text>
      
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Informações do Time:</Text>
        <Text style={styles.infoText}>📧 Email: {userInfo.email_time}</Text>
        <Text style={styles.infoText}>🏆 Categoria: {userInfo.categoria_time}</Text>
        <Text style={styles.infoText}>⚽ Esporte: {userInfo.esporte_time}</Text>
        <Text style={styles.infoText}>📍 Localização: {userInfo.localizacao_time || 'Não informada'}</Text>
        {userInfo.sobre_time && (
          <Text style={styles.infoText}>ℹ️ Sobre: {userInfo.sobre_time}</Text>
        )}
        {userInfo.time_cnpj && (
          <Text style={styles.infoText}>🏢 CNPJ: {userInfo.time_cnpj}</Text>
        )}
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={['#6A4CFF', '#8A58FF', '#4C6EF5']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>DraftMe</Text>
        
        {userType === 'player' ? renderPlayerInfo() : renderTeamInfo()}

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Menu Principal</Text>
          
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => navigation.navigate('Feed', { userType, userInfo })}
          >
            <Text style={styles.menuButtonText}>📝 Feed de Postagens</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => navigation.navigate('MyProfile', { userType, userInfo })}
          >
            <Text style={styles.menuButtonText}>👤 Meu Perfil</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => navigation.navigate('Search', { userType, userInfo })}
          >
            <Text style={styles.menuButtonText}>🔍 Buscar {userType === 'player' ? 'Times' : 'Jogadores'}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => navigation.navigate('Location', { userType, userInfo })}
          >
            <Text style={styles.menuButtonText}>📍 Busca por Localização</Text>
          </TouchableOpacity>
          
          {userType === 'player' && (
            <TouchableOpacity style={styles.menuButton}>
              <Text style={styles.menuButtonText}>📊 Minhas Estatísticas</Text>
            </TouchableOpacity>
          )}
          
          {userType === 'team' && (
            <TouchableOpacity style={styles.menuButton}>
              <Text style={styles.menuButtonText}>👥 Meus Jogadores</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Sair</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  userInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4C6EF5',
    textAlign: 'center',
    marginBottom: 10,
  },
  userType: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  infoSection: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4C6EF5',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
    lineHeight: 20,
  },
  menuSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
  },
  menuButton: {
    backgroundColor: '#4C6EF5',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 10,
    shadowColor: '#4C6EF5',
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  menuButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 40,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});

