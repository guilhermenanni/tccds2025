import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../styles/theme';

export default function Card({
  children,
  variant = 'default',
  onPress,
  style = {},
  ...props
}) {
  const getCardStyle = () => {
    const baseStyle = [styles.card];
    
    // Variantes baseadas no design do site
    switch (variant) {
      case 'elevated':
        baseStyle.push(styles.elevated);
        break;
      case 'outlined':
        baseStyle.push(styles.outlined);
        break;
      case 'flat':
        baseStyle.push(styles.flat);
        break;
      default:
        baseStyle.push(styles.default);
    }
    
    return [...baseStyle, style];
  };

  if (onPress) {
    return (
      <TouchableOpacity
        style={getCardStyle()}
        onPress={onPress}
        activeOpacity={0.8}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={getCardStyle()} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  // Base card style - baseado no site
  card: {
    backgroundColor: theme.colors.backgroundCard,  // #FFFFFF
    borderRadius: 15,                              // 15px como no site
    padding: 20,                                   // Padding generoso
    marginVertical: theme.spacing.xs,
  },
  
  // Variante padrão
  default: {
    ...theme.shadows.base,                         // Sombra padrão
  },
  
  // Variante elevada (sombra mais forte)
  elevated: {
    ...theme.shadows.lg,                           // Sombra do site (0 8px 15px)
    borderWidth: 1,
    borderColor: theme.colors.primary,             // Borda sutil da cor primária
  },
  
  // Variante com borda
  outlined: {
    borderWidth: 1,
    borderColor: theme.colors.border,              // #E3E4E6 como no site
    ...theme.shadows.sm,                           // Sombra leve
  },
  
  // Variante plana (sem sombra)
  flat: {
    backgroundColor: theme.colors.backgroundCard,
    // Sem sombra
  },
});

