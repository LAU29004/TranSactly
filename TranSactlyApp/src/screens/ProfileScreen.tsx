import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getUser } from '../services/auth/userStorage';
import { logout } from '../services/auth/logout';
// ── Design Tokens ──────────────────────────────────────────────────────────────
const C = {
  background:    '#0B0F17',
  card:          '#141A23',
  surface:       '#1E2636',
  border:        '#1F2937',
  borderLight:   '#374151',

  gold:          '#D4AF37',
  goldMuted:     '#D4AF3733',
  goldBorder:    '#D4AF3740',
  purple:        '#8B5CF6',
  purpleMuted:   '#8B5CF620',
  success:       '#10B981',
  successMuted:  '#10B98120',
  danger:        '#EF4444',
  dangerMuted:   '#EF444420',
  info:          '#3B82F6',
  infoMuted:     '#3B82F620',

  textPrimary:   '#FFFFFF',
  textSecondary: '#9CA3AF',
  textMuted:     '#4B5563',
  textInverse:   '#0B0F17',
};

// ── MenuCard ───────────────────────────────────────────────────────────────────
interface MenuCardProps {
  icon:    string;
  color:   string;
  colorBg: string;
  title:   string;
  sub?:    string;
  onPress?: () => void;
}

const MenuCard: React.FC<MenuCardProps> = ({ icon, color, colorBg, title, sub, onPress }) => (
  <TouchableOpacity style={s.menuRow} onPress={onPress} activeOpacity={0.7}>
    <View style={[s.menuIconBox, { backgroundColor: colorBg }]}>
      <MaterialCommunityIcons name={icon} size={19} color={color} />
    </View>
    <View style={s.menuContent}>
      <Text style={s.menuTitle}>{title}</Text>
      {sub ? <Text style={s.menuSub}>{sub}</Text> : null}
    </View>
    <MaterialCommunityIcons name="chevron-right" size={18} color={C.textMuted} />
  </TouchableOpacity>
);

