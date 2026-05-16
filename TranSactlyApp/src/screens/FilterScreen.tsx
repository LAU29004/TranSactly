import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, StatusBar, TouchableOpacity,
  Switch, ScrollView, ActivityIndicator, Animated,
  Dimensions, LayoutAnimation, Platform, UIManager, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, DateData } from 'react-native-calendars';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import { Colors, Space, Radius, Font } from '../theme';
import { FilterState } from '../types/Transaction';
import { useTransactions } from '../context/TransactionContext';
import { mockTransactions } from '../data/mockData';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width: SCREEN_W } = Dimensions.get('window');

type QuickRange = '7D' | '15D' | '1M' | '1Y';
const QUICK_RANGES: QuickRange[] = ['7D', '15D', '1M', '1Y'];
const today = new Date();
const oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

const fmt = (d: Date) => d.toISOString().split('T')[0];
const fmtDisplay = (d: Date) =>
  d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

type InsightData = {
  totalExpenses: number;
  totalIncome: number;
  totalSavings: number;
  savingsRate: number;
  categoryBreakdown: { category: string; amount: number; count: number; percent: number }[];
  topMerchants: { merchant: string; amount: number; count: number }[];
  subscriptions: { merchant: string; amount: number }[];
  dailyAvg: number;
  highestDay: { date: string; amount: number };
  unusualCount: number;
  recurringTotal: number;
};

const LOADING_MESSAGES = [
  'Parsing financial SMS entities…',
  'Detecting recurring subscriptions…',
  'Running fraud heuristics…',
  'Mapping merchant categories…',
  'Calculating spending patterns…',
  'Generating AI insights…',
  'Finalising analysis report…',
];

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
          Animated.timing(anim, { toValue: Math.random() * 0.6 + 0.4, duration: 280, useNativeDriver: true }),
          Animated.timing(anim, { toValue: bars[i], duration: 280, useNativeDriver: true }),
        ])
      )
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
            { transform: [{ scaleY: anim }], backgroundColor: active ? Colors.gold : Colors.border },
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
    marked[tempStart] = { startingDay: true, color: Colors.gold, textColor: Colors.textInverse };
    if (tempEnd && tempEnd !== tempStart) {
      marked[tempEnd] = { endingDay: true, color: Colors.gold, textColor: Colors.textInverse };
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
              <Ionicons name="close" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={modalStyles.selectorRow}>
            <TouchableOpacity
              onPress={() => setSelecting('start')}
              style={[modalStyles.selectorTab, selecting === 'start' && modalStyles.selectorTabActive]}
            >
              <Feather name="calendar" size={12} color={selecting === 'start' ? Colors.gold : Colors.textMuted} />
              <View>
                <Text style={modalStyles.selectorTabLabel}>FROM</Text>
                <Text style={[modalStyles.selectorTabDate, selecting === 'start' && { color: Colors.gold }]}>
                  {tempStart ? fmtDisplay(new Date(tempStart)) : 'Select start'}
                </Text>
              </View>
            </TouchableOpacity>
            <View style={modalStyles.selectorArrow}>
              <Feather name="arrow-right" size={14} color={Colors.textMuted} />
            </View>
            <TouchableOpacity
              onPress={() => setSelecting('end')}
              style={[modalStyles.selectorTab, selecting === 'end' && modalStyles.selectorTabActive]}
            >
              <Feather name="calendar" size={12} color={selecting === 'end' ? Colors.gold : Colors.textMuted} />
              <View>
                <Text style={modalStyles.selectorTabLabel}>TO</Text>
                <Text style={[modalStyles.selectorTabDate, selecting === 'end' && { color: Colors.gold }]}>
                  {tempEnd ? fmtDisplay(new Date(tempEnd)) : 'Select end'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <Text style={modalStyles.selectingHint}>
            {selecting === 'start' ? '⬤  Tap a start date' : '⬤  Now tap an end date'}
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
            style={[modalStyles.confirmBtn, (!tempStart || !tempEnd) && modalStyles.confirmBtnDisabled]}
            onPress={() => { onConfirm(new Date(tempStart), new Date(tempEnd)); onClose(); }}
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
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: Colors.bgCard, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 36 },
  handle: { width: 36, height: 3, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginTop: 12, marginBottom: 4 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, paddingVertical: 16 },
  headerSub: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, color: Colors.gold },
  headerTitle: { fontSize: 20, fontWeight: '300', color: Colors.textPrimary, marginTop: 2 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.bgElevated, alignItems: 'center', justifyContent: 'center' },
  selectorRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 8, gap: 8 },
  selectorTab: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.bgElevated, borderRadius: Radius.md, padding: 12, borderWidth: 0.5, borderColor: Colors.border },
  selectorTabActive: { borderColor: Colors.goldBorder, backgroundColor: Colors.goldMuted },
  selectorTabLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.8, color: Colors.textMuted },
  selectorTabDate: { fontSize: 12, fontWeight: '500', color: Colors.textPrimary, marginTop: 2 },
  selectorArrow: { padding: 4 },
  selectingHint: { fontSize: 10, color: Colors.gold, fontWeight: '600', letterSpacing: 0.5, marginHorizontal: 20, marginBottom: 8 },
  calendar: { borderRadius: Radius.lg, marginHorizontal: 12 },
  confirmBtn: { marginHorizontal: 20, marginTop: 16, height: 52, borderRadius: Radius.full, backgroundColor: Colors.gold, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  confirmBtnDisabled: { opacity: 0.4 },
  confirmBtnText: { fontSize: 13, fontWeight: '700', letterSpacing: 2, color: Colors.textInverse },
});

