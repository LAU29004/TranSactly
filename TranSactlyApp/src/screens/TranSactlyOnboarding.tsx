import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  StatusBar,
  ViewToken,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// ─────────────────────────────────────────────
// Theme
// ─────────────────────────────────────────────
const C = {
  bg: '#0B0F17',
  card: '#141A23',
  cardBorder: '#1E2A3A',
  gold: '#D4AF37',
  goldDim: 'rgba(212,175,55,0.12)',
  goldBorder: 'rgba(212,175,55,0.30)',
  goldBorderStrong: 'rgba(212,175,55,0.55)',
  purple: '#8B5CF6',
  purpleDim: 'rgba(139,92,246,0.15)',
  purpleMid: 'rgba(139,92,246,0.35)',
  green: '#10B981',
  greenDim: 'rgba(16,185,129,0.15)',
  greenMid: 'rgba(16,185,129,0.35)',
  blue: '#60A5FA',
  blueDim: 'rgba(96,165,250,0.12)',
  red: '#EF4444',
  textPrimary: '#ECEDF2',
  textSecondary: '#C8CDD8',
  textMuted: '#6B7A96',
  textDim: '#47546A',
  dotInactive: '#1E2A3A',
} as const;

const R = { sm: 8, md: 12, lg: 16, xl: 20, pill: 999 } as const;
const { width: W, height: H } = Dimensions.get('window');
const HERO_H = H * 0.52;

// ─────────────────────────────────────────────
// Shared types
// ─────────────────────────────────────────────
interface SlideData {
  key: string;
  accentColor: string;
  accentDim: string;
  accentMid: string;
  hero: React.ReactNode;
  eyebrow: string;
  headline: string;
  headlineAccent: string;
  body: string;
  cta: string;
  ctaTextColor: string;
  microcopy: string;
}

// ─────────────────────────────────────────────
// SVG-style hero illustrations (pure RN Views)
// ─────────────────────────────────────────────

/** Screen 1 — floating card stack with AI sparkles */
const HeroWelcome: React.FC = () => {
  const float = useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: -10, duration: 1800, useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={heroStyles.root}>
      {/* Background glow orb */}
      <View style={[heroStyles.orb, { backgroundColor: C.goldDim, width: 220, height: 220, borderRadius: 110, top: 20, left: W / 2 - 110 }]} />

      {/* Main card */}
      <Animated.View style={[heroStyles.mainCard, { transform: [{ translateY: float }] }]}>
        <View style={heroStyles.cardTopRow}>
          <View style={heroStyles.cardLogoMark}>
            <Text style={{ fontSize: 18 }}>⚡</Text>
          </View>
          <View>
            <Text style={heroStyles.cardTitle}>centfluence</Text>
            <Text style={heroStyles.cardSubtitle}>Net Worth</Text>
          </View>
          <View style={{ flex: 1 }} />
          <Text style={heroStyles.cardBadge}>LIVE</Text>
        </View>
        <Text style={heroStyles.bigNumber}>₹2,84,530</Text>
        <View style={heroStyles.cardBarRow}>
          {[65, 40, 80, 55, 70, 45, 90].map((h, i) => (
            <View key={i} style={[heroStyles.bar, { height: h * 0.5, backgroundColor: i === 6 ? C.gold : C.goldBorder }]} />
          ))}
        </View>
      </Animated.View>

      {/* Floating chip — income */}
      <Animated.View style={[heroStyles.chipGreen, { transform: [{ translateY: Animated.multiply(float, -0.6) }] }]}>
        <Text style={{ fontSize: 13 }}>📈</Text>
        <View>
          <Text style={heroStyles.chipLabel}>Income</Text>
          <Text style={heroStyles.chipVal}>+₹52,000</Text>
        </View>
      </Animated.View>

      {/* Floating chip — AI */}
      <Animated.View style={[heroStyles.chipPurple, { transform: [{ translateY: Animated.multiply(float, 0.4) }] }]}>
        <Text style={{ fontSize: 13 }}>✨</Text>
        <Text style={heroStyles.chipAI}>AI Active</Text>
      </Animated.View>

      {/* Bottom mini-card */}
      <View style={heroStyles.miniCard}>
        <View style={heroStyles.miniRow}>
          <View style={[heroStyles.miniDot, { backgroundColor: C.green }]} />
          <Text style={heroStyles.miniLabel}>Swiggy</Text>
          <View style={{ flex: 1 }} />
          <Text style={heroStyles.miniAmt}>−₹850</Text>
        </View>
        <View style={heroStyles.miniRow}>
          <View style={[heroStyles.miniDot, { backgroundColor: C.gold }]} />
          <Text style={heroStyles.miniLabel}>Salary credit</Text>
          <View style={{ flex: 1 }} />
          <Text style={[heroStyles.miniAmt, { color: C.green }]}>+₹52,000</Text>
        </View>
      </View>
    </View>
  );
};