// ── Component ──────────────────────────────────────────────────────────────────
const ProfileScreen: React.FC = () => {
  const [user, setUser]            = useState<any>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navigation = useNavigation<any>();

  useEffect(() => {
    const loadUser = async () => {
      const data = await getUser();
      setUser(data);
    };
    loadUser();
  }, []);

  const handleLogout = () =>
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          setIsLoggingOut(true);
          try {
            await logout();
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          } catch (e) {
            setIsLoggingOut(false);
            Alert.alert('Error', 'Something went wrong while logging out. Please try again.');
          }
        },
      },
    ]);

  const initial = (user?.name?.charAt(0) || 'U').toUpperCase();

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.background} />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Top bar ── */}
        <View style={s.topBar}>
          <View style={s.brandRow}>
            <View style={s.brandIcon}>
              <MaterialCommunityIcons name="shimmer" size={15} color={C.gold} />
            </View>
            <Text style={s.brandName}>centfluence</Text>
          </View>
          {/* <TouchableOpacity style={s.bellBtn} activeOpacity={0.8}>
            <MaterialCommunityIcons name="bell-outline" size={17} color={C.gold} />
          </TouchableOpacity> */}
        </View>

        {/* ── Profile hero ── */}
        <View style={s.profileHero}>

          {/* Decorative rings */}
          <View style={[s.ring, s.ring3]} />
          <View style={[s.ring, s.ring2]} />
          <View style={[s.ring, s.ring1]} />

          <View style={s.avatarRing}>
            <View style={s.avatar}>
              {user?.photo ? (
                <Image source={{ uri: user.photo }} style={s.avatarImage} />
              ) : (
                <Text style={s.avatarInitials}>{initial}</Text>
              )}
            </View>
            <View style={s.verifiedBadge}>
              <MaterialCommunityIcons name="check-bold" size={11} color={C.textInverse} />
            </View>
          </View>

          <Text style={s.profileName}>{user?.name || 'User'}</Text>

          {user?.email ? (
            <View style={s.emailRow}>
              <MaterialCommunityIcons name="email-outline" size={12} color={C.textMuted} />
              <Text style={s.profileEmail}>{user.email}</Text>
            </View>
          ) : null}

          {/* <TouchableOpacity style={s.editBtn} activeOpacity={0.75}>
            <MaterialCommunityIcons name="pencil-outline" size={13} color={C.textSecondary} />
            <Text style={s.editBtnText}>EDIT PROFILE</Text>
          </TouchableOpacity> */}
        </View>

        {/* ── Account section ── */}
        {/* <Text style={s.sectionLabel}>ACCOUNT</Text>
        <View style={s.listCard}>
          <MenuCard
            icon="shield-check-outline"
            color={C.success}
            colorBg={C.successMuted}
            title="Security & Privacy"
            sub="Password, biometrics, sessions"
          />
          <View style={s.listDivider} />
          <MenuCard
            icon="bell-ring-outline"
            color={C.gold}
            colorBg={C.goldMuted}
            title="Notifications"
            sub="Manage alerts and preferences"
          />
          <View style={s.listDivider} />
          <MenuCard
            icon="message-text-outline"
            color={C.info}
            colorBg={C.infoMuted}
            title="SMS Permissions"
            sub="Manage transaction data access"
          />
          <View style={s.listDivider} />
          <MenuCard
            icon="help-circle-outline"
            color={C.purple}
            colorBg={C.purpleMuted}
            title="Help & Support"
            sub="FAQs, contact us"
          />
        </View> */}

        {/* ── Logout ── */}
        <TouchableOpacity
          style={s.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.8}
          disabled={isLoggingOut}
        >
          <MaterialCommunityIcons name="logout" size={16} color={C.danger} />
          <Text style={s.logoutText}>LOGOUT</Text>
        </TouchableOpacity>

        {/* ── Intelligence banner ── */}
        <View style={s.banner}>
          {/* Glow */}
          <View style={s.bannerGlow} />

          <View style={s.bannerTopRow}>
            <View style={s.bannerLiveDot} />
            <Text style={s.bannerLiveText}>centfluence INTELLIGENCE LIVE</Text>
          </View>
          <Text style={s.bannerTitle}>Optimize your wealth</Text>
          <Text style={s.bannerDesc}>
            Our AI engine continues to analyze your transaction history while
            you rest. Secure, private, and always ahead.
          </Text>
          <View style={s.bannerDivider} />
          <View style={s.bannerFooterRow}>
            <MaterialCommunityIcons name="lock-outline" size={11} color={C.textMuted} />
            <Text style={s.bannerFooter}>End-to-end encrypted · On-device analysis</Text>
          </View>
        </View>

      </ScrollView>

      {/* ── Logout loading overlay ── */}
      <Modal visible={isLoggingOut} transparent animationType="fade" statusBarTranslucent>
        <View style={s.overlayBackdrop}>
          <View style={s.overlayCard}>
            <View style={s.overlayIconRing}>
              <ActivityIndicator size="large" color={C.gold} />
            </View>
            <Text style={s.overlayTitle}>Logging out…</Text>
            <Text style={s.overlaySub}>Securely closing your session</Text>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

export default ProfileScreen;