// ─── InsightsDashboard ────────────────────────────────────────────────────────

const InsightsDashboard: React.FC<{ data: InsightData }> = ({ data }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const maxCatAmount = Math.max(...data.categoryBreakdown.map(c => c.amount), 1);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <View style={insightStyles.sectionHeader}>
        <View style={insightStyles.sectionHeaderLeft}>
          <MaterialCommunityIcons name="brain" size={14} color={Colors.gold} />
          <Text style={insightStyles.sectionLabel}>AI ANALYSIS COMPLETE</Text>
        </View>
        <View style={insightStyles.completePill}>
          <Text style={insightStyles.completePillText}>✓ DONE</Text>
        </View>
      </View>

      {/* Income / Expenses / Savings */}
      <View style={insightStyles.trioRow}>
        <View style={[insightStyles.trioCard, { borderColor: 'rgba(61,203,127,0.3)' }]}>
          <MaterialCommunityIcons name="trending-up" size={16} color="#3DCB7F" />
          <Text style={insightStyles.trioLabel}>INCOME</Text>
          <Text style={[insightStyles.trioVal, { color: '#3DCB7F' }]}>₹{data.totalIncome.toLocaleString('en-IN')}</Text>
        </View>
        <View style={[insightStyles.trioCard, { borderColor: 'rgba(224,92,107,0.3)' }]}>
          <MaterialCommunityIcons name="trending-down" size={16} color="#E05C6B" />
          <Text style={insightStyles.trioLabel}>EXPENSES</Text>
          <Text style={[insightStyles.trioVal, { color: '#E05C6B' }]}>₹{data.totalExpenses.toLocaleString('en-IN')}</Text>
        </View>
        <View style={[insightStyles.trioCard, { borderColor: Colors.goldBorder }]}>
          <MaterialCommunityIcons name="piggy-bank-outline" size={16} color={Colors.gold} />
          <Text style={insightStyles.trioLabel}>SAVINGS</Text>
          <Text style={[insightStyles.trioVal, { color: Colors.gold }]}>₹{data.totalSavings.toLocaleString('en-IN')}</Text>
        </View>
      </View>

      {/* Savings Rate */}
      <View style={insightStyles.card}>
        <View style={insightStyles.cardHeaderRow}>
          <Feather name="bar-chart-2" size={13} color={Colors.textMuted} />
          <Text style={insightStyles.cardLabel}>SAVINGS RATE</Text>
          <Text style={[insightStyles.savingsRateVal, {
            color: data.savingsRate >= 20 ? '#3DCB7F' : data.savingsRate >= 10 ? Colors.gold : '#E05C6B',
          }]}>{data.savingsRate.toFixed(1)}%</Text>
        </View>
        <View style={insightStyles.rateTrack}>
          <View style={[insightStyles.rateFill, {
            width: `${Math.min(data.savingsRate, 100)}%` as any,
            backgroundColor: data.savingsRate >= 20 ? '#3DCB7F' : data.savingsRate >= 10 ? Colors.gold : '#E05C6B',
          }]} />
        </View>
        <Text style={insightStyles.rateHint}>
          {data.savingsRate >= 20
            ? '✦ Excellent! You\'re saving more than 20% of income.'
            : data.savingsRate >= 10
            ? '⚠ Moderate savings. Aim for 20%+ for financial health.'
            : '⚠ Low savings rate. Review discretionary spending.'}
        </Text>
      </View>

      {/* Category Breakdown */}
      <View style={insightStyles.card}>
        <View style={insightStyles.cardHeaderRow}>
          <MaterialCommunityIcons name="chart-donut" size={13} color={Colors.textMuted} />
          <Text style={insightStyles.cardLabel}>SPENDING BY CATEGORY</Text>
        </View>
        {data.categoryBreakdown.map(cat => (
          <View key={cat.category} style={insightStyles.catRow}>
            <View style={[insightStyles.catDot, { backgroundColor: CATEGORY_COLORS[cat.category] ?? '#6B7280' }]} />
            <Text style={insightStyles.catName}>{cat.category}</Text>
            <View style={insightStyles.catBarWrap}>
              <View style={[insightStyles.catBar, {
                width: `${(cat.amount / maxCatAmount) * 100}%` as any,
                backgroundColor: CATEGORY_COLORS[cat.category] ?? '#6B7280',
                opacity: 0.8,
              }]} />
            </View>
            <Text style={insightStyles.catAmt}>₹{cat.amount.toLocaleString('en-IN')}</Text>
            <Text style={insightStyles.catPct}>{cat.percent}%</Text>
          </View>
        ))}
      </View>

      {/* Top Merchants */}
      <View style={insightStyles.card}>
        <View style={insightStyles.cardHeaderRow}>
          <MaterialCommunityIcons name="store-outline" size={13} color={Colors.textMuted} />
          <Text style={insightStyles.cardLabel}>TOP MERCHANTS</Text>
        </View>
        {data.topMerchants.map((m, i) => (
          <View key={m.merchant} style={[insightStyles.merchantRow, i < data.topMerchants.length - 1 && insightStyles.merchantRowBorder]}>
            <View style={insightStyles.merchantRank}>
              <Text style={insightStyles.merchantRankText}>{i + 1}</Text>
            </View>
            <Text style={insightStyles.merchantName}>{m.merchant}</Text>
            <Text style={insightStyles.merchantCount}>{m.count} txns</Text>
            <Text style={insightStyles.merchantAmt}>₹{m.amount.toLocaleString('en-IN')}</Text>
          </View>
        ))}
      </View>

      {/* Subscriptions */}
      {data.subscriptions.length > 0 && (
        <View style={insightStyles.card}>
          <View style={insightStyles.cardHeaderRow}>
            <MaterialCommunityIcons name="refresh" size={13} color={Colors.textMuted} />
            <Text style={insightStyles.cardLabel}>SUBSCRIPTIONS DETECTED</Text>
            <View style={insightStyles.subTotalPill}>
              <Text style={insightStyles.subTotalText}>₹{data.recurringTotal}/mo</Text>
            </View>
          </View>
          {data.subscriptions.map(s => (
            <View key={s.merchant} style={insightStyles.subRow}>
              <MaterialCommunityIcons name="circle-small" size={18} color={Colors.gold} />
              <Text style={insightStyles.subMerchant}>{s.merchant}</Text>
              <Text style={insightStyles.subAmt}>₹{s.amount}/mo</Text>
            </View>
          ))}
        </View>
      )}

      {/* Quick Stats */}
      <View style={insightStyles.statsRow}>
        <View style={insightStyles.statBox}>
          <Feather name="calendar" size={13} color={Colors.textMuted} />
          <Text style={insightStyles.statLabel}>DAILY AVG</Text>
          <Text style={insightStyles.statVal}>₹{data.dailyAvg.toLocaleString('en-IN')}</Text>
        </View>
        <View style={insightStyles.statBox}>
          <Feather name="alert-triangle" size={13} color={data.unusualCount > 0 ? '#E05C6B' : '#3DCB7F'} />
          <Text style={insightStyles.statLabel}>UNUSUAL</Text>
          <Text style={[insightStyles.statVal, { color: data.unusualCount > 0 ? '#E05C6B' : '#3DCB7F' }]}>
            {data.unusualCount}
          </Text>
        </View>
        <View style={insightStyles.statBox}>
          <MaterialCommunityIcons name="fire" size={13} color="#F97316" />
          <Text style={insightStyles.statLabel}>PEAK DAY</Text>
          <Text style={insightStyles.statVal}>₹{data.highestDay.amount.toLocaleString('en-IN')}</Text>
        </View>
      </View>

      {/* AI Recommendation */}
      <View style={insightStyles.aiRecoCard}>
        <View style={insightStyles.aiRecoHeader}>
          <MaterialCommunityIcons name="brain" size={14} color={Colors.gold} />
          <Text style={insightStyles.aiRecoLabel}>AI RECOMMENDATION</Text>
        </View>
        <Text style={insightStyles.aiRecoText}>
          {data.savingsRate < 10
            ? `Your top spending category is ${data.categoryBreakdown[0]?.category ?? 'Others'} at ${data.categoryBreakdown[0]?.percent ?? 0}% of expenses. Reducing this by 20% could save ₹${Math.round((data.categoryBreakdown[0]?.amount ?? 0) * 0.2).toLocaleString('en-IN')} monthly.`
            : `You have ${data.subscriptions.length} active subscriptions totalling ₹${data.recurringTotal}/month. Review and cancel unused ones to boost savings by up to ₹${Math.round(data.recurringTotal * 0.3).toLocaleString('en-IN')}.`}
        </Text>
      </View>
    </Animated.View>
  );
};