/** Screen 2 — SMS → AI extraction pipeline */
const HeroAI: React.FC = () => {
  const pulse = useRef(new Animated.Value(0.85)).current;
  const slideIn = useRef(new Animated.Value(30)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.85, duration: 900, useNativeDriver: true }),
      ])
    ).start();
    Animated.sequence([
      Animated.delay(400),
      Animated.parallel([
        Animated.timing(slideIn, { toValue: 0, duration: 600, useNativeDriver: true }),
        Animated.timing(fadeIn, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={heroStyles.root}>
      <View style={[heroStyles.orb, { backgroundColor: C.purpleDim, width: 200, height: 200, borderRadius: 100, top: 30, left: W / 2 - 100 }]} />

      {/* SMS bubble */}
      <View style={heroStyles.smsBubble}>
        <Text style={heroStyles.smsBankTag}>📩  HDFC Bank</Text>
        <Text style={heroStyles.smsText}>
          Rs.1,850.00 debited from A/c XX8821 at Swiggy on 11-06-26.
        </Text>
      </View>

      {/* Arrow + AI brain */}
      <View style={heroStyles.pipeRow}>
        <View style={heroStyles.pipeArrow} />
        <Animated.View style={[heroStyles.aiBrain, { transform: [{ scale: pulse }] }]}>
          <Text style={{ fontSize: 26 }}>🧠</Text>
        </Animated.View>
        <View style={heroStyles.pipeArrow} />
      </View>

      {/* Extracted cards */}
      <Animated.View style={[heroStyles.extractStack, { opacity: fadeIn, transform: [{ translateY: slideIn }] }]}>
        {[
          { label: 'Merchant', value: 'Swiggy', color: C.textSecondary },
          { label: 'Category', value: '🍔  Food & Dining', color: C.textSecondary },
          { label: 'Amount', value: '−₹1,850', color: C.red },
          { label: 'Date', value: '11 Jun 2026', color: C.textSecondary },
        ].map((row) => (
          <View key={row.label} style={heroStyles.extractRow}>
            <Text style={heroStyles.extractLabel}>{row.label}</Text>
            <Text style={[heroStyles.extractVal, { color: row.color }]}>{row.value}</Text>
          </View>
        ))}
      </Animated.View>
    </View>
  );
};

/** Screen 3 — shield / security ecosystem */
const HeroSecurity: React.FC = () => {
  const rotate = useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.loop(
      Animated.timing(rotate, { toValue: 1, duration: 12000, useNativeDriver: true })
    ).start();
  }, []);
  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={heroStyles.root}>
      <View style={[heroStyles.orb, { backgroundColor: C.greenDim, width: 240, height: 240, borderRadius: 120, top: 10, left: W / 2 - 120 }]} />

      {/* Orbit ring */}
      <Animated.View style={[heroStyles.orbitRing, { transform: [{ rotate: spin }] }]}>
        {[
          { top: -14, left: '50%', ml: -14, icon: '🔒' },
          { top: '50%', right: -14, mt: -14, icon: '🛡️' },
          { bottom: -14, left: '50%', ml: -14, icon: '🔐' },
          { top: '50%', left: -14, mt: -14, icon: '✅' },
        ].map((node, i) => (
          <View
            key={i}
            style={[
              heroStyles.orbitNode,
              {
                top: node.top as any,
                left: node.left as any,
                right: node.right as any,
                bottom: node.bottom as any,
                marginLeft: node.ml as any,
                marginTop: node.mt as any,
              },
            ]}
          >
            <Text style={{ fontSize: 14 }}>{node.icon}</Text>
          </View>
        ))}
      </Animated.View>

      {/* centre shield */}
      <View style={heroStyles.shieldcenter}>
        <Text style={{ fontSize: 36 }}>🛡️</Text>
        <Text style={heroStyles.shieldLabel}>Secured</Text>
      </View>

      {/* Device sync row */}
      <View style={heroStyles.syncRow}>
        <View style={heroStyles.syncChip}>
          <Text style={{ fontSize: 18 }}>📱</Text>
          <Text style={heroStyles.syncChipLabel}>Mobile</Text>
        </View>
        <View style={heroStyles.syncDashes}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={heroStyles.syncDash} />
          ))}
        </View>
        <View style={[heroStyles.syncChip, { borderColor: C.goldBorderStrong }]}>
          <Text style={{ fontSize: 18 }}>🔐</Text>
          <Text style={heroStyles.syncChipLabel}>Encrypted</Text>
        </View>
        <View style={heroStyles.syncDashes}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={heroStyles.syncDash} />
          ))}
        </View>
        <View style={heroStyles.syncChip}>
          <Text style={{ fontSize: 18 }}>🖥️</Text>
          <Text style={heroStyles.syncChipLabel}>Web</Text>
        </View>
      </View>
    </View>
  );
};

