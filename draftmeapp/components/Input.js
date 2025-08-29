import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../styles/theme';

export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  leftIcon,
  rightIcon,
  onRightIconPress,
  error,
  style = {},
  inputStyle = {},
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const hasValue = value && value.length > 0;
  const shouldFloatLabel = isFocused || hasValue;

  return (
    <View style={[styles.container, style]}>
      <View style={[
        styles.inputContainer,
        isFocused && styles.inputContainerFocused,
        error && styles.inputContainerError,
      ]}>
        {/* Ícone esquerdo */}
        {leftIcon && (
          <Text style={styles.leftIcon}>{leftIcon}</Text>
        )}

        {/* Input */}
        <TextInput
          style={[
            styles.input,
            multiline && styles.multilineInput,
            leftIcon && styles.inputWithLeftIcon,
            (rightIcon || secureTextEntry) && styles.inputWithRightIcon,
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={!shouldFloatLabel ? placeholder : ''}
          placeholderTextColor={theme.colors.textSecondary}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />

        {/* Label flutuante (baseado no site) */}
        {label && (
          <Text style={[
            styles.label,
            shouldFloatLabel && styles.labelFloating,
            isFocused && styles.labelFocused,
            error && styles.labelError,
          ]}>
            {label}
          </Text>
        )}

        {/* Ícone direito ou toggle de senha */}
        {secureTextEntry ? (
          <TouchableOpacity
            style={styles.rightIcon}
            onPress={togglePasswordVisibility}
          >
            <Text style={styles.iconText}>
              {isPasswordVisible ? '👁️' : '🙈'}
            </Text>
          </TouchableOpacity>
        ) : rightIcon ? (
          <TouchableOpacity
            style={styles.rightIcon}
            onPress={onRightIconPress}
          >
            <Text style={styles.iconText}>{rightIcon}</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Mensagem de erro */}
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },

  inputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,        // #E3E4E6 como no site
    borderRadius: 30,                        // Border-radius 30px como no site
    minHeight: 55,                           // Altura 55px como no site
    paddingHorizontal: 20,                   // Padding 20px como no site
    ...theme.shadows.sm,
  },

  inputContainerFocused: {
    borderColor: theme.colors.borderFocus,   // #0D1936 como no site
    borderWidth: 1,
  },

  inputContainerError: {
    borderColor: theme.colors.error,
  },

  input: {
    flex: 1,
    fontSize: theme.typography.fontSize.base,  // 16px como no site
    color: theme.colors.textPrimary,
    paddingVertical: 0,                        // Remove padding vertical padrão
    backgroundColor: 'transparent',
  },

  inputWithLeftIcon: {
    marginLeft: theme.spacing.sm,
  },

  inputWithRightIcon: {
    marginRight: theme.spacing.sm,
  },

  multilineInput: {
    minHeight: 100,
    paddingVertical: theme.spacing.md,
    textAlignVertical: 'top',
  },

  // Label flutuante baseado no site
  label: {
    position: 'absolute',
    left: 20,                                  // Mesma posição do site
    top: '50%',
    transform: [{ translateY: -10 }],
    color: theme.colors.textSecondary,         // #535354 como no site
    fontSize: theme.typography.fontSize.base,
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    zIndex: 1,
  },

  labelFloating: {
    top: 0,                                    // Move para cima
    fontSize: theme.typography.fontSize.sm,    // 14px menor
    backgroundColor: theme.colors.backgroundCard, // #FFFFFF
    color: theme.colors.borderFocus,           // #0D1936 quando focado
    paddingHorizontal: 10,                     // Padding 10px como no site
    transform: [{ translateY: -10 }],
  },

  labelFocused: {
    color: theme.colors.borderFocus,           // #0D1936 como no site
  },

  labelError: {
    color: theme.colors.error,
  },

  leftIcon: {
    fontSize: theme.typography.fontSize.xl,    // 20px como no site
    color: theme.colors.textSecondary,         // #535354 como no site
    marginRight: theme.spacing.xs,
  },

  rightIcon: {
    padding: theme.spacing.xs,
  },

  iconText: {
    fontSize: theme.typography.fontSize.xl,    // 20px como no site
    color: theme.colors.textSecondary,         // #535354 como no site
  },

  errorText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.md,
  },
});

