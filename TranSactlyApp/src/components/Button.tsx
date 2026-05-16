import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { Colors, Radius, Font } from '../theme';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

const Button: React.FC<Props> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled || loading}
    activeOpacity={0.82}
    style={[
      styles.base,
      variant === 'primary' && styles.primary,
      variant === 'outline' && styles.outline,
      variant === 'ghost' && styles.ghost,
      (disabled || loading) && styles.disabled,
      style,
    ]}
  >
    {loading ? (
      <ActivityIndicator color={variant === 'primary' ? Colors.textInverse : Colors.gold} size="small" />
    ) : (
      <Text style={[
        styles.text,
        variant === 'primary' && styles.textPrimary,
        variant === 'outline' && styles.textOutline,
        variant === 'ghost' && styles.textGhost,
      ]}>
        {title}
      </Text>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  base: {
    height: 54,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  primary: {
    backgroundColor: Colors.gold,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: { opacity: 0.45 },
  text: {
    ...Font.labelM,
    fontSize: 13,
    letterSpacing: 1.4,
  },
  textPrimary: { color: Colors.textInverse },
  textOutline: { color: Colors.textSecondary },
  textGhost: { color: Colors.textSecondary },
});

export default Button;