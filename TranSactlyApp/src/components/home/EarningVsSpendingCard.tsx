import React, { useMemo } from 'react';
import { View, Text, Dimensions } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { BarChart } from 'react-native-gifted-charts';
import { Colors, Space, Radius } from '../../theme';
import { EarningData } from '../../utils/dashboardCalculations';
import styles from '../../styles/home/EarningVsSpendingCard.styles';

const { width: SCREEN_W } = Dimensions.get('window');

interface EarningVsSpendingCardProps {
  data: EarningData[];
}

const EarningVsSpendingCard: React.FC<EarningVsSpendingCardProps> = ({
  data,
}) => {
  const chartData = useMemo(() => {
    return data.flatMap(item => [
      {
        value: item.earnings,
        frontColor: Colors.gold,
        label: item.month,
        spacing: 4,
        labelWidth: 30,
      },
      {
        value: item.spending,
        frontColor: '#E05C6B',
      },
    ]);
  }, [data]);

  return (
    <View style={styles.chartSection}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>EARNINGS VS SPENDING</Text>
        <MaterialCommunityIcons
          name="chart-line"
          size={16}
          color={Colors.textMuted}
        />
      </View>

      <View style={styles.barChartContainer}>
        <BarChart
          data={chartData}
          barWidth={16}
          spacing={22}
          roundedTop
          roundedBottom
          hideRules
          yAxisThickness={0}
          xAxisThickness={0}
          noOfSections={4}
          maxValue={Math.max(...chartData.map(d => d.value)) * 1.2}
          yAxisTextStyle={{
            color: Colors.textMuted,
            fontSize: 10,
          }}
          xAxisLabelTextStyle={{
            color: Colors.textMuted,
            fontSize: 10,
          }}
          isAnimated
        />
      </View>

      <View style={styles.chartLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.gold }]} />
          <Text style={styles.legendLabel}>Earnings</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#E05C6B' }]} />
          <Text style={styles.legendLabel}>Spending</Text>
        </View>
      </View>
    </View>
  );
};

export default EarningVsSpendingCard;
