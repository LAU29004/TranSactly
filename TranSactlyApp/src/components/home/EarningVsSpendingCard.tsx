import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { BarChart } from 'react-native-gifted-charts';
import { EarningData } from '../../utils/dashboardCalculations';

const { width: SCREEN_W } = Dimensions.get('window');

// ── Design Tokens ──────────────────────────────────────────────────────────────
const C = {
  background:    '#0B0F17',
  card:          '#141A23',
  surface:       '#1E2636',
  border:        '#1F2937',
  borderLight:   '#374151',

  gold:          '#D4AF37',
  goldLight:     '#F0D060',
  goldMuted:     '#D4AF3733',
  purple:        '#8B5CF6',
  purpleMuted:   '#8B5CF620',

  success:       '#10B981',
  successMuted:  '#10B98120',
  danger:        '#EF4444',
  dangerMuted:   '#EF444420',

  textPrimary:   '#FFFFFF',
  textSecondary: '#9CA3AF',
  textMuted:     '#4B5563',

  // Chart-specific: two clearly distinct bars from the token set
  barEarnings:   '#D4AF37',   // gold  — income is "positive / warm"
  barEarningsGrad: '#F0D060', // gold-light gradient tip
  barSpending:   '#8B5CF6',   // purple — spending is "cost / cool"
  barSpendingGrad: '#A78BFA', // purple-300 gradient tip

  // Axis rule
  rule:          '#1F293780',
};

// ── Helpers ────────────────────────────────────────────────────────────────────
const formatK = (v: number): string =>
  v >= 1_00_000
    ? `₹${(v / 1_00_000).toFixed(1)}L`
    : v >= 1_000
    ? `₹${(v / 1_000).toFixed(0)}K`
    : `₹${v.toFixed(0)}`;

// ── Props ──────────────────────────────────────────────────────────────────────
interface EarningVsSpendingCardProps {
  data: EarningData[];
}