// ─────────────────────────────────────────────
// Slide data
// ─────────────────────────────────────────────
const slides: SlideData[] = [
  {
    key: 'welcome',
    accentColor: C.gold,
    accentDim: C.goldDim,
    accentMid: C.goldBorder,
    hero: <HeroWelcome />,
    eyebrow: 'WELCOME TO centfluence',
    headline: 'Your money,\n',
    headlineAccent: 'finally intelligent.',
    body: 'Automatic SMS tracking. AI categorization. Real-time insights. Everything your bank should tell you — but never does.',
    cta: "Get Started — It's Free",
    ctaTextColor: C.bg,
    microcopy: 'No credit card required  ·  Setup in 60 seconds',
  },
  {
    key: 'ai',
    accentColor: C.purple,
    accentDim: C.purpleDim,
    accentMid: C.purpleMid,
    hero: <HeroAI />,
    eyebrow: 'AI FINANCIAL INTELLIGENCE',
    headline: 'Every SMS becomes\n',
    headlineAccent: 'a financial insight.',
    body: 'Grant one-time permission. Our AI reads every bank alert, extracts transactions, and builds your complete spending picture — automatically.',
    cta: 'See How It Works',
    ctaTextColor: '#FFFFFF',
    microcopy: 'Reads SMS only  ·  Never accesses banking apps',
  },
  {
    key: 'security',
    accentColor: C.green,
    accentDim: C.greenDim,
    accentMid: C.greenMid,
    hero: <HeroSecurity />,
    eyebrow: 'BANK-GRADE SECURITY',
    headline: 'Your data stays\n',
    headlineAccent: 'yours. Always.',
    body: 'Zero credentials. AES-256 encryption. Google OAuth login. We see your patterns — never your passwords.',
    cta: 'Continue with Google',
    ctaTextColor: '#FFFFFF',
    microcopy: 'By continuing you agree to our Terms & Privacy Policy',
  },
];

