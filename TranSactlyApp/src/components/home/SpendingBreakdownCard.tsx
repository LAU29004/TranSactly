import React, { useMemo } from 'react';
import { View, Text, Dimensions } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { PieChart } from 'react-native-gifted-charts';
import { Colors, Space, Radius } from '../../theme';
import { SpendingCategory } from '../../utils/dashboardCalculations';
import styles from '../../styles/home/SpendingBreakdownCard.styles';

const { width: SCREEN_W } = Dimensions.get('window');

interface SpendingBreakdownCardProps {
  categories: SpendingCategory[];
}

const formatCurrency = (
  amount: number,
) => {

  if (amount >= 1000) {

    return `₹${(
      amount / 1000
    ).toFixed(1)}K`;
  }

  return `₹${amount.toFixed(0)}`;
};

const SpendingBreakdownCard: React.FC<SpendingBreakdownCardProps> = ({
  categories,
}) => {
  const pieData = useMemo(
    () =>
      categories.map(cat => ({
        value: cat.amount,
        color: cat.color,
        text: `${cat.percent}%`,
      })),
    [categories],
  );

  if (categories.length === 0) {
  return (
    <View style={styles.chartSection}>
      <Text style={styles.chartTitle}>
        No spending data available
      </Text>
    </View>
  );
}

  const totalAmount = useMemo(
    () => categories.reduce((sum, cat) => sum + cat.amount, 0),
    [categories],
  );

  return (
    <View style={styles.chartSection}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>SPENDING BREAKDOWN</Text>
        <MaterialCommunityIcons
          name="information-outline"
          size={16}
          color={Colors.textMuted}
        />
      </View>

      <View style={styles.pieChartWrapper}>
        <View style={styles.pieChartContainer}>
          <PieChart
            data={pieData}
            donut
            radius={92}
            innerRadius={54}
            innerCircleColor={Colors.bgCard}
            textColor={Colors.textPrimary}
            textSize={11}
            focusOnPress
            showText
            isAnimated
          />
        </View>

        {/* Custom Legend Below Chart */}
        <View style={styles.customLegend}>
          {categories.map(cat => (
            <View key={cat.name} style={styles.legendRow}>
              <View
                style={[styles.legendColorBox, { backgroundColor: cat.color }]}
              />
              <View style={styles.legendContent}>
                <Text style={styles.legendCategoryName}>{cat.name}</Text>
                <Text style={styles.legendAmount}>
                  {formatCurrency(cat.amount)}
                </Text>
              </View>
              <View style={styles.legendPercentBox}>
                <Text style={styles.legendPercent}>{cat.percent}%</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Total Amount Display */}
        <View style={styles.totalAmountBox}>
          <Text style={styles.totalAmountLabel}>TOTAL SPENDING</Text>
          <Text style={styles.totalAmountValue}>
            ₹{(totalAmount / 1000).toFixed(1)}K
          </Text>
        </View>
      </View>

      {/* Category Details Grid */}
      <View style={styles.categoryDetailsGrid}>
        {categories.map(cat => (
          <View key={cat.name} style={styles.categoryDetailItem}>
            <View
              style={[styles.categoryDetailDot, { backgroundColor: cat.color }]}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.categoryDetailName}>{cat.name}</Text>
              <View style={styles.categoryDetailRow}>
                <MaterialCommunityIcons
                  name={cat.icon}
                  size={12}
                  color={Colors.textSecondary}
                />
                <Text style={styles.categoryDetailAmount}>
                  {formatCurrency(cat.amount)}
                </Text>
              </View>
            </View>
            <View style={styles.categoryDetailPercentBadge}>
              <Text style={styles.categoryDetailPercent}>{cat.percent}%</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default SpendingBreakdownCard;
