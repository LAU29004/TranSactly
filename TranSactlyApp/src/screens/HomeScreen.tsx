import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, StatusBar,
  TouchableOpacity, PermissionsAndroid, Platform,
  ActivityIndicator, Animated, ScrollView, Dimensions,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TransactionCard from '../components/TransactionCard';
import { mockProfile } from '../data/mockData';
import { Colors, Space, Radius, Font } from '../theme';
import { useTransactions } from '../context/TransactionContext';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { PieChart, BarChart } from 'react-native-chart-kit';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Constants ───────────────────────────────────────────────────────────────
const CARD_WIDTH = SCREEN_W * 0.75;
const CARD_SPACING = Space.sm;
const SPARK_HEIGHTS = [18, 28, 22, 36, 30, 42, 34];
const SPENDING_CATEGORIES = [
  { name: 'Food & Dining', amount: 12400, percent: 28, color: '#FF6B6B', icon: 'silverware-fork-knife' },
  { name: 'Travel', amount: 8900, percent: 20, color: '#4ECDC4', icon: 'car-outline' },
  { name: 'Entertainment', amount: 6200, percent: 14, color: '#45B7D1', icon: 'gamepad-variant-outline' },
  { name: 'Utilities', amount: 5100, percent: 12, color: '#FFA502', icon: 'lightning-bolt' },
  { name: 'Shopping', amount: 4800, percent: 11, color: '#9C27B0', icon: 'shopping-outline' },
  { name: 'Other', amount: 3600, percent: 8, color: '#95E1D3', icon: 'dots-horizontal' },
];
const EARNING_DATA = [
  { month: 'Jan', earnings: 95, spending: 65 },
  { month: 'Feb', earnings: 98, spending: 72 },
  { month: 'Mar', earnings: 105, spending: 68 },
  { month: 'Apr', earnings: 102, spending: 75 },
  { month: 'May', earnings: 110, spending: 82 },
];

type PermState = 'idle' | 'checking' | 'granted' | 'denied' | 'unavailable';
type ComparisonPeriod = 'month' | 'sixMonths' | 'year';

interface InsightObject {
  icon: string;
  text: string;
  change: string;
  changePercent: number;
  category?: string;
  type: 'warn' | 'alert' | 'info';
  cta: string;
}

interface SpendingCategory {
  name: string;
  amount: number;
  percent: number;
  color: string;
  icon: string;
}

interface EarningData {
  month: string;
  earnings: number;
  spending: number;
}

const requestSmsPermission = async (): Promise<PermState> => {
  if (Platform.OS !== 'android') return 'unavailable';
  try {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_SMS,
      {
        title: 'SmartSpend AI — SMS Access',
        message: 'SmartSpend AI reads your bank SMS messages to detect and categorise transactions automatically. No messages leave your device.',
        buttonPositive: 'Allow Access',
        buttonNegative: 'Not Now',
      },
    );
    return result === PermissionsAndroid.RESULTS.GRANTED ? 'granted' : 'denied';
  } catch { return 'denied'; }
};

const checkSmsPermission = async (): Promise<PermState> => {
  if (Platform.OS !== 'android') return 'unavailable';
  try {
    const granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_SMS);
    return granted ? 'granted' : 'idle';
  } catch { return 'idle'; }
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const AIPulseDot: React.FC = () => {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.4, duration: 800, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={[styles.pulseDot, { transform: [{ scale }] }]} />
  );
};

// SMS Data Source Badge Component
const SMSSourceBadge: React.FC = () => (
  <View style={styles.smsBadge}>
    <MaterialCommunityIcons name="message-text-outline" size={10} color={Colors.textMuted} />
    <Text style={styles.smsBadgeText}>Detected from SMS</Text>
  </View>
);

