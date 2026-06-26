import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import {
  View,
  FlatList,
  StatusBar,
  ActivityIndicator,
  Animated,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { Buffer } from 'buffer';
import { parseSMSIntoTransactions } from '../services/readSms';
import { type InsightObject, type ComparisonPeriod } from '../utils/insights';
import TransactionCard from '../components/TransactionCard';
import { Colors, Space } from '../theme';
import { useTransactions } from '../context/TransactionContext';
import { downloadExcel } from '../services/api/exportApi';

import {
  checkSmsPermission,
  requestSmsPermission,
  type PermState,
} from '../services/smsPermissions';
import { filterTransactionsByPeriod } from '../utils/dashboardCalculations';
import { fetchHomeData } from '../services/api/homeApi';
import HomeHeader from '../components/home/HomeHeader';
import AIInsightsSection from '../components/home/AIInsightsSection';
import ChartsSection from '../components/home/ChartsSection';
import FloatingActionButton from '../components/home/FloatingActionButton';
import EmptyState from '../components/home/EmptyState';
import SecurityStatusCard from '../components/home/SecurityStatusCard';
import styles from '../styles/HomeScreen.styles';
import { fetchInsights } from '../services/api/insightsApi';
const { width: SCREEN_W } = Dimensions.get('window');
const getDateRange = (period: ComparisonPeriod) => {
  const end = new Date();

  const start = new Date();

  switch (period) {
    case 'month':
      start.setMonth(end.getMonth() - 1);

      break;

    case 'sixMonths':
      start.setMonth(end.getMonth() - 6);

      break;

    case 'year':
      start.setFullYear(end.getFullYear() - 1);

      break;
  }

  return {
    startDate: start.toISOString(),

    endDate: end.toISOString(),
  };
};
const HomeScreen: React.FC = () => {
  const [homeData, setHomeData] = useState<any>(null);
  const [insightsData, setInsightsData] = useState<any>(null);
  const navigation = useNavigation<any>();
  const [permState, setPermState] = useState<PermState>('checking');
  const [comparisonPeriod, setComparisonPeriod] =
    useState<ComparisonPeriod>('month');
  const { transactions, setTransactions } = useTransactions();
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const heroFade = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(16)).current;
  const [loadingMore, setLoadingMore] = useState(false);
  // Load transactions on mount

  const loadHomeData = async (period: ComparisonPeriod) => {
    try {
      const { startDate, endDate } = getDateRange(period);


      const data = await fetchHomeData(startDate, endDate, page);



      setHomeData((prev: any) => {
        if (!prev || page === 1) {
          return data;
        }

        return {
          ...data,

          recentTransactions: [
            ...new Map(
              [...prev.recentTransactions, ...data.recentTransactions].map(
                tx => [tx.id, tx],
              ),
            ).values(),
          ],
        };
      });
    } catch (error) {

    } finally {
      setLoadingMore(false);
    }
  };
const handleExportExcel = async () => {

  try {

    const {
      startDate,
      endDate,
    } = getDateRange(
      comparisonPeriod,
    );

    const file =
      await downloadExcel(
        new Date(startDate),
        new Date(endDate),
      );

    const base64 =
      Buffer.from(file).toString(
        'base64',
      );

    const path =
      `${RNFS.DownloadDirectoryPath}/centfluence_Transactions.xlsx`;

    await RNFS.writeFile(
      path,
      base64,
      'base64',
    );

    await Share.open({

      url:
        `file://${path}`,

      type:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

  } catch (error) {

  }
};
  const handleRefresh = async () => {
    try {
      setRefreshing(true);

      setPage(1);

      await loadHomeData(comparisonPeriod);
      await loadInsights(comparisonPeriod);
    } catch (error) {
    } finally {
      setRefreshing(false);
    }
  };
  const loadInsights = async (period: ComparisonPeriod) => {
    try {
      const { startDate, endDate } = getDateRange(period);

      const data = await fetchInsights(new Date(startDate), new Date(endDate));


      setInsightsData(data);
    } catch (error) {
    }
  };
  useEffect(() => {
    loadHomeData(comparisonPeriod);
  }, [comparisonPeriod, page]);
  useEffect(() => {
    loadInsights(comparisonPeriod);
  }, [comparisonPeriod]);
  useEffect(() => {
    setPage(1);
  }, [comparisonPeriod]);

  useEffect(() => {
    const loadTransactions = async () => {
      try {


        if (permState !== 'granted') {
          return;
        }

        if (transactions.length > 0) {
          return;
        }

        const parsed = await parseSMSIntoTransactions();

        if (parsed.length > 0) {
          setTransactions(parsed);
        }
      } catch (e) {
      }
    };

    loadTransactions();
  }, [permState]);

  // Check SMS permission on mount
  useEffect(() => {
    const initializePermission = async () => {
      const state = await checkSmsPermission();

      if (state === 'idle') {
        const result = await requestSmsPermission();

        setPermState(result);
      } else {
        setPermState(state);
      }
    };

    initializePermission();
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
  const dashboardStats = useMemo(() => {
    return {
      income: homeData?.totalIncome ?? 0,

      spending: homeData?.totalExpenses ?? 0,

      savings: homeData?.totalSavings ?? 0,

      savingsRate: homeData?.totalIncome
        ? (homeData.totalSavings / homeData.totalIncome) * 100
        : 0,

      transactionCount: homeData?.recentTransactions?.length ?? 0,
    };
  }, [homeData]);

  const spendingCategories = useMemo(() => {
    if (!homeData?.categoryBreakdown) {
      return [];
    }

    return homeData.categoryBreakdown.map((item: any) => ({
      name: item.category,

      amount: item.amount,

      percent: item.percent ?? 0,
    }));
  }, [homeData]);

  const earningData = useMemo(() => {
    if (!homeData?.monthlyTrend) {
      return [];
    }

    return homeData.monthlyTrend;
  }, [homeData]);

  const currentInsights = useMemo<InsightObject[]>(() => {
    if (!insightsData) {
      return [];
    }

    return [
      {
        icon: 'cash',
        text: `Income ₹${insightsData.totalIncome}`,
        change: '',
        changePercent: 0,
        category: 'Income',
        type: 'info',
      },

      {
        icon: 'credit-card',
        text: `Spent ₹${insightsData.totalExpenses}`,
        change: '',
        changePercent: 0,
        category: 'Spending',
        type: 'warn',
      },

      {
        icon: 'piggy-bank',
        text: `Savings ₹${insightsData.totalSavings}`,
        change: '',
        changePercent: 0,
        category: 'Savings',
        type: insightsData.totalSavings < 0 ? 'alert' : 'info',
      },
      {
        icon: 'trending-up',

        text: `${homeData?.topCategory} accounts for most spending`,

        change: homeData?.categoryBreakdown?.[0]
          ? `₹${homeData.categoryBreakdown[0].amount}`
          : '',

        changePercent: homeData?.categoryBreakdown?.[0]?.percent ?? 0,

        category: homeData?.topCategory,

        type:
          (homeData?.categoryBreakdown?.[0]?.percent ?? 0) > 50
            ? 'alert'
            : 'warn',
      },
    ];
  }, [insightsData, homeData]);

  const renderHeader = () => (
    <View>
      <HomeHeader
        dashboardStats={dashboardStats}
        homeData={homeData}
        heroFade={heroFade}
        heroSlide={heroSlide}
        onExportExcel={handleExportExcel}
      />
      <AIInsightsSection
        insights={currentInsights}
        period={comparisonPeriod}
        onPeriodChange={setComparisonPeriod}
      />
      <ChartsSection
        spendingCategories={spendingCategories}
        earningData={earningData}
        homeData={homeData}
        hasTransactions={homeData?.recentTransactions?.length > 0}
        permState={permState}
        transactionCount={homeData?.recentTransactions?.length ?? 0}
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
        <View style={styles.loadingcenter}>
          <ActivityIndicator size="large" color={Colors.gold} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
      <FlatList
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.gold}
          />
        }
        data={homeData?.recentTransactions ?? []}
        onEndReached={() => {
          if (loadingMore || !homeData?.pagination?.hasMore) {
            return;
          }

          setLoadingMore(true);

          setPage(prev => prev + 1);
        }}
        onEndReachedThreshold={0.5}
        keyExtractor={item => item.id.toString()}
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
