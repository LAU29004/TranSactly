import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Transaction } from '../types/Transaction';

// ── Design Tokens ──────────────────────────────────────────────────────────────
const C = {
  card:          '#141A23',
  surface:       '#1E2636',
  border:        '#1F2937',

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
  warning:       '#F59E0B',
  warningMuted:  '#F59E0B20',
  teal:          '#14B8A6',
  tealMuted:     '#14B8A620',
  pink:          '#EC4899',
  pinkMuted:     '#EC489920',

  textPrimary:   '#FFFFFF',
  textSecondary: '#9CA3AF',
  textMuted:     '#4B5563',
};

// ── Category meta ──────────────────────────────────────────────────────────────
interface CategoryMeta { icon: string; color: string; bg: string; }

const CATEGORY_META: Record<string, CategoryMeta> = {
  Electronics:   { icon: 'laptop',                color: C.info,    bg: C.infoMuted    },
  Dining:        { icon: 'food-fork-drink',        color: C.warning, bg: C.warningMuted },
  Investments:   { icon: 'chart-line',             color: C.success, bg: C.successMuted },
  Travel:        { icon: 'airplane',               color: C.purple,  bg: C.purpleMuted  },
  Food:          { icon: 'food-apple-outline',     color: C.warning, bg: C.warningMuted },
  Income:        { icon: 'cash-multiple',          color: C.success, bg: C.successMuted },
  Subscriptions: { icon: 'refresh-circle',         color: C.purple,  bg: C.purpleMuted  },
  Groceries:     { icon: 'cart-outline',           color: C.teal,    bg: C.tealMuted    },
  Shopping:      { icon: 'shopping-outline',       color: C.pink,    bg: C.pinkMuted    },
  Healthcare:    { icon: 'hospital-box-outline',   color: C.danger,  bg: C.dangerMuted  },
  Education:     { icon: 'school-outline',         color: C.info,    bg: C.infoMuted    },
  Transport:     { icon: 'car-outline',            color: C.teal,    bg: C.tealMuted    },
  Utilities:     { icon: 'lightning-bolt-outline', color: C.gold,    bg: C.goldMuted    },
  Entertainment: { icon: 'movie-open-outline',     color: C.pink,    bg: C.pinkMuted    },
};

const FALLBACK: CategoryMeta = { icon: 'swap-horizontal', color: C.textSecondary, bg: C.surface };

// ── Formatters ─────────────────────────────────────────────────────────────────
const formatAmount = (n: number) =>
  n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatDate = (s: string) =>
  new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const formatTime = (s: string) =>
  new Date(s).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

// ── Props ──────────────────────────────────────────────────────────────────────
interface Props { transaction: Transaction; }

// ── Component ──────────────────────────────────────────────────────────────────
const TransactionCard: React.FC<Props> = memo(({ transaction }) => {
  const isCredit           = transaction.type === 'credit';
  const meta               = CATEGORY_META[transaction.category] ?? FALLBACK;
  const [intPart, decPart] = formatAmount(transaction.amount).split('.');

  return (
    <View style={s.card}>

      {/* ══════════════════════════════════════════════════════════════════════
          ROW 1 — icon  ·  merchant + category chip  ·  amount
      ══════════════════════════════════════════════════════════════════════ */}
      <View style={s.topRow}>
        {/* Category icon box */}
        <View style={[s.iconBox, { backgroundColor: meta.bg }]}>
          <MaterialCommunityIcons name={meta.icon} size={22} color={meta.color} />
        </View>

        {/* Merchant name + category chip */}
        <View style={s.merchantBlock}>
          <Text style={s.merchant} numberOfLines={1} ellipsizeMode="tail">
            {transaction.merchant}
          </Text>
          <View style={[s.categoryChip, { backgroundColor: meta.bg }]}>
            <MaterialCommunityIcons name={meta.icon} size={10} color={meta.color} />
            <Text style={[s.categoryText, { color: meta.color }]}>
              {transaction.category}
            </Text>
          </View>
        </View>

        {/* Amount — right-aligned, fixed min-width, never wraps */}
        <View style={s.amountBlock}>
          <View style={s.amountRow}>
            <Text style={[s.amountSign, { color: isCredit ? C.success : C.danger }]}>
              {isCredit ? '+' : '−'}
            </Text>
            <Text style={[s.amountInt, { color: isCredit ? C.success : C.textPrimary }]}>
              ₹{intPart}
            </Text>
            <Text style={[s.amountDec, { color: isCredit ? C.success + 'AA' : C.textMuted }]}>
              .{decPart}
            </Text>
          </View>
        </View>

      </View>

      {/* Thin separator */}
      <View style={s.separator} />

      {/* ══════════════════════════════════════════════════════════════════════
          ROW 2 — calendar icon · date · dot · clock icon · time  ·  CREDIT/DEBIT badge
      ══════════════════════════════════════════════════════════════════════ */}
      <View style={s.bottomRow}>

        {/* Date + time */}
        <View style={s.dateTimeBlock}>
          <MaterialCommunityIcons name="calendar-outline" size={12} color={C.textMuted} />
          <Text style={s.dateText}>{formatDate(transaction.date)}</Text>
          <View style={s.midDot} />
          <MaterialCommunityIcons name="clock-outline" size={12} color={C.textMuted} />
          <Text style={s.timeText}>{formatTime(transaction.date)}</Text>
        </View>

        {/* Credit / Debit pill — always right-aligned, never overlaps */}
        <View style={[
          s.typeBadge,
          {
            backgroundColor: isCredit ? C.successMuted : C.dangerMuted,
            borderColor:      isCredit ? C.success + '50' : C.danger + '50',
          },
        ]}>
          <View style={[s.typeDot, { backgroundColor: isCredit ? C.success : C.danger }]} />
          <Text style={[s.typeText, { color: isCredit ? C.success : C.danger }]}>
            {isCredit ? 'CREDIT' : 'DEBIT'}
          </Text>
        </View>

      </View>
    </View>
  );
});