// ── Component ──────────────────────────────────────────────────────────────────
const EarningVsSpendingCard: React.FC<EarningVsSpendingCardProps> = ({ data }) => {
  const [activeBar, setActiveBar] = useState<{
    index:  number;
    value:  number;
    type:   'earnings' | 'spending';
    month:  string;
  } | null>(null);

  // ── Gifted Charts data — unchanged shape, new colors ──────────────────────
  const chartData = useMemo(
    () =>
      data.flatMap((item, i) => [
        {
          value:         item.earnings,
          frontColor:    C.barEarnings,
          gradientColor: C.barEarningsGrad,
          showGradient:  true,
          label:         item.month,
          spacing:       6,
          labelWidth:    34,
          onPress: () =>
            setActiveBar(prev =>
              prev?.index === i && prev.type === 'earnings'
                ? null
                : { index: i, value: item.earnings, type: 'earnings', month: item.month },
            ),
        },
        {
          value:         item.spending,
          frontColor:    C.barSpending,
          gradientColor: C.barSpendingGrad,
          showGradient:  true,
          spacing:       18,
          onPress: () =>
            setActiveBar(prev =>
              prev?.index === i && prev.type === 'spending'
                ? null
                : { index: i, value: item.spending, type: 'spending', month: item.month },
            ),
        },
      ]),
    [data],
  );

  const maxVal = useMemo(
    () => Math.max(...data.flatMap(d => [d.earnings, d.spending]), 1),
    [data],
  );

  const totalEarnings = useMemo(
    () => data.reduce((s, d) => s + d.earnings, 0),
    [data],
  );

  const totalSpending = useMemo(
    () => data.reduce((s, d) => s + d.spending, 0),
    [data],
  );

  const netSavings = totalEarnings - totalSpending;

  const savingsRate = totalEarnings > 0
    ? Math.round((netSavings / totalEarnings) * 100)
    : 0;

  const savingsPositive = netSavings >= 0;

  // ── Empty state ──────────────────────────────────────────────────────────
  if (data.length === 0) {
    return (
      <View style={s.card}>
        <View style={s.header}>
          <View style={s.titleRow}>
            <View style={s.titleAccent} />
            <Text style={s.headerTitle}>EARNINGS VS SPENDING</Text>
          </View>
          <MaterialCommunityIcons name="chart-bar" size={15} color={C.gold} />
        </View>

        <View style={s.emptyWrap}>
          <View style={[s.ring, s.ring3]} />
          <View style={[s.ring, s.ring2]} />
          <View style={[s.ring, s.ring1]} />
          <View style={s.emptyIconWrap}>
            <MaterialCommunityIcons
              name="chart-bar-stacked"
              size={36}
              color={C.gold}
            />
          </View>
          <Text style={s.emptyTitle}>No Data Yet</Text>
          <Text style={s.emptySubtitle}>
            Your earnings and spending comparison will appear once transactions are loaded.
          </Text>
        </View>
      </View>
    );
  }

  // ── Main render ──────────────────────────────────────────────────────────
  return (
    <View style={s.card}>

      {/* ── Header ── */}
      <View style={s.header}>
        <View style={s.titleRow}>
          <View style={s.titleAccent} />
          <Text style={s.headerTitle}>EARNINGS VS SPENDING</Text>
        </View>
        <MaterialCommunityIcons name="chart-bar" size={15} color={C.gold} />
      </View>

      {/* ── Three summary pills ── */}
      <View style={s.summaryRow}>

        {/* Earnings pill */}
        <View style={[s.summaryPill, { borderColor: C.barEarnings + '40' }]}>
          <View style={[s.pillDot, { backgroundColor: C.barEarnings }]} />
          <View>
            <Text style={s.pillLabel}>EARNINGS</Text>
            <Text style={[s.pillValue, { color: C.barEarnings }]}>
              {formatK(totalEarnings)}
            </Text>
          </View>
        </View>

        {/* Savings rate badge */}
        <View style={[
          s.savingsBadge,
          {
            backgroundColor: savingsPositive ? C.successMuted : C.dangerMuted,
            borderColor:      savingsPositive ? C.success + '40' : C.danger + '40',
          },
        ]}>
          <MaterialCommunityIcons
            name={savingsPositive ? 'trending-up' : 'trending-down'}
            size={13}
            color={savingsPositive ? C.success : C.danger}
          />
          <Text style={s.savingsRateLabel}>SAVED</Text>
          <Text style={[
            s.savingsRateValue,
            { color: savingsPositive ? C.success : C.danger },
          ]}>
            {savingsRate}%
          </Text>
        </View>

        {/* Spending pill */}
        <View style={[s.summaryPill, { borderColor: C.barSpending + '40' }]}>
          <View style={[s.pillDot, { backgroundColor: C.barSpending }]} />
          <View>
            <Text style={s.pillLabel}>SPENDING</Text>
            <Text style={[s.pillValue, { color: C.barSpending }]}>
              {formatK(totalSpending)}
            </Text>
          </View>
        </View>

      </View>

      {/* ── Net savings strip ── */}
      <View style={[
        s.netStrip,
        {
          backgroundColor: savingsPositive ? C.successMuted : C.dangerMuted,
          borderColor:      savingsPositive ? C.success + '30' : C.danger + '30',
        },
      ]}>
        <Text style={s.netLabel}>Net savings this period</Text>
        <Text style={[
          s.netValue,
          { color: savingsPositive ? C.success : C.danger },
        ]}>
          {savingsPositive ? '+' : ''}{formatK(netSavings)}
        </Text>
      </View>

      {/* ── Tap tooltip ── */}
      {activeBar ? (
        <View style={[
          s.tooltip,
          {
            borderColor: activeBar.type === 'earnings'
              ? C.barEarnings + '50'
              : C.barSpending + '50',
          },
        ]}>
          <View style={[
            s.tooltipDot,
            {
              backgroundColor: activeBar.type === 'earnings'
                ? C.barEarnings
                : C.barSpending,
            },
          ]} />
          <Text style={s.tooltipLabel}>
            {activeBar.type === 'earnings' ? 'Earnings' : 'Spending'}
            {' · '}{activeBar.month}
          </Text>
          <Text style={[
            s.tooltipValue,
            {
              color: activeBar.type === 'earnings'
                ? C.barEarnings
                : C.barSpending,
            },
          ]}>
            {formatK(activeBar.value)}
          </Text>
        </View>
      ) : (
        /* placeholder so the chart doesn't jump when tooltip appears/disappears */
        <View style={s.tooltipPlaceholder} />
      )}

      {/* ── Bar Chart (Gifted Charts — props unchanged) ── */}
      <View style={s.chartWrapper}>
        <BarChart
          data={chartData}
          barWidth={14}
          spacing={6}
          roundedTop
          hideRules={false}
          rulesColor={C.rule}
          rulesType="dashed"
          dashWidth={4}
          dashGap={6}
          yAxisThickness={0}
          xAxisThickness={1}
          xAxisColor={C.borderLight}
          noOfSections={4}
          maxValue={maxVal * 1.25}
          yAxisTextStyle={s.axisText}
          xAxisLabelTextStyle={s.axisText}
          formatYLabel={(v: string) => formatK(Number(v))}
          isAnimated
          animationDuration={700}
          width={SCREEN_W - 96}
          height={160}
          barBorderRadius={4}
          backgroundColor="transparent"
        />
      </View>

      {/* ── Legend ── */}
      <View style={s.legend}>
        <View style={s.legendItem}>
          <View style={[s.legendSwatch, { backgroundColor: C.barEarnings }]} />
          <Text style={s.legendText}>Earnings</Text>
        </View>
        <View style={s.legendDivider} />
        <View style={s.legendItem}>
          <View style={[s.legendSwatch, { backgroundColor: C.barSpending }]} />
          <Text style={s.legendText}>Spending</Text>
        </View>
      </View>

    </View>
  );
};

