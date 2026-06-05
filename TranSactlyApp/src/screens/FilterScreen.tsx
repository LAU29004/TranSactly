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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, DateData } from 'react-native-calendars';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import { Colors, Space, Radius, Font } from '../theme';
import { FilterState } from '../types/Transaction';
import { useTransactions } from '../context/TransactionContext';
import { parseSMSIntoTransactions } from '../services/readSms';
import { fetchInsights, fetchTransactions } from '../services/api/insightsApi';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Types & constants ────────────────────────────────────────────────────────

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

// ─── Scan modules ─────────────────────────────────────────────────────────────

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

// ─── Loading steps ────────────────────────────────────────────────────────────

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
  {
    msg: 'Preparing dashboard…',
    sub: 'Almost ready',
  },
];

// ─── Insight type ─────────────────────────────────────────────────────────────

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

// ─── Category colours ─────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  Food: '#F97316',
  Shopping: '#8B5CF6',
  Entertainment: '#EC4899',
  Travel: '#3B82F6',
  Health: '#10B981',
  Utilities: '#F59E0B',
  Income: '#3DCB7F',
  Others: '#6B7280',
};

// ─── Calendar theme ───────────────────────────────────────────────────────────

const calendarTheme = {
  backgroundColor: Colors.bgCard,
  calendarBackground: Colors.bgCard,
  textSectionTitleColor: Colors.textMuted,
  selectedDayBackgroundColor: Colors.gold,
  selectedDayTextColor: Colors.textInverse,
  todayTextColor: Colors.gold,
  dayTextColor: Colors.textPrimary,
  textDisabledColor: Colors.textMuted,
  dotColor: Colors.gold,
  selectedDotColor: Colors.textInverse,
  arrowColor: Colors.gold,
  monthTextColor: Colors.textPrimary,
  indicatorColor: Colors.gold,
  textDayFontWeight: '400' as any,
  textMonthFontWeight: '600' as any,
  textDayHeaderFontWeight: '600' as any,
  textDayFontSize: 14,
  textMonthFontSize: 15,
  textDayHeaderFontSize: 11,
};

// ─── AIWaveform ───────────────────────────────────────────────────────────────

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
              backgroundColor: active ? Colors.gold : Colors.border,
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

// ─── ScanModuleRow ────────────────────────────────────────────────────────────

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
            size={18}
            color={enabled ? Colors.gold : Colors.textMuted}
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
          trackColor={{ false: Colors.border, true: Colors.gold }}
          thumbColor={Colors.bg}
          ios_backgroundColor={Colors.border}
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
    paddingVertical: 12,
  },
  rowDivider: { borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  iconBoxActive: {
    backgroundColor: Colors.goldMuted,
    borderColor: Colors.goldBorder,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  labelDim: { color: Colors.textMuted },
  desc: { fontSize: 10, color: Colors.textMuted },
});

// ─── AIPredictionCard ─────────────────────────────────────────────────────────

