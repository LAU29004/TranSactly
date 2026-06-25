import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getToken } from '../services/auth/authStorage';

// ─────────────────────────────────────────────
// Theme (mirrors TranSactly design system)
// ─────────────────────────────────────────────
const C = {
  bg: '#0B0F17',
  card: '#141A23',
  cardBorder: '#1E2A3A',
  gold: '#D4AF37',
  goldDim: 'rgba(212,175,55,0.10)',
  goldBorder: 'rgba(212,175,55,0.30)',
  textPrimary: '#ECEDF2',
  textMuted: '#3D4F6A',
  dot: '#2A3245',
} as const;

// ─────────────────────────────────────────────
// Animated ring component
// ─────────────────────────────────────────────
interface PulseRingProps {
  delay: number;
  size: number;
}

const PulseRing: React.FC<PulseRingProps> = ({ delay, size }) => {
  const scale = useRef(new Animated.Value(0.6)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1,
            duration: 1600,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 1600,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 0.6, duration: 0, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.6, duration: 0, useNativeDriver: true }),
        ]),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 1.5,
        borderColor: C.gold,
        opacity,
        transform: [{ scale }],
      }}
    />
  );
};

// ─────────────────────────────────────────────
// Loading dots
// ─────────────────────────────────────────────
const LoadingDots: React.FC = () => {
  const dots = [
    useRef(new Animated.Value(0.3)).current,
    useRef(new Animated.Value(0.3)).current,
    useRef(new Animated.Value(0.3)).current,
  ];

  useEffect(() => {
    const animations = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 220),
          Animated.timing(dot, {
            toValue: 1,
            duration: 380,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0.3,
            duration: 380,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.delay((dots.length - i - 1) * 220),
        ])
      )
    );
    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
  }, []);

  return (
    <View style={styles.dotsRow}>
      {dots.map((dot, i) => (
        <Animated.View key={i} style={[styles.dot, { opacity: dot }]} />
      ))}
    </View>
  );
};

// ─────────────────────────────────────────────
// SplashScreen
// ─────────────────────────────────────────────
const SplashScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  // Fade-in for the entire content
  const masterOpacity = useRef(new Animated.Value(0)).current;
  // Subtle vertical entrance for the logo block
  const logoY = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(masterOpacity, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(logoY, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Bootstrap routing logic
    const bootstrap = async (): Promise<void> => {
      await new Promise<void>((r) => setTimeout(() => r(), 1800)); // min splash duration

      const onboardingComplete = await AsyncStorage.getItem('onboarding_complete');
      if (!onboardingComplete) {
        navigation.replace('Onboarding');
        return;
      }

      const token = await getToken();
      navigation.replace(token ? 'MainTabs' : 'Login');
    };

    bootstrap();
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      <Animated.View
        style={[
          styles.centerBlock,
          { opacity: masterOpacity, transform: [{ translateY: logoY }] },
        ]}
      >
        {/* Pulse rings behind the logo */}
        <View style={styles.ringWrap}>
          <PulseRing size={130} delay={0} />
          <PulseRing size={100} delay={400} />
          <PulseRing size={72} delay={800} />

          {/* Logo card */}
          <View style={styles.logoCard}>
            <Text style={styles.logoEmoji}>⚡</Text>
          </View>
        </View>

        {/* Wordmark */}
        <Text style={styles.wordmark}>centfluence</Text>
        <Text style={styles.tagline}>AI FINANCIAL INTELLIGENCE</Text>

        {/* Loading dots */}
        <LoadingDots />
      </Animated.View>

      {/* Footer */}
      <Animated.Text style={[styles.footer, { opacity: masterOpacity }]}>
       Privacy-first financial intelligence
      </Animated.Text>
    </View>
  );
};

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  centerBlock: {
    alignItems: 'center',
  },

  // ── Rings + logo
  ringWrap: {
    width: 130,
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  logoCard: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: C.goldDim,
    borderWidth: 1.5,
    borderColor: C.goldBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: {
    fontSize: 30,
  },

  // ── Type
  wordmark: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F0E6C8',
    letterSpacing: 0.6,
    marginBottom: 5,
  },
  tagline: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2.2,
    color: C.gold,
    opacity: 0.7,
    marginBottom: 32,
  },

  // ── Loading dots
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.gold,
  },

  // ── Footer
  footer: {
    position: 'absolute',
    bottom: 36,
    fontSize: 10,
    color: C.textMuted,
    letterSpacing: 0.4,
  },
});

export default SplashScreen;