import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  Alert,
  RefreshControl,
  Dimensions,
  StatusBar 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Button from '../components/Button';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { theme, sportColors } from '../styles/theme';
import { supabase } from '../supabaseClient';

const { width } = Dimensions.get('window');

export default function FeedScreen({ navigation, route }) {
  const { userType, userInfo } = route.params || {};
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSport, setSelectedSport] = useState('Todos');

  const sports = ['Todos', 'Futebol', 'Basquete', 'Vôlei'];

  useEffect(() => {
    loadPosts();
  }, [selectedSport]);

  const loadPosts = async () => {
    try {
      let query = supabase
        .from('tb_postagem')
        .select(`
          *,
          tb_time (
            nm_time,
            esporte_time,
            categoria_time
          )
        `)
        .order('data_postagem', { ascending: false });

      if (selectedSport !== 'Todos') {
        query = query.eq('tb_time.esporte_time', selectedSport);
      }

      const { data, error } = await query;

      if (error) {
        Alert.alert('Erro', 'Erro ao carregar postagens: ' + error.message);
        return;
      }

      setPosts(data || []);
    } catch (error) {
      Alert.alert('Erro', 'Erro inesperado: ' + error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPosts();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR') + ' às ' + date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleCommentPress = (postId) => {
    navigation.navigate('Comments', { 
      postId, 
      userType, 
      userInfo 
    });
  };

  const renderSportFilter = () => (
    <View style={styles.filterContainer}>
      <FlatList
        horizontal
        data={sports}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedSport === item && styles.filterButtonActive
            ]}
            onPress={() => setSelectedSport(item)}
          >
            <Badge
              text={item}
              variant={selectedSport === item ? 'filled' : 'outlined'}
              color={sportColors[item] || theme.colors.gray500}
            />
          </TouchableOpacity>
        )}
      />
    </View>
  );

  const renderPost = ({ item }) => (
    <Card style={styles.postCard} variant="elevated">
      {/* Header do post */}
      <View style={styles.postHeader}>
        <View style={styles.teamInfo}>
          <Text style={styles.teamName}>{item.tb_time?.nm_time || 'Time'}</Text>
          <View style={styles.teamBadges}>
            <Badge text={item.tb_time?.esporte_time} size="small" />
            <Badge text={item.tb_time?.categoria_time} size="small" type="secondary" />
          </View>
          <Text style={styles.postDate}>{formatDate(item.data_postagem)}</Text>
        </View>
        {item.categoria && (
          <Badge text={item.categoria} type="primary" />
        )}
      </View>

      {/* Conteúdo do post */}
      {item.texto_postagem && (
        <Text style={styles.postText}>{item.texto_postagem}</Text>
      )}

      {/* Imagem do post */}
      {item.img_postagem && (
        <Image 
          source={{ uri: item.img_postagem }} 
          style={styles.postImage}
          resizeMode="cover"
        />
      )}

      {/* Tag */}
      {item.tag && (
        <View style={styles.tagContainer}>
          <Text style={styles.tagText}>#{item.tag}</Text>
        </View>
      )}

      {/* Ações do post */}
      <View style={styles.postActions}>
        <Button 
          title="Comentários"
          onPress={() => handleCommentPress(item.id_postagem)}
          variant="ghost"
          size="small"
          icon="💬"
          style={styles.actionButton}
        />
        
        <Button
          title="Curtir"
          variant="ghost"
          size="small"
          icon="👍"
          style={styles.actionButton}
        />
      </View>
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
          <View style={styles.headerContent}>
            <Text style={styles.title}>Feed DraftMe</Text>
            <Button
              title="Nova Postagem"
              onPress={() => navigation.navigate('CreatePost', { userType, userInfo })}
              variant="ghost"
              size="small"
              icon="+"
              style={styles.createPostButton}
            />
          </View>
        </View>

        {renderSportFilter()}

        <FlatList
          data={posts}
          keyExtractor={(item) => item.id_postagem.toString()}
          renderItem={renderPost}
          contentContainerStyle={styles.feedContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📝</Text>
              <Text style={styles.emptyText}>
                {loading ? 'Carregando postagens...' : 'Nenhuma postagem encontrada'}
              </Text>
              {!loading && (
                <Text style={styles.emptySubtext}>
                  Seja o primeiro a postar algo interessante!
                </Text>
              )}
            </View>
          }
        />
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textOnDark,
  },
  createPostButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  filterContainer: {
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  filterButton: {
    marginRight: theme.spacing.sm,
  },
  filterButtonActive: {
    // Active state handled by Badge component
  },
  feedContainer: {
    padding: theme.spacing.xl,
    paddingTop: 0,
  },
  postCard: {
    marginBottom: theme.spacing.lg,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  teamBadges: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  postDate: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  postText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.textPrimary,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.lg,
    marginBottom: theme.spacing.md,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  tagContainer: {
    marginBottom: theme.spacing.md,
  },
  tagText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray200,
    paddingTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing['5xl'],
  },
  emptyIcon: {
    fontSize: theme.typography.fontSize['5xl'],
    marginBottom: theme.spacing.lg,
  },
  emptyText: {
    color: theme.colors.textOnDark,
    fontSize: theme.typography.fontSize.xl,
    textAlign: 'center',
    fontWeight: theme.typography.fontWeight.medium,
    marginBottom: theme.spacing.sm,
  },
  emptySubtext: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: theme.typography.fontSize.base,
    textAlign: 'center',
  },
});

