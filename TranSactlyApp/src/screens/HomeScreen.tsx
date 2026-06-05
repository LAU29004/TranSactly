import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  FlatList,
  StatusBar,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { parseSMSIntoTransactions } from '../services/readSms';
import TransactionCard from '../components/TransactionCard';
import { mockProfile } from '../data/mockData';
import { Colors, Space } from '../theme';
import { useTransactions } from '../context/TransactionContext';

import {
  checkSmsPermission,
  requestSmsPermission,
  type PermState,
} from '../services/smsPermissions';
import { generateAIInsights , type ComparisonPeriod } from '../utils/insights';
import {
  calculateDashboardStats,
  filterTransactionsByPeriod,
  generateSpendingCategories,
  generateEarningData,
} from '../utils/dashboardCalculations';

import HomeHeader from '../components/home/HomeHeader';
import AIInsightsSection from '../components/home/AIInsightsSection';
import ChartsSection from '../components/home/ChartsSection';
import FloatingActionButton from '../components/home/FloatingActionButton';
import EmptyState from '../components/home/EmptyState';
import SecurityStatusCard from '../components/home/SecurityStatusCard';

import styles from '../styles/HomeScreen.styles';

const { width: SCREEN_W } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [permState, setPermState] = useState<PermState>('checking');
  const [comparisonPeriod, setComparisonPeriod] =
    useState<ComparisonPeriod>('month');
  const { transactions, setTransactions } = useTransactions();

  const heroFade = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(16)).current;

  // Load transactions on mount
console.log(
  'HOME TRANSACTIONS:',
  transactions,
);

useEffect(() => {

  const loadTransactions = async () => {

    try {

      // Wait for permission

      if (permState !== 'granted') {
        return;
      }

      // Avoid duplicate reloads

      if (transactions.length > 0) {
        return;
      }

      const parsed =
        await parseSMSIntoTransactions();

      console.log(
        'HOME TRANSACTIONS:',
        parsed.length,
      );

      setTransactions(parsed);

    } catch (e) {

      console.log(
        'HOME SMS LOAD ERROR:',
        e,
      );
    }
  };

  loadTransactions();

}, [permState]);

  // Check SMS permission on mount
  useEffect(() => {
    (async () => {
      const state = await checkSmsPermission();
      setPermState(state);
    })();
  }, []);

  // Animate hero card on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroFade, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(heroSlide, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleRequestPermission = useCallback(async () => {
    if (permState === 'denied') {
      const { Linking } = require('react-native');
      Linking.openSettings();
      return;
    }
    setPermState('checking');
    const result = await requestSmsPermission();
    setPermState(result);
  }, [permState]);

  // Memoized calculations
  const filteredTransactions = useMemo(
    () => filterTransactionsByPeriod(transactions, comparisonPeriod),
    [transactions, comparisonPeriod],
  );

  const dashboardStats = useMemo(
    () => calculateDashboardStats(filteredTransactions),
    [filteredTransactions],
  );

  const spendingCategories = useMemo(
    () => generateSpendingCategories(filteredTransactions),
    [filteredTransactions],
  );

  const earningData = useMemo(
    () => generateEarningData(filteredTransactions),
    [filteredTransactions],
  );

  const currentInsights = useMemo(
    () => generateAIInsights(filteredTransactions),
    [filteredTransactions],
  );

  const renderHeader = () => (
    <View>
      <HomeHeader
        dashboardStats={dashboardStats}
        heroFade={heroFade}
        heroSlide={heroSlide}
      />
      <AIInsightsSection
        insights={currentInsights}
        period={comparisonPeriod}
        onPeriodChange={setComparisonPeriod}
      />
      <ChartsSection
        spendingCategories={spendingCategories}
        earningData={earningData}
        hasTransactions={filteredTransactions.length > 0}
        permState={permState}
        transactionCount={transactions.length}
      />
    </View>
  );

  const renderFooter = () => {
    if (permState !== 'granted') return null;
    if (filteredTransactions.length === 0) {
      return (
        <EmptyState
          message="No transactions found in your SMS inbox."
          icon="inbox-outline"
        />
      );
    }
    return (
      <View>
        <SecurityStatusCard />
        <View style={{ height: Space.xxxl }} />
      </View>
    );
  };

  if (permState === 'checking') {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={Colors.gold} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
      <FlatList
        data={permState === 'granted' ? filteredTransactions : []}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <TransactionCard transaction={item} />}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={
          permState !== 'granted'
            ? () => (
                <EmptyState
                  permState={permState}
                  onRequest={handleRequestPermission}
                />
              )
            : renderFooter
        }
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews={true}
      />

      <FloatingActionButton onPress={() => navigation.navigate('Chat')} />
    </SafeAreaView>
  );
};

export default HomeScreen;