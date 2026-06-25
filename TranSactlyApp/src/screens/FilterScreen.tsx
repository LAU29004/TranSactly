import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Switch,
  ScrollView,
  ActivityIndicator,
  Animated,
  Dimensions,
  LayoutAnimation,
  Platform,
  UIManager,
  Modal,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, DateData } from 'react-native-calendars';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import { FilterState } from '../types/Transaction';
import { parseSMSIntoTransactions } from '../services/readSms';
import { fetchInsights, fetchTransactions } from '../services/api/insightsApi';
import { downloadExcel } from '../services/api/exportApi';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import { Buffer } from 'buffer';
import { useNavigation } from '@react-navigation/native';
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Revolut palette (local, so no theme dependency for new tokens) ───────────
const R = {
  bg: '#0B0F17',
  bgSurface: '#141A23',
  bgElevated: '#1C2333',
  bgInput: '#0F1420',
  border: '#1E2535',
  borderSoft: '#161D2A',

  gold: '#D4AF37',
  goldBright: '#F0CE5A',
  goldDim: '#1A1608',
  goldBorder: '#2A2210',
  goldMuted: 'rgba(212,175,55,0.10)',
  goldText: '#F0CE5A',

  textPrimary: '#FFFFFF',
  textSecondary: '#9CA3AF',
  textTertiary: '#4B5563',
  textInverse: '#0B0F17',

  green: '#10B981',
  greenDim: '#071A12',
  greenBdr: '#0D3322',

  red: '#EF4444',
  redDim: '#1A0808',
  redBdr: '#3A1212',

  purple: '#8B5CF6',
  purpleDim: '#110E2A',

  amber: '#F59E0B',
  teal: '#14B8A6',
};

// ─── Types & constants ─────────────────────────────────────────────────────────
type QuickRange = 'THIS_MONTH' | 'SIX_MONTHS' | 'THIS_YEAR';
const QUICK_RANGES: QuickRange[] = ['THIS_MONTH', 'SIX_MONTHS', 'THIS_YEAR'];

const today = new Date();
const oneMonthAgo = new Date(
  today.getFullYear(),
  today.getMonth() - 1,
  today.getDate(),
);

const fmt = (d: Date) => d.toISOString().split('T')[0];
const fmtDisplay = (d: Date) =>
  d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

// ─── Scan modules ──────────────────────────────────────────────────────────────
type ScanModule = { id: string; icon: string; label: string; desc: string };

const SCAN_MODULES: ScanModule[] = [
  {
    id: 'upi',
    icon: 'bank-transfer',
    label: 'UPI Messages',
    desc: 'Debit & credit UPI alerts',
  },
  {
    id: 'atm',
    icon: 'atm',
    label: 'ATM Withdrawals',
    desc: 'Cash withdrawal transactions',
  },
  {
    id: 'salary',
    icon: 'briefcase-outline',
    label: 'Salary Credits',
    desc: 'Monthly salary & bonus credits',
  },
  {
    id: 'wallet',
    icon: 'wallet-outline',
    label: 'Wallet Payments',
    desc: 'Paytm, PhonePe, Amazon Pay',
  },
  {
    id: 'recharge',
    icon: 'cellphone-wireless',
    label: 'Recharge & Bills',
    desc: 'Mobile, DTH, electricity',
  },
  {
    id: 'shopping',
    icon: 'shopping-outline',
    label: 'Shopping',
    desc: 'E-commerce & retail spends',
  },
  {
    id: 'food',
    icon: 'food-fork-drink',
    label: 'Food Orders',
    desc: 'Swiggy, Zomato, restaurants',
  },
  {
    id: 'entertainment',
    icon: 'television-play',
    label: 'Entertainment',
    desc: 'OTT, games & events',
  },
];

// ─── Loading steps ─────────────────────────────────────────────────────────────
const LOADING_STEPS: { msg: string; sub: string }[] = [
  {
    msg: 'Scanning SMS messages…',
    sub: 'Finding transaction-related messages',
  },
  {
    msg: 'Processing transactions…',
    sub: 'Extracting merchants, amounts and dates',
  },
  {
    msg: 'Categorising spending…',
    sub: 'Grouping transactions into categories',
  },
  {
    msg: 'Generating insights…',
    sub: 'Calculating income, expenses and savings',
  },
  { msg: 'Preparing dashboard…', sub: 'Almost ready' },
];

// ─── Insight type ──────────────────────────────────────────────────────────────
type InsightData = {
  totalExpenses: number;
  totalIncome: number;
  totalSavings: number;
  transactionCount: number;
  savingsRate: number;
  categoryBreakdown: {
    category: string;
    amount: number;
    count: number;
    percent: number;
  }[];
  topMerchants: { merchant: string; amount: number; count: number }[];
};

// ─── Category colours ──────────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  Food: '#F97316',
  Shopping: '#8B5CF6',
  Entertainment: '#EC4899',
  Travel: '#3B82F6',
  Health: '#10B981',
  Utilities: '#F59E0B',
  'Home Improvement': '#1830b8',
  Income: '#10B981',
  Others: '#6B7280',
};

const handleVisitWebsite = async () => {
  const url = 'https://transactly.ai';

  const supported = await Linking.canOpenURL(url);

  if (supported) {
    await Linking.openURL(url);
  }
};

// ─── Calendar theme ────────────────────────────────────────────────────────────
const calendarTheme = {
  backgroundColor: R.bgSurface,
  calendarBackground: R.bgSurface,
  textSectionTitleColor: R.textTertiary,
  selectedDayBackgroundColor: R.gold,
  selectedDayTextColor: R.textInverse,
  todayTextColor: R.gold,
  dayTextColor: R.textPrimary,
  textDisabledColor: R.textTertiary,
  dotColor: R.gold,
  selectedDotColor: R.textInverse,
  arrowColor: R.gold,
  monthTextColor: R.textPrimary,
  indicatorColor: R.gold,
  textDayFontWeight: '400' as any,
  textMonthFontWeight: '600' as any,
  textDayHeaderFontWeight: '600' as any,
  textDayFontSize: 14,
  textMonthFontSize: 15,
  textDayHeaderFontSize: 11,
};

