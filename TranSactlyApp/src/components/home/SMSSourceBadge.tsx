import React from 'react';
import { View, Text } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../theme';
import styles from '../../styles/home/SMSSourceBadge.styles';

const SMSSourceBadge: React.FC = () => (
  <View style={styles.smsBadge}>
    <MaterialCommunityIcons
      name="message-text-outline"
      size={10}
      color={Colors.textMuted}
    />
    <Text style={styles.smsBadgeText}>Detected from SMS</Text>
  </View>
);

export default SMSSourceBadge;