const insightStyles = StyleSheet.create({
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Space.md },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, color: Colors.gold },
  completePill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: Radius.full, backgroundColor: 'rgba(61,203,127,0.1)', borderWidth: 0.5, borderColor: 'rgba(61,203,127,0.3)' },
  completePillText: { fontSize: 9, fontWeight: '700', color: '#3DCB7F', letterSpacing: 0.8 },
  trioRow: { flexDirection: 'row', gap: 8, marginBottom: Space.md },
  trioCard: { flex: 1, backgroundColor: Colors.bgCard, borderRadius: Radius.lg, borderWidth: 0.5, padding: 12, alignItems: 'center', gap: 4 },
  trioLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.8, color: Colors.textMuted },
  trioVal: { fontSize: 13, fontWeight: '600', letterSpacing: -0.3 },
  card: { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, borderWidth: 0.5, borderColor: Colors.border, padding: Space.xl, marginBottom: Space.md, gap: Space.md },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardLabel: { flex: 1, fontSize: 10, fontWeight: '700', letterSpacing: 0.8, color: Colors.textMuted },
  savingsRateVal: { fontSize: 16, fontWeight: '600' },
  rateTrack: { height: 4, backgroundColor: Colors.border, borderRadius: 2, overflow: 'hidden' },
  rateFill: { height: '100%', borderRadius: 2 },
  rateHint: { fontSize: 11, color: Colors.textSecondary, lineHeight: 17 },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catDot: { width: 7, height: 7, borderRadius: 4 },
  catName: { fontSize: 12, color: Colors.textPrimary, width: 80 },
  catBarWrap: { flex: 1, height: 4, backgroundColor: Colors.border, borderRadius: 2, overflow: 'hidden' },
  catBar: { height: '100%', borderRadius: 2 },
  catAmt: { fontSize: 11, fontWeight: '500', color: Colors.textPrimary, width: 64, textAlign: 'right' },
  catPct: { fontSize: 10, color: Colors.textMuted, width: 32, textAlign: 'right' },
  merchantRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  merchantRowBorder: { borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  merchantRank: { width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.bgElevated, alignItems: 'center', justifyContent: 'center' },
  merchantRankText: { fontSize: 10, fontWeight: '700', color: Colors.gold },
  merchantName: { flex: 1, fontSize: 13, fontWeight: '500', color: Colors.textPrimary },
  merchantCount: { fontSize: 10, color: Colors.textMuted },
  merchantAmt: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  subRow: { flexDirection: 'row', alignItems: 'center' },
  subMerchant: { flex: 1, fontSize: 13, color: Colors.textPrimary },
  subAmt: { fontSize: 12, fontWeight: '500', color: Colors.gold },
  subTotalPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full, backgroundColor: Colors.goldMuted, borderWidth: 0.5, borderColor: Colors.goldBorder },
  subTotalText: { fontSize: 9, fontWeight: '700', color: Colors.gold },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: Space.md },
  statBox: { flex: 1, backgroundColor: Colors.bgCard, borderRadius: Radius.lg, borderWidth: 0.5, borderColor: Colors.border, padding: 12, alignItems: 'center', gap: 4 },
  statLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.8, color: Colors.textMuted },
  statVal: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  aiRecoCard: { backgroundColor: Colors.bgElevated, borderRadius: Radius.lg, borderWidth: 0.5, borderColor: Colors.goldBorder, padding: Space.xl, marginBottom: Space.md, gap: Space.sm },
  aiRecoHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  aiRecoLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, color: Colors.gold },
  aiRecoText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20, fontStyle: 'italic' },
});

