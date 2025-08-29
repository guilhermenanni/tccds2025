import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme, sportColors, categoryColors, statusColors } from '../styles/theme';

export default function Badge({
  text,
  type = 'default',
  size = 'medium',
  variant = 'filled',
  color,
  style,
  textStyle,
}) {
  const getBadgeColor = () => {
    if (color) return color;
    
    // Auto-detect color based on text content
    if (sportColors[text]) return sportColors[text];
    if (categoryColors[text]) return categoryColors[text];
    if (statusColors[text]) return statusColors[text];
    
    switch (type) {
      case 'success': return theme.colors.success;
      case 'warning': return theme.colors.warning;
      case 'error': return theme.colors.error;
      case 'info': return theme.colors.info;
      case 'primary': return theme.colors.primary;
      case 'secondary': return theme.colors.secondary;
      default: return theme.colors.gray500;
    }
  };

  const getBadgeStyle = () => {
    const badgeColor = getBadgeColor();
    const baseStyle = {
      paddingHorizontal: size === 'small' ? 6 : size === 'large' ? 12 : 8,
      paddingVertical: size === 'small' ? 2 : size === 'large' ? 6 : 4,
      borderRadius: size === 'small' ? 8 : size === 'large' ? 12 : 10,
      alignSelf: 'flex-start',
    };

    switch (variant) {
      case 'outlined':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: badgeColor,
        };
      case 'subtle':
        return {
          ...baseStyle,
          backgroundColor: `${badgeColor}20`, // 20% opacity
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: badgeColor,
        };
    }
  };

  const getTextStyle = () => {
    const badgeColor = getBadgeColor();
    const baseTextStyle = {
      fontSize: size === 'small' ? theme.typography.fontSize.xs : 
                size === 'large' ? theme.typography.fontSize.sm : 
                theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.medium,
      textAlign: 'center',
    };

    switch (variant) {
      case 'outlined':
      case 'subtle':
        return {
          ...baseTextStyle,
          color: badgeColor,
        };
      default:
        return {
          ...baseTextStyle,
          color: theme.colors.textOnPrimary,
        };
    }
  };

  return (
    <View style={[getBadgeStyle(), style]}>
      <Text style={[getTextStyle(), textStyle]}>
        {text}
      </Text>
    </View>
  );
}

