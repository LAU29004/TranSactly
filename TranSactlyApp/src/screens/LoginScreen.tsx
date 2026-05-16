import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Colors, Space, Radius, Font } from '../theme';

const { height } = Dimensions.get('window');

const LoginScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      <View style={styles.container}>

        {/* Top wordmark */}
        <View style={styles.topBar}>
          <Text style={styles.topLabel}>SOVEREIGN LEDGER V2.0</Text>
          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>READY</Text>
          </View>
        </View>

        {/* Center hero */}
        <View style={styles.hero}>
          <View style={styles.logoWrap}>
            <View style={styles.logoOuter}>
              <View style={styles.logoInner}>
                <Text style={styles.logoGlyph}>◈</Text>
              </View>
            </View>
          </View>

          <Text style={styles.appName}>
            SmartSpend<Text style={styles.appNameAccent}> AI</Text>
          </Text>
          <Text style={styles.tagline}>Understand your money effortlessly</Text>
        </View>

        {/* Auth card */}
        <View style={styles.card}>
          <View style={styles.cardTopRow}>
            <View style={styles.privateBadge}>
              <Text style={styles.privateBadgeText}>PRIVATE ACCESS</Text>
            </View>
          </View>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>CONTINUE WITH</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.googleBtn} activeOpacity={0.85}>
            <View style={styles.googleIconWrap}>
              <Text style={styles.googleG}>G</Text>
            </View>
            <Text style={styles.googleBtnText}>Continue with Google</Text>
          </TouchableOpacity>

          <View style={styles.securityRow}>
            <Text style={styles.lockIcon}>⚿</Text>
            <Text style={styles.securityText}>SECURITY ENCRYPTED</Text>
          </View>

          <Text style={styles.terms}>
            By signing in, you agree to our{' '}
            <Text style={styles.termsLink}>Terms</Text>
            {' '}and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>CRAFTING WEALTH INTELLIGENCE © 2024</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  container: {
    flex: 1,
    paddingHorizontal: Space.xl,
    paddingTop: Space.lg,
    paddingBottom: Space.xl,
    justifyContent: 'space-between',
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topLabel: {
    ...Font.labelS,
    color: Colors.textMuted,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.xs,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Space.md,
    paddingVertical: Space.xs,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.gold,
  },
  statusText: {
    ...Font.labelS,
    color: Colors.gold,
  },

  // Hero
  hero: {
    alignItems: 'center',
    gap: Space.lg,
  },
  logoWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoOuter: {
    width: 96,
    height: 96,
    borderRadius: Radius.xl,
    backgroundColor: Colors.goldMuted,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInner: {
    width: 72,
    height: 72,
    borderRadius: Radius.lg,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGlyph: {
    fontSize: 34,
    color: Colors.textInverse,
    fontWeight: '900',
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.8,
  },
  appNameAccent: {
    color: Colors.gold,
  },
  tagline: {
    ...Font.bodyM,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  // Auth card
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Space.xl,
    gap: Space.lg,
  },
  cardTopRow: {
    alignItems: 'center',
  },
  privateBadge: {
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Space.lg,
    paddingVertical: Space.xs + 2,
  },
  privateBadgeText: {
    ...Font.labelS,
    color: Colors.textSecondary,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    ...Font.labelS,
    color: Colors.textMuted,
  },
  googleBtn: {
    height: 56,
    borderRadius: Radius.full,
    backgroundColor: Colors.gold,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space.md,
  },
  googleIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.textInverse,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleG: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.gold,
    lineHeight: 17,
  },
  googleBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textInverse,
    letterSpacing: 0.2,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space.xs,
  },
  lockIcon: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  securityText: {
    ...Font.labelS,
    color: Colors.textMuted,
  },
  terms: {
    ...Font.bodyS,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  termsLink: {
    color: Colors.textPrimary,
    textDecorationLine: 'underline',
  },

  footer: {
    ...Font.labelS,
    color: Colors.textMuted,
    textAlign: 'center',
    letterSpacing: 1.2,
  },
});

export default LoginScreen;