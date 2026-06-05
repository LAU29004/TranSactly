import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../theme';
import styles from '../../styles/home/FloatingActionButton.styles';

interface FloatingActionButtonProps {
  onPress: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
}) => (
  <TouchableOpacity
    style={styles.fab}
    activeOpacity={0.85}
    onPress={onPress}
    accessibilityLabel="Open AI chat assistant"
    accessibilityRole="button"
  >
    <MaterialCommunityIcons
      name="sparkles"
      size={14}
      color={Colors.textInverse}
    />
    <Text style={styles.fabText}>ASK AI</Text>
  </TouchableOpacity>
);

export default FloatingActionButton;