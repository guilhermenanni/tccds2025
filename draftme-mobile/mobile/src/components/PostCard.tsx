// mobile/src/components/PostCard.tsx

import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

interface Props {
  autor: string;
  avatar?: string | null;
  texto_postagem: string;
  categoria?: string | null;
  tag?: string | null;
  img_postagem?: string | null;
  curtidas_count?: number;
  comentarios_count?: number;
  onPress?: () => void;
  onLike?: () => void;
  onComment?: () => void;
}

const PostCard: React.FC<Props> = ({
  autor,
  avatar,
  texto_postagem,
  categoria,
  tag,
  img_postagem,
  curtidas_count = 0,
  comentarios_count = 0,
  onPress,
  onLike,
  onComment,
}) => {
  const safeAutor = autor ?? '';

  const handleLikePress = () => {
    if (onLike) onLike();
  };

  const handleCommentPress = () => {
    if (onComment) onComment();
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {safeAutor.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        <View>
          <Text style={styles.autor}>{safeAutor || 'Autor desconhecido'}</Text>

          {!!categoria && <Text style={styles.meta}>{categoria}</Text>}
        </View>
      </View>

      <Text style={styles.texto}>{texto_postagem ?? ''}</Text>

      {img_postagem ? (
        <Image source={{ uri: img_postagem }} style={styles.image} />
      ) : null}

      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleLikePress}
            activeOpacity={0.7}
          >
            <Text style={styles.actionEmoji}>❤️</Text>
            <Text style={styles.actionLabel}>Curtir</Text>
            <Text style={styles.actionCount}>{curtidas_count}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleCommentPress}
            activeOpacity={0.7}
          >
            <Text style={styles.actionEmoji}>💬</Text>
            <Text style={styles.actionLabel}>Comentar</Text>
            <Text style={styles.actionCount}>{comentarios_count}</Text>
          </TouchableOpacity>
        </View>

        {!!tag && <Text style={styles.tag}>#{tag}</Text>}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 12,
    marginVertical: 8,
    marginHorizontal: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#E5E7EB',
    fontWeight: 'bold',
  },
  autor: {
    color: '#F9FAFB',
    fontWeight: '600',
    fontSize: 16,
  },
  meta: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  texto: {
    color: '#E5E7EB',
    marginBottom: 8,
    marginTop: 4,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#020617',
  },
  actionEmoji: {
    color: '#F9FAFB',
    fontSize: 13,
    marginRight: 4,
  },
  actionLabel: {
    color: '#E5E7EB',
    fontSize: 13,
    marginRight: 4,
  },
  actionCount: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  tag: {
    color: '#38BDF8',
    fontSize: 12,
  },
});

export default PostCard;
