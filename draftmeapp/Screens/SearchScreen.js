import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Alert,
  ScrollView 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../supabaseClient';

export default function SearchScreen({ navigation, route }) {
  const { userType, userInfo } = route.params || {};
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    esporte: 'Todos',
    categoria: 'Todas',
    localizacao: '',
  });

  const esportes = ['Todos', 'Futebol', 'Basquete', 'Vôlei'];
  const categorias = userType === 'player' 
    ? ['Todas', 'Amador', 'Semi-Profissional', 'Profissional', 'Juvenil', 'Infantil']
    : ['Todas']; // Jogadores não têm categoria específica

  const searchTarget = userType === 'player' ? 'times' : 'jogadores';

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      performSearch();
    } else {
      setResults([]);
    }
  }, [searchQuery, filters]);

  const performSearch = async () => {
    setLoading(true);
    try {
      if (userType === 'player') {
        // Jogador buscando times
        await searchTeams();
      } else {
        // Time buscando jogadores
        await searchPlayers();
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro na busca: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const searchTeams = async () => {
    let query = supabase
      .from('tb_time')
      .select('*');

    // Filtro por nome
    if (searchQuery.trim()) {
      query = query.ilike('nm_time', `%${searchQuery}%`);
    }

    // Filtro por esporte
    if (filters.esporte !== 'Todos') {
      query = query.eq('esporte_time', filters.esporte);
    }

    // Filtro por categoria
    if (filters.categoria !== 'Todas') {
      query = query.eq('categoria_time', filters.categoria);
    }

    // Filtro por localização
    if (filters.localizacao.trim()) {
      query = query.ilike('localizacao_time', `%${filters.localizacao}%`);
    }

    const { data, error } = await query.limit(20);

    if (error) {
      throw error;
    }

    setResults(data || []);
  };

  const searchPlayers = async () => {
    let query = supabase
      .from('tb_usuario')
      .select('*');

    // Filtro por nome
    if (searchQuery.trim()) {
      query = query.ilike('nm_usuario', `%${searchQuery}%`);
    }

    // Para jogadores, não temos filtro de esporte direto
    // mas podemos filtrar por localização se implementarmos

    const { data, error } = await query.limit(20);

    if (error) {
      throw error;
    }

    setResults(data || []);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleContactPress = (targetInfo) => {
    const targetName = userType === 'player' ? targetInfo.nm_time : targetInfo.nm_usuario;
    const targetEmail = userType === 'player' ? targetInfo.email_time : targetInfo.email_usuario;
    
    Alert.alert(
      'Entrar em Contato',
      `Deseja entrar em contato com ${targetName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Ver Perfil', 
          onPress: () => navigation.navigate('Profile', { 
            targetInfo, 
            targetType: userType === 'player' ? 'team' : 'player',
            userType, 
            userInfo 
          })
        },
        { 
          text: 'Contato', 
          onPress: () => Alert.alert('Contato', `Email: ${targetEmail}`)
        }
      ]
    );
  };

  const renderTeamResult = ({ item }) => (
    <TouchableOpacity 
      style={styles.resultCard}
      onPress={() => handleContactPress(item)}
    >
      <View style={styles.resultHeader}>
        <Text style={styles.resultName}>{item.nm_time}</Text>
        <View style={styles.badgeContainer}>
          <View style={styles.sportBadge}>
            <Text style={styles.badgeText}>{item.esporte_time}</Text>
          </View>
          <View style={styles.categoryBadge}>
            <Text style={styles.badgeText}>{item.categoria_time}</Text>
          </View>
        </View>
      </View>
      
      <Text style={styles.resultLocation}>
        📍 {item.localizacao_time || 'Localização não informada'}
      </Text>
      
      {item.sobre_time && (
        <Text style={styles.resultDescription} numberOfLines={2}>
          {item.sobre_time}
        </Text>
      )}
      
      <Text style={styles.contactHint}>Toque para ver perfil e entrar em contato</Text>
    </TouchableOpacity>
  );

  const renderPlayerResult = ({ item }) => (
    <TouchableOpacity 
      style={styles.resultCard}
      onPress={() => handleContactPress(item)}
    >
      <View style={styles.resultHeader}>
        <Text style={styles.resultName}>{item.nm_usuario}</Text>
        <Text style={styles.resultAge}>
          {item.dt_nasc_usuario ? calculateAge(item.dt_nasc_usuario) + ' anos' : ''}
        </Text>
      </View>
      
      <Text style={styles.resultEmail}>📧 {item.email_usuario}</Text>
      
      {item.tel_usuario && (
        <Text style={styles.resultPhone}>📱 {item.tel_usuario}</Text>
      )}
      
      {item.id_time && (
        <Text style={styles.resultTeam}>⚽ Já tem time (ID: {item.id_time})</Text>
      )}
      
      <Text style={styles.contactHint}>Toque para ver perfil e entrar em contato</Text>
    </TouchableOpacity>
  );

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

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
        <Text style={styles.title}>Buscar {searchTarget}</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={`Buscar ${searchTarget}...`}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

      <ScrollView style={styles.filtersContainer} horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Esporte:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={filters.esporte}
              style={styles.picker}
              onValueChange={(value) => handleFilterChange('esporte', value)}
            >
              {esportes.map(esporte => (
                <Picker.Item key={esporte} label={esporte} value={esporte} />
              ))}
            </Picker>
          </View>
        </View>

        {userType === 'player' && (
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Categoria:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={filters.categoria}
                style={styles.picker}
                onValueChange={(value) => handleFilterChange('categoria', value)}
              >
                {categorias.map(categoria => (
                  <Picker.Item key={categoria} label={categoria} value={categoria} />
                ))}
              </Picker>
            </View>
          </View>
        )}

        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Localização:</Text>
          <TextInput
            style={styles.locationInput}
            placeholder="Cidade..."
            value={filters.localizacao}
            onChangeText={(value) => handleFilterChange('localizacao', value)}
            placeholderTextColor="#999"
          />
        </View>
      </ScrollView>

      <FlatList
        data={results}
        keyExtractor={(item) => userType === 'player' ? item.id_time.toString() : item.id_usuario.toString()}
        renderItem={userType === 'player' ? renderTeamResult : renderPlayerResult}
        contentContainerStyle={styles.resultsContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {loading ? 'Buscando...' : 
               searchQuery.trim() ? 'Nenhum resultado encontrado' : 
               `Digite para buscar ${searchTarget}`}
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
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  filtersContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  filterGroup: {
    marginRight: 15,
    minWidth: 120,
  },
  filterLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 5,
  },
  pickerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    height: 40,
  },
  picker: {
    height: 40,
    color: '#333',
  },
  locationInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: '#333',
    minWidth: 100,
  },
  resultsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  resultName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  resultAge: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 5,
  },
  sportBadge: {
    backgroundColor: '#4C6EF5',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  categoryBadge: {
    backgroundColor: '#28a745',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
  },
  resultLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  resultDescription: {
    fontSize: 14,
    color: '#333',
    lineHeight: 18,
    marginBottom: 5,
  },
  resultEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  resultPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  resultTeam: {
    fontSize: 14,
    color: '#28a745',
    marginBottom: 5,
    fontWeight: '500',
  },
  contactHint: {
    fontSize: 12,
    color: '#4C6EF5',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 5,
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
  },
});

