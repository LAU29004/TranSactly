import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Space } from '../../theme';
import { mockProfile } from '../../data/mockData';
import { DashboardStats } from '../../utils/dashboardCalculations';
import AIPulseDot from './AIPulseDot';
import MiniSparkBar from './MiniSparkBar';
import SMSSourceBadge from './SMSSourceBadge';
import styles from '../../styles/home/HomeHeader.styles';

const SPARK_HEIGHTS = [18, 28, 22, 36, 30, 42, 34];

interface HomeHeaderProps {
  dashboardStats: DashboardStats;
  heroFade: Animated.Value;
  heroSlide: Animated.Value;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({
  dashboardStats,
  heroFade,
  heroSlide,
}) => {
  return (
    <>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>AX</Text>
            </View>
            <View style={styles.avatarBadge} />
          </View>
          <View style={styles.aiProtectedPill}>
            <AIPulseDot />
            <Text style={styles.aiProtectedText}>AI PROTECTED</Text>
          </View>
        </View>
        <View style={styles.topRight}>
          {/* <TouchableOpacity
            style={styles.iconBtn}
            accessibilityLabel="View notifications"
            accessibilityRole="button"
          >
            <MaterialCommunityIcons
              name="bell-outline"
              size={18}
              color={Colors.textPrimary}
            />
            <View style={styles.notifBadge} accessible={false} />
          </TouchableOpacity> */}
        </View>
      </View>

      {/* Greeting */}
      <View style={styles.greetingBlock}>
        <Text style={styles.greetingSub}>GOOD EVENING</Text>
        <Text style={styles.greetingName}>Hello, User</Text>
        <Text style={styles.greetingDesc}>
          Your financial intelligence overview
        </Text>
      </View>

      {/* Hero Card */}
      <Animated.View
        style={[
          styles.heroCard,
          { opacity: heroFade, transform: [{ translateY: heroSlide }] },
        ]}
      >
        <Text style={styles.heroLabel}>TOTAL MONTHLY SPENDING</Text>
        <View style={styles.heroAmountRow}>
          <Text style={styles.heroCurrency}>₹</Text>
          <Text style={styles.heroAmount}>
            {Math.floor(dashboardStats.spending).toLocaleString('en-IN')}
          </Text>
          <Text style={styles.heroDecimal}>
            {' '}
            . {String(dashboardStats.spending.toFixed(2).split('.')[1])}{' '}
          </Text>
        </View>
        <View style={styles.heroMetaRow}>
          <View style={styles.heroChangePill}>
            <MaterialCommunityIcons
              name="trending-down"
              size={12}
              color="#3DCB7F"
            />
            <Text style={styles.heroChangePillText}>
              {dashboardStats.savingsRate >= 30
                ? 'Healthy savings rate'
                : 'Savings rate needs improvement'}
            </Text>
          </View>
        </View>

        <View style={styles.heroStatRow}>
          {[
            {
              label: 'INCOME',
              value: `₹${(dashboardStats.income / 1000).toFixed(0)}K`,
              positive: true,
              icon: 'cash-multiple',
            },
            {
              label: 'SAVINGS',
              value: `₹${(dashboardStats.savings / 1000).toFixed(1)}K`,
              positive: true,
              icon: 'piggy-bank-outline',
            },

            {
              label: 'TRANSACTIONS',
              value: `${dashboardStats.transactionCount}`,
              positive: true,
              icon: 'swap-horizontal',
            },
          ].map((s, i) => (
            <View
              key={i}
              style={[styles.heroStat, i < 2 && styles.heroStatBorder]}
            >
              <MaterialCommunityIcons
                name={s.icon}
                size={14}
                color={Colors.textSecondary}
                style={{ marginBottom: 4 }}
              />
              <Text style={styles.heroStatLabel}>{s.label}</Text>
              <Text
                style={[
                  styles.heroStatVal,
                  s.positive && { color: Colors.gold },
                ]}
              >
                {s.value}
              </Text>
            </View>
          ))}
        </View>

        <MiniSparkBar heights={SPARK_HEIGHTS} activeIndex={6} />
        <SMSSourceBadge />
      </Animated.View>
    </>
  );
};

export default HomeHeader;
