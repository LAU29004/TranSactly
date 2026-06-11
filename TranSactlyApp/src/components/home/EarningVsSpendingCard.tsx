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

// ── Amber palette ──────────────────────────────────────────────────────────────
const AMBER = {
  earnings: '#F59E0B',   // amber-500 — bright, dominant
  spending: '#78350F',   // amber-900 — deep brown, clearly distinct
};

// ── Design tokens ──────────────────────────────────────────────────────────────
const C = {
  card: '#000000',
  border: '#D4AF37',
  textSecondary: '#D4AF37',
  textMuted: '#D4AF37',
  rule: '#2C1F0088',
};

interface EarningVsSpendingCardProps {
  data: EarningData[];
}

const formatK = (v: number) =>
  v >= 1000 ? `₹${(v / 1000).toFixed(0)}K` : `₹${v}`;

const EarningVsSpendingCard: React.FC<EarningVsSpendingCardProps> = ({ data }) => {
  const [activeBar, setActiveBar] = useState<{
    index: number;
    value: number;
    type: 'earnings' | 'spending';
  } | null>(null);

  const chartData = useMemo(() => {
    return data.flatMap((item, i) => [
      {
        value: item.earnings,
        frontColor: AMBER.earnings,
        gradientColor: '#FDE68A',
        showGradient: true,
        label: item.month,
        spacing: 6,
        labelWidth: 34,
        onPress: () =>
          setActiveBar(prev =>
            prev?.index === i && prev.type === 'earnings'
              ? null
              : { index: i, value: item.earnings, type: 'earnings' },
          ),
      },
      {
        value: item.spending,
        frontColor: AMBER.spending,
        gradientColor: '#92400E',
        showGradient: true,
        spacing: 18,
        onPress: () =>
          setActiveBar(prev =>
            prev?.index === i && prev.type === 'spending'
              ? null
              : { index: i, value: item.spending, type: 'spending' },
          ),
      },
    ]);
  }, [data]);

  const maxVal = useMemo(
    () => Math.max(...data.flatMap(d => [d.earnings, d.spending])),
    [data],
  );

  const totalEarnings = useMemo(() => data.reduce((s, d) => s + d.earnings, 0), [data]);
  const totalSpending = useMemo(() => data.reduce((s, d) => s + d.spending, 0), [data]);
  const savingsRate = totalEarnings
    ? Math.round(((totalEarnings - totalSpending) / totalEarnings) * 100)
    : 0;

  return (
    <View style={s.card}>
      {/* ── Header ── */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <View style={s.headerAccent} />
          <Text style={s.headerTitle}>EARNINGS VS SPENDING</Text>
        </View>
        <MaterialCommunityIcons name="chart-bar" size={15} color={C.textMuted} />
      </View>

      {/* ── Summary Pills ── */}
      <View style={s.summaryRow}>
        <View style={[s.summaryPill, { borderColor: AMBER.earnings + '50' }]}>
          <View style={[s.pillDot, { backgroundColor: AMBER.earnings }]} />
          <View>
            <Text style={s.pillLabel}>EARNINGS</Text>
            <Text style={[s.pillValue, { color: AMBER.earnings }]}>
              {formatK(totalEarnings)}
            </Text>
          </View>
        </View>

        <View style={s.savingsBadge}>
          <Text style={s.savingsLabel}>SAVED</Text>
          <Text style={s.savingsValue}>{savingsRate}%</Text>
        </View>

        <View style={[s.summaryPill, { borderColor: AMBER.spending + '50' }]}>
          <View style={[s.pillDot, { backgroundColor: AMBER.spending }]} />
          <View>
            <Text style={s.pillLabel}>SPENDING</Text>
            <Text style={[s.pillValue, { color: '#B45309' }]}>
              {formatK(totalSpending)}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Tooltip ── */}
      {activeBar && (
        <View
          style={[
            s.tooltip,
            {
              borderColor:
                activeBar.type === 'earnings'
                  ? AMBER.earnings + '60'
                  : AMBER.spending + '60',
            },
          ]}
        >
          <View
            style={[
              s.tooltipDot,
              {
                backgroundColor:
                  activeBar.type === 'earnings' ? AMBER.earnings : AMBER.spending,
              },
            ]}
          />
          <Text style={s.tooltipLabel}>
            {activeBar.type === 'earnings' ? 'Earnings' : 'Spending'} ·{' '}
            {data[activeBar.index]?.month}
          </Text>
          <Text
            style={[
              s.tooltipValue,
              {
                color: activeBar.type === 'earnings' ? AMBER.earnings : '#B45309',
              },
            ]}
          >
            {formatK(activeBar.value)}
          </Text>
        </View>
      )}

      {/* ── Bar Chart ── */}
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
          xAxisColor={C.border}
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
        />
      </View>

      {/* ── Legend ── */}
      <View style={s.legend}>
        <View style={s.legendItem}>
          <View style={[s.legendSwatch, { backgroundColor: AMBER.earnings }]} />
          <Text style={s.legendText}>Earnings</Text>
        </View>
        <View style={s.legendDivider} />
        <View style={s.legendItem}>
          <View style={[s.legendSwatch, { backgroundColor: AMBER.spending }]} />
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
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 10,
    shadowColor: '#F59E0B',
    shadowOpacity: 0.07,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerAccent: {
    width: 3,
    height: 14,
    borderRadius: 2,
    backgroundColor: '#F59E0B',
  },
  headerTitle: {
    color: C.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 8,
  },
  summaryPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ffffff06',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  pillDot: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  pillLabel: {
    color: C.textMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  pillValue: {
    fontSize: 15,
    fontWeight: '800',
  },
  savingsBadge: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#F59E0B15',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F59E0B30',
  },
  savingsLabel: {
    color: C.textMuted,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  savingsValue: {
    color: '#F59E0B',
    fontSize: 16,
    fontWeight: '900',
  },
  tooltip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2C1F00',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  tooltipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tooltipLabel: {
    color: C.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  tooltipValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  chartWrapper: {
    alignItems: 'center',
    marginLeft: -8,
    marginBottom: 12,
  },
  axisText: {
    color: C.textMuted,
    fontSize: 9,
    fontWeight: '600',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 14,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendSwatch: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  legendText: {
    color: C.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  legendDivider: {
    width: 1,
    height: 14,
    backgroundColor: C.border,
  },
});