import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Font, Space } from '../theme';

interface Props {
  title: string;
  subtitle?: string;
  action?: string;
  onAction?: () => void;
}

const SectionHeader: React.FC<Props> = ({ title, subtitle, action, onAction }) => (
  <View style={styles.row}>
    <View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
    {action ? (
      <TouchableOpacity onPress={onAction} activeOpacity={0.7}>
        <Text style={styles.action}>{action}</Text>
      </TouchableOpacity>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: Space.md,
  },
  title: {
    ...Font.displayM,
    color: Colors.textPrimary,
    fontSize: 18,
  },
  subtitle: {
    ...Font.labelS,
    color: Colors.textMuted,
    marginTop: 2,
  },
  action: {
    ...Font.labelS,
    color: Colors.gold,
    letterSpacing: 0.8,
  },
});

export default SectionHeader;