// ── Styles ─────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: C.background },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },

  // ── Top bar ──
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 16,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandIcon: {
    width: 28, height: 28, borderRadius: 9,
    backgroundColor: C.goldMuted,
    alignItems: 'center', justifyContent: 'center',
  },
  brandName: { fontSize: 15, fontWeight: '700', color: C.textPrimary, letterSpacing: 0.2 },
  bellBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: C.card,
    borderWidth: 1, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },

  // ── Profile hero ──
  profileHero: {
    alignItems: 'center',
    paddingVertical: 28,
    gap: 8,
    position: 'relative',
  },
  ring: {
    position: 'absolute', top: '12%',
    borderRadius: 9999, borderWidth: 1,
  },
  ring1: { width: 120, height: 120, borderColor: C.gold + '22' },
  ring2: { width: 156, height: 156, borderColor: C.gold + '12' },
  ring3: { width: 196, height: 196, borderColor: C.gold + '08' },

  avatarRing: {
    width: 104, height: 104, borderRadius: 52,
    borderWidth: 2, borderColor: C.gold,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 10, zIndex: 1,
  },
  avatar: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: C.goldMuted,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarImage:    { width: 90, height: 90, borderRadius: 45 },
  avatarInitials: { fontSize: 32, fontWeight: '800', color: C.gold },
  verifiedBadge: {
    position: 'absolute', bottom: 2, right: 2,
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: C.gold,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: C.background,
  },
  profileName: {
    fontSize: 22, fontWeight: '800', color: C.textPrimary,
    letterSpacing: -0.3, zIndex: 1,
  },
  emailRow: { flexDirection: 'row', alignItems: 'center', gap: 5, zIndex: 1 },
  profileEmail: { fontSize: 12, color: C.textSecondary },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: C.border,
    backgroundColor: C.card,
    borderRadius: 9999,
    paddingHorizontal: 18, paddingVertical: 9,
    marginTop: 10, zIndex: 1,
  },
  editBtnText: { fontSize: 11, fontWeight: '700', color: C.textSecondary, letterSpacing: 1 },

  // ── Section label ──
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: C.textMuted,
    letterSpacing: 2, marginBottom: 10, marginTop: 6,
  },

  // ── Account list ──
  listCard: {
    backgroundColor: C.card,
    borderRadius: 16, borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 6, marginBottom: 22,
  },
  menuRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 10, paddingVertical: 13,
  },
  menuIconBox: {
    width: 40, height: 40, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
  },
  menuContent: { flex: 1, gap: 2 },
  menuTitle: { fontSize: 14, fontWeight: '600', color: C.textPrimary },
  menuSub:   { fontSize: 11, color: C.textSecondary },
  listDivider: { height: 1, backgroundColor: C.border, marginLeft: 62 },

  // ── Logout ──
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1, borderColor: C.danger + '40',
    backgroundColor: C.dangerMuted,
    borderRadius: 14, paddingVertical: 15, marginBottom: 24,
  },
  logoutText: { fontSize: 13, fontWeight: '800', color: C.danger, letterSpacing: 1.5 },

  // ── Banner ──
  banner: {
    backgroundColor: C.card,
    borderRadius: 18, borderWidth: 1, borderColor: C.goldBorder,
    padding: 20, gap: 10, overflow: 'hidden', position: 'relative',
  },
  bannerGlow: {
    position: 'absolute', top: -40, right: -30,
    width: 130, height: 130, borderRadius: 65,
    backgroundColor: C.gold + '0C',
  },
  bannerTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bannerLiveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.gold },
  bannerLiveText: { fontSize: 10, fontWeight: '700', color: C.gold, letterSpacing: 1.5 },
  bannerTitle: { fontSize: 19, fontWeight: '800', color: C.textPrimary, letterSpacing: -0.3 },
  bannerDesc: { fontSize: 12.5, color: C.textSecondary, lineHeight: 19 },
  bannerDivider: { height: 1, backgroundColor: C.border, marginTop: 2 },
  bannerFooterRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bannerFooter: { fontSize: 10, color: C.textMuted, letterSpacing: 0.3 },

  // ── Logout overlay ──
  overlayBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(11,15,23,0.82)',
    alignItems: 'center', justifyContent: 'center',
  },
  overlayCard: {
    width: 220,
    backgroundColor: C.card,
    borderRadius: 20, borderWidth: 1, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 32, paddingHorizontal: 24,
    gap: 6,
  },
  overlayIconRing: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: C.goldMuted,
    borderWidth: 1, borderColor: C.goldBorder,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
  },
  overlayTitle: { fontSize: 15, fontWeight: '700', color: C.textPrimary },
  overlaySub:   { fontSize: 11, color: C.textSecondary, marginTop: 2 },
});