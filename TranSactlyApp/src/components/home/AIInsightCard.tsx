import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ComparisonPeriod } from '../../utils/insights';
import SMSSourceBadge from './SMSSourceBadge';

// ── Amber shades per insight type ──────────────────────────────────────────────
const TYPE_PALETTE = {
  warn: {
    border:     '#D4AF37',   // amber-500 @ 31%
    bg:         '#000000',   // amber-500 @ 7%
    accent:     '#F59E0B',     // amber-500
    badge:      '#FCD34D',     // amber-300
    badgeBg:    '#F59E0B20',
  },
  alert: {
    border:     '#B4530960',   // amber-700 @ 38%
    bg:         '#000000',   // amber-700 @ 7%
    accent:     '#D4AF37',     // amber-700
    badge:      '#92400E',     // amber-800
    badgeBg:    '#B4530920',
  },
  info: {
    border:     '#D9770650',   // amber-600 @ 31%
    bg:         '#000000',   // amber-600 @ 7%
    accent:     '#D97706',     // amber-600
    badge:      '#FDE68A',     // amber-200
    badgeBg:    '#D9770620',
  },
};

// ── Design tokens ──────────────────────────────────────────────────────────────
const C = {
  card:          '#000000',
  cardPressed:   '#241800',
  border:        '#2C1F00',
  textPrimary:   '#D4AF37',
  textSecondary: '#D4AF37',
  textMuted:     '#D4AF37',
};

// ── Types ──────────────────────────────────────────────────────────────────────
interface AIInsightCardProps {
  icon: string;
  text: string;
  change: string;
  changePercent: number;
  period: ComparisonPeriod;
  category?: string;
  type: 'warn' | 'alert' | 'info';
  // cta: string;
}

const PERIOD_LABEL: Record<ComparisonPeriod, string> = {
  month:     'This Month',
  sixMonths: '6 Months',
  year:      'This Year',
};

// ── Component ──────────────────────────────────────────────────────────────────
const AIInsightCard: React.FC<AIInsightCardProps> = ({
  icon,
  text,
  change,
  changePercent,
  period,
  category,
  type,
  // cta,
}) => {
  const p = TYPE_PALETTE[type];
  const isPositive = changePercent > 0;
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.975, useNativeDriver: true, friction: 8 }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 8 }).start();

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    >
      <Animated.View
        style={[
          s.card,
          { borderColor: p.border, backgroundColor: C.card },
          { transform: [{ scale }] },
        ]}
      >
        {/* ── Top accent strip ── */}
        <View style={[s.topStrip, { backgroundColor: p.accent + '22' }]}>
          <View style={[s.stripPulse, { backgroundColor: p.accent }]} />
        </View>

        {/* ── Header row ── */}
        <View style={s.headerRow}>
          {/* Icon box */}
          <View style={[s.iconBox, { backgroundColor: p.bg, borderColor: p.border }]}>
            <MaterialCommunityIcons name={icon} size={18} color={p.accent} />
          </View>

          <View style={s.headerMeta}>
            {/* Type label */}
            <View style={[s.typeChip, { backgroundColor: p.badgeBg, borderColor: p.border }]}>
              <View style={[s.typeChipDot, { backgroundColor: p.accent }]} />
              <Text style={[s.typeChipText, { color: p.accent }]}>
                {type === 'warn' ? 'WARNING' : type === 'alert' ? 'ALERT' : 'INSIGHT'}
              </Text>
            </View>

            {/* Change badge */}
            <View style={[s.changeBadge, { backgroundColor: p.badgeBg, borderColor: p.border }]}>
              <Text style={[s.changeArrow, { color: isPositive ? '#F59E0B' : '#92400E' }]}>
                {isPositive ? '▲' : '▼'}
              </Text>
              <Text style={[s.changeText, { color: isPositive ? '#F59E0B' : '#B45309' }]}>
                {Math.abs(changePercent)}%
              </Text>
            </View>
          </View>
        </View>

        {/* ── Body text ── */}
        <Text style={s.body}>{text}</Text>

        {/* ── Category tag ── */}
        {category && (
          <View style={s.categoryRow}>
            <MaterialCommunityIcons
              name="tag-outline"
              size={11}
              color={p.accent}
            />
            <Text style={[s.categoryText, { color: p.accent }]}>{category}</Text>
          </View>
        )}

        {/* ── Divider ── */}
        <View style={s.divider} />

        {/* ── Meta row ── */}
        <View style={s.metaRow}>
          <View style={s.metaLeft}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={11}
              color={C.textMuted}
            />
            <Text style={s.metaPeriod}>vs {PERIOD_LABEL[period]}</Text>
          </View>
          <Text style={s.metaChange}>{change}</Text>
        </View>

        {/* ── CTA row ── */}
        {/* <View style={[s.ctaRow, { borderColor: p.border }]}>
          <Text style={[s.ctaText, { color: p.accent }]}>{cta}</Text>
          <View style={[s.ctaArrow, { backgroundColor: p.bg }]}>
            <MaterialCommunityIcons
              name="arrow-right"
              size={13}
              color={p.accent}
            />
          </View>
        </View> */}

        {/* ── SMS source ── */}
        <View style={s.badgeRow}>
          <SMSSourceBadge />
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default AIInsightCard;

// ── Styles ─────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
    shadowColor: '#F59E0B',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  // Accent strip at top
  topStrip: {
    height: 3,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  stripPulse: {
    width: 32,
    height: 3,
    borderRadius: 2,
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerMeta: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  typeChipDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  typeChipText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  changeArrow: {
    fontSize: 9,
    fontWeight: '900',
  },
  changeText: {
    fontSize: 12,
    fontWeight: '800',
  },

  // Body
  body: {
    color: '#FEF3C7',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
  },

  // Category
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 16,
    paddingBottom: 12,
    marginTop: 2,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: '#2C1F00',
    marginHorizontal: 16,
  },

  // Meta
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  metaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaPeriod: {
    color: '#92400E',
    fontSize: 11,
    fontWeight: '600',
  },
  metaChange: {
    color: '#D97706',
    fontSize: 11,
    fontWeight: '700',
  },

  // CTA
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: '#ffffff05',
  },
  ctaText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  ctaArrow: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Badge
  badgeRow: {
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
});