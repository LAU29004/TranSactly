import React, { useRef, useEffect } from 'react';
import { Animated } from 'react-native';
import { Colors } from '../../theme';
import styles from '../../styles/home/AIPulseDot.styles';

const AIPulseDot: React.FC = () => {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.4,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.pulseDot, { transform: [{ scale }] }]} />
  );
};

export default AIPulseDot;