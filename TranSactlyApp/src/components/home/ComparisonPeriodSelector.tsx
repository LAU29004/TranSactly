import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { ComparisonPeriod } from '../../utils/insights';
import styles from '../../styles/home/ComparisonPeriodSelector.styles';

interface ComparisonPeriodSelectorProps {
  selected: ComparisonPeriod;
  onSelect: (period: ComparisonPeriod) => void;
}

const ComparisonPeriodSelector: React.FC<ComparisonPeriodSelectorProps> = ({
  selected,
  onSelect,
}) => (
  <View style={styles.periodSelector}>
    {(['month', 'sixMonths', 'year'] as ComparisonPeriod[]).map(period => (
      <TouchableOpacity
        key={period}
        style={[
          styles.periodBtn,
          selected === period && styles.periodBtnActive,
        ]}
        onPress={() => onSelect(period)}
        accessibilityLabel={`Filter by ${
          period === 'month'
            ? 'This Month'
            : period === 'sixMonths'
            ? '6 Months'
            : 'This Year'
        }`}
        accessibilityRole="radio"
        accessibilityState={{ selected: selected === period }}
      >
        <Text
          style={[
            styles.periodBtnText,
            selected === period && styles.periodBtnTextActive,
          ]}
        >
          {period === 'month'
            ? 'This Month'
            : period === 'sixMonths'
            ? '6 Months'
            : 'This Year'}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

export default ComparisonPeriodSelector;