const AIInsightCard: React.FC<{
  icon: string;
  text: string;
  change: string;
  changePercent: number;
  period: ComparisonPeriod;
  category?: string;
  type: 'warn' | 'alert' | 'info';
  cta: string;
}> = ({ icon, text, change, changePercent, period, category, type, cta }) => {
  const isPositive = changePercent > 0;
  const colorMap = {
    warn: { border: Colors.goldBorder, bg: Colors.goldMuted, text: Colors.gold, icon: '📈' },
    alert: { border: 'rgba(224,92,107,0.3)', bg: 'rgba(224,92,107,0.08)', text: '#E05C6B', icon: '🚨' },
    info: { border: 'rgba(77,158,245,0.3)', bg: 'rgba(77,158,245,0.08)', text: '#4D9EF5', icon: '🔄' },
  };
  const c = colorMap[type];
  const periodLabel = { month: 'This Month', sixMonths: '6 Months', year: 'This Year' }[period];
  
  return (
    <View style={[styles.insightCard, { borderColor: c.border }]}>
      <View style={styles.insightCardTop}>
        <View style={[styles.insightIconBox, { backgroundColor: c.bg }]}>
          <MaterialCommunityIcons name={icon} size={16} color={c.text} />
        </View>
        <View style={[styles.insightConfPill, { backgroundColor: c.bg, borderColor: c.border }]}>
          <Text style={[styles.insightConfText, { color: c.text }]}>
            {isPositive ? '↑' : '↓'} {Math.abs(changePercent)}%
          </Text>
        </View>
      </View>
      <Text style={styles.insightBody}>{text}</Text>
      {category && <Text style={[styles.insightCategory, { color: c.text }]}>{category}</Text>}
      <View style={styles.insightMetaRow}>
        <Text style={[styles.insightMeta, { color: Colors.textSecondary }]}>{change}</Text>
        <Text style={[styles.insightMeta, { color: Colors.textMuted }]}>vs {periodLabel}</Text>
      </View>
      <Text style={[styles.insightCta, { color: c.text }]}>{cta}  →</Text>
      <SMSSourceBadge />
    </View>
  );
};

const MiniSparkBar: React.FC<{ heights: number[]; activeIndex: number }> = ({ heights, activeIndex }) => (
  <View style={styles.sparkRow}>
    {heights.map((h, i) => (
      <View
        key={i}
        style={[
          styles.sparkBar,
          { height: h, backgroundColor: i === activeIndex ? Colors.gold : i > activeIndex - 2 ? Colors.goldBorder : Colors.border },
        ]}
      />
    ))}
  </View>
);

