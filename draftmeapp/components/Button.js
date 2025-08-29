import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { theme } from '../styles/theme';

export default function Button({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'medium', 
  loading = false, 
  disabled = false,
  icon = null,
  style = {},
  textStyle = {},
  ...props 
}) {
  const getButtonStyle = () => {
    const baseStyle = [styles.button];
    
    // Variantes baseadas no design do site
    switch (variant) {
      case 'primary':
        baseStyle.push(styles.primary);
        break;
      case 'secondary':
        baseStyle.push(styles.secondary);
        break;
      case 'outline':
        baseStyle.push(styles.outline);
        break;
      case 'ghost':
        baseStyle.push(styles.ghost);
        break;
      case 'danger':
        baseStyle.push(styles.danger);
        break;
      default:
        baseStyle.push(styles.primary);
    }
    
    // Tamanhos
    switch (size) {
      case 'small':
        baseStyle.push(styles.small);
        break;
      case 'medium':
        baseStyle.push(styles.medium);
        break;
      case 'large':
        baseStyle.push(styles.large);
        break;
    }
    
    // Estados
    if (disabled || loading) {
      baseStyle.push(styles.disabled);
    }
    
    return [...baseStyle, style];
  };

  const getTextStyle = () => {
    const baseTextStyle = [styles.text];
    
    switch (variant) {
      case 'primary':
        baseTextStyle.push(styles.primaryText);
        break;
      case 'secondary':
        baseTextStyle.push(styles.secondaryText);
        break;
      case 'outline':
        baseTextStyle.push(styles.outlineText);
        break;
      case 'ghost':
        baseTextStyle.push(styles.ghostText);
        break;
      case 'danger':
        baseTextStyle.push(styles.dangerText);
        break;
    }
    
    switch (size) {
      case 'small':
        baseTextStyle.push(styles.smallText);
        break;
      case 'medium':
        baseTextStyle.push(styles.mediumText);
        break;
      case 'large':
        baseTextStyle.push(styles.largeText);
        break;
    }
    
    return [...baseTextStyle, textStyle];
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'outline' || variant === 'ghost' ? theme.colors.primary : theme.colors.white} />
      ) : (
        <Text style={getTextStyle()}>
          {icon && `${icon} `}{title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Base button style - baseado no site
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,           // Botões bem arredondados como no site
    paddingHorizontal: 50,      // Padding horizontal do site
    minHeight: 50,              // Altura dos botões do site
    borderWidth: 1,
    ...theme.shadows.sm,        // Sombra sutil
  },
  
  // Variantes de cor
  primary: {
    backgroundColor: theme.colors.primary,  // #0D1936
    borderColor: theme.colors.primary,
  },
  
  secondary: {
    backgroundColor: theme.colors.secondary,
    borderColor: theme.colors.secondary,
  },
  
  outline: {
    backgroundColor: 'transparent',
    borderColor: theme.colors.primary,
    borderWidth: 1,
  },
  
  ghost: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',  // Estilo dos botões fantasma do site
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
  },
  
  danger: {
    backgroundColor: theme.colors.error,
    borderColor: theme.colors.error,
  },
  
  // Estados
  disabled: {
    opacity: 0.6,
    ...theme.shadows.sm,
  },
  
  // Tamanhos
  small: {
    minHeight: 40,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  
  medium: {
    minHeight: 50,              // Padrão do site
    paddingHorizontal: 50,
    borderRadius: 30,
  },
  
  large: {
    minHeight: 60,
    paddingHorizontal: 60,
    borderRadius: 30,
  },
  
  // Estilos de texto
  text: {
    fontWeight: theme.typography.fontWeight.medium,
    textAlign: 'center',
    textTransform: 'uppercase',  // Texto em maiúscula como no site
  },
  
  primaryText: {
    color: theme.colors.textOnPrimary,
  },
  
  secondaryText: {
    color: theme.colors.textOnPrimary,
  },
  
  outlineText: {
    color: theme.colors.primary,
  },
  
  ghostText: {
    color: theme.colors.textOnDark,
  },
  
  dangerText: {
    color: theme.colors.textOnPrimary,
  },
  
  // Tamanhos de texto
  smallText: {
    fontSize: theme.typography.fontSize.sm,
  },
  
  mediumText: {
    fontSize: theme.typography.fontSize.base,
  },
  
  largeText: {
    fontSize: theme.typography.fontSize.lg,
  },
});

