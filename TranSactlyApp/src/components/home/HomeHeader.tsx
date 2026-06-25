import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Image,
  TouchableOpacity,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getUser } from '../../services/auth/userStorage';
import { DashboardStats } from '../../utils/dashboardCalculations';
import AIPulseDot from './AIPulseDot';
import MiniSparkBar from './MiniSparkBar';
import SMSSourceBadge from './SMSSourceBadge';

// ── Design Tokens ──────────────────────────────────────────────────────────────
const C = {
  background: '#0B0F17',
  card: '#141A23',
  surface: '#1E2636',
  border: '#1F2937',
  borderLight: '#374151',

  gold: '#D4AF37',
  goldLight: '#F0D060',
  goldMuted: '#D4AF3733',
  purple: '#8B5CF6',
  purpleMuted: '#8B5CF620',

  success: '#10B981',
  successMuted: '#10B98120',
  danger: '#EF4444',
  dangerMuted: '#EF444420',

  textPrimary: '#FFFFFF',
  textSecondary: '#9CA3AF',
  textMuted: '#4B5563',
};

// ── Spark bar heights — unchanged from original ────────────────────────────────
const SPARK_HEIGHTS = [18, 28, 22, 36, 30, 42, 34];

// ── Greeting helper ────────────────────────────────────────────────────────────
function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function formatFullDate(): string {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

// ── Props — unchanged ──────────────────────────────────────────────────────────
interface HomeHeaderProps {
  dashboardStats: DashboardStats;
  homeData?: any;
  heroFade: Animated.Value;
  heroSlide: Animated.Value;
  onExportExcel: () => void;
}
// ── Stat item definition ───────────────────────────────────────────────────────
interface StatItem {
  label: string;
  value: string;
  icon: string;
  color: string;
  colorBg: string;
}

// ── Component ──────────────────────────────────────────────────────────────────
const HomeHeader: React.FC<HomeHeaderProps> = ({
  dashboardStats,
  homeData,
  heroFade,
  heroSlide,
  onExportExcel,
}) => {
  const [user, setUser] = useState<any>(null);
  // Format the spending number — split into integer and decimal parts
  const totalSpending = homeData?.totalExpenses ?? dashboardStats.spending;

  const spendingFixed = totalSpending.toFixed(2);
  const [intPart, decPart] = spendingFixed.split('.');
  const intFormatted = Number(intPart).toLocaleString('en-IN');

  const savingsRate = homeData?.totalIncome
    ? (homeData.totalSavings / homeData.totalIncome) * 100
    : dashboardStats.savingsRate;

  const savingsHealthy = savingsRate >= 30;

  const stats: StatItem[] = [
    {
      label: 'INCOME',
      value: `₹${(
        (homeData?.totalIncome ?? dashboardStats.income) / 1000
      ).toFixed(0)}K`,
      icon: 'cash-multiple',
      color: C.success,
      colorBg: C.successMuted,
    },
    {
      label: 'SAVINGS',
      value: `₹${(
        (homeData?.totalSavings ?? dashboardStats.savings) / 1000
      ).toFixed(1)}K`,
      icon: 'piggy-bank-outline',
      color: C.gold,
      colorBg: C.goldMuted,
    },
    {
      label: 'TXN COUNT',
      value: `${
        homeData?.recentTransactions?.length ?? dashboardStats.transactionCount
      }`,
      icon: 'swap-horizontal',
      color: C.purple,
      colorBg: C.purpleMuted,
    },
  ];
  useEffect(() => {
    const loadUser = async () => {
      const data = await getUser();

      setUser(data);
    };

    loadUser();
  }, []);
  return (
    <>
      {/* ── Top Bar ─────────────────────────────────────────────────────────── */}
      <View style={s.topBar}>
        {/* Left: avatar + AI pill */}
        <View style={s.topLeft}>
          <View style={s.avatarWrap}>
            <View style={s.avatar}>
              <Image
                source={{
                  uri: user?.photo,
                }}
                style={s.avatar}
              />
            </View>
            {/* Online dot */}
            <View style={s.avatarOnline} />
          </View>

          <View style={s.aiPill}>
            <AIPulseDot />
            <Text style={s.aiPillText}>AI PROTECTED</Text>
          </View>
        </View>

        {/* Right: date chip */}
        <View style={s.dateChip}>
          <MaterialCommunityIcons
            name="calendar-month-outline"
            size={11}
            color={C.gold}
          />
          <Text style={s.dateText}>{formatFullDate()}</Text>
        </View>
      </View>

      {/* ── Greeting Block ──────────────────────────────────────────────────── */}
      <View style={s.greetingBlock}>
        <Text style={s.greetingSub}>{getGreeting().toUpperCase()}</Text>
        <Text style={s.greetingName}>
          Hello, {user?.name?.split(' ')[0] ?? 'User'} 👋{' '}
        </Text>
        <Text style={s.greetingDesc}>Your financial intelligence overview</Text>
      </View>

      {/* ── Hero Card ───────────────────────────────────────────────────────── */}
      <Animated.View
        style={[
          s.heroCard,
          { opacity: heroFade, transform: [{ translateY: heroSlide }] },
        ]}
      >
        {/* Decorative glow blobs */}
        <View style={s.glowTopRight} />
        <View style={s.glowBottomLeft} />

        {/* ── Card header row ── */}
        <View style={s.cardHeaderRow}>
          <View>
            <Text style={s.heroLabel}>TOTAL MONTHLY SPENDING</Text>
          </View>
          {/* Health badge */}
          <View
            style={[
              s.healthBadge,
              {
                backgroundColor: savingsHealthy
                  ? C.successMuted
                  : C.dangerMuted,
                borderColor: savingsHealthy
                  ? C.success + '40'
                  : C.danger + '40',
              },
            ]}
          >
            <View
              style={[
                s.healthDot,
                { backgroundColor: savingsHealthy ? C.success : C.danger },
              ]}
            />
            <Text
              style={[
                s.healthText,
                { color: savingsHealthy ? C.success : C.danger },
              ]}
            >
              {savingsHealthy ? 'On Track' : 'Review Spend'}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={s.exportButton}
          onPress={onExportExcel}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="file-excel" size={14} color={C.gold} />

          <Text style={s.exportText}>EXPORT</Text>
        </TouchableOpacity>
        {/* ── Big spending number ── */}
        <View style={s.amountRow}>
          <Text style={s.currencySymbol}>₹</Text>
          <Text style={s.amountInt}>{intFormatted}</Text>
          <Text style={s.amountDec}>.{decPart}</Text>
        </View>

        {/* Savings rate caption */}
        <View style={s.savingsCaption}>
          <MaterialCommunityIcons
            name={savingsHealthy ? 'trending-up' : 'trending-down'}
            size={12}
            color={savingsHealthy ? C.success : C.danger}
          />
          <Text
            style={[
              s.savingsCaptionText,
              { color: savingsHealthy ? C.success : C.danger },
            ]}
          >
            {savingsRate.toFixed(0)}% savings rate
            {savingsHealthy ? ' · healthy' : ' · needs improvement'}
          </Text>
        </View>

        {/* ── Divider ── */}
        <View style={s.divider} />

        {/* ── Three stat pills ── */}
        <View style={s.statRow}>
          {stats.map((stat, i) => (
            <React.Fragment key={stat.label}>
              <View style={s.statItem}>
                <View style={[s.statIcon, { backgroundColor: stat.colorBg }]}>
                  <MaterialCommunityIcons
                    name={stat.icon}
                    size={14}
                    color={stat.color}
                  />
                </View>
                <Text style={s.statLabel}>{stat.label}</Text>
                <Text style={[s.statValue, { color: stat.color }]}>
                  {stat.value}
                </Text>
              </View>
              {i < stats.length - 1 && <View style={s.statSeparator} />}
            </React.Fragment>
          ))}
        </View>

        {/* ── Spark bar ── */}
        <MiniSparkBar heights={SPARK_HEIGHTS} activeIndex={6} />

        {/* ── SMS source badge ── */}
        <SMSSourceBadge />
      </Animated.View>
    </>
  );
};

export default HomeHeader;

// ── Styles ─────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  // ── Top bar ──
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  topLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  // Avatar
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: C.goldMuted,
    borderWidth: 1.5,
    borderColor: C.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: C.gold,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  avatarOnline: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: C.success,
    borderWidth: 1.5,
    borderColor: C.background,
  },

  // AI protected pill
  aiPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: C.purpleMuted,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: C.purple + '40',
  },
  aiPillText: {
    color: C.purple,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
  },

  // Date chip
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: C.goldMuted,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: C.gold + '30',
  },
  dateText: {
    color: C.gold,
    fontSize: 10,
    fontWeight: '600',
  },

  // ── Greeting ──
  greetingBlock: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    gap: 4,
  },
  greetingSub: {
    color: C.gold,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2.5,
  },
  greetingName: {
    color: C.textPrimary,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  greetingDesc: {
    color: C.textSecondary,
    fontSize: 13,
    fontWeight: '400',
    marginTop: 2,
  },

  // ── Hero card ──
  heroCard: {
    backgroundColor: C.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: C.border,
    marginHorizontal: 16,
    padding: 22,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: C.gold,
    shadowOpacity: 0.06,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },

  // Glow blobs
  glowTopRight: {
    position: 'absolute',
    top: -30,
    right: -20,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: C.gold + '0C',
  },
  glowBottomLeft: {
    position: 'absolute',
    bottom: -20,
    left: 10,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: C.purple + '10',
  },

  // Card header row
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  heroLabel: {
    color: C.gold,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
  },
  healthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  healthDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  healthText: {
    fontSize: 10,
    fontWeight: '700',
  },

  // Amount
  amountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  currencySymbol: {
    color: C.textSecondary,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 50,
    marginRight: 2,
  },
  amountInt: {
    color: C.textPrimary,
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: -2,
    lineHeight: 52,
  },
  amountDec: {
    color: C.textMuted,
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 36,
    marginLeft: 1,
    marginBottom: 4,
  },

  // Savings caption
  savingsCaption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 20,
  },
  savingsCaptionText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginBottom: 18,
  },

  // Stat row
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 5,
  },
  statSeparator: {
    width: 1,
    height: 40,
    backgroundColor: C.border,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    color: C.textMuted,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: 5,

    paddingHorizontal: 10,
    paddingVertical: 6,

    borderRadius: 18,

    backgroundColor: C.goldMuted,

    borderWidth: 1,
    borderColor: C.gold + '40',
  },

  exportText: {
    color: C.gold,

    fontSize: 10,

    fontWeight: '800',

    letterSpacing: 1,
  },
});