const AIPredictionCard: React.FC<{ enabledCount: number }> = ({
  enabledCount,
}) => {
  const pulse = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.5,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const messages = Math.round(enabledCount * 23);
  const entities = Math.round(enabledCount * 10.5);
  const merchants = Math.round(enabledCount * 1.4);
  const unusual = Math.max(1, Math.round(enabledCount * 0.38));

  return (
    <View style={aiStyles.card}>
      <View style={aiStyles.headerRow}>
        <View style={aiStyles.brainBox}>
          <MaterialCommunityIcons name="brain" size={15} color={Colors.gold} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={aiStyles.headerSub}>AI PREDICTION ENGINE</Text>
          <Text style={aiStyles.headerTitle}>Analysis Preview</Text>
        </View>
        <Animated.View style={[aiStyles.liveDot, { opacity: pulse }]} />
        <Text style={aiStyles.liveLabel}>LIVE</Text>
      </View>

      <Text style={aiStyles.quoteText}>
        "Predicted {entities} financial entities across {merchants} merchants in
        your selected range."
      </Text>

      <View style={aiStyles.statsGrid}>
        {[
          { val: `~${messages}`, label: 'SMS', icon: 'message-text-outline' },
          { val: `~${entities}`, label: 'ENTITIES', icon: 'tag-outline' },
          { val: `~${merchants}`, label: 'MERCHANTS', icon: 'store-outline' },
          { val: `~${unusual}`, label: 'UNUSUAL', icon: 'alert-outline' },
        ].map(s => (
          <View key={s.label} style={aiStyles.statBox}>
            <MaterialCommunityIcons
              name={s.icon as any}
              size={13}
              color={Colors.gold}
            />
            <Text style={aiStyles.statVal}>{s.val}</Text>
            <Text style={aiStyles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const aiStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    borderColor: Colors.goldBorder,
    padding: Space.xl,
    marginBottom: Space.md,
    gap: Space.md,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: Space.sm },
  brainBox: {
    width: 30,
    height: 30,
    borderRadius: Radius.sm,
    backgroundColor: Colors.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSub: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: Colors.gold,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginTop: 1,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#3DCB7F' },
  liveLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#3DCB7F',
    letterSpacing: 1,
  },
  quoteText: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  statsGrid: { flexDirection: 'row', gap: 8 },
  statBox: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.sm,
    padding: Space.sm,
    alignItems: 'center',
    gap: 4,
  },
  statVal: { fontSize: 17, fontWeight: '700', color: Colors.gold },
  statLabel: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.7,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});

// ─── PrivacyShieldCard ────────────────────────────────────────────────────────

const PrivacyShieldCard: React.FC = () => (
  <View style={privStyles.card}>
    <View style={privStyles.headerRow}>
      <MaterialCommunityIcons name="shield-check" size={16} color="#3DCB7F" />
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
            size={14}
            color="#3DCB7F"
          />
        </View>
        <Text style={privStyles.rowText}>{item.text}</Text>
        <Feather name="check" size={12} color="#3DCB7F" />
      </View>
    ))}
  </View>
);

const privStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    borderColor: 'rgba(61,203,127,0.25)',
    padding: Space.xl,
    marginBottom: Space.xl,
    gap: Space.md,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerLabel: {
    flex: 1,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: '#3DCB7F',
  },
  activePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(61,203,127,0.1)',
    borderWidth: 0.5,
    borderColor: 'rgba(61,203,127,0.3)',
  },
  activePillText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#3DCB7F',
    letterSpacing: 1,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(61,203,127,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
});

// ─── LoadingCard ──────────────────────────────────────────────────────────────

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
      <Text style={ldStyles.stepMsg}>{step.msg}</Text>
      <Text style={ldStyles.stepSub}>{step.sub}</Text>
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
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    borderColor: Colors.goldBorder,
    padding: Space.xl,
    marginBottom: Space.md,
    gap: Space.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pctBlock: { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  pctNum: {
    fontSize: 36,
    fontWeight: '200',
    color: Colors.gold,
    lineHeight: 40,
  },
  pctSym: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gold,
    marginBottom: 5,
  },
  stepMsg: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  stepSub: { fontSize: 10, color: Colors.textMuted, fontStyle: 'italic' },
  track: {
    height: 2,
    backgroundColor: Colors.border,
    borderRadius: 1,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: Colors.gold, borderRadius: 1 },
  dotsRow: { flexDirection: 'row', gap: 6 },
  dot: { flex: 1, height: 3, borderRadius: 2, backgroundColor: Colors.border },
  dotDone: { backgroundColor: Colors.goldMuted },
  dotActive: { backgroundColor: Colors.gold },
});

// ─── InsightsDashboard ────────────────────────────────────────────────────────

