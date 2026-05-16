import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Transaction } from '../types/Transaction';
import { Colors, Space, Radius, Font } from '../theme';

interface Props {
  transaction: Transaction;
}

// SVG-style category initials with colored backgrounds
const categoryMeta: Record<string, { abbr: string; bg: string; fg: string }> = {
  Electronics:   { abbr: 'EL', bg: '#1E2A3A', fg: '#5B9BD5' },
  Dining:        { abbr: 'DN', bg: '#2A1E1E', fg: '#D57B5B' },
  Investments:   { abbr: 'IN', bg: '#1A2A1E', fg: '#5BD5A0' },
  Travel:        { abbr: 'TR', bg: '#251E2A', fg: '#A05BD5' },
  Food:          { abbr: 'FD', bg: '#2A2118', fg: '#D5A55B' },
  Income:        { abbr: 'IC', bg: '#1A2A1E', fg: '#3DAA72' },
  Subscriptions: { abbr: 'SB', bg: '#1E1E2A', fg: '#6B7FD5' },
  Groceries:     { abbr: 'GR', bg: '#1E2A22', fg: '#5BD598' },
};

const formatAmount = (amount: number) =>
  amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const TransactionCard: React.FC<Props> = ({ transaction }) => {
  const isCredit = transaction.type === 'credit';
  const meta = categoryMeta[transaction.category] ?? { abbr: 'TX', bg: '#222', fg: Colors.textSecondary };

  return (
    <View style={styles.card}>
      {/* Icon */}
      <View style={[styles.iconBox, { backgroundColor: meta.bg }]}>
        <Text style={[styles.iconText, { color: meta.fg }]}>{meta.abbr}</Text>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.merchant} numberOfLines={1}>{transaction.merchant}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.category}>{transaction.category.toUpperCase()}</Text>
          <Text style={styles.dot}> · </Text>
          <Text style={styles.date}>{formatDate(transaction.date)}</Text>
        </View>
      </View>

      {/* Amount */}
      <View style={styles.amountCol}>
        <Text style={[styles.sign, { color: isCredit ? Colors.credit : Colors.debit }]}>
          {isCredit ? '+' : '−'}
        </Text>
        <Text style={[styles.amount, { color: isCredit ? Colors.credit : Colors.textPrimary }]}>
          ₹{formatAmount(transaction.amount)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    paddingVertical: Space.md,
    paddingHorizontal: Space.lg,
    marginBottom: Space.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Space.md,
  },
  iconText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  merchant: {
    ...Font.labelL,
    color: Colors.textPrimary,
    fontSize: 14,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  category: {
    ...Font.labelS,
    color: Colors.textMuted,
  },
  dot: {
    color: Colors.textMuted,
    fontSize: 10,
  },
  date: {
    ...Font.labelS,
    color: Colors.textSecondary,
    letterSpacing: 0.3,
  },
  amountCol: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginLeft: Space.sm,
  },
  sign: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 1,
    marginRight: 1,
  },
  amount: {
    ...Font.numM,
    fontSize: 15,
  },
});

export default TransactionCard;