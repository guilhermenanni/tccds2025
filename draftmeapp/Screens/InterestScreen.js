import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Alert 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../supabaseClient';

// Tabela para gerenciar interesses (seria criada no banco)
// CREATE TABLE tb_interesse (
//   id_interesse SERIAL PRIMARY KEY,
//   id_jogador INT REFERENCES tb_usuario(id_usuario),
//   id_time INT REFERENCES tb_time(id_time),
//   tipo VARCHAR(20) NOT NULL, -- 'jogador_para_time' ou 'time_para_jogador'
//   status VARCHAR(20) DEFAULT 'pendente', -- 'pendente', 'aceito', 'rejeitado'
//   data_interesse TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//   mensagem TEXT
// );

export default function InterestScreen({ navigation, route }) {
  const { userType, userInfo } = route.params || {};
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('received'); // 'received' ou 'sent'

  useEffect(() => {
    loadInterests();
  }, [activeTab]);

  const loadInterests = async () => {
    setLoading(true);
    try {
      // Esta funcionalidade requer uma tabela de interesses no banco
      // Por enquanto, vamos simular dados
      const mockData = [
        {
          id: 1,
          nome: userType === 'player' ? 'FC Barcelona' : 'João Silva',
          tipo: userType === 'player' ? 'time' : 'jogador',
          status: 'pendente',
          data: '2024-01-15',
          mensagem: 'Interessado em fazer parte do time!'
        },
        {
          id: 2,
          nome: userType === 'player' ? 'Real Madrid' : 'Maria Santos',
          tipo: userType === 'player' ? 'time' : 'jogador',
          status: 'aceito',
          data: '2024-01-10',
          mensagem: 'Gostaria de uma oportunidade.'
        }
      ];

      setInterests(mockData);
    } catch (error) {
      Alert.alert('Erro', 'Erro ao carregar interesses: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInterestAction = (interestId, action) => {
    Alert.alert(
      'Confirmar Ação',
      `Deseja ${action === 'accept' ? 'aceitar' : 'rejeitar'} este interesse?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: action === 'accept' ? 'Aceitar' : 'Rejeitar',
          onPress: () => {
            // Aqui atualizaria o status no banco
            Alert.alert(
              'Sucesso!',
              `Interesse ${action === 'accept' ? 'aceito' : 'rejeitado'} com sucesso!`
            );
            loadInterests();
          }
        }
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendente': return '#ffc107';
      case 'aceito': return '#28a745';
      case 'rejeitado': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pendente': return 'Pendente';
      case 'aceito': return 'Aceito';
      case 'rejeitado': return 'Rejeitado';
      default: return 'Desconhecido';
    }
  };

  const renderInterest = ({ item }) => (
    <View style={styles.interestCard}>
      <View style={styles.interestHeader}>
        <Text style={styles.interestName}>{item.nome}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      
      <Text style={styles.interestDate}>📅 {item.data}</Text>
      
      {item.mensagem && (
        <Text style={styles.interestMessage}>{item.mensagem}</Text>
      )}
      
      {activeTab === 'received' && item.status === 'pendente' && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.acceptButton]}
            onPress={() => handleInterestAction(item.id, 'accept')}
          >
            <Text style={styles.actionButtonText}>✓ Aceitar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleInterestAction(item.id, 'reject')}
          >
            <Text style={styles.actionButtonText}>✗ Rejeitar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
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
        <Text style={styles.title}>Interesses</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'received' && styles.activeTab]}
          onPress={() => setActiveTab('received')}
        >
          <Text style={[styles.tabText, activeTab === 'received' && styles.activeTabText]}>
            Recebidos
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'sent' && styles.activeTab]}
          onPress={() => setActiveTab('sent')}
        >
          <Text style={[styles.tabText, activeTab === 'sent' && styles.activeTabText]}>
            Enviados
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={interests}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderInterest}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {loading ? 'Carregando...' : 
               activeTab === 'received' ? 'Nenhum interesse recebido' : 'Nenhum interesse enviado'}
            </Text>
            <Text style={styles.emptySubtext}>
              {activeTab === 'received' 
                ? 'Quando alguém demonstrar interesse, aparecerá aqui'
                : 'Use a busca para encontrar e demonstrar interesse'
              }
            </Text>
          </View>
        }
      />
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#fff',
  },
  tabText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#4C6EF5',
  },
  listContainer: {
    padding: 20,
    paddingTop: 0,
  },
  interestCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  interestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  interestName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
  },
  interestDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  interestMessage: {
    fontSize: 14,
    color: '#333',
    lineHeight: 18,
    marginBottom: 15,
    fontStyle: 'italic',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#28a745',
  },
  rejectButton: {
    backgroundColor: '#dc3545',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubtext: {
    color: '#E0E0FF',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