const InsightsDashboard: React.FC<{ data: InsightData }> = ({ data }) => {
  console.log('DASHBOARD DATA', JSON.stringify(data, null, 2));
  const onlyTransfers = data.transactionCount > 0 && data.categoryBreakdown.length === 0;

  if (onlyTransfers) {
    return (
<View style={styles.emptyState}>
        <MaterialCommunityIcons
          name="database-remove-outline"
          size={52}
          color={Colors.textMuted}
          style={{ marginBottom: Space.lg }}
        />

        <Text style={styles.emptyTitle}>No Spending Transactions Found</Text>

        <Text style={styles.emptyText}>
          Only transfer transactions were detected in the selected period.
        </Text>
      </View>
    );
  }
  if (data.categoryBreakdown.length === 0) {
    return (
      <View style={styles.emptyState}>
        <MaterialCommunityIcons
          name="database-remove-outline"
          size={52}
          color={Colors.textMuted}
          style={{ marginBottom: Space.lg }}
        />

        <Text style={styles.emptyTitle}>No Transactions Found</Text>

        <Text style={styles.emptyText}>
          No financial SMS were detected in the selected time range.
        </Text>
      </View>
    );
  }

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const categories = data.categoryBreakdown ?? [];

  const barAnims = useMemo(
    () => categories.map(() => new Animated.Value(0)),
    [categories.length],
  );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const maxCat = Math.max(
    ...(data.categoryBreakdown ?? []).map(c => c.amount),
    1,
  );

  return (
    <Animated.View
      style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
    >
      {/* completion badge */}
      <View style={inStyles.sectionHeader}>
        <View style={inStyles.sectionLeft}>
          <MaterialCommunityIcons name="brain" size={14} color={Colors.gold} />
          <Text style={inStyles.sectionLabel}>AI ANALYSIS COMPLETE</Text>
        </View>
        <View style={inStyles.donePill}>
          <Text style={inStyles.donePillText}>✓ DONE</Text>
        </View>
      </View>

      {/* income / expenses / savings */}
      <View style={inStyles.trioRow}>
        {[
          {
            label: 'INCOME',
            val: data.totalIncome,
            color: '#3DCB7F',
            icon: 'trending-up',
          },
          {
            label: 'EXPENSES',
            val: data.totalExpenses,
            color: '#E05C6B',
            icon: 'trending-down',
          },
          {
            label: 'SAVINGS',
            val: data.totalSavings,
            color: Colors.gold,
            icon: 'piggy-bank-outline',
          },
        ].map(item => (
          <View
            key={item.label}
            style={[inStyles.trioCard, { borderColor: `${item.color}40` }]}
          >
            <MaterialCommunityIcons
              name={item.icon as any}
              size={16}
              color={item.color}
            />
            <Text style={inStyles.trioLabel}>{item.label}</Text>
            <Text style={[inStyles.trioVal, { color: item.color }]}>
              ₹{Number(item.val ?? 0).toLocaleString('en-IN')}
            </Text>
          </View>
        ))}
      </View>

      {/* savings rate */}
      <View style={inStyles.card}>
        <View style={inStyles.cardHeaderRow}>
          <Feather name="bar-chart-2" size={13} color={Colors.textMuted} />
          <Text style={inStyles.cardLabel}>SAVINGS RATE</Text>
          <Text
            style={[
              inStyles.savingsRateVal,
              {
                color:
                  data.savingsRate >= 20
                    ? '#3DCB7F'
                    : data.savingsRate >= 10
                    ? Colors.gold
                    : '#E05C6B',
              },
            ]}
          >
            {data.savingsRate.toFixed(1)}%
          </Text>
        </View>
        <View style={inStyles.rateTrack}>
          <View
            style={[
              inStyles.rateFill,
              {
                width: `${Math.min(data.savingsRate, 100)}%` as any,
                backgroundColor:
                  data.savingsRate >= 20
                    ? '#3DCB7F'
                    : data.savingsRate >= 10
                    ? Colors.gold
                    : '#E05C6B',
              },
            ]}
          />
        </View>
        <Text style={inStyles.rateHint}>
          {data.savingsRate >= 20
            ? "✦ Excellent! You're saving more than 20% of income."
            : data.savingsRate >= 10
            ? '⚠ Moderate savings. Aim for 20%+ for financial health.'
            : '⚠ Low savings rate. Review your discretionary spending.'}
        </Text>
      </View>

      {/* category breakdown */}
      <View style={inStyles.card}>
        <View style={inStyles.cardHeaderRow}>
          <MaterialCommunityIcons
            name="chart-donut"
            size={13}
            color={Colors.textMuted}
          />
          <Text style={inStyles.cardLabel}>SPENDING BY CATEGORY</Text>
        </View>
        {(data.categoryBreakdown ?? []).map((cat, i) => {
          const barW =
            barAnims[i]?.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', `${(cat.amount / maxCat) * 100}%`],
            }) ?? '0%';
          return (
            <View key={cat.category} style={inStyles.catRow}>
              <View
                style={[
                  inStyles.catDot,
                  {
                    backgroundColor: CATEGORY_COLORS[cat.category] ?? '#6B7280',
                  },
                ]}
              />
              <Text style={inStyles.catName}>{cat.category}</Text>
              <View style={inStyles.catBarWrap}>
                <Animated.View
                  style={[
                    inStyles.catBar,
                    {
                      width: barW,
                      backgroundColor:
                        CATEGORY_COLORS[cat.category] ?? '#6B7280',
                    },
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

      {/* top merchants */}
      <View style={inStyles.card}>
        <View style={inStyles.cardHeaderRow}>
          <MaterialCommunityIcons
            name="store-outline"
            size={13}
            color={Colors.textMuted}
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
            <View style={inStyles.merchantRank}>
              <Text style={inStyles.merchantRankText}>{i + 1}</Text>
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

      {/* subscriptions */}

      {/* quick stats */}

      {/* AI recommendation */}
    </Animated.View>
  );
};

const inStyles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Space.md,
  },
  sectionLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: Colors.gold,
  },
  donePill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(61,203,127,0.1)',
    borderWidth: 0.5,
    borderColor: 'rgba(61,203,127,0.3)',
  },
  donePillText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#3DCB7F',
    letterSpacing: 0.8,
  },
  trioRow: { flexDirection: 'row', gap: 8, marginBottom: Space.md },
  trioCard: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  trioLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: Colors.textMuted,
  },
  trioVal: { fontSize: 12, fontWeight: '700', letterSpacing: -0.3 },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: Space.xl,
    marginBottom: Space.md,
    gap: Space.md,
  },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardLabel: {
    flex: 1,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: Colors.textMuted,
  },
  savingsRateVal: { fontSize: 18, fontWeight: '600' },
  rateTrack: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  rateFill: { height: '100%', borderRadius: 2 },
  rateHint: { fontSize: 11, color: Colors.textSecondary, lineHeight: 17 },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catDot: { width: 7, height: 7, borderRadius: 4 },
  catName: { fontSize: 11, color: Colors.textPrimary, width: 82 },
  catBarWrap: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  catBar: { height: '100%', borderRadius: 2, opacity: 0.85 },
  catAmt: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textPrimary,
    width: 64,
    textAlign: 'right',
  },
  catPct: {
    fontSize: 10,
    color: Colors.textMuted,
    width: 32,
    textAlign: 'right',
  },
  merchantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  merchantDivider: { borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  merchantRank: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  merchantRankText: { fontSize: 10, fontWeight: '700', color: Colors.gold },
  merchantName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  merchantCount: { fontSize: 10, color: Colors.textMuted },
  merchantAmt: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  subRow: { flexDirection: 'row', alignItems: 'center' },
  subMerchant: { flex: 1, fontSize: 13, color: Colors.textPrimary },
  subAmt: { fontSize: 12, fontWeight: '600', color: Colors.gold },
  subTotalPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
    backgroundColor: Colors.goldMuted,
    borderWidth: 0.5,
    borderColor: Colors.goldBorder,
  },
  subTotalText: { fontSize: 9, fontWeight: '700', color: Colors.gold },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: Space.md },
  statBox: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: 12,
    alignItems: 'center',
    gap: 5,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: Colors.textMuted,
  },
  statVal: { fontSize: 13, fontWeight: '700' },
  recoCard: {
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    borderColor: Colors.goldBorder,
    padding: Space.xl,
    marginBottom: Space.md,
    gap: Space.sm,
  },
  recoHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  recoLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: Colors.gold,
  },
  recoText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 20,
    fontStyle: 'italic',
  },
});

