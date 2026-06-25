import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SpendingCategory } from '../../utils/dashboardCalculations';

// ── Design Tokens ──────────────────────────────────────────────────────────────
const C = {
  background:    '#0B0F17',
  card:          '#141A23',
  surface:       '#1E2636',
  border:        '#1F2937',
  borderLight:   '#374151',

  gold:          '#D4AF37',
  goldMuted:     '#D4AF3733',
  goldLight:     '#F0D060',
  purple:        '#8B5CF6',
  purpleMuted:   '#8B5CF620',

  success:       '#10B981',
  successMuted:  '#10B98120',
  danger:        '#EF4444',
  dangerMuted:   '#EF444420',
  info:          '#3B82F6',
  infoMuted:     '#3B82F620',
  warning:       '#F59E0B',
  warningMuted:  '#F59E0B20',

  textPrimary:   '#FFFFFF',
  textSecondary: '#9CA3AF',
  textMuted:     '#4B5563',
};

// ── Category color palette — cycles through 8 distinct hues ───────────────────
const CATEGORY_PALETTE = [
  C.gold,      // #D4AF37 — gold
  C.purple,    // #8B5CF6 — violet
  C.success,   // #10B981 — emerald
  C.info,      // #3B82F6 — blue
  C.danger,    // #EF4444 — red
  C.warning,   // #F59E0B — amber
  '#EC4899',   // pink
  '#14B8A6',   // teal
];

// ── Category → MaterialCommunityIcons icon name ────────────────────────────────
const CATEGORY_ICONS: Record<string, string> = {
  'Food':             'food-fork-drink',
  'Shopping':         'shopping-outline',
  'Travel':           'airplane',
  'Entertainment':    'movie-open-outline',
  'Healthcare':       'hospital-box-outline',
  'Education':        'school-outline',
  'Utilities':        'lightning-bolt-outline',
  'Transport':        'car-outline',
  'Home Improvement': 'hammer-wrench',
  'Other':            'dots-horizontal-circle-outline',
};

const getIcon = (name: string): string =>
  CATEGORY_ICONS[name] ?? 'tag-outline';

const formatCurrency = (amount: number): string =>
  amount >= 1_00_000
    ? `₹${(amount / 1_00_000).toFixed(1)}L`
    : amount >= 1_000
    ? `₹${(amount / 1_000).toFixed(1)}K`
    : `₹${amount.toFixed(0)}`;

// ── Props ──────────────────────────────────────────────────────────────────────
interface SpendingBreakdownCardProps {
  categories: SpendingCategory[];
}