// ═══════════════════════════════════════════════════════════════════════════════
// AIWaveform
// ═══════════════════════════════════════════════════════════════════════════════
const AIWaveform: React.FC<{ active?: boolean }> = ({ active = false }) => {
  const bars = [0.4, 0.7, 1, 0.6, 0.9, 0.5, 0.8, 0.45, 0.75, 1, 0.6, 0.35];
  const anims = useRef(bars.map(h => new Animated.Value(h))).current;

  useEffect(() => {
    if (!active) {
      anims.forEach((a, i) => a.setValue(bars[i]));
      return;
    }
    const animations = anims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 60),
          Animated.timing(anim, {
            toValue: Math.random() * 0.6 + 0.4,
            duration: 280,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: bars[i],
            duration: 280,
            useNativeDriver: true,
          }),
        ]),
      ),
    );
    Animated.parallel(animations).start();
    return () => animations.forEach(a => a.stop());
  }, [active]);

  return (
    <View style={waveStyles.row}>
      {anims.map((anim, i) => (
        <Animated.View
          key={i}
          style={[
            waveStyles.bar,
            {
              transform: [{ scaleY: anim }],
              backgroundColor: active ? R.gold : R.border,
            },
          ]}
        />
      ))}
    </View>
  );
};

const waveStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 3, height: 32 },
  bar: { width: 3, height: 24, borderRadius: 2 },
});

// ═══════════════════════════════════════════════════════════════════════════════
// ScanModuleRow
// ═══════════════════════════════════════════════════════════════════════════════
const ScanModuleRow: React.FC<{
  module: ScanModule;
  enabled: boolean;
  onToggle: () => void;
  isLast: boolean;
}> = ({ module, enabled, onToggle, isLast }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.96,
        duration: 70,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onToggle();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.85}
        style={[smStyles.row, !isLast && smStyles.rowDivider]}
      >
        <View style={[smStyles.iconBox, enabled && smStyles.iconBoxActive]}>
          <MaterialCommunityIcons
            name={module.icon as any}
            size={17}
            color={enabled ? R.gold : R.textTertiary}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[smStyles.label, !enabled && smStyles.labelDim]}>
            {module.label}
          </Text>
          <Text style={smStyles.desc}>{module.desc}</Text>
        </View>
        <Switch
          value={enabled}
          onValueChange={onToggle}
          trackColor={{ false: R.border, true: R.gold + '80' }}
          thumbColor={enabled ? R.gold : R.textTertiary}
          ios_backgroundColor={R.border}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

const smStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
  },
  rowDivider: { borderBottomWidth: 0.5, borderBottomColor: R.border },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: R.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: R.border,
  },
  iconBoxActive: { backgroundColor: R.goldMuted, borderColor: R.goldBorder },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: R.textPrimary,
    marginBottom: 2,
  },
  labelDim: { color: R.textTertiary },
  desc: { fontSize: 10, color: R.textTertiary },
});

// ═══════════════════════════════════════════════════════════════════════════════
// AIPredictionCard
// ═══════════════════════════════════════════════════════════════════════════════

const aiStyles = StyleSheet.create({
  card: {
    backgroundColor: R.bgElevated,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: R.goldBorder,
    padding: 18,
    marginBottom: 12,
    gap: 14,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brainBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: R.goldMuted,
    borderWidth: 0.5,
    borderColor: R.goldBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSub: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: R.gold,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: R.textPrimary,
    marginTop: 2,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: R.green },
  liveLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: R.green,
    letterSpacing: 1,
  },
  quoteText: {
    fontSize: 11,
    color: R.textSecondary,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  statsGrid: { flexDirection: 'row', gap: 8 },
  statBox: {
    flex: 1,
    backgroundColor: R.bgSurface,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: R.border,
    padding: 10,
    alignItems: 'center',
    gap: 4,
  },
  statVal: { fontSize: 16, fontWeight: '700', color: R.gold },
  statLabel: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.7,
    color: R.textTertiary,
    textAlign: 'center',
  },
});

// ═══════════════════════════════════════════════════════════════════════════════
// PrivacyShieldCard
// ═══════════════════════════════════════════════════════════════════════════════
const PrivacyShieldCard: React.FC = () => (
  <View style={privStyles.card}>
    <View style={privStyles.headerRow}>
      <View style={privStyles.shieldIcon}>
        <MaterialCommunityIcons name="shield-check" size={15} color={R.green} />
      </View>
      <Text style={privStyles.headerLabel}>PRIVACY SHIELD ACTIVE</Text>
      <View style={privStyles.activePill}>
        <Text style={privStyles.activePillText}>SECURED</Text>
      </View>
    </View>
    {[
      {
        icon: 'cellphone-lock',
        text: 'SMS scanned on-device — never uploaded',
      },
      {
        icon: 'chat-remove-outline',
        text: 'Personal chats are never stored or read',
      },
      {
        icon: 'tag-check-outline',
        text: 'Only transaction entities are extracted',
      },
      { icon: 'lock-outline', text: 'AI processing fully encrypted locally' },
    ].map(item => (
      <View key={item.text} style={privStyles.row}>
        <View style={privStyles.iconCircle}>
          <MaterialCommunityIcons
            name={item.icon as any}
            size={13}
            color={R.green}
          />
        </View>
        <Text style={privStyles.rowText}>{item.text}</Text>
        <View style={privStyles.checkBox}>
          <Feather name="check" size={10} color={R.green} />
        </View>
      </View>
    ))}
  </View>
);

