import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Alert,
  StatusBar,
  Dimensions 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import Button from '../components/Button';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Input from '../components/Input';
import { theme } from '../styles/theme';
import { supabase } from '../supabaseClient';

const { width } = Dimensions.get('window');

export default function LocationScreen({ navigation, route }) {
  const { userType, userInfo } = route.params || {};
  const [location, setLocation] = useState(null);
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchRadius, setSearchRadius] = useState('10'); // km
  const [locationPermission, setLocationPermission] = useState(false);

  useEffect(() => {
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permissão Necessária',
          'Para usar a busca por localização, precisamos acessar sua localização.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Tentar Novamente', onPress: checkLocationPermission }
          ]
        );
        return;
      }

      setLocationPermission(true);
      getCurrentLocation();
    } catch (error) {
      Alert.alert('Erro', 'Erro ao solicitar permissão de localização');
    }
  };

  const getCurrentLocation = async () => {
    setLoading(true);
    try {
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      // Buscar endereço reverso
      const address = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      if (address.length > 0) {
        const addr = address[0];
        const locationString = `${addr.city || addr.subregion}, ${addr.region}`;
        
        // Atualizar localização no banco de dados
        await updateUserLocation(locationString, currentLocation.coords);
      }

    } catch (error) {
      Alert.alert('Erro', 'Erro ao obter localização: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateUserLocation = async (locationString, coords) => {
    try {
      const table = userType === 'player' ? 'tb_usuario' : 'tb_time';
      const idField = userType === 'player' ? 'id_usuario' : 'id_time';
      const locationField = userType === 'player' ? 'localizacao_usuario' : 'localizacao_time';
      const idValue = userType === 'player' ? userInfo.id_usuario : userInfo.id_time;

      // Atualizar localização textual
      await supabase
        .from(table)
        .update({ 
          [locationField]: locationString,
          // Em um sistema real, você salvaria lat/lng em campos separados
          latitude: coords.latitude,
          longitude: coords.longitude
        })
        .eq(idField, idValue);

    } catch (error) {
      console.log('Erro ao atualizar localização:', error);
    }
  };

  const searchNearbyUsers = async () => {
    if (!location) {
      Alert.alert('Erro', 'Localização não disponível');
      return;
    }

    setLoading(true);
    try {
      // Em um sistema real, você faria uma query com cálculo de distância
      // Por enquanto, vamos simular busca por cidade
      const targetTable = userType === 'player' ? 'tb_time' : 'tb_usuario';
      const locationField = userType === 'player' ? 'localizacao_time' : 'localizacao_usuario';

      const { data, error } = await supabase
        .from(targetTable)
        .select('*')
        .not(locationField, 'is', null)
        .limit(20);

      if (error) {
        Alert.alert('Erro', 'Erro ao buscar usuários próximos: ' + error.message);
        return;
      }

      // Simular cálculo de distância (em um app real, usaria fórmula de Haversine)
      const usersWithDistance = (data || []).map(user => ({
        ...user,
        distance: Math.floor(Math.random() * parseInt(searchRadius)) + 1 // Distância simulada
      })).filter(user => user.distance <= parseInt(searchRadius));

      setNearbyUsers(usersWithDistance);

    } catch (error) {
      Alert.alert('Erro', 'Erro inesperado: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleContactPress = (targetInfo) => {
    navigation.navigate('Profile', { 
      targetInfo, 
      targetType: userType === 'player' ? 'team' : 'player',
      userType, 
      userInfo 
    });
  };

  const renderNearbyUser = ({ item }) => (
    <Card style={styles.userCard} onPress={() => handleContactPress(item)}>
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {userType === 'player' ? item.nm_time : item.nm_usuario}
          </Text>
          <View style={styles.userBadges}>
            {userType === 'player' ? (
              <>
                <Badge text={item.esporte_time} size="small" />
                <Badge text={item.categoria_time} size="small" type="secondary" />
              </>
            ) : (
              <Badge text="Jogador" type="primary" size="small" />
            )}
          </View>
        </View>
        <View style={styles.distanceContainer}>
          <Text style={styles.distanceText}>{item.distance} km</Text>
          <Text style={styles.distanceLabel}>de distância</Text>
        </View>
      </View>

      <View style={styles.locationInfo}>
        <Text style={styles.locationText}>
          📍 {userType === 'player' ? item.localizacao_time : item.localizacao_usuario}
        </Text>
      </View>

      {userType === 'player' && item.sobre_time && (
        <Text style={styles.description} numberOfLines={2}>
          {item.sobre_time}
        </Text>
      )}

      <Text style={styles.tapHint}>Toque para ver perfil completo</Text>
    </Card>
  );

  return (
    <>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[theme.colors.gradientStart, theme.colors.gradientMiddle, theme.colors.gradientEnd]}
        style={styles.container}
      >
        <View style={styles.header}>
          <Button
            title="Voltar"
            onPress={() => navigation.goBack()}
            variant="ghost"
            size="small"
            icon="←"
          />
          <Text style={styles.title}>Busca por Localização</Text>
        </View>

        <View style={styles.content}>
          {/* Controles de Localização */}
          <Card style={styles.controlsCard} variant="elevated">
            <Text style={styles.sectionTitle}>Sua Localização</Text>
            
            {location ? (
              <View style={styles.locationStatus}>
                <Text style={styles.locationFound}>📍 Localização obtida!</Text>
                <Button
                  title="Atualizar Localização"
                  onPress={getCurrentLocation}
                  loading={loading}
                  size="small"
                  icon="🔄"
                  style={styles.updateButton}
                />
              </View>
            ) : (
              <View style={styles.locationStatus}>
                <Text style={styles.locationNotFound}>📍 Localização não disponível</Text>
                <Button
                  title="Obter Localização"
                  onPress={checkLocationPermission}
                  loading={loading}
                  size="small"
                  icon="📍"
                  style={styles.updateButton}
                />
              </View>
            )}

            <Input
              label="Raio de Busca (km)"
              value={searchRadius}
              onChangeText={setSearchRadius}
              keyboardType="numeric"
              placeholder="10"
              leftIcon="📏"
            />

            <Button
              title={`Buscar ${userType === 'player' ? 'Times' : 'Jogadores'} Próximos`}
              onPress={searchNearbyUsers}
              loading={loading}
              disabled={!location}
              icon="🔍"
              style={styles.searchButton}
            />
          </Card>

          {/* Resultados */}
          <Text style={styles.resultsTitle}>
            {nearbyUsers.length > 0 
              ? `${nearbyUsers.length} ${userType === 'player' ? 'times' : 'jogadores'} encontrados`
              : 'Nenhum resultado ainda'
            }
          </Text>

          <FlatList
            data={nearbyUsers}
            keyExtractor={(item) => 
              userType === 'player' ? item.id_time?.toString() : item.id_usuario?.toString()
            }
            renderItem={renderNearbyUser}
            contentContainerStyle={styles.resultsList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🗺️</Text>
                <Text style={styles.emptyText}>
                  {!location 
                    ? 'Permita o acesso à localização para buscar usuários próximos'
                    : 'Use o botão de busca para encontrar usuários próximos'
                  }
                </Text>
              </View>
            }
          />
        </View>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textOnDark,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
  },
  controlsCard: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  locationStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  locationFound: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.success,
    fontWeight: theme.typography.fontWeight.medium,
  },
  locationNotFound: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.warning,
    fontWeight: theme.typography.fontWeight.medium,
  },
  updateButton: {
    minWidth: 120,
  },
  searchButton: {
    marginTop: theme.spacing.md,
  },
  resultsTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textOnDark,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  resultsList: {
    paddingBottom: theme.spacing.xl,
  },
  userCard: {
    marginBottom: theme.spacing.md,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  userBadges: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  distanceContainer: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  distanceText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textOnPrimary,
  },
  distanceLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textOnPrimary,
  },
  locationInfo: {
    marginBottom: theme.spacing.sm,
  },
  locationText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  description: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textPrimary,
    lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.base,
    marginBottom: theme.spacing.sm,
  },
  tapHint: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing['4xl'],
  },
  emptyIcon: {
    fontSize: theme.typography.fontSize['4xl'],
    marginBottom: theme.spacing.lg,
  },
  emptyText: {
    color: theme.colors.textOnDark,
    fontSize: theme.typography.fontSize.base,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
  },
});

