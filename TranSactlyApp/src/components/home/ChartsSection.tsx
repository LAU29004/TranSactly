import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { SpendingCategory, EarningData } from '../../utils/dashboardCalculations';
import { PermState } from '../../services/smsPermissions';
import SpendingBreakdownCard from './SpendingBreakdownCard';
import EarningVsSpendingCard from './EarningVsSpendingCard';

// ── Design Tokens ──────────────────────────────────────────────────────────────
const C = {
  background:    '#0B0F17',
  card:          '#141A23',
  surface:       '#1E2636',
  border:        '#1F2937',

  gold:          '#D4AF37',
  goldMuted:     '#D4AF3733',
  purple:        '#8B5CF6',
  purpleMuted:   '#8B5CF620',

  textPrimary:   '#FFFFFF',
  textSecondary: '#9CA3AF',
  textMuted:     '#4B5563',
};

// ── Props — unchanged from original ───────────────────────────────────────────
interface ChartsSectionProps {
  spendingCategories: SpendingCategory[];
  earningData: EarningData[];
  hasTransactions: boolean;
  permState: PermState;
  transactionCount: number;
  homeData?: any;
}

// ── Component ──────────────────────────────────────────────────────────────────
const ChartsSection: React.FC<ChartsSectionProps> = ({
  spendingCategories,
  earningData,
  hasTransactions,
  permState,
  transactionCount,
}) => {
  const showRecentHeader =
    permState === 'granted' && transactionCount > 0;

  return (
    <>
      {/* ── Spending Breakdown ──
          Empty state is handled inside SpendingBreakdownCard itself.
          Always render so the card shows its own "No data" UI when empty. */}
      <SpendingBreakdownCard categories={spendingCategories} />

      {/* ── Earnings vs Spending ──
          Same pattern — empty state lives inside EarningVsSpendingCard. */}
      <EarningVsSpendingCard data={earningData} />

      {/* ── Recent Activity section header ──
          Only shown once there are transactions to scroll into. */}
      {showRecentHeader && (
        <View style={s.sectionHeader}>
          {/* Gold accent bar — same visual language as card title accents */}
          <View style={s.accent} />

          <Text style={s.sectionTitle}>REcent ACTIVITY</Text>

          {/* Transaction count badge */}
          <View style={s.countBadge}>
            <MaterialCommunityIcons
              name="swap-horizontal"
              size={11}
              color={C.gold}
            />
            <Text style={s.countText}>{transactionCount} txns</Text>
          </View>
        </View>
      )}
    </>
  );
};

export default ChartsSection;

// ── Styles ─────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  sectionHeader: {
    flexDirection:    'row',
    alignItems:       'center',
    gap:              10,
    marginTop:        24,
    marginBottom:     4,
    paddingHorizontal: 20,
  },

  // Gold vertical bar — mirrors the accent used in SpendingBreakdownCard header
  accent: {
    width:           3,
    height:          14,
    borderRadius:    2,
    backgroundColor: C.gold,
  },

  sectionTitle: {
    flex:          1,
    color:         C.gold,
    fontSize:      11,
    fontWeight:    '700',
    letterSpacing: 2,
  },

  // Subtle pill showing total transaction count
  countBadge: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             4,
    backgroundColor: C.goldMuted,
    borderRadius:    20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth:     1,
    borderColor:     C.gold + '30',
  },
  countText: {
    color:      C.gold,
    fontSize:   10,
    fontWeight: '700',
  },
});