// ── Component ──────────────────────────────────────────────────────────────────
const SpendingBreakdownCard: React.FC<SpendingBreakdownCardProps> = ({
  categories,
}) => {
  // Enrich with stable colors, sort descending by amount
  const enriched = useMemo(
    () =>
      [...categories]
        .sort((a, b) => b.amount - a.amount)
        .map((cat, i) => ({
          ...cat,
          color:     CATEGORY_PALETTE[i % CATEGORY_PALETTE.length],
          icon:      getIcon(cat.name),
          colorMuted: CATEGORY_PALETTE[i % CATEGORY_PALETTE.length] + '22',
        })),
    [categories],
  );

  const maxAmount = useMemo(
    () => (enriched.length > 0 ? enriched[0].amount : 1),
    [enriched],
  );

  const totalAmount = useMemo(
    () => enriched.reduce((s, c) => s + c.amount, 0),
    [enriched],
  );

  // ── Empty state ──────────────────────────────────────────────────────────────
  if (enriched.length === 0) {
    return (
      <View style={s.card}>
        <View style={s.header}>
          <View style={s.titleRow}>
            <View style={s.titleAccent} />
            <Text style={s.headerTitle}>SPENDING BREAKDOWN</Text>
          </View>
          <MaterialCommunityIcons
            name="chart-bar"
            size={15}
            color={C.gold}
          />
        </View>

        <View style={s.emptyWrap}>
          {/* Concentric rings */}
          <View style={[s.ring, s.ring3]} />
          <View style={[s.ring, s.ring2]} />
          <View style={[s.ring, s.ring1]} />

          <View style={s.emptyIconWrap}>
            <MaterialCommunityIcons
              name="chart-timeline-variant-shimmer"
              size={36}
              color={C.purple}
            />
          </View>
          <Text style={s.emptyTitle}>No Spending Data</Text>
          <Text style={s.emptySubtitle}>
            Transactions will appear here once your SMS inbox is scanned.
          </Text>
        </View>
      </View>
    );
  }

  // ── Main render ──────────────────────────────────────────────────────────────
  return (
    <View style={s.card}>

      {/* ── Header ── */}
      <View style={s.header}>
        <View style={s.titleRow}>
          <View style={s.titleAccent} />
          <Text style={s.headerTitle}>SPENDING BREAKDOWN</Text>
        </View>
        <MaterialCommunityIcons
          name="chart-bar"
          size={15}
          color={C.gold}
        />
      </View>

      {/* ── Total summary pill ── */}
      <View style={s.totalPill}>
        <View style={s.totalLeft}>
          <View style={s.totalIconWrap}>
            <MaterialCommunityIcons
              name="swap-horizontal-bold"
              size={14}
              color={C.gold}
            />
          </View>
          <View>
            <Text style={s.totalLabel}>TOTAL SPEND</Text>
            <Text style={s.totalValue}>{formatCurrency(totalAmount)}</Text>
          </View>
        </View>
        <View style={s.totalRight}>
          <Text style={s.totalCatCount}>{enriched.length}</Text>
          <Text style={s.totalCatLabel}>categories</Text>
        </View>
      </View>

      {/* ── Ranked horizontal bars ── */}
      <View style={s.barList}>
        {enriched.map((cat, index) => {
          const fillRatio  = maxAmount > 0 ? cat.amount / maxAmount : 0;
          const fillWidth  = `${Math.max(4, fillRatio * 100)}%` as `${number}%`;

          return (
            <View key={cat.name} style={s.barItem}>

              {/* Row 1: rank + icon + name + amount */}
              <View style={s.barMeta}>
                <Text style={s.barRank}>#{index + 1}</Text>

                <View style={[s.barIcon, { backgroundColor: cat.colorMuted }]}>
                  <MaterialCommunityIcons
                    name={cat.icon}
                    size={13}
                    color={cat.color}
                  />
                </View>

                <Text style={s.barName} numberOfLines={1}>
                  {cat.name}
                </Text>

                <View style={s.barRight}>
                  <Text style={[s.barAmount, { color: cat.color }]}>
                    {formatCurrency(cat.amount)}
                  </Text>
                  <View style={[s.percentBadge, { backgroundColor: cat.color + '18' }]}>
                    <Text style={[s.percentText, { color: cat.color }]}>
                      {cat.percent}%
                    </Text>
                  </View>
                </View>
              </View>

              {/* Row 2: fill bar */}
              <View style={s.barTrackRow}>
                {/* spacer aligns track under the label (rank + icon widths) */}
                <View style={s.barTrackSpacer} />
                <View style={s.barTrack}>
                  <View
                    style={[
                      s.barFill,
                      { width: fillWidth, backgroundColor: cat.color },
                    ]}
                  />
                </View>
              </View>

              {/* Divider — skip after last item */}
              {index < enriched.length - 1 && (
                <View style={s.barDivider} />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default SpendingBreakdownCard;

// ── Styles ─────────────────────────────────────────────────────────────────────
const RANK_W  = 22;
const ICON_W  = 26;
const GAP     = 8;
const SPACER  = RANK_W + ICON_W + GAP * 2; // keeps bar aligned under label

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
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'center',
    marginBottom:    18,
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

  // ── Total pill ──
  totalPill: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
    backgroundColor: C.surface,
    borderRadius:    14,
    borderWidth:     1,
    borderColor:     C.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom:    20,
  },
  totalLeft: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           10,
  },
  totalIconWrap: {
    width:           34,
    height:          34,
    borderRadius:    10,
    backgroundColor: C.goldMuted,
    alignItems:      'center',
    justifyContent:  'center',
  },
  totalLabel: {
    color:         C.textMuted,
    fontSize:      9,
    fontWeight:    '700',
    letterSpacing: 1.5,
    marginBottom:  2,
  },
  totalValue: {
    color:      C.textPrimary,
    fontSize:   17,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  totalRight: {
    alignItems: 'flex-end',
  },
  totalCatCount: {
    color:      C.gold,
    fontSize:   22,
    fontWeight: '900',
    letterSpacing: -1,
  },
  totalCatLabel: {
    color:      C.textMuted,
    fontSize:   10,
    fontWeight: '600',
  },

  // ── Bar list ──
  barList: {
    gap: 0,
  },
  barItem: {
    gap: 6,
  },

  // Meta row: rank + icon + name + amount
  barMeta: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           GAP,
  },
  barRank: {
    color:      C.textMuted,
    fontSize:   11,
    fontWeight: '700',
    width:      RANK_W,
    textAlign:  'right',
  },
  barIcon: {
    width:           ICON_W,
    height:          ICON_W,
    borderRadius:    7,
    alignItems:      'center',
    justifyContent:  'center',
  },
  barName: {
    flex:       1,
    color:      C.textSecondary,
    fontSize:   13,
    fontWeight: '600',
  },
  barRight: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           6,
  },
  barAmount: {
    fontSize:   13,
    fontWeight: '700',
  },
  percentBadge: {
    paddingHorizontal: 6,
    paddingVertical:   2,
    borderRadius:      6,
  },
  percentText: {
    fontSize:   10,
    fontWeight: '700',
  },

  // Track row: spacer + fill bar
  barTrackRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           GAP,
  },
  barTrackSpacer: {
    width: SPACER,
  },
  barTrack: {
    flex:            1,
    height:          6,
    backgroundColor: C.surface,
    borderRadius:    3,
    overflow:        'hidden',
  },
  barFill: {
    height:       '100%',
    borderRadius: 3,
  },

  barDivider: {
    height:          1,
    backgroundColor: C.border,
    marginVertical:  10,
    marginLeft:      SPACER + GAP,
  },

  // ── Empty state ──
  emptyWrap: {
    alignItems:    'center',
    justifyContent:'center',
    paddingVertical: 40,
    position:      'relative',
  },
  ring: {
    position:     'absolute',
    borderRadius: 9999,
    borderWidth:  1,
  },
  ring1: {
    width:       96,
    height:      96,
    borderColor: C.purple + '25',
  },
  ring2: {
    width:       130,
    height:      130,
    borderColor: C.purple + '14',
  },
  ring3: {
    width:       166,
    height:      166,
    borderColor: C.purple + '08',
  },
  emptyIconWrap: {
    width:           80,
    height:          80,
    borderRadius:    9999,
    backgroundColor: C.purpleMuted,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    18,
    zIndex:          1,
  },
  emptyTitle: {
    color:      C.textPrimary,
    fontSize:   16,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySubtitle: {
    color:      C.textSecondary,
    fontSize:   13,
    fontWeight: '400',
    textAlign:  'center',
    lineHeight: 20,
    paddingHorizontal: 12,
  },
});