// ─────────────────────────────────────────────
// Dot indicator
// ─────────────────────────────────────────────
const Dots: React.FC<{ total: number; active: number; color: string }> = ({ total, active, color }) => (
  <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
    {Array.from({ length: total }).map((_, i) => (
      <View
        key={i}
        style={{
          height: 4,
          width: i === active ? 24 : 6,
          borderRadius: 2,
          backgroundColor: i === active ? color : C.dotInactive,
        }}
      />
    ))}
  </View>
);

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────
const TranSactlyOnboarding: React.FC = () => {
  const navigation = useNavigation<any>();
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const flatListRef = useRef<FlatList<SlideData>>(null);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const finish = async (): Promise<void> => {
    await AsyncStorage.setItem('onboarding_complete', 'true');
    navigation.replace('Login');
  };

  const handleNext = async (): Promise<void> => {
    if (activeIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    } else {
      await finish();
    }
  };

  const slide = slides[activeIndex];

  return (
    <SafeAreaView style={s.safe} edges={['bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      <FlatList<SlideData>
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item }) => (
          <View style={{ width: W }}>
            {/* ── Hero zone */}
            <View style={[s.heroZone, { backgroundColor: item.accentDim }]}>
              {/* subtle top border accent */}
              <View style={[s.heroTopAccent, { backgroundColor: item.accentColor }]} />
              {item.hero}
            </View>

            {/* ── Copy zone */}
            <View style={s.copyZone}>
              {/* Eyebrow */}
              <View style={[s.eyebrowPill, { backgroundColor: item.accentDim, borderColor: item.accentMid }]}>
                <View style={[s.eyebrowDot, { backgroundColor: item.accentColor }]} />
                <Text style={[s.eyebrowText, { color: item.accentColor }]}>{item.eyebrow}</Text>
              </View>

              {/* Headline */}
              <Text style={s.headline}>
                {item.headline}
                <Text style={{ color: item.accentColor }}>{item.headlineAccent}</Text>
              </Text>

              {/* Body */}
              <Text style={s.body}>{item.body}</Text>
            </View>
          </View>
        )}
        style={{ flex: 1 }}
      />

      {/* ── Bottom nav (outside FlatList so it stays fixed) */}
      <View style={s.bottomNav}>
        <View style={s.navRow}>
          <Dots total={slides.length} active={activeIndex} color={slide.accentColor} />
          <View style={{ flex: 1 }} />
          {activeIndex < slides.length - 1 && (
            <TouchableOpacity onPress={finish} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={s.skipText}>Skip</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[s.ctaBtn, { backgroundColor: slide.accentColor }]}
          onPress={handleNext}
          activeOpacity={0.86}
        >
          <Text style={[s.ctaText, { color: slide.ctaTextColor }]}>{slide.cta}</Text>
        </TouchableOpacity>

        <Text style={s.microcopy}>{slide.microcopy}</Text>
      </View>
    </SafeAreaView>
  );
};