// ─── computeInsights ──────────────────────────────────────────────────────────

function computeInsights(transactions: typeof mockTransactions): InsightData {
  const debits = transactions.filter(t => t.type === 'debit');
  const credits = transactions.filter(t => t.type === 'credit');
  const totalExpenses = debits.reduce((s, t) => s + t.amount, 0);
  const totalIncome = credits.reduce((s, t) => s + t.amount, 0);
  const totalSavings = Math.max(totalIncome - totalExpenses, 0);
  const savingsRate = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;

  const catMap: Record<string, { amount: number; count: number }> = {};
  debits.forEach(t => {
    if (!catMap[t.category]) catMap[t.category] = { amount: 0, count: 0 };
    catMap[t.category].amount += t.amount;
    catMap[t.category].count += 1;
  });
  const categoryBreakdown = Object.entries(catMap)
    .map(([category, { amount, count }]) => ({
      category, amount, count,
      percent: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const merchantMap: Record<string, { amount: number; count: number }> = {};
  debits.forEach(t => {
    if (!merchantMap[t.merchant]) merchantMap[t.merchant] = { amount: 0, count: 0 };
    merchantMap[t.merchant].amount += t.amount;
    merchantMap[t.merchant].count += 1;
  });
  const topMerchants = Object.entries(merchantMap)
    .map(([merchant, { amount, count }]) => ({ merchant, amount, count }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const subscriptions = debits
    .filter(t => t.category === 'Entertainment' && t.amount < 2000)
    .map(t => ({ merchant: t.merchant, amount: t.amount }));
  const recurringTotal = subscriptions.reduce((s, t) => s + t.amount, 0);

  const days = Math.max(
    Math.ceil(
      (new Date(debits[debits.length - 1]?.date ?? Date.now()).getTime() -
        new Date(debits[0]?.date ?? Date.now()).getTime()) / 86400000
    ), 1
  );
  const dailyAvg = Math.round(totalExpenses / days);

  const dayMap: Record<string, number> = {};
  debits.forEach(t => { dayMap[t.date] = (dayMap[t.date] ?? 0) + t.amount; });
  const highestDayEntry = Object.entries(dayMap).sort((a, b) => b[1] - a[1])[0];
  const highestDay = { date: highestDayEntry?.[0] ?? '', amount: highestDayEntry?.[1] ?? 0 };

  return {
    totalExpenses, totalIncome, totalSavings, savingsRate,
    categoryBreakdown, topMerchants, subscriptions,
    dailyAvg, highestDay, unusualCount: 1, recurringTotal,
  };
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

const FilterScreen: React.FC = () => {
  const { setTransactions } = useTransactions();
  const [filter, setFilter] = useState<FilterState>({
    range: '1M',
    startDate: oneMonthAgo,
    endDate: today,
    onlyTransactionMessages: true,
  });
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [loadingPct, setLoadingPct] = useState(0);
  const [insights, setInsights] = useState<InsightData | null>(null);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const handleRangeSelect = (range: QuickRange) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const end = new Date();
    let start = new Date();
    if (range === '7D') start.setDate(end.getDate() - 7);
    else if (range === '15D') start.setDate(end.getDate() - 15);
    else if (range === '1M') start.setMonth(end.getMonth() - 1);
    else if (range === '1Y') start.setFullYear(end.getFullYear() - 1);
    setFilter(prev => ({ ...prev, range, startDate: start, endDate: end }));
    setInsights(null);
  };

  const handleFetch = async () => {
    setLoading(true);
    setInsights(null);
    progressAnim.setValue(0);

    for (let i = 0; i < LOADING_MESSAGES.length; i++) {
      setLoadingMsg(LOADING_MESSAGES[i]);
      const pct = Math.round(((i + 1) / LOADING_MESSAGES.length) * 100);
      setLoadingPct(pct);
      Animated.timing(progressAnim, { toValue: pct / 100, duration: 400, useNativeDriver: false }).start();
      await new Promise<void>(r => setTimeout(r, 600));
    }

    const filtered = mockTransactions.filter(t => {
      const d = new Date(t.date);
      return d >= filter.startDate && d <= filter.endDate;
    });

    setTransactions(filtered);
    setLoading(false);
    setInsights(computeInsights(filtered));
  };

  const handleClear = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFilter({ range: '1M', startDate: oneMonthAgo, endDate: today, onlyTransactionMessages: false });
    setInsights(null);
  };

  const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      <DateRangeModal
        visible={calendarVisible}
        startDate={filter.startDate}
        endDate={filter.endDate}
        onConfirm={(s, e) => {
          setFilter(prev => ({ ...prev, range: 'CUSTOM' as any, startDate: s, endDate: e }));
          setInsights(null);
        }}
        onClose={() => setCalendarVisible(false)}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Top bar */}
        <View style={styles.topBar}>
          <View style={styles.topLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>AX</Text>
            </View>
            <Text style={styles.brandName}>SmartSpend AI</Text>
          </View>
          <TouchableOpacity style={styles.bellBtn}>
            <Ionicons name="notifications-outline" size={17} color={Colors.gold} />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <View style={styles.titleBlock}>
          <View style={styles.titleRow}>
            <AIWaveform active={loading} />
            <View style={{ flex: 1 }}>
              <Text style={styles.titleSub}>FINANCIAL SIGNAL SCANNER</Text>
              <Text style={styles.title}>Configure Analysis</Text>
            </View>
          </View>
          <Text style={styles.titleDesc}>Configure intelligent transaction analysis parameters</Text>
        </View>

        {/* Quick Range */}
        <View style={styles.card}>
          <View style={styles.cardLabelRow}>
            <Feather name="clock" size={11} color={Colors.textMuted} />
            <Text style={styles.cardLabel}>QUICK RANGE</Text>
          </View>
          <View style={styles.rangeGrid}>
            {QUICK_RANGES.map(r => (
              <TouchableOpacity
                key={r}
                onPress={() => handleRangeSelect(r)}
                style={[styles.rangeBtn, filter.range === r && styles.rangeBtnActive]}
                activeOpacity={0.75}
              >
                <Text style={[styles.rangeBtnText, filter.range === r && styles.rangeBtnTextActive]}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Custom Date Range */}
        <TouchableOpacity
          style={[styles.card, styles.calendarTrigger, (filter.range as string) === 'CUSTOM' && styles.calendarTriggerActive]}
          onPress={() => setCalendarVisible(true)}
          activeOpacity={0.8}
        >
          <View style={styles.calendarTriggerLeft}>
            <View style={[styles.calendarIconBox, (filter.range as string) === 'CUSTOM' && styles.calendarIconBoxActive]}>
              <Feather name="calendar" size={15} color={(filter.range as string) === 'CUSTOM' ? Colors.gold : Colors.textSecondary} />
            </View>
            <View>
              <Text style={styles.cardLabel}>CUSTOM DATE RANGE</Text>
              {(filter.range as string) === 'CUSTOM' ? (
                <Text style={styles.calendarRangeText}>
                  {fmtDisplay(filter.startDate)}  →  {fmtDisplay(filter.endDate)}
                </Text>
              ) : (
                <Text style={styles.calendarPlaceholder}>Tap to open calendar picker</Text>
              )}
            </View>
          </View>
          <Feather name="chevron-right" size={15} color={Colors.textMuted} />
        </TouchableOpacity>

        {/* Preference */}
        <View style={styles.card}>
          <View style={styles.cardLabelRow}>
            <MaterialCommunityIcons name="filter-outline" size={11} color={Colors.textMuted} />
            <Text style={styles.cardLabel}>AI FILTER MODE</Text>
          </View>
          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleLabel}>Only transaction messages</Text>
              <Text style={styles.toggleSub}>Ignore promotional and OTP noise</Text>
            </View>
            <Switch
              value={filter.onlyTransactionMessages}
              onValueChange={v => setFilter(prev => ({ ...prev, onlyTransactionMessages: v }))}
              trackColor={{ false: Colors.border, true: Colors.gold }}
              thumbColor={Colors.bg}
              ios_backgroundColor={Colors.border}
            />
          </View>
        </View>

        {/* AI Prediction */}
        <View style={styles.predictionCard}>
          <View style={styles.predictionHeader}>
            <View style={styles.predictionIconBox}>
              <MaterialCommunityIcons name="brain" size={14} color={Colors.gold} />
            </View>
            <Text style={styles.predictionLabel}>AI PREDICTION</Text>
          </View>
          <Text style={styles.predictionText}>
            "AI predicts 84 financial entities and 11 recurring payment patterns in your selected range."
          </Text>
          <View style={styles.predictionStats}>
            {[{ label: 'MESSAGES', value: '~184' }, { label: 'MERCHANTS', value: '~31' }, { label: 'PATTERNS', value: '~11' }].map(s => (
              <View key={s.label} style={styles.predictionStat}>
                <Text style={styles.predictionStatVal}>{s.value}</Text>
                <Text style={styles.predictionStatLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Security Panel */}
        <View style={styles.securityPanel}>
          <View style={styles.cardLabelRow}>
            <MaterialCommunityIcons name="shield-check-outline" size={11} color="#3DCB7F" />
            <Text style={[styles.cardLabel, { color: '#3DCB7F' }]}>PRIVACY SHIELD</Text>
          </View>
          {[
            { icon: 'cellphone', text: 'Local SMS processing only — on-device' },
            { icon: 'lock-outline', text: 'Encrypted analysis pipeline active' },
            { icon: 'web-off', text: 'No raw data shared externally' },
            { icon: 'shield-lock-outline', text: 'AI privacy shield enabled' },
          ].map(item => (
            <View key={item.text} style={styles.securityRow}>
              <MaterialCommunityIcons name={item.icon as any} size={15} color="#3DCB7F" />
              <Text style={styles.securityRowText}>{item.text}</Text>
              <Feather name="check" size={13} color="#3DCB7F" />
            </View>
          ))}
        </View>

        {/* Loading Progress */}
        {loading && (
          <View style={styles.loadingCard}>
            <View style={styles.loadingHeader}>
              <AIWaveform active />
              <Text style={styles.loadingPct}>{loadingPct}%</Text>
            </View>
            <Text style={styles.loadingMsg}>{loadingMsg}</Text>
            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
            </View>
          </View>
        )}

        {/* Insights Dashboard */}
        {insights && <InsightsDashboard data={insights} />}

        {/* CTA */}
        <TouchableOpacity
          style={[styles.fetchBtn, loading && styles.fetchBtnLoading]}
          onPress={handleFetch}
          activeOpacity={0.85}
          disabled={loading}
        >
          {loading ? (
            <View style={styles.fetchBtnInner}>
              <ActivityIndicator color={Colors.textInverse} size="small" />
              <Text style={styles.fetchBtnText}>ANALYSING…</Text>
            </View>
          ) : (
            <View style={styles.fetchBtnInner}>
              <MaterialCommunityIcons name="brain" size={16} color={Colors.textInverse} />
              <Text style={styles.fetchBtnText}>RUN AI ANALYSIS</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={handleClear} activeOpacity={0.7} style={styles.clearBtn}>
          <Text style={styles.clearText}>RESET ALL FILTERS</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingHorizontal: Space.xl, paddingBottom: Space.xxxl },

  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Space.lg },
  topLeft: { flexDirection: 'row', alignItems: 'center', gap: Space.sm },
  avatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.gold, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 12, fontWeight: '800', color: Colors.textInverse },
  brandName: { ...Font.labelL, color: Colors.textPrimary, fontSize: 15 },
  bellBtn: { width: 36, height: 36, borderRadius: Radius.sm, backgroundColor: Colors.bgCard, borderWidth: 0.5, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },

  titleBlock: { marginBottom: Space.xl, gap: Space.sm },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Space.md },
  titleSub: { ...Font.labelS, color: Colors.gold, letterSpacing: 1.2 },
  title: { ...Font.displayXL, color: Colors.textPrimary, fontSize: 26, fontWeight: '300' },
  titleDesc: { ...Font.bodyS, color: Colors.textSecondary },

  card: { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, borderWidth: 0.5, borderColor: Colors.border, padding: Space.xl, marginBottom: Space.md, gap: Space.md },
  cardLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, color: Colors.textMuted },
  cardLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },

  rangeGrid: { flexDirection: 'row', gap: Space.sm },
  rangeBtn: { flex: 1, height: 44, borderRadius: Radius.md, backgroundColor: Colors.bgElevated, alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: Colors.border },
  rangeBtnActive: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  rangeBtnText: { ...Font.labelL, color: Colors.textSecondary, fontSize: 12, letterSpacing: 0.5 },
  rangeBtnTextActive: { color: Colors.textInverse },

  calendarTrigger: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 0 },
  calendarTriggerActive: { borderColor: Colors.goldBorder },
  calendarTriggerLeft: { flexDirection: 'row', alignItems: 'center', gap: Space.md, flex: 1 },
  calendarIconBox: { width: 38, height: 38, borderRadius: Radius.md, backgroundColor: Colors.bgElevated, alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: Colors.border },
  calendarIconBoxActive: { backgroundColor: Colors.goldMuted, borderColor: Colors.goldBorder },
  calendarRangeText: { fontSize: 12, fontWeight: '500', color: Colors.gold, marginTop: 3 },
  calendarPlaceholder: { fontSize: 11, color: Colors.textMuted, marginTop: 3 },

  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Space.md },
  toggleLabel: { ...Font.bodyM, color: Colors.textPrimary, fontWeight: '500' },
  toggleSub: { ...Font.labelS, color: Colors.textMuted, fontSize: 10, marginTop: 2 },

  predictionCard: { backgroundColor: Colors.bgElevated, borderRadius: Radius.lg, borderWidth: 0.5, borderColor: Colors.goldBorder, padding: Space.xl, marginBottom: Space.md, gap: Space.md },
  predictionHeader: { flexDirection: 'row', alignItems: 'center', gap: Space.sm },
  predictionIconBox: { width: 28, height: 28, borderRadius: Radius.xs, backgroundColor: Colors.goldMuted, alignItems: 'center', justifyContent: 'center' },
  predictionLabel: { ...Font.labelS, color: Colors.gold },
  predictionText: { ...Font.bodyS, color: Colors.textSecondary, fontStyle: 'italic', lineHeight: 20 },
  predictionStats: { flexDirection: 'row', gap: Space.sm },
  predictionStat: { flex: 1, backgroundColor: Colors.bgCard, borderRadius: Radius.sm, padding: Space.md, alignItems: 'center', gap: 3 },
  predictionStatVal: { ...Font.labelL, color: Colors.gold, fontSize: 18 },
  predictionStatLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.8, color: Colors.textMuted },

  securityPanel: { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, borderWidth: 0.5, borderColor: 'rgba(61,203,127,0.2)', padding: Space.xl, marginBottom: Space.xl, gap: Space.md },
  securityRow: { flexDirection: 'row', alignItems: 'center', gap: Space.sm },
  securityRowText: { ...Font.bodyS, color: Colors.textSecondary, flex: 1 },

  loadingCard: { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, borderWidth: 0.5, borderColor: Colors.goldBorder, padding: Space.xl, marginBottom: Space.md, gap: Space.md },
  loadingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  loadingPct: { ...Font.numXL, color: Colors.gold, fontSize: 28, fontWeight: '300' },
  loadingMsg: { ...Font.bodyS, color: Colors.textSecondary, fontStyle: 'italic' },
  progressTrack: { height: 2, backgroundColor: Colors.border, borderRadius: 1, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.gold, borderRadius: 1 },

  fetchBtn: { height: 56, borderRadius: Radius.full, backgroundColor: Colors.gold, alignItems: 'center', justifyContent: 'center', marginBottom: Space.lg, shadowColor: Colors.gold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  fetchBtnLoading: { backgroundColor: Colors.bgCard, borderWidth: 0.5, borderColor: Colors.goldBorder },
  fetchBtnInner: { flexDirection: 'row', alignItems: 'center', gap: Space.sm },
  fetchBtnText: { ...Font.labelM, fontSize: 13, letterSpacing: 2, color: Colors.textInverse },
  clearBtn: { alignItems: 'center', paddingVertical: Space.sm },
  clearText: { ...Font.labelM, color: Colors.textSecondary, letterSpacing: 1.2 },
});

export default FilterScreen;