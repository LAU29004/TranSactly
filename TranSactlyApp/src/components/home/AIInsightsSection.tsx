import React, { useMemo } from 'react';
import { View, ScrollView, Text, Dimensions } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Space } from '../../theme';
import { ComparisonPeriod, InsightObject } from '../../utils/insights';
import ComparisonPeriodSelector from './ComparisonPeriodSelector';
import AIInsightCard from './AIInsightCard';
import styles from '../../styles/home/AIInsightsSection.styles';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_W * 0.75;
const CARD_SPACING = Space.sm;

interface AIInsightsSectionProps {
  insights: InsightObject[];
  period: ComparisonPeriod;
  onPeriodChange: (period: ComparisonPeriod) => void;
}

const AIInsightsSection: React.FC<AIInsightsSectionProps> = ({
  insights,
  period,
  onPeriodChange,
}) => {
  return (
    <>
      {/* Comparison Period Selector */}
      <ComparisonPeriodSelector selected={period} onSelect={onPeriodChange} />

      {/* AI Insights Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <MaterialCommunityIcons
            name="lightbulb-on-outline"
            size={16}
            color={Colors.gold}
          />
          <Text style={styles.sectionTitle}>AI INSIGHTS</Text>
        </View>
        <Text style={styles.sectionAction}>{insights.length} ACTIVE</Text>
      </View>

      {/* Insights Carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        decelerationRate="fast"
        contentContainerStyle={styles.insightScroll}
        accessibilityLabel="AI-generated financial insights carousel"
      >
        {insights.map((ins, i) => (
          <AIInsightCard
            key={i}
            icon={ins.icon}
            text={ins.text}
            change={ins.change}
            changePercent={ins.changePercent}
            period={period}
            category={ins.category}
            type={ins.type}
            // cta={ins.cta}
          />
        ))}
      </ScrollView>
    </>
  );
};

export default AIInsightsSection;