const SpendingBreakdownCard: React.FC<{ categories: SpendingCategory[] }> = ({ categories }) => {
  const pieData = useMemo(() => 
    categories.map(cat => ({
      name: cat.name,
      amount: cat.amount,
      color: cat.color,
      legendFontColor: Colors.textSecondary,
      legendFontSize: 10,
    })),
    [categories]
  );

  const totalAmount = useMemo(() => 
    categories.reduce((sum, cat) => sum + cat.amount, 0),
    [categories]
  );

  return (
    <View style={styles.chartSection}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>SPENDING BREAKDOWN</Text>
        <MaterialCommunityIcons name="information-outline" size={16} color={Colors.textMuted} />
      </View>
      
      <View style={styles.pieChartWrapper}>
        <View style={styles.pieChartContainer}>
          <PieChart 
            data={pieData} 
            width={SCREEN_W - 60} 
            height={220} 
            accessor="amount" 
            backgroundColor="transparent" 
            paddingLeft="0" 
            center={[10, 0]} 
            hasLegend={false} 
            chartConfig={{ 
              backgroundColor: 'transparent', 
              backgroundGradientFrom: 'transparent', 
              backgroundGradientTo: 'transparent', 
              color: (opacity = 1) => `rgba(255,255,255,${opacity})`, 
            }} 
          />
        </View>
        
        {/* Custom Legend Below Chart */}
        <View style={styles.customLegend}>
          {categories.map((cat) => (
            <View key={cat.name} style={styles.legendRow}>
              <View style={[styles.legendColorBox, { backgroundColor: cat.color }]} />
              <View style={styles.legendContent}>
                <Text style={styles.legendCategoryName}>{cat.name}</Text>
                <Text style={styles.legendAmount}>₹{(cat.amount / 1000).toFixed(1)}K</Text>
              </View>
              <View style={styles.legendPercentBox}>
                <Text style={styles.legendPercent}>{cat.percent}%</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Total Amount Display */}
        <View style={styles.totalAmountBox}>
          <Text style={styles.totalAmountLabel}>TOTAL SPENDING</Text>
          <Text style={styles.totalAmountValue}>₹{(totalAmount / 1000).toFixed(1)}K</Text>
        </View>
      </View>

      {/* Category Details Grid */}
      <View style={styles.categoryDetailsGrid}>
        {categories.map((cat) => (
          <View key={cat.name} style={styles.categoryDetailItem}>
            <View style={[styles.categoryDetailDot, { backgroundColor: cat.color }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.categoryDetailName}>{cat.name}</Text>
              <View style={styles.categoryDetailRow}>
                <MaterialCommunityIcons name={cat.icon} size={12} color={Colors.textSecondary} />
                <Text style={styles.categoryDetailAmount}>₹{(cat.amount / 1000).toFixed(1)}K</Text>
              </View>
            </View>
            <View style={styles.categoryDetailPercentBadge}>
              <Text style={styles.categoryDetailPercent}>{cat.percent}%</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const EarningVsSpendingCard: React.FC<{ data: EarningData[] }> = ({ data }) => {
  const chartData = useMemo(() => ({
    labels: data.map(d => d.month),
    datasets: [
      {
        data: data.map(d => d.earnings),
        color: () => Colors.gold,
        strokeWidth: 2,
      },
      {
        data: data.map(d => d.spending),
        color: () => '#E05C6B',
        strokeWidth: 2,
      },
    ],
  }), [data]);

  return (
    <View style={styles.chartSection}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>EARNINGS VS SPENDING</Text>
        <MaterialCommunityIcons name="chart-line" size={16} color={Colors.textMuted} />
      </View>

      <View style={styles.barChartContainer}>
        <BarChart
          data={chartData}
          width={SCREEN_W - Space.xl * 2}
          height={280}
          yAxisLabel="₹"
          yAxisSuffix="K"
          chartConfig={{
            backgroundColor: Colors.bg,
            backgroundGradientFrom: Colors.bg,
            backgroundGradientTo: Colors.bg,
            color: (opacity = 1) => `rgba(77, 158, 245, ${opacity})`,
            barPercentage: 0.5,
            useShadowColorFromDataset: false,
            decimalPlaces: 0,
            style: { borderRadius: Radius.lg },
            propsForLabels: {
              fontSize: 10,
              fontWeight: '600',
              fill: Colors.textMuted,
            },
          }}
          verticalLabelRotation={-45}
        />
      </View>

      <View style={styles.chartLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.gold }]} />
          <Text style={styles.legendLabel}>Earnings</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#E05C6B' }]} />
          <Text style={styles.legendLabel}>Spending</Text>
        </View>
      </View>
    </View>
  );
};

const ComparisonPeriodSelector: React.FC<{
  selected: ComparisonPeriod;
  onSelect: (period: ComparisonPeriod) => void;
}> = ({ selected, onSelect }) => (
  <View style={styles.periodSelector}>
    {(['month', 'sixMonths', 'year'] as ComparisonPeriod[]).map(period => (
      <TouchableOpacity
        key={period}
        style={[styles.periodBtn, selected === period && styles.periodBtnActive]}
        onPress={() => onSelect(period)}
        accessibilityLabel={`Filter by ${period === 'month' ? 'This Month' : period === 'sixMonths' ? '6 Months' : 'This Year'}`}
        accessibilityRole="radio"
        accessibilityState={{ selected: selected === period }}
      >
        <Text style={[styles.periodBtnText, selected === period && styles.periodBtnTextActive]}>
          {period === 'month' ? 'This Month' : period === 'sixMonths' ? '6 Months' : 'This Year'}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

const SecurityStatusCard: React.FC = () => {
  const pulseAnim = useRef(new Animated.Value(0.6)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.6, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const items = [
    { icon: 'shield-lock', label: 'DEVICE', value: 'Protected' },
    { icon: 'lock-outline', label: 'ENCRYPTION', value: 'E2E Active' },
    { icon: 'robot', label: 'AI FRAUD', value: 'Monitoring' },
    { icon: 'sync', label: 'LAST SYNC', value: '2 min ago' },
  ];

  return (
    <View style={styles.securityCard}>
      <View style={styles.securityHeader}>
        <View style={styles.securityTitleRow}>
          <Animated.View style={[styles.securityGreenDot, { opacity: pulseAnim }]} />
          <Text style={styles.securityTitle}>SECURITY STATUS</Text>
        </View>
        <View style={styles.securityActivePill}>
          <Text style={styles.securityActiveText}>ALL CLEAR</Text>
        </View>
      </View>
      <View style={styles.securityGrid}>
        {items.map(item => (
          <View key={item.label} style={styles.securityItem}>
            <MaterialCommunityIcons name={item.icon} size={18} color={Colors.gold} />
            <View>
              <Text style={styles.securityItemLabel}>{item.label}</Text>
              <Text style={styles.securityItemValue}>{item.value}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const EmptyState: React.FC<{ permState: PermState; onRequest: () => void }> = ({ permState, onRequest }) => {
  const isUnavailable = permState === 'unavailable';
  const isDenied = permState === 'denied';
  return (
    <View style={emptyStyles.container}>
      <View style={emptyStyles.iconBox}>
        <View style={emptyStyles.iconInner}>
          <MaterialCommunityIcons
            name={isDenied || isUnavailable ? 'alert-circle-outline' : 'inbox-outline'}
            size={40}
            color={Colors.gold}
          />
        </View>
      </View>
      <Text style={emptyStyles.title}>
        {isUnavailable ? 'Not Available on iOS' : isDenied ? 'Permission Denied' : 'No Transactions Yet'}
      </Text>
      <Text style={emptyStyles.desc}>
        {isUnavailable
          ? 'SMS reading is only supported on Android. Connect your bank account to import transactions.'
          : isDenied
          ? 'SMS access was denied. Grant permission in device Settings.'
          : 'Grant SMS permission so SmartSpend AI can detect your bank transactions automatically.'}
      </Text>
      {!isUnavailable && (
        <TouchableOpacity 
          style={emptyStyles.btn} 
          onPress={onRequest} 
          activeOpacity={0.85}
          accessibilityLabel={isDenied ? 'Open device settings' : 'Grant SMS permission'}
          accessibilityRole="button"
        >
          <Text style={emptyStyles.btnText}>
            {isDenied ? 'OPEN SETTINGS' : 'GIVE MESSAGE PERMISSION'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const emptyStyles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: Space.xxl, paddingHorizontal: Space.xl, gap: Space.lg },
  iconBox: { width: 88, height: 88, borderRadius: Radius.xl, backgroundColor: Colors.goldMuted, borderWidth: 1, borderColor: Colors.goldBorder, alignItems: 'center', justifyContent: 'center' },
  iconInner: { width: 64, height: 64, borderRadius: Radius.lg, backgroundColor: Colors.bgElevated, alignItems: 'center', justifyContent: 'center' },
  title: { ...Font.displayM, color: Colors.textPrimary, textAlign: 'center', fontSize: 20 },
  desc: { ...Font.bodyM, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, maxWidth: 280 },
  btn: { height: 50, borderRadius: Radius.full, backgroundColor: Colors.gold, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Space.xxl, marginTop: Space.sm },
  btnText: { ...Font.labelM, fontSize: 11, letterSpacing: 1.4, color: Colors.textInverse },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

const getInsightsForPeriod = (period: ComparisonPeriod): InsightObject[] => {
  const insights = {
    month: [
      { icon: 'trending-up', text: 'Food spending increased 18% this week — Swiggy & Zomato orders spiking.', change: '₹2,340↑', changePercent: 18, category: 'FOOD & DINING', type: 'warn' as const, cta: 'VIEW BREAKDOWN' },
      { icon: 'alert-circle', text: 'Suspicious merchant "MPAY23819" — ₹2,340 charged. Flagged for review.', change: '₹2,340', changePercent: 0, type: 'alert' as const, cta: 'REVIEW NOW' },
      { icon: 'repeat', text: 'Detected 3 recurring subscriptions totalling ₹2,097/month.', change: '₹2,097↓', changePercent: -5, category: 'SUBSCRIPTIONS', type: 'info' as const, cta: 'MANAGE' },
      { icon: 'clock-alert', text: 'At current pace you will exceed entertainment budget in 6 days.', change: '₹8,400 spent', changePercent: 12, category: 'ENTERTAINMENT', type: 'warn' as const, cta: 'SET LIMIT' },
    ],
    sixMonths: [
      { icon: 'trending-up', text: 'Food & Dining expenses rose 34% over 6 months — consistent uptrend.', change: '₹45,200↑', changePercent: 34, category: 'FOOD & DINING', type: 'warn' as const, cta: 'ANALYZE TREND' },
      { icon: 'chart-line', text: 'Travel spending surged 52% — summer vacation impact visible.', change: '₹78,900↑', changePercent: 52, category: 'TRAVEL', type: 'warn' as const, cta: 'VIEW DETAILS' },
      { icon: 'percent', text: 'Overall spending increased 28% — entertainment & dining main drivers.', change: '₹156,300↑', changePercent: 28, type: 'info' as const, cta: 'DETAILED REPORT' },
    ],
    year: [
      { icon: 'trending-down', text: 'Investment spending increased 67% YoY — strong portfolio growth.', change: '₹287,400↑', changePercent: 67, category: 'INVESTMENTS', type: 'info' as const, cta: 'VIEW PORTFOLIO' },
      { icon: 'home', text: 'Home & Utilities costs up 18% annually — seasonal heating/cooling impact.', change: '₹42,100↑', changePercent: 18, category: 'UTILITIES', type: 'warn' as const, cta: 'OPTIMIZE' },
      { icon: 'dumbbell', text: 'Health & Wellness expenses doubled — gym & medical focus areas.', change: '₹78,200↑', changePercent: 100, category: 'HEALTH', type: 'info' as const, cta: 'HEALTH GOALS' },
    ],
  };
  return insights[period];
};

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [permState, setPermState] = useState<PermState>('checking');
  const [comparisonPeriod, setComparisonPeriod] = useState<ComparisonPeriod>('month');
  const { transactions } = useTransactions();
  const heroFade = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    (async () => {
      const state = await checkSmsPermission();
      setPermState(state);
    })();
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroFade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(heroSlide, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleRequestPermission = useCallback(async () => {
    if (permState === 'denied') {
      const { Linking } = require('react-native');
      Linking.openSettings();
      return;
    }
    setPermState('checking');
    const result = await requestSmsPermission();
    setPermState(result);
  }, [permState]);

  // Memoize insights to prevent unnecessary recalculation
  const currentInsights = useMemo(() => getInsightsForPeriod(comparisonPeriod), [comparisonPeriod]);

  const renderHeader = () => (
    <View>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>AX</Text>
            </View>
            <View style={styles.avatarBadge} />
          </View>
          <View style={styles.aiProtectedPill}>
            <AIPulseDot />
            <Text style={styles.aiProtectedText}>AI PROTECTED</Text>
          </View>
        </View>
        <View style={styles.topRight}>
          <TouchableOpacity 
            style={styles.iconBtn}
            accessibilityLabel="View notifications"
            accessibilityRole="button"
          >
            <MaterialCommunityIcons name="bell-outline" size={18} color={Colors.textPrimary} />
            <View style={styles.notifBadge} accessible={false} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Greeting */}
      <View style={styles.greetingBlock}>
        <Text style={styles.greetingSub}>GOOD EVENING</Text>
        <Text style={styles.greetingName}>Hello, {mockProfile.firstName}</Text>
        <Text style={styles.greetingDesc}>Your financial intelligence overview</Text>
      </View>

      {/* Hero Card */}
      <Animated.View style={[styles.heroCard, { opacity: heroFade, transform: [{ translateY: heroSlide }] }]}>
        <Text style={styles.heroLabel}>TOTAL MONTHLY SPENDING</Text>
        <View style={styles.heroAmountRow}>
          <Text style={styles.heroCurrency}>₹</Text>
          <Text style={styles.heroAmount}>{Math.floor(mockProfile.totalMonthlySpending).toLocaleString('en-IN')}</Text>
          <Text style={styles.heroDecimal}>.54</Text>
        </View>
        <View style={styles.heroMetaRow}>
          <View style={styles.heroChangePill}>
            <MaterialCommunityIcons name="trending-down" size={12} color="#3DCB7F" />
            <Text style={styles.heroChangePillText}>6.2% vs last month</Text>
          </View>
          <View style={styles.heroBudgetPill}>
            <Text style={styles.heroBudgetPillText}>{mockProfile.budgetUsed}% BUDGET USED</Text>
          </View>
        </View>

        <View style={styles.heroStatRow}>
          {[
            { label: 'INCOME', value: `₹${(mockProfile.totalMonthlyIncome / 1000).toFixed(0)}K`, positive: true, icon: 'cash-multiple' },
            { label: 'SAVINGS', value: '₹24.8K', positive: true, icon: 'piggy-bank-outline' },
            { label: 'INVESTED', value: '₹12.2K', positive: true, icon: 'trending-up' },
          ].map((s, i) => (
            <View key={i} style={[styles.heroStat, i < 2 && styles.heroStatBorder]}>
              <MaterialCommunityIcons name={s.icon} size={14} color={Colors.textSecondary} style={{ marginBottom: 4 }} />
              <Text style={styles.heroStatLabel}>{s.label}</Text>
              <Text style={[styles.heroStatVal, s.positive && { color: Colors.gold }]}>{s.value}</Text>
            </View>
          ))}
        </View>

        <MiniSparkBar heights={SPARK_HEIGHTS} activeIndex={6} />
        <SMSSourceBadge />
      </Animated.View>

      {/* Comparison Period Selector */}
      <ComparisonPeriodSelector selected={comparisonPeriod} onSelect={setComparisonPeriod} />

      {/* AI Insights */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <MaterialCommunityIcons name="lightbulb-on-outline" size={16} color={Colors.gold} />
          <Text style={styles.sectionTitle}>AI INSIGHTS</Text>
        </View>
        <Text style={styles.sectionAction}>{currentInsights.length} ACTIVE</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        decelerationRate="fast"
        contentContainerStyle={styles.insightScroll}
        accessibilityLabel="AI-generated financial insights carousel"
      >
        {currentInsights.map((ins, i) => (
          <AIInsightCard
            key={i}
            icon={ins.icon}
            text={ins.text}
            change={ins.change}
            changePercent={ins.changePercent}
            period={comparisonPeriod}
            category={ins.category}
            type={ins.type}
            cta={ins.cta}
          />
        ))}
      </ScrollView>

      {/* Charts Section */}
      {(
        <>
          <SpendingBreakdownCard categories={SPENDING_CATEGORIES} />
          <EarningVsSpendingCard data={EARNING_DATA} />
        </>
      )}

      {/* Transactions header */}
      {permState === 'granted' && transactions.length > 0 && (
        <View style={[styles.sectionHeader, { marginTop: Space.xl }]}>
          <Text style={styles.sectionTitle}>RECENT ACTIVITY</Text>
          <TouchableOpacity accessibilityLabel="View all transactions">
            <Text style={styles.sectionAction}>VIEW ALL</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderFooter = () => {
    if (permState !== 'granted') return null;
    if (transactions.length === 0) {
      return (
        <View style={styles.noTxBox}>
          <MaterialCommunityIcons name="inbox-outline" size={32} color={Colors.textMuted} style={{ marginBottom: Space.md }} />
          <Text style={styles.noTxText}>No transactions found in your SMS inbox.</Text>
        </View>
      );
    }
    return (
      <View>
        <SecurityStatusCard />
        <View style={{ height: Space.xxxl }} />
      </View>
    );
  };

  if (permState === 'checking') {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={Colors.gold} />
          <Text style={styles.loadingText}>Initialising AI Engine...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
      <FlatList
        data={permState === 'granted' ? transactions : []}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <TransactionCard transaction={item} />}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={
          permState !== 'granted'
            ? () => <EmptyState permState={permState} onRequest={handleRequestPermission} />
            : renderFooter
        }
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews={true}
      />

      {/* Floating AI Assistant Button */}
      <TouchableOpacity 
        style={styles.fab} 
        activeOpacity={0.85} 
        onPress={() => navigation.navigate('Chat')}
        accessibilityLabel="Open AI chat assistant"
        accessibilityRole="button"
      >
        <MaterialCommunityIcons name="sparkles" size={14} color={Colors.textInverse} />
        <Text style={styles.fabText}>ASK AI</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: Space.xl, paddingBottom: 100 },
  loadingCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Space.lg },
  loadingText: { ...Font.labelM, color: Colors.textSecondary },

  // Top bar
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Space.lg },
  topLeft: { flexDirection: 'row', alignItems: 'center', gap: Space.sm },
  topRight: { flexDirection: 'row', gap: Space.sm },
  avatarWrap: { position: 'relative' },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.gold, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 12, fontWeight: '800', color: Colors.textInverse },
  avatarBadge: { position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: 5, backgroundColor: '#3DCB7F', borderWidth: 1.5, borderColor: Colors.bg },
  aiProtectedPill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.full, backgroundColor: 'rgba(61,203,127,0.08)', borderWidth: 0.5, borderColor: 'rgba(61,203,127,0.25)' },
  pulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#3DCB7F' },
  aiProtectedText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, color: '#3DCB7F' },
  iconBtn: { width: 36, height: 36, borderRadius: Radius.sm, backgroundColor: Colors.bgCard, borderWidth: 0.5, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  notifBadge: { position: 'absolute', top: 7, right: 7, width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.gold, borderWidth: 1.5, borderColor: Colors.bg },

  // Greeting
  greetingBlock: { marginBottom: Space.xl },
  greetingSub: { ...Font.labelS, color: Colors.gold, letterSpacing: 1.5 },
  greetingName: { ...Font.displayXL, color: Colors.textPrimary, fontSize: 30, fontWeight: '300', marginTop: 2 },
  greetingDesc: { ...Font.bodyS, color: Colors.textSecondary, marginTop: 4 },

  // SMS Badge
  smsBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: Space.sm, paddingHorizontal: Space.sm, paddingVertical: 4, borderRadius: Radius.full, backgroundColor: Colors.bgElevated, borderWidth: 0.5, borderColor: Colors.border, alignSelf: 'flex-start' },
  smsBadgeText: { ...Font.labelS, fontSize: 9, color: Colors.textMuted, fontWeight: '500' },

  // Hero card
  heroCard: { backgroundColor: Colors.bgCard, borderRadius: Radius.xl, borderWidth: 0.5, borderColor: Colors.border, padding: Space.xl, marginBottom: Space.md },
  heroLabel: { ...Font.labelS, color: Colors.textMuted, marginBottom: Space.md },
  heroAmountRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, marginBottom: Space.sm },
  heroCurrency: { fontSize: 20, fontWeight: '300', color: Colors.textSecondary, marginBottom: 6 },
  heroAmount: { ...Font.numXL, color: Colors.textPrimary, fontSize: 44, fontWeight: '300', letterSpacing: -1.5 },
  heroDecimal: { fontSize: 22, fontWeight: '300', color: Colors.textSecondary, marginBottom: 6 },
  heroMetaRow: { flexDirection: 'row', gap: Space.sm, marginBottom: Space.lg },
  heroChangePill: { paddingHorizontal: Space.md, paddingVertical: 4, borderRadius: Radius.full, backgroundColor: 'rgba(61,203,127,0.1)', borderWidth: 0.5, borderColor: 'rgba(61,203,127,0.3)', flexDirection: 'row', alignItems: 'center', gap: 4 },
  heroChangePillText: { fontSize: 11, fontWeight: '600', color: '#3DCB7F' },
  heroBudgetPill: { paddingHorizontal: Space.md, paddingVertical: 4, borderRadius: Radius.full, backgroundColor: Colors.goldMuted, borderWidth: 0.5, borderColor: Colors.goldBorder },
  heroBudgetPillText: { fontSize: 11, fontWeight: '600', color: Colors.gold },
  heroStatRow: { flexDirection: 'row', borderTopWidth: 0.5, borderTopColor: Colors.border, paddingTop: Space.lg, marginBottom: Space.lg },
  heroStat: { flex: 1, alignItems: 'center' },
  heroStatBorder: { borderRightWidth: 0.5, borderRightColor: Colors.border },
  heroStatLabel: { ...Font.labelS, color: Colors.textMuted, fontSize: 9, marginBottom: 4 },
  heroStatVal: { ...Font.labelL, color: Colors.textPrimary, fontSize: 15 },
  sparkRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 36 },
  sparkBar: { flex: 1, borderRadius: 3 },

  // Period Selector
  periodSelector: { flexDirection: 'row', gap: Space.sm, marginBottom: Space.lg, marginTop: Space.md },
  periodBtn: { flex: 1, paddingVertical: Space.sm, borderRadius: Radius.md, backgroundColor: Colors.bgElevated, borderWidth: 0.5, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  periodBtnActive: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  periodBtnText: { ...Font.labelS, fontSize: 10, color: Colors.textSecondary },
  periodBtnTextActive: { color: Colors.textInverse },

  // Section
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Space.md, marginTop: Space.lg },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Space.sm },
  sectionTitle: { ...Font.labelS, color: Colors.textMuted },
  sectionAction: { ...Font.labelS, color: Colors.gold },

  // Insight cards
  insightScroll: { paddingRight: Space.sm, gap: CARD_SPACING, marginBottom: Space.md },
  insightCard: { width: CARD_WIDTH, backgroundColor: Colors.bgCard, borderRadius: Radius.lg, borderWidth: 0.5, padding: Space.lg, gap: Space.sm },
  insightCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  insightIconBox: { width: 32, height: 32, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  insightConfPill: { paddingHorizontal: Space.sm, paddingVertical: 3, borderRadius: Radius.full, borderWidth: 0.5 },
  insightConfText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.8 },
  insightBody: { ...Font.bodyS, color: Colors.textPrimary, lineHeight: 20 },
  insightCategory: { ...Font.labelS, fontSize: 10, fontWeight: '600', letterSpacing: 0.5 },
  insightMetaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  insightMeta: { ...Font.labelS, fontSize: 9 },
  insightCta: { ...Font.labelS, fontSize: 10, letterSpacing: 0.8 },

  // Charts
  chartSection: { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, borderWidth: 0.5, borderColor: Colors.border, padding: Space.xl, marginBottom: Space.md, marginTop: Space.lg },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Space.lg },
  chartTitle: { ...Font.labelS, color: Colors.textMuted },
  
  // Pie Chart Wrapper
  pieChartWrapper: { alignItems: 'center', marginBottom: Space.lg },
  pieChartContainer: { width: '100%', alignItems: 'center', justifyContent: 'center', marginLeft: 130 },
  
  // Custom Legend
  customLegend: { width: '100%', gap: Space.sm, marginBottom: Space.lg, paddingTop: Space.md, borderTopWidth: 0.5, borderTopColor: Colors.border },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: Space.md, paddingVertical: Space.sm },
  legendColorBox: { width: 12, height: 12, borderRadius: 2 },
  legendContent: { flex: 1, gap: 2 },
  legendCategoryName: { ...Font.bodyS, color: Colors.textPrimary, fontSize: 12, fontWeight: '500' },
  legendAmount: { ...Font.labelS, color: Colors.gold, fontSize: 11, fontWeight: '600' },
  legendPercentBox: { paddingHorizontal: Space.sm, paddingVertical: 3, borderRadius: Radius.md, backgroundColor: Colors.bgElevated },
  legendPercent: { ...Font.labelS, fontSize: 10, fontWeight: '600', color: Colors.textSecondary },
  
  // Total Amount Display
  totalAmountBox: { alignItems: 'center', paddingVertical: Space.md, paddingHorizontal: Space.lg, backgroundColor: Colors.bgElevated, borderRadius: Radius.lg, marginBottom: Space.lg },
  totalAmountLabel: { ...Font.labelS, color: Colors.textMuted, fontSize: 10, marginBottom: 4 },
  totalAmountValue: { ...Font.displayM, color: Colors.gold, fontSize: 28, fontWeight: '600' },
  
  // Category Details Grid
  categoryDetailsGrid: { gap: Space.sm },
  categoryDetailItem: { flexDirection: 'row', alignItems: 'center', gap: Space.md, paddingHorizontal: Space.md, paddingVertical: Space.md, backgroundColor: Colors.bgElevated, borderRadius: Radius.md, borderWidth: 0.5, borderColor: Colors.border },
  categoryDetailDot: { width: 10, height: 10, borderRadius: 5 },
  categoryDetailName: { ...Font.labelM, color: Colors.textPrimary, fontSize: 12, fontWeight: '500' },
  categoryDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  categoryDetailAmount: { ...Font.labelS, color: Colors.gold, fontSize: 11, fontWeight: '600' },
  categoryDetailPercentBadge: { paddingHorizontal: Space.sm, paddingVertical: 2, borderRadius: Radius.sm, backgroundColor: Colors.gold },
  categoryDetailPercent: { ...Font.labelS, fontSize: 9, fontWeight: '700', color: Colors.textInverse, letterSpacing: 0.5 },

  barChartContainer: { alignItems: 'center', marginBottom: Space.lg, marginHorizontal: -Space.xl },
  chartLegend: { flexDirection: 'row', justifyContent: 'center', gap: Space.xl },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: Space.sm },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { ...Font.labelS, fontSize: 11, color: Colors.textSecondary },

  categoryGrid: { gap: Space.md, marginTop: Space.lg },
  categoryItem: { flexDirection: 'row', alignItems: 'center', gap: Space.md, paddingVertical: Space.sm },
  categoryDot: { width: 12, height: 12, borderRadius: 6 },
  categoryNameRow: { flexDirection: 'row', alignItems: 'center', gap: Space.sm },
  categoryName: { ...Font.bodyS, color: Colors.textPrimary },
  categoryAmount: { ...Font.labelM, color: Colors.gold, marginTop: 2, fontSize: 13 },
  categoryPercent: { ...Font.labelS, color: Colors.textSecondary, fontSize: 11, minWidth: 30, textAlign: 'right' },

  // Security
  securityCard: { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, borderWidth: 0.5, borderColor: 'rgba(61,203,127,0.2)', padding: Space.xl, marginBottom: Space.md, marginTop: Space.lg },
  securityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Space.lg },
  securityTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Space.sm },
  securityGreenDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#3DCB7F' },
  securityTitle: { ...Font.labelS, color: Colors.textPrimary },
  securityActivePill: { paddingHorizontal: Space.md, paddingVertical: 4, borderRadius: Radius.full, backgroundColor: 'rgba(61,203,127,0.1)', borderWidth: 0.5, borderColor: 'rgba(61,203,127,0.25)' },
  securityActiveText: { fontSize: 9, fontWeight: '700', letterSpacing: 1, color: '#3DCB7F' },
  securityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.sm },
  securityItem: { width: '47%', flexDirection: 'row', alignItems: 'center', gap: Space.sm, backgroundColor: Colors.bgElevated, borderRadius: Radius.md, padding: Space.md },
  securityItemLabel: { ...Font.labelS, color: Colors.textMuted, fontSize: 9 },
  securityItemValue: { ...Font.labelS, color: '#3DCB7F', fontSize: 11 },

  // No tx
  noTxBox: { padding: Space.xxl, alignItems: 'center' },
  noTxText: { ...Font.bodyM, color: Colors.textMuted, textAlign: 'center' },

  // FAB
  fab: { position: 'absolute', bottom: 32, right: Space.xl, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 18, paddingVertical: 12, borderRadius: Radius.full, backgroundColor: Colors.gold, shadowColor: Colors.gold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  fabText: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, color: Colors.textInverse },
});

export default HomeScreen;