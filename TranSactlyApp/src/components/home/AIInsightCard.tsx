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

// ── Design Tokens ──────────────────────────────────────────────────────────────
const C = {
  card:          '#141A23',
  surface:       '#1E2636',
  border:        '#1F2937',
  borderLight:   '#374151',

  gold:          '#D4AF37',
  goldMuted:     '#D4AF3733',
  purple:        '#8B5CF6',
  purpleMuted:   '#8B5CF620',
  success:       '#10B981',
  successMuted:  '#10B98120',
  danger:        '#EF4444',
  dangerMuted:   '#EF444420',
  info:          '#3B82F6',
  infoMuted:     '#3B82F620',

  textPrimary:   '#FFFFFF',
  textSecondary: '#9CA3AF',
  textMuted:     '#4B5563',
};

// ── Per-type palette — maps insight type onto theme tokens ─────────────────────
const TYPE_PALETTE = {
  warn: {
    accent:    C.gold,
    accentBg:  C.goldMuted,
    border:    C.gold + '50',
    stripBg:   C.gold + '18',
    label:     'WARNING',
  },
  alert: {
    accent:    C.danger,
    accentBg:  C.dangerMuted,
    border:    C.danger + '50',
    stripBg:   C.danger + '18',
    label:     'ALERT',
  },
  info: {
    accent:    C.info,
    accentBg:  C.infoMuted,
    border:    C.info + '50',
    stripBg:   C.info + '18',
    label:     'INSIGHT',
  },
} as const;

// ── Types ──────────────────────────────────────────────────────────────────────
interface AIInsightCardProps {
  icon:           string;
  text:           string;
  change:         string;
  changePercent:  number;
  period:         ComparisonPeriod;
  category?:      string;
  type:           'warn' | 'alert' | 'info';
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
}) => {
  const p           = TYPE_PALETTE[type];
  const isPositive  = changePercent > 0;
  const changeColor = isPositive ? C.danger : C.success;   // ↑ spending = bad, ↓ = good
  const changeIcon  = isPositive ? 'trending-up' : 'trending-down';

  // Press-scale animation — unchanged from original
  const scale = useRef(new Animated.Value(1)).current;
  const onPressIn  = () =>
    Animated.spring(scale, { toValue: 0.975, useNativeDriver: true, friction: 8 }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1,     useNativeDriver: true, friction: 8 }).start();

  return (
    <TouchableOpacity activeOpacity={1} onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View
        style={[
          s.card,
          { borderColor: p.border },
          { transform: [{ scale }] },
        ]}
      >
        {/* ── Top accent strip ── */}
        <View style={[s.topStrip, { backgroundColor: p.stripBg }]}>
          <View style={[s.stripPulse, { backgroundColor: p.accent }]} />
        </View>

        <View style={s.inner}>

          {/* ── Header row ── */}
          <View style={s.headerRow}>

            {/* Icon box */}
            <View style={[s.iconBox, { backgroundColor: p.accentBg, borderColor: p.border }]}>
              <MaterialCommunityIcons name={icon} size={18} color={p.accent} />
            </View>

            <View style={s.headerMeta}>
              {/* Type chip */}
              <View style={[s.typeChip, { backgroundColor: p.accentBg, borderColor: p.border }]}>
                <View style={[s.typeChipDot, { backgroundColor: p.accent }]} />
                <Text style={[s.typeChipText, { color: p.accent }]}>{p.label}</Text>
              </View>

              {/* Change badge */}
              <View style={[
                s.changeBadge,
                { backgroundColor: changeColor + '18', borderColor: changeColor + '40' },
              ]}>
                <MaterialCommunityIcons name={changeIcon} size={11} color={changeColor} />
                <Text style={[s.changeText, { color: changeColor }]}>
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
              <MaterialCommunityIcons name="tag-outline" size={11} color={p.accent} />
              <Text style={[s.categoryText, { color: p.accent }]}>{category}</Text>
            </View>
          )}

          {/* ── Divider ── */}
          <View style={s.divider} />

          {/* ── Meta row ── */}
          <View style={s.metaRow}>
            <View style={s.metaLeft}>
              <MaterialCommunityIcons name="clock-outline" size={11} color={C.textMuted} />
              <Text style={s.metaPeriod}>vs {PERIOD_LABEL[period]}</Text>
            </View>
            <Text style={[s.metaChange, { color: p.accent }]}>{change}</Text>
          </View>

          {/* ── SMS source badge ── */}
          <View style={s.badgeRow}>
            <SMSSourceBadge />
          </View>

        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default AIInsightCard;

// ── Styles ─────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  card: {
    backgroundColor:  C.card,
    borderRadius:     16,
    borderWidth:      1,
    marginHorizontal: 16,
    marginVertical:   8,
    overflow:         'hidden',
    shadowColor:      C.gold,
    shadowOpacity:    0.06,
    shadowRadius:     16,
    shadowOffset:     { width: 0, height: 4 },
    elevation:        4,
  },

  // Top accent strip
  topStrip: {
    height:        3,
    width:         '100%',
    flexDirection: 'row',
    alignItems:    'center',
  },
  stripPulse: {
    width:        36,
    height:       3,
    borderRadius: 2,
  },

  // Content wrapper with consistent padding
  inner: {
    paddingHorizontal: 16,
    paddingTop:        14,
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           12,
    marginBottom:  4,
  },
  iconBox: {
    width:           40,
    height:          40,
    borderRadius:    10,
    borderWidth:     1,
    alignItems:      'center',
    justifyContent:  'center',
  },
  headerMeta: {
    flex:           1,
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
  },

  // Type chip
  typeChip: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             5,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius:    6,
    borderWidth:     1,
  },
  typeChipDot: {
    width:        5,
    height:       5,
    borderRadius: 3,
  },
  typeChipText: {
    fontSize:      9,
    fontWeight:    '800',
    letterSpacing: 1.2,
  },

  // Change badge
  changeBadge: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius:    6,
    borderWidth:     1,
  },
  changeText: {
    fontSize:   12,
    fontWeight: '800',
  },

  // Body
  body: {
    color:       C.textPrimary,
    fontSize:    14,
    fontWeight:  '500',
    lineHeight:  21,
    paddingTop:  10,
    paddingBottom: 4,
  },

  // Category
  categoryRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           5,
    paddingBottom: 12,
    marginTop:     2,
  },
  categoryText: {
    fontSize:      11,
    fontWeight:    '700',
    letterSpacing: 0.4,
  },

  // Divider
  divider: {
    height:          1,
    backgroundColor: C.border,
  },

  // Meta
  metaRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  metaLeft: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           5,
  },
  metaPeriod: {
    color:      C.textMuted,
    fontSize:   11,
    fontWeight: '600',
  },
  metaChange: {
    fontSize:   11,
    fontWeight: '700',
  },

  // Badge
  badgeRow: {
    paddingBottom: 14,
  },
});