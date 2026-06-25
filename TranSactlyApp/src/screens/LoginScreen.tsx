import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors, Space, Radius, Font } from '../theme';
import GoogleSignin from '../services/auth/googleAuth';
import { loginWithGoogle } from '../services/api/authApi';
import { Button } from 'react-native';
import { saveToken } from '../services/auth/authStorage';
import { saveUser } from '../services/auth/userStorage';
import { getToken } from '../services/auth/authStorage';
const { height } = Dimensions.get('window');

type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
};
const LoginScreen: React.FC = () => {
  const testGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();

      const result = await GoogleSignin.signIn();

      const idToken = result.data?.idToken;
      if (!idToken || !result.data) {
        return;
      }

      if (!idToken) {
        console.log('NO ID TOKEN');

        return;
      }

      const response = await loginWithGoogle(idToken);

      await saveToken(response.access_token);

      await saveUser({
        id: response.user_id,
        name: response.name,
        email: response.email,
        photo: result.data.user.photo,
      });

      const token = await getToken();
      console.log('TOKEN:', token);
      navigation.replace('MainTabs');
    } catch (error) {
      console.log('GOOGLE LOGIN ERROR', error);
    }
  };
  const navigation = useNavigation<any>();
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

        {/* center hero */}
        <View style={styles.hero}>
          <View style={styles.logoWrap}>
            <View style={styles.logoOuter}>
              <Image
                source={require('../assets/screenLogo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
          </View>

          <Text style={styles.appName}>
            cent<Text style={styles.appNameAccent}>Fluence</Text>
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

          <TouchableOpacity
            style={styles.googleBtn}
            activeOpacity={0.85}
            // onPress={() => navigation.replace('MainTabs')}
            onPress={testGoogleLogin}
          >
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
            <Text style={styles.termsLink}>Terms</Text> and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>AN AI INTELLIGENT SYSTEM</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  logoOuter: {
    width: 120,
    height: 120,
    backgroundColor: 'transparent', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoInner: {
    width: 72,
    height: 72,
    borderRadius: Radius.lg,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 90,          
    height: 90,         
    borderRadius: 45,   
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