TransactionCard.displayName = 'TransactionCard';
export default TransactionCard;

// ── Styles ─────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({

  // Card shell — two rows with a separator between them
  card: {
    backgroundColor:   C.card,
    borderRadius:      16,
    borderWidth:       1,
    borderColor:       C.border,
    marginHorizontal:  16,
    marginBottom:      10,
    paddingHorizontal: 14,
    paddingTop:        14,
    paddingBottom:     12,
  },

  // ── ROW 1 ──────────────────────────────────────────────────────────────────
  topRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           12,
  },

  iconBox: {
    width:           48,
    height:          48,
    borderRadius:    13,
    alignItems:      'center',
    justifyContent:  'center',
    flexShrink:      0,
  },

  merchantBlock: {
    flex:    1,        // takes all space between icon and amount
    minWidth: 0,       // required for numberOfLines truncation in flex child
    gap:     6,
  },
  merchant: {
    color:         C.textPrimary,
    fontSize:      15,
    fontWeight:    '700',
    letterSpacing: -0.2,
  },
  categoryChip: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             4,
    alignSelf:       'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius:    6,
  },
  categoryText: {
    fontSize:      10,
    fontWeight:    '700',
    letterSpacing: 0.3,
  },

  // Amount block — right column, enough min-width for ₹1,00,000.00
  amountBlock: {
    flexShrink: 0,
    minWidth:   100,
    alignItems: 'flex-end',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems:    'flex-end',
  },
  amountSign: {
    fontSize:    14,
    fontWeight:  '700',
    lineHeight:  26,
    marginRight: 1,
  },
  amountInt: {
    fontSize:      20,
    fontWeight:    '800',
    letterSpacing: -0.5,
    lineHeight:    26,
  },
  amountDec: {
    fontSize:     12,
    fontWeight:   '600',
    lineHeight:   22,
    marginBottom:  1,
  },

  // Separator between rows
  separator: {
    height:          1,
    backgroundColor: C.border,
    marginVertical:  11,
  },

  // ── ROW 2 ──────────────────────────────────────────────────────────────────
  bottomRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
  },

  dateTimeBlock: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           4,
    flex:          1,          // pushes badge to the right
    flexWrap:      'nowrap',
  },
  dateText: {
    color:      C.textSecondary,
    fontSize:   11,
    fontWeight: '500',
  },
  midDot: {
    width:           3,
    height:          3,
    borderRadius:    2,
    backgroundColor: C.textMuted,
    marginHorizontal: 2,
  },
  timeText: {
    color:      C.textMuted,
    fontSize:   11,
    fontWeight: '500',
  },

  // Credit / Debit pill — flexShrink:0 so it is NEVER squeezed by date text
  typeBadge: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius:    20,
    borderWidth:     1,
    flexShrink:      0,
    marginLeft:      8,
  },
  typeDot: {
    width:        5,
    height:       5,
    borderRadius: 3,
  },
  typeText: {
    fontSize:      9,
    fontWeight:    '800',
    letterSpacing: 1,
  },
});