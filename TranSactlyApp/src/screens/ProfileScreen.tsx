import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors, Space, Radius, Font } from '../theme';
import { getUser } from '../services/auth/userStorage';
import { useEffect, useState } from 'react';
import {
  Image,
} from 'react-native';
import {
  fetchMe,
} from '../services/api/userApi';
interface MenuCardProps {
  meta: string;
  title: string;
  sub?: string;
  iconChar: string;
  iconBg: string;
  iconFg: string;
  onPress?: () => void;
}

const MenuCard: React.FC<MenuCardProps> = ({ meta, title, sub, iconChar, iconBg, iconFg, onPress }) => (
  <TouchableOpacity style={styles.menuCard} onPress={onPress} activeOpacity={0.8}>
    <View style={[styles.menuIconBox, { backgroundColor: iconBg }]}>
      <Text style={[styles.menuIconText, { color: iconFg }]}>{iconChar}</Text>
    </View>
    <View style={styles.menuContent}>
      <Text style={styles.menuMeta}>{meta}</Text>
      <Text style={styles.menuTitle}>{title}</Text>
      {sub ? <Text style={styles.menuSub}>{sub}</Text> : null}
    </View>
    <View style={styles.chevronBox}>
      <Text style={styles.chevron}>›</Text>
    </View>
  </TouchableOpacity>
);

const ProfileScreen: React.FC = () => {
  const [user, setUser] = useState<any>(null);

useEffect(() => {
  const loadUser = async () => {
    const data = await getUser();
    setUser(data);
  };

  loadUser();
}, []);
   const navigation = useNavigation<any>();
  const handleLogout = () =>
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
  text: 'Logout',
  style: 'destructive',
onPress: async () => {

  const { logout } = await import(
    '../services/auth/logout'
  );

  await logout();

  navigation.reset({
    index: 0,
    routes: [{ name: 'Login' }],
  });
},
},
    ]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Top bar */}
        <View style={styles.topBar}>
          <Text style={styles.brandName}>SmartSpend AI</Text>
          <TouchableOpacity style={styles.bellBtn}>
            <Text style={styles.bellGlyph}>◉</Text>
          </TouchableOpacity>
        </View>

        {/* Profile hero */}
        <View style={styles.profileHero}>
          <View style={styles.avatarRing}>
<View style={styles.avatar}>
  {user?.photo ? (
    <Image
      source={{
        uri: user.photo,
      }}
      style={styles.avatarImage}
    />
  ) : (
    <Text style={styles.avatarInitials}>
      {user?.name?.charAt(0) || 'U'}
    </Text>
  )}
</View>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedGlyph}>✓</Text>
            </View>
          </View>
<Text style={styles.profileName}>
  {user?.name || 'User'}
</Text>

<Text style={styles.profileEmail}>
  {user?.email || ''}
</Text>
          <TouchableOpacity style={styles.editBtn} activeOpacity={0.75}>
            <Text style={styles.editBtnText}>EDIT PROFILE  →</Text>
          </TouchableOpacity>
        </View>

        {/* Menu cards */}
        {/* Account control list */}
        <View style={styles.listCard}>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.logoutGlyph}>↪</Text>
          <Text style={styles.logoutText}>LOGOUT</Text>
        </TouchableOpacity>

        {/* Intelligence banner */}
        <View style={styles.banner}>
          <View style={styles.bannerTopRow}>
            <View style={styles.bannerLiveDot} />
            <Text style={styles.bannerLiveText}>SMARTSPEND INTELLIGENCE LIVE</Text>
          </View>
          <Text style={styles.bannerTitle}>Optimize your wealth</Text>
          <Text style={styles.bannerDesc}>
            Our AI engine continues to analyze global markets while you rest.
            Secure, private, and always ahead.
          </Text>
          <View style={styles.bannerDivider} />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingHorizontal: Space.xl, paddingBottom: Space.xxxl },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Space.lg,
  },
  brandName: { ...Font.labelL, color: Colors.textPrimary, fontSize: 15 },
  bellBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellGlyph: { fontSize: 16, color: Colors.gold },

  // Profile hero
  profileHero: {
    alignItems: 'center',
    paddingVertical: Space.xl,
    gap: Space.sm,
  },
  avatarRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Space.sm,
  },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: Colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: { fontSize: 30, fontWeight: '800', color: Colors.gold },
  verifiedBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.bg,
  },
  verifiedGlyph: { fontSize: 11, color: Colors.textInverse, fontWeight: '900' },
  profileName: { ...Font.displayL, color: Colors.textPrimary, fontSize: 24 },
  profileEmail: { ...Font.bodyS, color: Colors.textSecondary },
  editBtn: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.full,
    paddingHorizontal: Space.xl,
    paddingVertical: Space.sm,
    marginTop: Space.sm,
  },
  editBtnText: { ...Font.labelS, color: Colors.textSecondary },

  // Menu cards
  menuGroup: { gap: Space.sm, marginBottom: Space.md },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Space.lg,
    gap: Space.md,
  },
  menuIconBox: {
    width: 46,
    height: 46,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconText: { fontSize: 20, fontWeight: '700' },
  menuContent: { flex: 1 },
  menuMeta: { ...Font.labelS, color: Colors.gold, marginBottom: 3 },
  menuTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  menuSub: { ...Font.bodyS, color: Colors.textSecondary, marginTop: 2 },
  chevronBox: {
    width: 28,
    height: 28,
    borderRadius: Radius.xs,
    backgroundColor: Colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: { fontSize: 18, color: Colors.textMuted, lineHeight: 22 },

  // Account list
  listCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Space.lg,
    marginBottom: Space.md,
  },
  listTitle: {
    ...Font.labelL,
    color: Colors.textPrimary,
    fontSize: 14,
    marginBottom: Space.md,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Space.md,
    gap: Space.md,
  },
  listIconBox: {
    width: 30,
    height: 30,
    borderRadius: Radius.xs,
    backgroundColor: Colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listGlyph: { fontSize: 14, color: Colors.textSecondary },
  listLabel: { ...Font.bodyM, color: Colors.textPrimary, flex: 1 },
  listChevron: { fontSize: 18, color: Colors.textMuted },
  listDivider: { height: 1, backgroundColor: Colors.border },

  // Logout
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingVertical: Space.lg,
    marginBottom: Space.xl,
  },
  logoutGlyph: { fontSize: 16, color: Colors.textSecondary },
  logoutText: { ...Font.labelM, color: Colors.textSecondary, letterSpacing: 1.2 },

  // Banner
  banner: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    padding: Space.xl,
    gap: Space.md,
  },
  bannerTopRow: { flexDirection: 'row', alignItems: 'center', gap: Space.sm },
  bannerLiveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.gold },
  bannerLiveText: { ...Font.labelS, color: Colors.gold },
  bannerTitle: { ...Font.displayM, color: Colors.textPrimary, fontSize: 20 },
  bannerDesc: { ...Font.bodyS, color: Colors.textSecondary, lineHeight: 19 },
  bannerDivider: { height: 1, backgroundColor: Colors.border },
  bannerFooter: { ...Font.labelS, color: Colors.textMuted, textAlign: 'center' },
  avatarImage: {
  width: 86,
  height: 86,
  borderRadius: 43,
},
});

export default ProfileScreen;