export default EarningVsSpendingCard;

// ── Styles ─────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  card: {
    backgroundColor: C.card,
    borderRadius:    20,
    borderWidth:     1,
    borderColor:     C.border,
    padding:         20,
    marginHorizontal: 16,
    marginVertical:  10,
    shadowColor:     C.gold,
    shadowOpacity:   0.06,
    shadowRadius:    20,
    shadowOffset:    { width: 0, height: 6 },
    elevation:       5,
  },

  // ── Header ──
  header: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   18,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           8,
  },
  titleAccent: {
    width:           3,
    height:          14,
    borderRadius:    2,
    backgroundColor: C.gold,
  },
  headerTitle: {
    color:         C.gold,
    fontSize:      11,
    fontWeight:    '700',
    letterSpacing: 2,
  },

  // ── Summary row ──
  summaryRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    gap:            8,
    marginBottom:   12,
  },
  summaryPill: {
    flex:            1,
    flexDirection:   'row',
    alignItems:      'center',
    gap:             8,
    backgroundColor: C.surface,
    borderWidth:     1,
    borderRadius:    14,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  pillDot: {
    width:        8,
    height:       8,
    borderRadius: 2,
  },
  pillLabel: {
    color:         C.textMuted,
    fontSize:      9,
    fontWeight:    '700',
    letterSpacing: 1.5,
    marginBottom:  2,
  },
  pillValue: {
    fontSize:   15,
    fontWeight: '800',
  },

  // ── Savings badge (centre) ──
  savingsBadge: {
    alignItems:      'center',
    justifyContent:  'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius:    14,
    borderWidth:     1,
    gap:             2,
  },
  savingsRateLabel: {
    color:         C.textMuted,
    fontSize:      8,
    fontWeight:    '700',
    letterSpacing: 1.5,
  },
  savingsRateValue: {
    fontSize:   16,
    fontWeight: '900',
  },

  // ── Net savings strip ──
  netStrip: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
    borderRadius:    12,
    borderWidth:     1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom:    14,
  },
  netLabel: {
    color:      C.textSecondary,
    fontSize:   12,
    fontWeight: '500',
  },
  netValue: {
    fontSize:   14,
    fontWeight: '800',
    letterSpacing: -0.3,
  },

  // ── Tooltip ──
  tooltip: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             8,
    backgroundColor: C.surface,
    borderWidth:     1,
    borderRadius:    12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom:    12,
  },
  tooltipPlaceholder: {
    height:       36,
    marginBottom: 12,
  },
  tooltipDot: {
    width:        8,
    height:       8,
    borderRadius: 4,
  },
  tooltipLabel: {
    color:      C.textSecondary,
    fontSize:   12,
    fontWeight: '600',
    flex:       1,
  },
  tooltipValue: {
    fontSize:   14,
    fontWeight: '800',
  },

  // ── Chart ──
  chartWrapper: {
    alignItems:   'center',
    marginLeft:   -8,
    marginBottom: 12,
  },
  axisText: {
    color:      C.textMuted,
    fontSize:   9,
    fontWeight: '600',
  },

  // ── Legend ──
  legend: {
    flexDirection:   'row',
    justifyContent:  'center',
    alignItems:      'center',
    gap:             16,
    borderTopWidth:  1,
    borderTopColor:  C.border,
    paddingTop:      14,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           6,
  },
  legendSwatch: {
    width:        10,
    height:       10,
    borderRadius: 2,
  },
  legendText: {
    color:      C.textSecondary,
    fontSize:   12,
    fontWeight: '600',
  },
  legendDivider: {
    width:           1,
    height:          14,
    backgroundColor: C.border,
  },

  // ── Empty state ──
  emptyWrap: {
    alignItems:     'center',
    justifyContent: 'center',
    paddingVertical: 40,
    position:       'relative',
  },
  ring: {
    position:     'absolute',
    borderRadius: 9999,
    borderWidth:  1,
  },
  ring1: {
    width:       96,
    height:      96,
    borderColor: C.gold + '25',
  },
  ring2: {
    width:       130,
    height:      130,
    borderColor: C.gold + '14',
  },
  ring3: {
    width:       166,
    height:      166,
    borderColor: C.gold + '08',
  },
  emptyIconWrap: {
    width:           80,
    height:          80,
    borderRadius:    9999,
    backgroundColor: C.goldMuted,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    18,
    zIndex:          1,
  },
  emptyTitle: {
    color:        C.textPrimary,
    fontSize:     16,
    fontWeight:   '700',
    marginBottom: 6,
  },
  emptySubtitle: {
    color:             C.textSecondary,
    fontSize:          13,
    fontWeight:        '400',
    textAlign:         'center',
    lineHeight:        20,
    paddingHorizontal: 12,
  },
});