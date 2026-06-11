import React, { useMemo, useState, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { PieChart } from 'react-native-gifted-charts';
import { SpendingCategory } from '../../utils/dashboardCalculations';

const { width: SCREEN_W } = Dimensions.get('window');

// ── Amber palette: 8 shades from lightest to richest ──────────────────────────
const AMBER_SHADES = [
  '#F59E0B', // amber-500  (brand anchor)
  '#D97706', // amber-600
  '#B45309', // amber-700
  '#92400E', // amber-800
  '#FCD34D', // amber-300
  '#FDE68A', // amber-200
  '#FBBF24', // amber-400
  '#78350F', // amber-900
];

// ── Tokens ─────────────────────────────────────────────────────────────────────
const C = {
  bg: '#000000',
  card: '#000000',
  border: '#D4AF37',
  amber: '#D4AF37',
  amberDim: '#D4AF37',
  textPrimary: '#FEF3C7',
  textSecondary: '#D4AF37',
  textMuted: '#D4AF37',
  white: '#FFFFFF',
};

// ── Helpers ────────────────────────────────────────────────────────────────────
const formatCurrency = (amount: number) =>
  amount >= 1000 ? `₹${(amount / 1000).toFixed(1)}K` : `₹${amount.toFixed(0)}`;

// ── Types ──────────────────────────────────────────────────────────────────────
interface SpendingBreakdownCardProps {
  categories: SpendingCategory[];
}

// ── Component ──────────────────────────────────────────────────────────────────
const SpendingBreakdownCard: React.FC<SpendingBreakdownCardProps> = ({
  categories,
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const labelOpacity = useRef(new Animated.Value(0)).current;
  const labelScale = useRef(new Animated.Value(0.8)).current;

  // Assign amber shades to each category
  const enriched = useMemo(
    () =>
      categories.map((cat, i) => ({
        ...cat,
        color: AMBER_SHADES[i % AMBER_SHADES.length],
      })),
    [categories],
  );

  const pieData = useMemo(
    () =>
      enriched.map((cat, i) => ({
        value: cat.amount,
        color: cat.color,
        focused: activeIndex === i,
      })),
    [enriched, activeIndex],
  );

  const totalAmount = useMemo(
    () => enriched.reduce((sum, c) => sum + c.amount, 0),
    [enriched],
  );

  const handlePress = (index: number) => {
    const isSame = activeIndex === index;
    setActiveIndex(isSame ? null : index);

    Animated.parallel([
      Animated.spring(labelOpacity, {
        toValue: isSame ? 0 : 1,
        useNativeDriver: true,
      }),
      Animated.spring(labelScale, {
        toValue: isSame ? 0.8 : 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const activeCategory = activeIndex !== null ? enriched[activeIndex] : null;

  if (enriched.length === 0) {
    return (
      <View style={s.card}>
        <Text style={s.emptyText}>No spending data available</Text>
      </View>
    );
  }

  return (
    <View style={s.card}>
      {/* ── Header ── */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <View style={s.headerAccent} />
          <Text style={s.headerTitle}>SPENDING BREAKDOWN</Text>
        </View>
        <MaterialCommunityIcons
          name="information-outline"
          size={15}
          color={C.textMuted}
        />
      </View>

      {/* ── Pie Chart (centered) ── */}
      <View style={s.chartWrapper}>
        {/* Glow ring */}
        <View style={s.glowRing} />

        <PieChart
          data={pieData}
          donut
          radius={100}
          innerRadius={62}
          innerCircleColor={C.card}
          focusOnPress
          onPress={(_item: any, index: number) => handlePress(index)}
          showText={false}
          isAnimated
          animationDuration={600}
          strokeColor={C.bg}
          strokeWidth={2}
        />

        {/* Center label — shows selected or total */}
        <View style={s.centerLabel} pointerEvents="none">
          {activeCategory ? (
            <Animated.View
              style={[
                s.centerLabelInner,
                { opacity: labelOpacity, transform: [{ scale: labelScale }] },
              ]}
            >
              <View
                style={[s.centerDot, { backgroundColor: activeCategory.color }]}
              />
              <Text style={s.centerCategoryName} numberOfLines={1}>
                {activeCategory.name}
              </Text>
              <Text style={s.centerAmount}>
                {formatCurrency(activeCategory.amount)}
              </Text>
              <Text style={s.centerPercent}>{activeCategory.percent}%</Text>
            </Animated.View>
          ) : (
            <View style={s.centerLabelInner}>
              <Text style={s.centerTotalLabel}>TOTAL</Text>
              <Text style={s.centerTotalValue}>
                {formatCurrency(totalAmount)}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* ── Legend ── */}
      <View style={s.legendGrid}>
        {enriched.map((cat, i) => {
          const isActive = activeIndex === i;
          return (
            <TouchableOpacity
              key={cat.name}
              activeOpacity={0.7}
              onPress={() => handlePress(i)}
              style={[s.legendItem, isActive && s.legendItemActive]}
            >
              <View style={s.legendLeft}>
                <View
                  style={[
                    s.legendSwatch,
                    { backgroundColor: cat.color },
                    isActive && s.legendSwatchActive,
                  ]}
                />
                <Text
                  style={[s.legendName, isActive && s.legendNameActive]}
                  numberOfLines={1}
                >
                  {cat.name}
                </Text>
              </View>
              <View style={s.legendRight}>
                <Text style={[s.legendAmt, isActive && s.legendAmtActive]}>
                  {formatCurrency(cat.amount)}
                </Text>
                <View
                  style={[
                    s.percentBadge,
                    isActive && { backgroundColor: cat.color + '33' },
                  ]}
                >
                  <Text
                    style={[s.percentText, isActive && { color: cat.color }]}
                  >
                    {cat.percent}%
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Progress Bars ── */}
      <View style={s.barsSection}>
        {enriched.map((cat, i) => (
          <View key={cat.name} style={s.barRow}>
            <Text style={s.barLabel} numberOfLines={1}>
              {cat.name}
            </Text>
            <View style={s.barTrack}>
              <Animated.View
                style={[
                  s.barFill,
                  {
                    width: `${cat.percent}%` as any,
                    backgroundColor: cat.color,
                    opacity: activeIndex === null || activeIndex === i ? 1 : 0.3,
                  },
                ]}
              />
            </View>
            <Text style={s.barPercent}>{cat.percent}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default SpendingBreakdownCard;

// ── Styles ─────────────────────────────────────────────────────────────────────
const PIE_SIZE = 200; // radius * 2

const s = StyleSheet.create({
  card: {
    backgroundColor: C.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 10,
    shadowColor: C.amber,
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
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
    backgroundColor: C.amber,
  },
  headerTitle: {
    color: C.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
  },

  // Chart
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  glowRing: {
    position: 'absolute',
    width: PIE_SIZE + 32,
    height: PIE_SIZE + 32,
    borderRadius: (PIE_SIZE + 32) / 2,
    borderWidth: 1,
    borderColor: C.amber + '18',
    backgroundColor: C.amber + '06',
  },
  centerLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
    pointerEvents: 'none',
  },
  centerLabelInner: {
    alignItems: 'center',
  },
  centerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginBottom: 4,
  },
  centerCategoryName: {
    color: C.textPrimary,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    maxWidth: 90,
    textAlign: 'center',
  },
  centerAmount: {
    color: C.amber,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  centerPercent: {
    color: C.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  centerTotalLabel: {
    color: C.textMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 4,
  },
  centerTotalValue: {
    color: C.textPrimary,
    fontSize: 20,
    fontWeight: '800',
  },

  // Legend grid
  legendGrid: {
    gap: 6,
    marginBottom: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: '#ffffff08',
  },
  legendItemActive: {
    borderColor: C.amber + '40',
    backgroundColor: C.amber + '0D',
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  legendSwatch: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  legendSwatchActive: {
    shadowColor: C.amber,
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  legendName: {
    color: C.textSecondary,
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  legendNameActive: {
    color: C.textPrimary,
    fontWeight: '700',
  },
  legendRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendAmt: {
    color: C.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  legendAmtActive: {
    color: C.amber,
  },
  percentBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#ffffff0A',
  },
  percentText: {
    color: C.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },

  // Progress bars
  barsSection: {
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 16,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barLabel: {
    color: C.textMuted,
    fontSize: 10,
    fontWeight: '600',
    width: 64,
    letterSpacing: 0.3,
  },
  barTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
  },
  barPercent: {
    color: C.textMuted,
    fontSize: 10,
    fontWeight: '700',
    width: 30,
    textAlign: 'right',
  },

  emptyText: {
    color: C.textMuted,
    textAlign: 'center',
    paddingVertical: 32,
    fontSize: 14,
  },
});