const privStyles = StyleSheet.create({
  card: {
    backgroundColor: R.bgSurface,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(16,185,129,0.22)',
    padding: 18,
    marginBottom: 20,
    gap: 12,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  shieldIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(16,185,129,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLabel: {
    flex: 1,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: R.green,
  },
  activePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    backgroundColor: 'rgba(16,185,129,0.10)',
    borderWidth: 0.5,
    borderColor: 'rgba(16,185,129,0.28)',
  },
  activePillText: {
    fontSize: 8,
    fontWeight: '700',
    color: R.green,
    letterSpacing: 1,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(16,185,129,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1, fontSize: 12, color: R.textSecondary, lineHeight: 17 },
  checkBox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(16,185,129,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// ═══════════════════════════════════════════════════════════════════════════════
// LoadingCard
// ═══════════════════════════════════════════════════════════════════════════════
const LoadingCard: React.FC<{
  stepIndex: number;
  pct: number;
  progressAnim: Animated.Value;
}> = ({ stepIndex, pct, progressAnim }) => {
  const step = LOADING_STEPS[stepIndex] ?? LOADING_STEPS[0];
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={ldStyles.card}>
      <View style={ldStyles.topRow}>
        <AIWaveform active />
        <View style={ldStyles.pctBlock}>
          <Text style={ldStyles.pctNum}>{pct}</Text>
          <Text style={ldStyles.pctSym}>%</Text>
        </View>
      </View>
      <View>
        <Text style={ldStyles.stepMsg}>{step.msg}</Text>
        <Text style={ldStyles.stepSub}>{step.sub}</Text>
      </View>
      <View style={ldStyles.track}>
        <Animated.View style={[ldStyles.fill, { width: progressWidth }]} />
      </View>
      <View style={ldStyles.dotsRow}>
        {LOADING_STEPS.map((_, i) => (
          <View
            key={i}
            style={[
              ldStyles.dot,
              i < stepIndex && ldStyles.dotDone,
              i === stepIndex && ldStyles.dotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const ldStyles = StyleSheet.create({
  card: {
    backgroundColor: R.bgSurface,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: R.goldBorder,
    padding: 18,
    marginBottom: 12,
    gap: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pctBlock: { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  pctNum: { fontSize: 36, fontWeight: '200', color: R.gold, lineHeight: 40 },
  pctSym: { fontSize: 14, fontWeight: '600', color: R.gold, marginBottom: 5 },
  stepMsg: {
    fontSize: 13,
    fontWeight: '600',
    color: R.textPrimary,
    marginBottom: 3,
  },
  stepSub: { fontSize: 10, color: R.textTertiary, fontStyle: 'italic' },
  track: {
    height: 2,
    backgroundColor: R.border,
    borderRadius: 1,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: R.gold, borderRadius: 1 },
  dotsRow: { flexDirection: 'row', gap: 6 },
  dot: { flex: 1, height: 3, borderRadius: 2, backgroundColor: R.border },
  dotDone: { backgroundColor: R.goldMuted },
  dotActive: { backgroundColor: R.gold },
});

// ═══════════════════════════════════════════════════════════════════════════════
// InsightsDashboard
// ═══════════════════════════════════════════════════════════════════════════════
const InsightsDashboard: React.FC<{ data: InsightData }> = ({ data }) => {
  const onlyTransfers =
    data.transactionCount > 0 && data.categoryBreakdown.length === 0;

  if (onlyTransfers || data.categoryBreakdown.length === 0) {
    return (
      <View style={inStyles.emptyState}>
        <View style={inStyles.emptyIcon}>
          <MaterialCommunityIcons
            name="database-remove-outline"
            size={28}
            color={R.textTertiary}
          />
        </View>
        <Text style={inStyles.emptyTitle}>
          {onlyTransfers
            ? 'No Spending Transactions Found'
            : 'No Transactions Found'}
        </Text>
        <Text style={inStyles.emptyText}>
          {onlyTransfers
            ? 'Only transfer transactions were detected in the selected period.'
            : 'No financial SMS were detected in the selected time range.'}
        </Text>
      </View>
    );
  }

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const categories = data.categoryBreakdown ?? [];
  const barAnims = useMemo(
    () => categories.map(() => new Animated.Value(0)),
    [categories.length],
  );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 550,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 550,
        useNativeDriver: true,
      }),
    ]).start();
    const barAnimations = barAnims.map(a =>
      Animated.timing(a, { toValue: 1, duration: 700, useNativeDriver: false }),
    );
    Animated.stagger(60, barAnimations).start();
  }, []);

  const maxCat = Math.max(
    ...(data.categoryBreakdown ?? []).map(c => c.amount),
    1,
  );

  const savingsColor =
    data.savingsRate >= 20 ? R.green : data.savingsRate >= 10 ? R.gold : R.red;

  return (
    <Animated.View
      style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
    >
      {/* ── Completion badge ── */}
      <View style={inStyles.completionBanner}>
        <View style={inStyles.completionLeft}>
          <View style={inStyles.completionIcon}>
            <MaterialCommunityIcons name="brain" size={13} color={R.gold} />
          </View>
          <View>
            <Text style={inStyles.completionLabel}>AI ANALYSIS COMPLETE</Text>
            <Text style={inStyles.completionSub}>
              {data.transactionCount} transactions processed
            </Text>
          </View>
        </View>
        <View style={inStyles.donePill}>
          <Feather name="check" size={10} color={R.green} />
          <Text style={inStyles.donePillText}>DONE</Text>
        </View>
      </View>

      {/* ── Income / Expenses / Savings trio ── */}
      <View style={inStyles.trioRow}>
        {[
          {
            label: 'INCOME',
            val: data.totalIncome,
            color: R.green,
            icon: 'trending-up',
            bg: R.greenDim,
            bdr: R.greenBdr,
          },
          {
            label: 'EXPENSES',
            val: data.totalExpenses,
            color: R.red,
            icon: 'trending-down',
            bg: R.redDim,
            bdr: R.redBdr,
          },
          {
            label: 'SAVINGS',
            val: data.totalSavings,
            color: R.gold,
            icon: 'piggy-bank-outline',
            bg: R.goldDim,
            bdr: R.goldBorder,
          },
        ].map(item => (
          <View
            key={item.label}
            style={[
              inStyles.trioCard,
              { borderColor: item.bdr, backgroundColor: item.bg },
            ]}
          >
            <View
              style={[
                inStyles.trioIcon,
                { backgroundColor: item.color + '18' },
              ]}
            >
              <MaterialCommunityIcons
                name={item.icon as any}
                size={14}
                color={item.color}
              />
            </View>
            <Text style={inStyles.trioLabel}>{item.label}</Text>
            <Text style={[inStyles.trioVal, { color: item.color }]}>
              ₹{Number(item.val ?? 0).toLocaleString('en-IN')}
            </Text>
          </View>
        ))}
      </View>

      {/* ── Savings rate ── */}
      <View style={inStyles.card}>
        <View style={inStyles.cardHeaderRow}>
          <Feather name="bar-chart-2" size={12} color={R.textTertiary} />
          <Text style={inStyles.cardLabel}>SAVINGS RATE</Text>
          <Text style={[inStyles.savingsRateVal, { color: savingsColor }]}>
            {data.savingsRate.toFixed(1)}%
          </Text>
        </View>
        <View style={inStyles.rateTrack}>
          <View
            style={[
              inStyles.rateFill,
              {
                width: `${Math.min(data.savingsRate, 100)}%` as any,
                backgroundColor: savingsColor,
              },
            ]}
          />
        </View>
        <View
          style={[
            inStyles.rateHintRow,
            {
              borderColor: savingsColor + '20',
              backgroundColor: savingsColor + '0A',
            },
          ]}
        >
          <MaterialCommunityIcons
            name={
              data.savingsRate >= 20 ? 'check-circle-outline' : 'alert-outline'
            }
            size={12}
            color={savingsColor}
          />
          <Text style={[inStyles.rateHint, { color: savingsColor }]}>
            {data.savingsRate >= 20
              ? "Excellent! You're saving more than 20% of income."
              : data.savingsRate >= 10
              ? 'Moderate savings. Aim for 20%+ for financial health.'
              : 'Low savings rate. Review your discretionary spending.'}
          </Text>
        </View>
      </View>

      {/* ── Category breakdown ── */}
      <View style={inStyles.card}>
        <View style={inStyles.cardHeaderRow}>
          <MaterialCommunityIcons
            name="chart-donut"
            size={12}
            color={R.textTertiary}
          />
          <Text style={inStyles.cardLabel}>SPENDING BY CATEGORY</Text>
        </View>
        {(data.categoryBreakdown ?? []).map((cat, i) => {
          const barW =
            barAnims[i]?.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', `${(cat.amount / maxCat) * 100}%`],
            }) ?? '0%';
          const color = CATEGORY_COLORS[cat.category] ?? '#6B7280';
          return (
            <View key={cat.category} style={inStyles.catRow}>
              <View style={[inStyles.catDot, { backgroundColor: color }]} />
              <Text style={inStyles.catName}>{cat.category}</Text>
              <View style={inStyles.catBarWrap}>
                <Animated.View
                  style={[
                    inStyles.catBar,
                    { width: barW, backgroundColor: color },
                  ]}
                />
              </View>
              <Text style={inStyles.catAmt}>
                ₹{Number(cat.amount ?? 0).toLocaleString('en-IN')}
              </Text>
              <Text style={inStyles.catPct}>{cat.percent}%</Text>
            </View>
          );
        })}
      </View>

      {/* ── Top merchants ── */}
      <View style={inStyles.card}>
        <View style={inStyles.cardHeaderRow}>
          <MaterialCommunityIcons
            name="store-outline"
            size={12}
            color={R.textTertiary}
          />
          <Text style={inStyles.cardLabel}>TOP MERCHANTS</Text>
        </View>
        {(data.topMerchants ?? []).map((m, i) => (
          <View
            key={m.merchant}
            style={[
              inStyles.merchantRow,
              i < (data.topMerchants?.length ?? 0) - 1 &&
                inStyles.merchantDivider,
            ]}
          >
            <View
              style={[
                inStyles.merchantRank,
                i === 0 && {
                  backgroundColor: R.goldMuted,
                  borderColor: R.goldBorder,
                },
              ]}
            >
              <Text
                style={[
                  inStyles.merchantRankText,
                  i === 0 && { color: R.gold },
                ]}
              >
                {i + 1}
              </Text>
            </View>
            <Text style={inStyles.merchantName}>{m.merchant}</Text>
            {m.count && (
              <Text style={inStyles.merchantCount}>{m.count} txns</Text>
            )}
            <Text style={inStyles.merchantAmt}>
              ₹{Number(m.amount ?? 0).toLocaleString('en-IN')}
            </Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
};

const inStyles = StyleSheet.create({
  emptyState: {
    backgroundColor: R.bgSurface,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: R.border,
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: R.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    color: R.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyText: {
    color: R.textTertiary,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  completionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: R.bgSurface,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: R.goldBorder,
    padding: 14,
    marginBottom: 12,
  },
  completionLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  completionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: R.goldMuted,
    borderWidth: 0.5,
    borderColor: R.goldBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: R.gold,
  },
  completionSub: { fontSize: 10, color: R.textTertiary, marginTop: 2 },
  donePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(16,185,129,0.10)',
    borderWidth: 0.5,
    borderColor: 'rgba(16,185,129,0.28)',
  },
  donePillText: {
    fontSize: 9,
    fontWeight: '700',
    color: R.green,
    letterSpacing: 0.8,
  },
  trioRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  trioCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 0.5,
    padding: 12,
    alignItems: 'center',
    gap: 6,
  },
  trioIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trioLabel: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: R.textTertiary,
  },
  trioVal: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  card: {
    backgroundColor: R.bgSurface,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: R.border,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardLabel: {
    flex: 1,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: R.textTertiary,
  },
  savingsRateVal: { fontSize: 18, fontWeight: '700' },
  rateTrack: {
    height: 4,
    backgroundColor: R.bgElevated,
    borderRadius: 2,
    overflow: 'hidden',
  },
  rateFill: { height: '100%', borderRadius: 2 },
  rateHintRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
    borderWidth: 0.5,
    borderRadius: 10,
    padding: 10,
    marginTop: -2,
  },
  rateHint: { flex: 1, fontSize: 11, lineHeight: 17 },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catDot: { width: 7, height: 7, borderRadius: 4 },
  catName: { fontSize: 11, color: R.textPrimary, width: 82 },
  catBarWrap: {
    flex: 1,
    height: 4,
    backgroundColor: R.bgElevated,
    borderRadius: 2,
    overflow: 'hidden',
  },
  catBar: { height: '100%', borderRadius: 2, opacity: 0.85 },
  catAmt: {
    fontSize: 11,
    fontWeight: '600',
    color: R.textPrimary,
    width: 64,
    textAlign: 'right',
  },
  catPct: {
    fontSize: 10,
    color: R.textTertiary,
    width: 32,
    textAlign: 'right',
  },
  merchantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 7,
  },
  merchantDivider: { borderBottomWidth: 0.5, borderBottomColor: R.border },
  merchantRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: R.bgElevated,
    borderWidth: 0.5,
    borderColor: R.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  merchantRankText: { fontSize: 10, fontWeight: '700', color: R.textSecondary },
  merchantName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: R.textPrimary,
  },
  merchantCount: { fontSize: 10, color: R.textTertiary },
  merchantAmt: { fontSize: 13, fontWeight: '700', color: R.textPrimary },
});

// ═══════════════════════════════════════════════════════════════════════════════
// DateRangeModal
// ═══════════════════════════════════════════════════════════════════════════════
const DateRangeModal: React.FC<{
  visible: boolean;
  startDate: Date;
  endDate: Date;
  onConfirm: (start: Date, end: Date) => void;
  onClose: () => void;
  currentDate: string;
  setCurrentDate: (date: string) => void;
}> = ({ visible, startDate, endDate, onConfirm, onClose, currentDate, setCurrentDate }) => {
  const [selecting, setSelecting] = useState<'start' | 'end'>('start');
  const [tempStart, setTempStart] = useState(fmt(startDate));
  const [tempEnd, setTempEnd] = useState(fmt(endDate));
  
  // State to toggle the scroll selector view
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (visible) {
      setTempStart(fmt(startDate));
      setTempEnd(fmt(endDate));
      setSelecting('start');
      setShowPicker(false);
    }
  }, [visible]);

  // Generate dynamic array of years (e.g. 15 years back)
  const years = useMemo(() => {
    const currentYr = today.getFullYear();
    return Array.from({ length: 16 }, (_, i) => currentYr - i);
  }, []);

  const months = [
    { label: 'Jan', val: 1 }, { label: 'Feb', val: 2 }, { label: 'Mar', val: 3 },
    { label: 'Apr', val: 4 }, { label: 'May', val: 5 }, { label: 'Jun', val: 6 },
    { label: 'Jul', val: 7 }, { label: 'Aug', val: 8 }, { label: 'Sep', val: 9 },
    { label: 'Oct', val: 10 }, { label: 'Nov', val: 11 }, { label: 'Dec', val: 12 }
  ];

  const currentParsedDate = new Date(currentDate);
  const selectedYear = currentParsedDate.getFullYear();
  const selectedMonth = currentParsedDate.getMonth() + 1;

  const handleMonthYearSelect = (year: number, month: number) => {
    const monthStr = String(month).padStart(2, '0');
    setCurrentDate(`${year}-${monthStr}-01`);
    setShowPicker(false);
  };

  const buildMarked = () => {
    const marked: Record<string, any> = {};
    if (!tempStart) return marked;
    marked[tempStart] = {
      startingDay: true,
      color: R.gold,
      textColor: R.textInverse,
    };
    if (tempEnd && tempEnd !== tempStart) {
      marked[tempEnd] = {
        endingDay: true,
        color: R.gold,
        textColor: R.textInverse,
      };
      const cur = new Date(tempStart);
      cur.setDate(cur.getDate() + 1);
      const end = new Date(tempEnd);
      while (cur < end) {
        marked[fmt(cur)] = { color: R.goldMuted, textColor: R.gold };
        cur.setDate(cur.getDate() + 1);
      }
    }
    return marked;
  };

  const handleDayPress = (day: DateData) => {
    if (selecting === 'start') {
      setTempStart(day.dateString);
      if (tempEnd && day.dateString > tempEnd) setTempEnd('');
      setSelecting('end');
    } else {
      if (day.dateString < tempStart) {
        setTempStart(day.dateString);
        setSelecting('end');
      } else {
        setTempEnd(day.dateString);
        setSelecting('start');
      }
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.sheet}>
          <View style={modalStyles.handle} />

          <View style={modalStyles.header}>
            <View>
              <Text style={modalStyles.headerSub}>CUSTOM INTERVAL</Text>
              <Text style={modalStyles.headerTitle}>Select Date Range</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={modalStyles.closeBtn}>
              <Ionicons name="close" size={17} color={R.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={modalStyles.selectorRow}>
            {(['start', 'end'] as const).map(type => (
              <TouchableOpacity
                key={type}
                onPress={() => {
                  setSelecting(type);
                  setShowPicker(false);
                }}
                style={[
                  modalStyles.selectorTab,
                  selecting === type && !showPicker && modalStyles.selectorTabActive,
                ]}
              >
                <Feather
                  name="calendar"
                  size={12}
                  color={selecting === type && !showPicker ? R.gold : R.textTertiary}
                />
                <View>
                  <Text style={modalStyles.selectorTabLabel}>
                    {type === 'start' ? 'FROM' : 'TO'}
                  </Text>
                  <Text
                    style={[
                      modalStyles.selectorTabDate,
                      selecting === type && !showPicker && { color: R.gold },
                    ]}
                  >
                    {type === 'start'
                      ? tempStart ? fmtDisplay(new Date(tempStart)) : 'Select start'
                      : tempEnd ? fmtDisplay(new Date(tempEnd)) : 'Select end'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={modalStyles.selectingHint}>
            {showPicker 
              ? '⬤  Select month and year'
              : selecting === 'start'
                ? '⬤  Tap a start date'
                : '⬤  Now tap an end date'}
          </Text>

          <View style={modalStyles.calendarContainer}>
            <Calendar
              key={currentDate}
              current={currentDate}
              theme={calendarTheme}
              markingType="period"
              markedDates={buildMarked()}
              onDayPress={handleDayPress}
              maxDate={fmt(today)}
              enableSwipeMonths
              style={modalStyles.calendar}
              renderHeader={(date) => (
                <TouchableOpacity 
                  onPress={() => setShowPicker(!showPicker)} 
                  style={[modalStyles.customHeaderTouch, showPicker && { borderColor: R.gold }]}
                >
                  <Text style={modalStyles.customHeaderTxt}>
                    {date.toString('MMMM')} {date.getFullYear()}
                  </Text>
                  <MaterialCommunityIcons 
                    name={showPicker ? "chevron-up" : "menu-down"} 
                    size={18} 
                    color={R.gold} 
                  />
                </TouchableOpacity>
              )}
            />

            {/* ─── SCROLLABLE YEAR & MONTH OVERLAY PICKER ─── */}
            {showPicker && (
              <View style={modalStyles.pickerOverlay}>
                {/* Year Horizontal Scroller */}
                <View style={modalStyles.yearStrip}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 10 }}>
                    {years.map(yr => (
                      <TouchableOpacity
                        key={yr}
                        onPress={() => handleMonthYearSelect(yr, selectedMonth)}
                        style={[modalStyles.yearPill, selectedYear === yr && modalStyles.yearPillActive]}
                      >
                        <Text style={[modalStyles.yearPillText, selectedYear === yr && modalStyles.yearPillTextActive]}>
                          {yr}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Month Grid Scroller */}
                <ScrollView contentContainerStyle={modalStyles.monthGrid}>
                  {months.map(m => (
                    <TouchableOpacity
                      key={m.val}
                      onPress={() => handleMonthYearSelect(selectedYear, m.val)}
                      style={[
                        modalStyles.monthCell, 
                        selectedMonth === m.val && modalStyles.monthCellActive
                      ]}
                    >
                      <Text style={[modalStyles.monthCellText, selectedMonth === m.val && modalStyles.monthCellTextActive]}>
                        {m.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[
              modalStyles.confirmBtn,
              (!tempStart || !tempEnd) && modalStyles.confirmBtnDisabled,
            ]}
            onPress={() => {
              onConfirm(new Date(tempStart), new Date(tempEnd));
              onClose();
            }}
            disabled={!tempStart || !tempEnd}
            activeOpacity={0.85}
          >
            <Feather name="check" size={15} color={R.textInverse} />
            <Text style={modalStyles.confirmBtnText}>APPLY RANGE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.78)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: R.bgSurface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 36,
  },
  handle: {
    width: 36,
    height: 3,
    borderRadius: 2,
    backgroundColor: R.border,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerSub: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: R.gold,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '300',
    color: R.textPrimary,
    marginTop: 3,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: R.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: R.border,
  },
  selectorRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 8,
    gap: 10,
  },
  selectorTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: R.bgElevated,
    borderRadius: 12,
    padding: 12,
    borderWidth: 0.5,
    borderColor: R.border,
  },
  selectorTabActive: {
    borderColor: R.goldBorder,
    backgroundColor: R.goldMuted,
  },
  selectorTabLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: R.textTertiary,
  },
  selectorTabDate: {
    fontSize: 12,
    fontWeight: '500',
    color: R.textPrimary,
    marginTop: 2,
  },
  selectingHint: {
    fontSize: 10,
    color: R.gold,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginHorizontal: 20,
    marginBottom: 8,
  },
  calendar: { borderRadius: 12, marginHorizontal: 12 },
  confirmBtn: {
    marginHorizontal: 20,
    marginTop: 16,
    height: 54,
    borderRadius: 27,
    backgroundColor: R.gold,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  confirmBtnDisabled: { opacity: 0.35 },
  confirmBtnText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
    color: R.textInverse,
  },
  customHeaderTouch: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: R.bgElevated,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: R.border,
  },
  customHeaderTxt: {
    fontSize: 14,
    fontWeight: '600',
    color: R.textPrimary,
    marginRight: 2,
  },
  calendarContainer: {
    position: 'relative',
    marginHorizontal: 12,
    minHeight: 330,
  },
  pickerOverlay: {
    position: 'absolute',
    top: 50, // aligns perfectly below calendar header
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: R.bgSurface,
    zIndex: 10,
    paddingTop: 10,
  },
  yearStrip: {
    height: 46,
    borderBottomWidth: 0.5,
    borderBottomColor: R.border,
    paddingBottom: 10,
  },
  yearPill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: R.bgElevated,
    marginRight: 8,
    borderWidth: 0.5,
    borderColor: R.border,
    justifyContent: 'center',
  },
  yearPillActive: {
    backgroundColor: R.goldMuted,
    borderColor: R.gold,
  },
  yearPillText: {
    color: R.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  yearPillTextActive: {
    color: R.gold,
    fontWeight: '700',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    gap: 8,
    justifyContent: 'space-between',
  },
  monthCell: {
    width: '31%',
    height: 48,
    backgroundColor: R.bgElevated,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: R.border,
    marginBottom: 4,
  },
  monthCellActive: {
    backgroundColor: R.gold,
    borderColor: R.gold,
  },
  monthCellText: {
    color: R.textPrimary,
    fontSize: 13,
    fontWeight: '500',
  },
  monthCellTextActive: {
    color: R.textInverse,
    fontWeight: '700',
  },
});

// ═══════════════════════════════════════════════════════════════════════════════
// FilterScreen — main
// ═══════════════════════════════════════════════════════════════════════════════
const FilterScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [filter, setFilter] = useState<FilterState>({
    range: 'THIS_MONTH',
    startDate: oneMonthAgo,
    endDate: today,
    onlyTransactionMessages: true,
  });

  const [modulesEnabled, setModulesEnabled] = useState<Record<string, boolean>>(
    Object.fromEntries(SCAN_MODULES.map(m => [m.id, true])),
  );

  const [loading, setLoading] = useState(false);
  const [loadStep, setLoadStep] = useState(0);
  const [loadingPct, setLoadingPct] = useState(0);
  const [insights, setInsights] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [calVisible, setCalVisible] = useState(false);
  const [modulesExpanded, setModulesExpanded] = useState(false);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(1)).current;
  const calendarRef = useRef<any>(null);
  const [currentDate, setCurrentDate] = useState(fmt(new Date()));
  const handleExportExcel = async () => {
    try {
      const data = await downloadExcel(filter.startDate, filter.endDate);
      const start = filter.startDate.toISOString().split('T')[0];
      const end = filter.endDate.toISOString().split('T')[0];
      const filePath = `${RNFS.DocumentDirectoryPath}/centfluence_${start}_${end}.xlsx`;
      const base64 = Buffer.from(data).toString('base64');
      await RNFS.writeFile(filePath, base64, 'base64');
      Alert.alert('Success', 'Excel exported successfully');
      await FileViewer.open(filePath);
    } catch (error) {
      console.error('EXPORT ERROR', error);
      Alert.alert('Export Failed', 'Unable to export Excel file');
    }
  };

  const handleRangeSelect = (range: QuickRange) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const end = new Date();
    const start = new Date();
    if (range === 'THIS_MONTH') start.setMonth(end.getMonth() - 1);
    else if (range === 'SIX_MONTHS') start.setMonth(end.getMonth() - 6);
    else if (range === 'THIS_YEAR') start.setFullYear(end.getFullYear() - 1);
    setFilter(prev => ({ ...prev, range, startDate: start, endDate: end }));
    setInsights(null);
  };

  const handleFetch = async () => {
    Animated.sequence([
      Animated.timing(btnScale, {
        toValue: 0.95,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(btnScale, {
        toValue: 1,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start();

    setLoading(true);
    setInsights(null);
    progressAnim.setValue(0);
    setLoadStep(0);
    setLoadingPct(0);

    for (let i = 0; i < LOADING_STEPS.length; i++) {
      setLoadStep(i);
      const pct = Math.round(((i + 1) / LOADING_STEPS.length) * 100);
      setLoadingPct(pct);
      Animated.timing(progressAnim, {
        toValue: pct / 100,
        duration: 420,
        useNativeDriver: false,
      }).start();
      await new Promise<void>(r => setTimeout(r, 640));
    }

    await parseSMSIntoTransactions(filter.startDate, filter.endDate);
    try {
      const insightsResponse = await fetchInsights(
        filter.startDate,
        filter.endDate,
      );
      const transactionsResponse = await fetchTransactions(
        filter.startDate,
        filter.endDate,
      );
      setInsights(insightsResponse);
      setTransactions(transactionsResponse.transactions ?? []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFilter({
      range: 'THIS_MONTH',
      startDate: oneMonthAgo,
      endDate: today,
      onlyTransactionMessages: false,
    });
    setModulesEnabled(Object.fromEntries(SCAN_MODULES.map(m => [m.id, true])));
    setInsights(null);
  };

  const enabledCount = Object.values(modulesEnabled).filter(Boolean).length;

  const RANGE_LABELS: Record<QuickRange, string> = {
    THIS_MONTH: 'This Month',
    SIX_MONTHS: '6 Months',
    THIS_YEAR: 'This Year',
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={R.bg} />

      <DateRangeModal
        visible={calVisible}
        startDate={filter.startDate}
        endDate={filter.endDate}
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        onConfirm={(s, e) => {
          setFilter(prev => ({
            ...prev,
            range: 'CUSTOM' as any,
            startDate: s,
            endDate: e,
          }));
          setInsights(null);
        }}
        onClose={() => setCalVisible(false)}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Top bar ── */}
        <View style={styles.topBar}>
          <View style={styles.topLeft}>
            <View style={styles.avatar}>
              <MaterialCommunityIcons
                name="shimmer"
                size={16}
                color={R.textInverse}
              />
            </View>
            <View>
              <Text style={styles.brandName}>centfluence</Text>
              <Text style={styles.brandTagline}>SMS INTELLIGENCE ENGINE</Text>
            </View>
          </View>
          <View style={styles.topRight}>
            <View style={styles.secBadge}>
              <Animated.View style={[styles.secDot]} />
              <Text style={styles.secLabel}>SECURED</Text>
            </View>
          </View>
        </View>

        {/* ── Title block ── */}
        <View style={styles.titleBlock}>
          <View style={styles.titleRow}>
            <AIWaveform active={loading} />
            <View style={{ flex: 1 }}>
              <Text style={styles.titleSub}>FINANCIAL SIGNAL SCANNER</Text>
              <Text style={styles.title}>Configure Analysis</Text>
            </View>
          </View>
          <Text style={styles.titleDesc}>
            Configure intelligent SMS-based financial analysis parameters
          </Text>
        </View>

        {/* ── Quick Range ── */}
        <View style={styles.card}>
          <View style={styles.cardLabelRow}>
            <Feather name="clock" size={11} color={R.textTertiary} />
            <Text style={styles.cardLabel}>QUICK RANGE</Text>
          </View>
          <View style={styles.rangeGrid}>
            {QUICK_RANGES.map(r => (
              <TouchableOpacity
                key={r}
                onPress={() => handleRangeSelect(r)}
                style={[
                  styles.rangeBtn,
                  filter.range === r && styles.rangeBtnActive,
                ]}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.rangeBtnText,
                    filter.range === r && styles.rangeBtnTextActive,
                  ]}
                >
                  {RANGE_LABELS[r]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Custom Date Range trigger ── */}
        <TouchableOpacity
          style={[
            styles.card,
            styles.calendarTrigger,
            (filter.range as string) === 'CUSTOM' &&
              styles.calendarTriggerActive,
          ]}
          onPress={() => setCalVisible(true)}
          activeOpacity={0.8}
        >
          <View style={styles.calendarTriggerLeft}>
            <View
              style={[
                styles.calendarIconBox,
                (filter.range as string) === 'CUSTOM' &&
                  styles.calendarIconBoxActive,
              ]}
            >
              <Feather
                name="calendar"
                size={15}
                color={
                  (filter.range as string) === 'CUSTOM'
                    ? R.gold
                    : R.textSecondary
                }
              />
            </View>
            <View>
              <Text style={styles.cardLabel}>CUSTOM DATE RANGE</Text>
              {(filter.range as string) === 'CUSTOM' ? (
                <Text style={styles.calendarRangeText}>
                  {fmtDisplay(filter.startDate)} → {fmtDisplay(filter.endDate)}
                </Text>
              ) : (
                <Text style={styles.calendarPlaceholder}>
                  Tap to open calendar picker
                </Text>
              )}
            </View>
          </View>
          <Feather name="chevron-right" size={15} color={R.textTertiary} />
        </TouchableOpacity>

        {/* ── Scan Modules (collapsible) ── */}
        {/* <View style={styles.card}>
          <TouchableOpacity
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setModulesExpanded(v => !v);
            }}
            style={styles.modulesHeader}
            activeOpacity={0.8}
          >
            <Feather name="sliders" size={11} color={R.textTertiary} />
            <Text style={[styles.cardLabel, { flex: 1 }]}>SCAN MODULES</Text>
            <View style={styles.moduleCountPill}>
              <Text style={styles.moduleCountText}>{enabledCount}/{SCAN_MODULES.length} ON</Text>
            </View>
            <Feather name={modulesExpanded ? 'chevron-up' : 'chevron-down'} size={14} color={R.textTertiary} style={{ marginLeft: 6 }} />
          </TouchableOpacity>
          {modulesExpanded && SCAN_MODULES.map((m, i) => (
            <ScanModuleRow
              key={m.id}
              module={m}
              enabled={!!modulesEnabled[m.id]}
              onToggle={() => setModulesEnabled(prev => ({ ...prev, [m.id]: !prev[m.id] }))}
              isLast={i === SCAN_MODULES.length - 1}
            />
          ))}
        </View> */}

        {/* ── AI Prediction preview ── */}
        {/* ── Privacy & Security ── */}
        <PrivacyShieldCard />

        {/* ── Loading experience ── */}
        {loading && (
          <LoadingCard
            stepIndex={loadStep}
            pct={loadingPct}
            progressAnim={progressAnim}
          />
        )}

        {/* ── Post-analysis insights dashboard ── */}
        {insights && (
          <>
            <InsightsDashboard data={insights} />

            {/* Recent Transactions */}
            <View style={inStyles.card}>
              <View style={inStyles.cardHeaderRow}>
                <MaterialCommunityIcons
                  name="receipt"
                  size={12}
                  color={R.textTertiary}
                />
                <Text style={inStyles.cardLabel}>REcent TRANSACTIONS</Text>
                <Text style={styles.txCountPill}>
                  {(transactions ?? []).length} total
                </Text>
              </View>
              {(transactions ?? []).slice(0, 10).map((tx, i) => (
                <View
                  key={tx.id ?? i}
                  style={[
                    inStyles.merchantRow,
                    i < Math.min(transactions.length, 10) - 1 &&
                      inStyles.merchantDivider,
                  ]}
                >
                  <View style={styles.txIconWrap}>
                    <MaterialCommunityIcons
                      name="swap-horizontal"
                      size={12}
                      color={R.textTertiary}
                    />
                  </View>
                  <Text style={inStyles.merchantName}>{tx.merchant}</Text>
                  <Text
                    style={[
                      inStyles.merchantAmt,
                      { color: tx.type === 'credit' ? R.green : R.textPrimary },
                    ]}
                  >
                    ₹{tx.amount}
                  </Text>
                </View>
              ))}
            </View>

            {/* Export & AI buttons */}
            <TouchableOpacity
              style={styles.exportBtn}
              activeOpacity={0.85}
              onPress={handleExportExcel}
            >
              <MaterialCommunityIcons
                name="file-excel-outline"
                size={17}
                color="#fff"
              />
              <Text style={styles.exportBtnText}>EXPORT TO EXCEL</Text>
            </TouchableOpacity>
            <Text style={styles.websiteSubtext}>
              Detailed AI insights and advanced analytics
            </Text>
            <TouchableOpacity
              style={styles.websiteButton}
              onPress={handleVisitWebsite}
            >
              <MaterialCommunityIcons name="web" size={20} color="#D4AF37" />
              <Text style={styles.websiteButtonText}>Advanced Analytics</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.aiAssistantBtn}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Chat')}
            >
              <MaterialCommunityIcons
                name="robot-outline"
                size={17}
                color={R.textInverse}
              />
              <Text style={styles.aiAssistantText}>
                ASK AI ABOUT YOUR SPENDING
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* ── CTA ── */}
        <Animated.View style={{ transform: [{ scale: btnScale }] }}>
          <TouchableOpacity
            style={[styles.fetchBtn, loading && styles.fetchBtnLoading]}
            onPress={handleFetch}
            activeOpacity={0.88}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.fetchBtnInner}>
                <ActivityIndicator color={R.gold} size="small" />
                <Text style={[styles.fetchBtnText, { color: R.gold }]}>
                  ANALYSING…
                </Text>
              </View>
            ) : (
              <View style={styles.fetchBtnInner}>
                <MaterialCommunityIcons
                  name="brain"
                  size={18}
                  color={R.textInverse}
                />
                <Text style={styles.fetchBtnText}>RUN AI ANALYSIS</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity
          onPress={handleClear}
          activeOpacity={0.7}
          style={styles.clearBtn}
        >
          <Feather name="refresh-ccw" size={11} color={R.textTertiary} />
          <Text style={styles.clearText}>RESET ALL FILTERS</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Main styles ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: R.bg },
  scroll: { paddingHorizontal: 18, paddingBottom: 48 },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  topLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: R.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: { fontSize: 14, fontWeight: '700', color: R.textPrimary },
  brandTagline: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1,
    color: R.textTertiary,
    marginTop: 1,
  },
  secBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(16,185,129,0.08)',
    borderWidth: 0.5,
    borderColor: 'rgba(16,185,129,0.22)',
  },
  secDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: R.green },
  secLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: R.green,
    letterSpacing: 0.8,
  },

  titleBlock: { marginBottom: 20, gap: 8 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  titleSub: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: R.gold,
  },
  title: {
    fontSize: 26,
    fontWeight: '300',
    color: R.textPrimary,
    letterSpacing: -0.3,
    marginTop: 2,
  },
  titleDesc: { fontSize: 12, color: R.textSecondary, lineHeight: 18 },

  card: {
    backgroundColor: R.bgSurface,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: R.border,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: R.textTertiary,
  },
  cardLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },

  rangeGrid: { flexDirection: 'row', gap: 8 },
  rangeBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: R.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: R.border,
  },
  rangeBtnActive: { backgroundColor: R.goldMuted, borderColor: R.gold },
  rangeBtnText: {
    fontSize: 11,
    fontWeight: '500',
    color: R.textTertiary,
    letterSpacing: 0.3,
  },
  rangeBtnTextActive: { color: R.gold, fontWeight: '700' },

  calendarTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0,
  },
  calendarTriggerActive: { borderColor: R.goldBorder },
  calendarTriggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  calendarIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: R.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: R.border,
  },
  calendarIconBoxActive: {
    backgroundColor: R.goldMuted,
    borderColor: R.goldBorder,
  },
  calendarRangeText: {
    fontSize: 12,
    fontWeight: '500',
    color: R.gold,
    marginTop: 3,
  },
  calendarPlaceholder: { fontSize: 11, color: R.textTertiary, marginTop: 3 },

  modulesHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  moduleCountPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    backgroundColor: R.goldMuted,
    borderWidth: 0.5,
    borderColor: R.goldBorder,
  },
  moduleCountText: {
    fontSize: 8,
    fontWeight: '700',
    color: R.gold,
    letterSpacing: 0.6,
  },

  fetchBtn: {
    height: 58,
    borderRadius: 29,
    backgroundColor: R.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: R.gold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 7,
  },
  fetchBtnLoading: {
    backgroundColor: R.bgSurface,
    borderWidth: 0.5,
    borderColor: R.goldBorder,
    shadowOpacity: 0,
  },
  fetchBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  fetchBtnText: {
    fontSize: 13,
    letterSpacing: 2.5,
    color: R.textInverse,
    fontWeight: '800',
  },

  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  clearText: {
    fontSize: 10,
    fontWeight: '600',
    color: R.textTertiary,
    letterSpacing: 1.2,
  },

  exportBtn: {
    height: 54,
    borderRadius: 27,
    backgroundColor: '#1A6B40',
    borderWidth: 0.5,
    borderColor: '#2A9A5C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 10,
  },
  exportBtnText: {
    color: '#ECFDF5',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },

  aiAssistantBtn: {
    height: 54,
    borderRadius: 27,
    backgroundColor: R.gold,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  aiAssistantText: {
    color: R.textInverse,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
  },

  txCountPill: { fontSize: 9, color: R.textTertiary, fontWeight: '600' },
  txIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: R.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  websiteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 16,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#141A23',
    borderWidth: 1,
    borderColor: '#D4AF3730',
  },

  websiteButtonText: {
    color: '#D4AF37',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 10,
  },

  websiteSubtext: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  
});

export default FilterScreen;
