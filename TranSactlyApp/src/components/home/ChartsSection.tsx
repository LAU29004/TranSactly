import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Space, Font, Radius } from '../../theme';
import {
  SpendingCategory,
  EarningData,
} from '../../utils/dashboardCalculations';
import { PermState } from '../../services/smsPermissions';
import SpendingBreakdownCard from './SpendingBreakdownCard';
import EarningVsSpendingCard from './EarningVsSpendingCard';
import EmptyState from './EmptyState';
import styles from '../../styles/home/ChartsSection.styles';

interface ChartsSectionProps {
  spendingCategories: SpendingCategory[];
  earningData: EarningData[];
  hasTransactions: boolean;
  permState: PermState;
  transactionCount: number;
}

const ChartsSection: React.FC<ChartsSectionProps> = ({
  spendingCategories,
  earningData,
  hasTransactions,
  permState,
  transactionCount,
}) => {
  return (
    <>
      {/* Spending Breakdown Chart */}
      {spendingCategories.length > 0 ? (
        <SpendingBreakdownCard categories={spendingCategories} />
      ) : (
        <View style={styles.noTxBox}>
          <MaterialCommunityIcons
            name="chart-pie"
            size={32}
            color={Colors.textMuted}
            style={{ marginBottom: Space.md }}
          />
          <Text style={styles.noTxText}>
            No transactions found in your SMS inbox.
          </Text>
        </View>
      )}

      {/* Earning vs Spending Chart */}
      {earningData.length > 0 ? (
        <EarningVsSpendingCard data={earningData} />
      ) : (
        <View style={styles.noTxBox}>
          <MaterialCommunityIcons
            name="chart-bar"
            size={32}
            color={Colors.textMuted}
            style={{ marginBottom: Space.md }}
          />
          <Text style={styles.noTxText}>
            No transactions found in your SMS inbox.
          </Text>
        </View>
      )}

      {/* Transactions header */}
      {permState === 'granted' && transactionCount > 0 && (
        <View style={[styles.sectionHeader, { marginTop: Space.xl }]}>
          <Text style={styles.sectionTitle}>RECENT ACTIVITY</Text>
        </View>
      )}
    </>
  );
};

export default ChartsSection;