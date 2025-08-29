import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  Linking 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../supabaseClient';

export default function ProfileScreen({ navigation, route }) {
  const { targetInfo, targetType, userType, userInfo } = route.params || {};
  const [posts, setPosts] = useState([]);
  const [teamPlayers, setTeamPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      if (targetType === 'team') {
        // Carregar postagens do time
        await loadTeamPosts();
        // Carregar jogadores do time
        await loadTeamPlayers();
      }
      // Para jogadores, podemos carregar estatísticas futuras
    } catch (error) {
      Alert.alert('Erro', 'Erro ao carregar dados do perfil: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadTeamPosts = async () => {
    const { data, error } = await supabase
      .from('tb_postagem')
      .select('*')
      .eq('id_time', targetInfo.id_time)
      .order('data_postagem', { ascending: false })
      .limit(5);

    if (!error) {
      setPosts(data || []);
    }
  };

  const loadTeamPlayers = async () => {
    const { data, error } = await supabase
      .from('tb_usuario')
      .select('nm_usuario, email_usuario, dt_nasc_usuario')
      .eq('id_time', targetInfo.id_time);

    if (!error) {
      setTeamPlayers(data || []);
    }
  };

  const handleContact = () => {
    const email = targetType === 'team' ? targetInfo.email_time : targetInfo.email_usuario;
    const name = targetType === 'team' ? targetInfo.nm_time : targetInfo.nm_usuario;
    
    Alert.alert(
      'Entrar em Contato',
      `Como deseja entrar em contato com ${name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Email', 
          onPress: () => Linking.openURL(`mailto:${email}`)
        },
        { 
          text: 'Copiar Email', 
          onPress: () => {
            // Em um app real, usaria Clipboard
            Alert.alert('Email', email);
          }
        }
      ]
    );
  };

  const handleInterest = () => {
    const targetName = targetType === 'team' ? targetInfo.nm_time : targetInfo.nm_usuario;
    const userName = userType === 'team' ? userInfo.nm_time : userInfo.nm_usuario;
    
    Alert.alert(
      'Demonstrar Interesse',
      `Deseja demonstrar interesse em ${targetType === 'team' ? 'jogar neste time' : 'recrutar este jogador'}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sim', 
          onPress: () => {
            // Aqui poderia enviar uma notificação ou salvar no banco
            Alert.alert(
              'Interesse Enviado!',
              `Seu interesse foi registrado. ${targetName} será notificado.`
            );
          }
        }
      ]
    );
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const renderTeamProfile = () => (
    <ScrollView style={styles.profileContainer}>
      <View style={styles.headerSection}>
        <Text style={styles.profileName}>{targetInfo.nm_time}</Text>
        <View style={styles.badgeContainer}>
          <View style={styles.sportBadge}>
            <Text style={styles.badgeText}>{targetInfo.esporte_time}</Text>
          </View>
          <View style={styles.categoryBadge}>
            <Text style={styles.badgeText}>{targetInfo.categoria_time}</Text>
          </View>
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Informações do Time</Text>
        <Text style={styles.infoText}>📧 Email: {targetInfo.email_time}</Text>
        <Text style={styles.infoText}>📍 Localização: {targetInfo.localizacao_time || 'Não informada'}</Text>
        {targetInfo.time_cnpj && (
          <Text style={styles.infoText}>🏢 CNPJ: {targetInfo.time_cnpj}</Text>
        )}
      </View>

      {targetInfo.sobre_time && (
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Sobre o Time</Text>
          <Text style={styles.descriptionText}>{targetInfo.sobre_time}</Text>
        </View>
      )}

      {teamPlayers.length > 0 && (
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Jogadores ({teamPlayers.length})</Text>
          {teamPlayers.map((player, index) => (
            <View key={index} style={styles.playerItem}>
              <Text style={styles.playerName}>{player.nm_usuario}</Text>
              <Text style={styles.playerAge}>
                {calculateAge(player.dt_nasc_usuario)} anos
              </Text>
            </View>
          ))}
        </View>
      )}

      {posts.length > 0 && (
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Postagens Recentes</Text>
          {posts.map((post, index) => (
            <View key={index} style={styles.postItem}>
              <Text style={styles.postDate}>{formatDate(post.data_postagem)}</Text>
              <Text style={styles.postText} numberOfLines={2}>
                {post.texto_postagem || 'Postagem com imagem'}
              </Text>
              {post.categoria && (
                <Text style={styles.postCategory}>#{post.categoria}</Text>
              )}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );

  const renderPlayerProfile = () => (
    <ScrollView style={styles.profileContainer}>
      <View style={styles.headerSection}>
        <Text style={styles.profileName}>{targetInfo.nm_usuario}</Text>
        <Text style={styles.profileAge}>
          {calculateAge(targetInfo.dt_nasc_usuario)} anos
        </Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Informações Pessoais</Text>
        <Text style={styles.infoText}>📧 Email: {targetInfo.email_usuario}</Text>
        <Text style={styles.infoText}>🎂 Nascimento: {formatDate(targetInfo.dt_nasc_usuario)}</Text>
        {targetInfo.tel_usuario && (
          <Text style={styles.infoText}>📱 Telefone: {targetInfo.tel_usuario}</Text>
        )}
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Status</Text>
        <Text style={styles.infoText}>
          ⚽ {targetInfo.id_time ? 'Já possui time' : 'Disponível para recrutamento'}
        </Text>
      </View>

      {/* Seção futura para estatísticas */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Estatísticas</Text>
        <Text style={styles.infoText}>📊 Em desenvolvimento...</Text>
      </View>
    </ScrollView>
  );

  return (
    <LinearGradient
      colors={['#6A4CFF', '#8A58FF', '#4C6EF5']}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          Perfil {targetType === 'team' ? 'do Time' : 'do Jogador'}
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando perfil...</Text>
        </View>
      ) : (
        <>
          {targetType === 'team' ? renderTeamProfile() : renderPlayerProfile()}
          
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.contactButton}
              onPress={handleContact}
            >
              <Text style={styles.contactButtonText}>📧 Entrar em Contato</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.interestButton}
              onPress={handleInterest}
            >
              <Text style={styles.interestButtonText}>
                ⭐ {targetType === 'team' ? 'Quero Jogar' : 'Quero Recrutar'}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
  profileContainer: {
    flex: 1,
    padding: 20,
  },
  headerSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  profileAge: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  sportBadge: {
    backgroundColor: '#4C6EF5',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  categoryBadge: {
    backgroundColor: '#28a745',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  infoSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
  descriptionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
  playerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  playerName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  playerAge: {
    fontSize: 12,
    color: '#666',
  },
  postItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  postDate: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
  },
  postText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  postCategory: {
    fontSize: 12,
    color: '#4C6EF5',
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
  },
  contactButton: {
    flex: 1,
    backgroundColor: '#4C6EF5',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  interestButton: {
    flex: 1,
    backgroundColor: '#28a745',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  interestButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