// ─── computeInsights ──────────────────────────────────────────────────────────

// ─── DateRangeModal ───────────────────────────────────────────────────────────

const DateRangeModal: React.FC<{
  visible: boolean;
  startDate: Date;
  endDate: Date;
  onConfirm: (start: Date, end: Date) => void;
  onClose: () => void;
}> = ({ visible, startDate, endDate, onConfirm, onClose }) => {
  const [selecting, setSelecting] = useState<'start' | 'end'>('start');
  const [tempStart, setTempStart] = useState(fmt(startDate));
  const [tempEnd, setTempEnd] = useState(fmt(endDate));

  useEffect(() => {
    if (visible) {
      setTempStart(fmt(startDate));
      setTempEnd(fmt(endDate));
      setSelecting('start');
    }
  }, [visible]);

  const buildMarked = () => {
    const marked: Record<string, any> = {};
    if (!tempStart) return marked;
    marked[tempStart] = {
      startingDay: true,
      color: Colors.gold,
      textColor: Colors.textInverse,
    };
    if (tempEnd && tempEnd !== tempStart) {
      marked[tempEnd] = {
        endingDay: true,
        color: Colors.gold,
        textColor: Colors.textInverse,
      };
      const cur = new Date(tempStart);
      cur.setDate(cur.getDate() + 1);
      const end = new Date(tempEnd);
      while (cur < end) {
        marked[fmt(cur)] = { color: Colors.goldMuted, textColor: Colors.gold };
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
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={modalStyles.overlay}>
        <View style={modalStyles.sheet}>
          <View style={modalStyles.handle} />
          <View style={modalStyles.header}>
            <View>
              <Text style={modalStyles.headerSub}>CUSTOM INTERVAL</Text>
              <Text style={modalStyles.headerTitle}>Select Date Range</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={modalStyles.closeBtn}>
              <Ionicons name="close" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={modalStyles.selectorRow}>
            <TouchableOpacity
              onPress={() => setSelecting('start')}
              style={[
                modalStyles.selectorTab,
                selecting === 'start' && modalStyles.selectorTabActive,
              ]}
            >
              <Feather
                name="calendar"
                size={12}
                color={selecting === 'start' ? Colors.gold : Colors.textMuted}
              />
              <View>
                <Text style={modalStyles.selectorTabLabel}>FROM</Text>
                <Text
                  style={[
                    modalStyles.selectorTabDate,
                    selecting === 'start' && { color: Colors.gold },
                  ]}
                >
                  {tempStart ? fmtDisplay(new Date(tempStart)) : 'Select start'}
                </Text>
              </View>
            </TouchableOpacity>
            <View style={modalStyles.selectorArrow}>
              <Feather name="arrow-right" size={14} color={Colors.textMuted} />
            </View>
            <TouchableOpacity
              onPress={() => setSelecting('end')}
              style={[
                modalStyles.selectorTab,
                selecting === 'end' && modalStyles.selectorTabActive,
              ]}
            >
              <Feather
                name="calendar"
                size={12}
                color={selecting === 'end' ? Colors.gold : Colors.textMuted}
              />
              <View>
                <Text style={modalStyles.selectorTabLabel}>TO</Text>
                <Text
                  style={[
                    modalStyles.selectorTabDate,
                    selecting === 'end' && { color: Colors.gold },
                  ]}
                >
                  {tempEnd ? fmtDisplay(new Date(tempEnd)) : 'Select end'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <Text style={modalStyles.selectingHint}>
            {selecting === 'start'
              ? '⬤  Tap a start date'
              : '⬤  Now tap an end date'}
          </Text>

          <Calendar
            theme={calendarTheme}
            markingType="period"
            markedDates={buildMarked()}
            onDayPress={handleDayPress}
            maxDate={fmt(today)}
            enableSwipeMonths
            style={modalStyles.calendar}
          />

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
            <Feather name="check" size={15} color={Colors.textInverse} />
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
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.bgCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 36,
  },
  handle: {
    width: 36,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.border,
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
    color: Colors.gold,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '300',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 8,
    gap: 8,
  },
  selectorTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.md,
    padding: 12,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  selectorTabActive: {
    borderColor: Colors.goldBorder,
    backgroundColor: Colors.goldMuted,
  },
  selectorTabLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: Colors.textMuted,
  },
  selectorTabDate: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  selectorArrow: { padding: 4 },
  selectingHint: {
    fontSize: 10,
    color: Colors.gold,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginHorizontal: 20,
    marginBottom: 8,
  },
  calendar: { borderRadius: Radius.lg, marginHorizontal: 12 },
  confirmBtn: {
    marginHorizontal: 20,
    marginTop: 16,
    height: 52,
    borderRadius: Radius.full,
    backgroundColor: Colors.gold,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  confirmBtnDisabled: { opacity: 0.4 },
  confirmBtnText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
    color: Colors.textInverse,
  },
});

// ─── FilterScreen ─────────────────────────────────────────────────────────────

const FilterScreen: React.FC = () => {
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

  const progressAnim = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(1)).current;

  // idle CTA glow
  useEffect(() => {
    if (loading) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1.15,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [loading]);

  const handleRangeSelect = (range: QuickRange) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const end = new Date();
    const start = new Date();
    if (range === 'THIS_MONTH') {
      start.setMonth(end.getMonth() - 1);
    } else if (range === 'SIX_MONTHS') {
      start.setMonth(end.getMonth() - 6);
    } else if (range === 'THIS_YEAR') {
      start.setFullYear(end.getFullYear() - 1);
    }
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
    console.log('STEP 1');
    try {
      console.log('STEP 2');
      console.log('INSIGHTS REQUEST', filter.startDate, filter.endDate);
      const insightsResponse = await fetchInsights(
        filter.startDate,
        filter.endDate,
      );
      console.log('STEP 3', insightsResponse);
      const transactionsResponse = await fetchTransactions(
        filter.startDate,
        filter.endDate,
      );
      console.log('STEP 4', transactionsResponse);
      setInsights(insightsResponse);
      console.log('STEP 5');
      setTransactions(transactionsResponse.transactions ?? []);
      console.log('STEP 6');
    } catch (err) {
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
  if (insights) {
    console.log('INSIGHTS DATA', JSON.stringify(insights, null, 2));
  }
  console.log('TRANSACTIONS STATE', JSON.stringify(transactions, null, 2));
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      <DateRangeModal
        visible={calVisible}
        startDate={filter.startDate}
        endDate={filter.endDate}
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
              <Text style={styles.avatarText}>AX</Text>
            </View>
            <View>
              <Text style={styles.brandName}>SmartSpend AI</Text>
              <Text style={styles.brandTagline}>SMS INTELLIGENCE ENGINE</Text>
            </View>
          </View>
          <View style={styles.topRight}>
            <View style={styles.secBadge}>
              <View style={styles.secDot} />
              <Text style={styles.secLabel}>SECURED</Text>
            </View>
            {/* <TouchableOpacity style={styles.bellBtn}>
              <Ionicons
                name="notifications-outline"
                size={17}
                color={Colors.gold}
              />
            </TouchableOpacity> */}
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
            <Feather name="clock" size={11} color={Colors.textMuted} />
            <Text style={styles.cardLabel}>QUICK RANGE</Text>
          </View>
          <View style={styles.rangeGrid}>
            {QUICK_RANGES.map(r => (
              <TouchableOpacity
                key={
                  r === 'THIS_MONTH'
                    ? 'This Month'
                    : r === 'SIX_MONTHS'
                    ? '6 Months'
                    : 'This Year'
                }
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
                  {r === 'THIS_MONTH'
                    ? 'This Month'
                    : r === 'SIX_MONTHS'
                    ? '6 Months'
                    : 'This Year'}
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
                    ? Colors.gold
                    : Colors.textSecondary
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
          <Feather name="chevron-right" size={15} color={Colors.textMuted} />
        </TouchableOpacity>

        {/* ── Scan Configuration modules ── */}

        {/* ── AI Filter Mode (original toggle, preserved) ── */}

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
            <View style={inStyles.card}>
              <Text style={inStyles.cardLabel}>RECENT TRANSACTIONS</Text>

              {(transactions ?? []).slice(0, 10).map(tx => (
                <View key={tx.id} style={inStyles.merchantRow}>
                  <Text style={inStyles.merchantName}>{tx.merchant}</Text>
                  <Text style={inStyles.merchantAmt}>₹{tx.amount}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity
              style={styles.aiAssistantBtn}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons
                name="robot-outline"
                size={18}
                color={Colors.textInverse}
              />

              <Text style={styles.aiAssistantText}>
                ASK AI ABOUT YOUR SPENDING
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* ── CTA button ── */}
        <Animated.View style={{ transform: [{ scale: btnScale }] }}>
          <TouchableOpacity
            style={[styles.fetchBtn, loading && styles.fetchBtnLoading]}
            onPress={handleFetch}
            activeOpacity={0.88}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.fetchBtnInner}>
                <ActivityIndicator color={Colors.gold} size="small" />
                <Text style={[styles.fetchBtnText, { color: Colors.gold }]}>
                  ANALYSING…
                </Text>
              </View>
            ) : (
              <View style={styles.fetchBtnInner}>
                <MaterialCommunityIcons
                  name="brain"
                  size={18}
                  color={Colors.textInverse}
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
          <Text style={styles.clearText}>RESET ALL FILTERS</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Main styles ──────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingHorizontal: Space.xl, paddingBottom: Space.xxxl },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Space.lg,
  },
  topLeft: { flexDirection: 'row', alignItems: 'center', gap: Space.sm },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: Space.sm },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 12, fontWeight: '800', color: Colors.textInverse },
  brandName: {
    ...Font.labelL,
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  brandTagline: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1,
    color: Colors.textMuted,
    marginTop: 1,
  },
  secBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(61,203,127,0.08)',
    borderWidth: 0.5,
    borderColor: 'rgba(61,203,127,0.25)',
  },
  secDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#3DCB7F' },
  secLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#3DCB7F',
    letterSpacing: 0.8,
  },
  bellBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: Colors.bgCard,
    borderWidth: 0.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  titleBlock: { marginBottom: Space.xl, gap: Space.sm },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Space.md },
  titleSub: { ...Font.labelS, color: Colors.gold, letterSpacing: 1.2 },
  title: {
    ...Font.displayXL,
    color: Colors.textPrimary,
    fontSize: 26,
    fontWeight: '300',
  },
  titleDesc: { ...Font.bodyS, color: Colors.textSecondary },

  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: Space.xl,
    marginBottom: Space.md,
    gap: Space.md,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: Colors.textMuted,
  },
  cardLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },

  moduleCountPill: {
    marginLeft: 'auto',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
    backgroundColor: Colors.goldMuted,
    borderWidth: 0.5,
    borderColor: Colors.goldBorder,
  },
  moduleCountText: {
    fontSize: 8,
    fontWeight: '700',
    color: Colors.gold,
    letterSpacing: 0.6,
  },

  rangeGrid: { flexDirection: 'row', gap: Space.sm },
  rangeBtn: {
    flex: 1,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  rangeBtnActive: {
    backgroundColor: Colors.goldMuted,
    borderColor: Colors.gold,
  },
  rangeBtnText: {
    ...Font.labelL,
    color: Colors.textSecondary,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  rangeBtnTextActive: { color: Colors.gold, fontWeight: '700' },

  calendarTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0,
  },
  calendarTriggerActive: { borderColor: Colors.goldBorder },
  calendarTriggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    flex: 1,
  },
  calendarIconBox: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    backgroundColor: Colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  calendarIconBoxActive: {
    backgroundColor: Colors.goldMuted,
    borderColor: Colors.goldBorder,
  },
  calendarRangeText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.gold,
    marginTop: 3,
  },
  calendarPlaceholder: { fontSize: 11, color: Colors.textMuted, marginTop: 3 },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Space.md,
  },
  toggleLabel: { ...Font.bodyM, color: Colors.textPrimary, fontWeight: '500' },
  toggleSub: {
    ...Font.labelS,
    color: Colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },

  fetchBtn: {
    height: 58,
    borderRadius: Radius.full,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Space.lg,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  fetchBtnLoading: {
    backgroundColor: Colors.bgCard,
    borderWidth: 0.5,
    borderColor: Colors.goldBorder,
    shadowOpacity: 0,
  },
  fetchBtnInner: { flexDirection: 'row', alignItems: 'center', gap: Space.sm },
  fetchBtnText: {
    ...Font.labelM,
    fontSize: 13,
    letterSpacing: 2.5,
    color: Colors.textInverse,
    fontWeight: '800',
  },

  clearBtn: { alignItems: 'center', paddingVertical: Space.sm },
  clearText: {
    ...Font.labelM,
    color: Colors.textSecondary,
    letterSpacing: 1.2,
  },
  emptyState: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    borderColor: Colors.border,
    paddingVertical: Space.xxxl,
    paddingHorizontal: Space.xl,
    alignItems: 'center',
    marginBottom: Space.lg,
  },

  emptyTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: Space.sm,
  },

  emptyText: {
    color: Colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  aiAssistantBtn: {
    height: 54,
    borderRadius: Radius.full,
    backgroundColor: Colors.gold,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space.sm,
    marginBottom: Space.lg,
  },

  aiAssistantText: {
    color: Colors.textInverse,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  emptyInsightsCard: {
    backgroundColor: '#111',
    borderRadius: 24,
    padding: 24,
    marginTop: 20,
  },

  emptyInsightsTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },

  emptyInsightsText: {
    color: '#888',
    marginTop: 8,
    lineHeight: 22,
  },
});

export default FilterScreen;
