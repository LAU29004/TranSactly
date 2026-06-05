import React from 'react';
import { View, Text } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../theme';
import { ComparisonPeriod } from '../../utils/insights';
import SMSSourceBadge from './SMSSourceBadge';
import styles from '../../styles/home/AIInsightCard.styles';

interface AIInsightCardProps {
  icon: string;
  text: string;
  change: string;
  changePercent: number;
  period: ComparisonPeriod;
  category?: string;
  type: 'warn' | 'alert' | 'info';
  cta: string;
}

const AIInsightCard: React.FC<AIInsightCardProps> = ({
  icon,
  text,
  change,
  changePercent,
  period,
  category,
  type,
  cta,
}) => {
  const isPositive = changePercent > 0;
  const colorMap = {
    warn: {
      border: Colors.goldBorder,
      bg: Colors.goldMuted,
      text: Colors.gold,
    },
    alert: {
      border: 'rgba(224,92,107,0.3)',
      bg: 'rgba(224,92,107,0.08)',
      text: '#E05C6B',
    },
    info: {
      border: 'rgba(77,158,245,0.3)',
      bg: 'rgba(77,158,245,0.08)',
      text: '#4D9EF5',
    },
  };
  const c = colorMap[type];
  const periodLabel = {
    month: 'This Month',
    sixMonths: '6 Months',
    year: 'This Year',
  }[period];

  return (
    <View style={[styles.insightCard, { borderColor: c.border }]}>
      <View style={styles.insightCardTop}>
        <View style={[styles.insightIconBox, { backgroundColor: c.bg }]}>
          <MaterialCommunityIcons name={icon} size={16} color={c.text} />
        </View>
        <View
          style={[
            styles.insightConfPill,
            { backgroundColor: c.bg, borderColor: c.border },
          ]}
        >
          <Text style={[styles.insightConfText, { color: c.text }]}>
            {isPositive ? '↑' : '↓'} {Math.abs(changePercent)}%
          </Text>
        </View>
      </View>
      <Text style={styles.insightBody}>{text}</Text>
      {category && (
        <Text style={[styles.insightCategory, { color: c.text }]}>
          {category}
        </Text>
      )}
      <View style={styles.insightMetaRow}>
        <Text style={[styles.insightMeta, { color: Colors.textSecondary }]}>
          {change}
        </Text>
        <Text style={[styles.insightMeta, { color: Colors.textMuted }]}>
          vs {periodLabel}
        </Text>
      </View>
      <Text style={[styles.insightCta, { color: c.text }]}>{cta} →</Text>
      <SMSSourceBadge />
    </View>
  );
};

export default AIInsightCard;