// ─────────────────────────────────────────────
// Hero sub-styles
// ─────────────────────────────────────────────
const heroStyles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  orb: {
    position: 'absolute',
  },

  // ── Screen 1
  mainCard: {
    width: W * 0.72,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.cardBorder,
    borderRadius: R.xl,
    padding: 16,
    marginBottom: 12,
  },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  cardLogoMark: {
    width: 32, height: 32, borderRadius: 9,
    backgroundColor: C.goldDim, borderWidth: 1, borderColor: C.goldBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  cardTitle: { fontSize: 12, fontWeight: '700', color: C.textSecondary },
  cardSubtitle: { fontSize: 9, color: C.textDim },
  cardBadge: {
    fontSize: 8, fontWeight: '700', color: C.green,
    backgroundColor: C.greenDim, borderRadius: 4,
    paddingHorizontal: 5, paddingVertical: 2,
    borderWidth: 1, borderColor: C.greenMid,
  },
  bigNumber: { fontSize: 26, fontWeight: '700', color: C.textPrimary, marginBottom: 10 },
  cardBarRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 5, height: 30 },
  bar: { width: 8, borderRadius: 3 },

  chipGreen: {
    position: 'absolute', top: H * 0.04, right: 20,
    flexDirection: 'row', gap: 6, alignItems: 'center',
    backgroundColor: C.card, borderWidth: 1, borderColor: C.greenMid,
    borderRadius: R.pill, paddingHorizontal: 10, paddingVertical: 6,
  },
  chipPurple: {
    position: 'absolute', top: H * 0.04, left: 20,
    flexDirection: 'row', gap: 6, alignItems: 'center',
    backgroundColor: C.card, borderWidth: 1, borderColor: C.purpleMid,
    borderRadius: R.pill, paddingHorizontal: 10, paddingVertical: 6,
  },
  chipLabel: { fontSize: 9, color: C.textDim },
  chipVal: { fontSize: 11, fontWeight: '700', color: C.green },
  chipAI: { fontSize: 11, fontWeight: '700', color: C.purple },

  miniCard: {
    width: W * 0.72,
    backgroundColor: C.card, borderWidth: 1, borderColor: C.cardBorder,
    borderRadius: R.md, padding: 10, gap: 6,
  },
  miniRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  miniDot: { width: 7, height: 7, borderRadius: 4 },
  miniLabel: { fontSize: 10, color: C.textSecondary },
  miniAmt: { fontSize: 10, fontWeight: '700', color: C.red },

  // ── Screen 2
  smsBubble: {
    width: W * 0.75,
    backgroundColor: C.card, borderWidth: 1, borderColor: C.cardBorder,
    borderRadius: R.lg, padding: 12, marginBottom: 14,
  },
  smsBankTag: { fontSize: 10, fontWeight: '700', color: C.green, marginBottom: 5 },
  smsText: { fontSize: 11, color: C.textMuted, lineHeight: 16 },

  pipeRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 8, marginBottom: 14,
  },
  pipeArrow: {
    flex: 1, height: 1.5, backgroundColor: C.purpleMid,
  },
  aiBrain: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: C.purpleDim, borderWidth: 1.5, borderColor: C.purpleMid,
    alignItems: 'center', justifyContent: 'center',
  },

  extractStack: {
    width: W * 0.75,
    backgroundColor: C.card, borderWidth: 1, borderColor: C.cardBorder,
    borderRadius: R.lg, overflow: 'hidden',
  },
  extractRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 9,
    borderBottomWidth: 1, borderBottomColor: C.cardBorder,
  },
  extractLabel: { fontSize: 10, color: C.textDim },
  extractVal: { fontSize: 11, fontWeight: '600' },

  // ── Screen 3
  orbitRing: {
    width: 160, height: 160, borderRadius: 80,
    borderWidth: 1, borderColor: C.greenMid,
    position: 'absolute',
    top: H * 0.03,
  },
  orbitNode: {
    position: 'absolute',
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: C.card, borderWidth: 1, borderColor: C.cardBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  shieldcenter: {
    width: 90, height: 90, borderRadius: 28,
    backgroundColor: C.card, borderWidth: 1.5, borderColor: C.greenMid,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 10, marginBottom: 28,
    gap: 2,
  },
  shieldLabel: { fontSize: 9, fontWeight: '700', color: C.green },

  syncRow: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    marginTop: 8,
  },
  syncChip: {
    alignItems: 'center', justifyContent: 'center', gap: 3,
    width: 60, height: 54, borderRadius: R.md,
    backgroundColor: C.card, borderWidth: 1, borderColor: C.cardBorder,
  },
  syncChipLabel: { fontSize: 8, color: C.textMuted, fontWeight: '600' },
  syncDashes: { flexDirection: 'row', gap: 3, alignItems: 'center' },
  syncDash: { width: 5, height: 1.5, borderRadius: 1, backgroundColor: C.goldBorder },
});

// ─────────────────────────────────────────────
// Main styles
// ─────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  heroZone: {
    height: HERO_H,
    overflow: 'hidden',
    position: 'relative',
  },
  heroTopAccent: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 2, opacity: 0.7,
  },

  copyZone: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 8,
  },

  eyebrowPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderRadius: R.pill,
    paddingHorizontal: 10, paddingVertical: 5,
    alignSelf: 'flex-start', marginBottom: 12,
  },
  eyebrowDot: { width: 6, height: 6, borderRadius: 3 },
  eyebrowText: { fontSize: 9, fontWeight: '700', letterSpacing: 1.0 },

  headline: {
    fontSize: 28,
    fontWeight: '700',
    color: C.textPrimary,
    lineHeight: 35,
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  body: {
    fontSize: 13,
    lineHeight: 20,
    color: C.textMuted,
  },

  bottomNav: {
    backgroundColor: C.bg,
    borderTopWidth: 1,
    borderTopColor: '#151D2B',
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 16,
    gap: 12,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skipText: {
    fontSize: 13,
    color: C.textDim,
    fontWeight: '600',
  },

  ctaBtn: {
    borderRadius: R.lg,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  microcopy: {
    fontSize: 10,
    color: C.textDim,
    textAlign: 'center',
  },
});

export default TranSactlyOnboarding;