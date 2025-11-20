import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface Props {
  titulo: string;
  time: string;
  cidade: string;
  data: string;
  hora: string;
  categoria?: string | null;
  onPress?: () => void;
}

const SeletivaCard: React.FC<Props> = ({
  titulo,
  time,
  cidade,
  data,
  hora,
  categoria,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.titulo}>{titulo}</Text>
      <Text style={styles.time}>{time}</Text>
      <Text style={styles.meta}>{cidade} • {data} • {hora}</Text>
      {!!categoria && <Text style={styles.categoria}>{categoria}</Text>}
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
  titulo: {
    color: '#F9FAFB',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 4,
  },
  time: {
    color: '#E5E7EB',
    fontWeight: '500',
    marginBottom: 4,
  },
  meta: {
    color: '#9CA3AF',
    fontSize: 12,
    marginBottom: 4,
  },
  categoria: {
    color: '#38BDF8',
    fontSize: 12,
  },
});

export default SeletivaCard;
