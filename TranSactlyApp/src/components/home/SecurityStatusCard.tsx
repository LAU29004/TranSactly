import React, { useRef, useEffect } from 'react';
import { View, Text, Animated } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../theme';
import styles from '../../styles/home/SecurityStatusCard.styles';

const SecurityStatusCard: React.FC = () => {
  const pulseAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.6,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const items = [

  {
    icon: 'message-text-outline',
    label: 'SMS PARSED',
    value: 'Active',
  },

  {
    icon: 'brain',
    label: 'AI ENGINE',
    value: 'Running',
  },

  {
    icon: 'database-outline',
    label: 'DATABASE',
    value: 'Connected',
  },

  {
    icon: 'sync',
    label: 'SYNC STATUS',
    value: 'Live',
  },
];


  return (
    <View style={styles.securityCard}>
      <View style={styles.securityHeader}>
        <View style={styles.securityTitleRow}>
          <Animated.View
            style={[styles.securityGreenDot, { opacity: pulseAnim }]}
          />
          <Text style={styles.securityTitle}>SECURITY STATUS</Text>
        </View>
        <View style={styles.securityActivePill}>
          <Text style={styles.securityActiveText}>ALL CLEAR</Text>
        </View>
      </View>
      <View style={styles.securityGrid}>
        {items.map(item => (
          <View key={item.label} style={styles.securityItem}>
            <MaterialCommunityIcons
              name={item.icon}
              size={18}
              color={Colors.gold}
            />
            <View>
              <Text style={styles.securityItemLabel}>{item.label}</Text>
              <Text style={styles.securityItemValue}>{item.value}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default SecurityStatusCard;