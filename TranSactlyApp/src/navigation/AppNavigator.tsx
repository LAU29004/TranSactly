import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeScreen from '../screens/HomeScreen';
import FilterScreen from '../screens/FilterScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { Colors, Radius, Font } from '../theme';

export type RootTabParamList = {
  Home: undefined;
  Filter: undefined;
  Chat: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

// ─── Animated Tab Button ───────────────────────────────────────────────────────

interface TabIconProps {
  focused: boolean;
  children: React.ReactNode;
  label: string;
}

const AnimatedTabItem: React.FC<TabIconProps> = ({ focused, children, label }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const bgOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: focused ? 1.08 : 1,
        useNativeDriver: true,
        tension: 180,
        friction: 10,
      }),
      Animated.timing(bgOpacity, {
        toValue: focused ? 1 : 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused]);

  return (
    <Animated.View style={[tabStyles.container, { transform: [{ scale }] }]}>
      <Animated.View
        style={[
          tabStyles.iconBg,
          { opacity: bgOpacity, backgroundColor: Colors.goldMuted },
        ]}
      />
      <View style={tabStyles.iconWrap}>{children}</View>
      <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>{label}</Text>
    </Animated.View>
  );
};

const tabStyles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', gap: 3, paddingTop: 2 },
  iconBg: {
    ...StyleSheet.absoluteFill,
    borderRadius: Radius.lg,
    top: -2, bottom: -2, left: -10, right: -10,
    borderWidth: 0.5,
    borderColor: Colors.goldBorder,
  },
  iconWrap: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 9, fontWeight: '600', letterSpacing: 0.8, color: Colors.tabInactive },
  labelActive: { color: Colors.tabActive },
});

// ─── SVG-style Icon Components ────────────────────────────────────────────────

const HomeIcon: React.FC<{ focused: boolean }> = ({ focused }) => {
  const c = focused ? Colors.tabActive : Colors.tabInactive;
  return (
    <AnimatedTabItem focused={focused} label="HOME">
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        {/* Roof */}
        <View style={{
          width: 0, height: 0,
          borderLeftWidth: 10, borderRightWidth: 10, borderBottomWidth: 8,
          borderLeftColor: 'transparent', borderRightColor: 'transparent',
          borderBottomColor: c,
          marginBottom: -1,
        }} />
        {/* Body */}
        <View style={{ width: 14, height: 9, backgroundColor: c, borderRadius: 1 }}>
          {/* Door */}
          <View style={{ width: 4, height: 5, backgroundColor: Colors.bg, borderRadius: 1, position: 'absolute', bottom: 0, left: 5 }} />
        </View>
      </View>
    </AnimatedTabItem>
  );
};

const FilterIcon: React.FC<{ focused: boolean }> = ({ focused }) => {
  const c = focused ? Colors.tabActive : Colors.tabInactive;
  return (
    <AnimatedTabItem focused={focused} label="FILTER">
      <View style={{ gap: 4, alignItems: 'center' }}>
        <View style={{ width: 18, height: 2, borderRadius: 1, backgroundColor: c }} />
        <View style={{ width: 13, height: 2, borderRadius: 1, backgroundColor: c }} />
        <View style={{ width: 8, height: 2, borderRadius: 1, backgroundColor: c }} />
      </View>
    </AnimatedTabItem>
  );
};

const ChatIcon: React.FC<{ focused: boolean }> = ({ focused }) => {
  const c = focused ? Colors.tabActive : Colors.tabInactive;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!focused) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.3, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [focused]);

  return (
    <AnimatedTabItem focused={focused} label="AI CHAT">
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        {/* Chat bubble body */}
        <View style={{
          width: 20, height: 15, borderRadius: 5,
          backgroundColor: c, alignItems: 'center', justifyContent: 'center',
        }}>
          {/* Dots */}
          <View style={{ flexDirection: 'row', gap: 2.5 }}>
            {[0, 1, 2].map(i => (
              <View key={i} style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: Colors.bg }} />
            ))}
          </View>
        </View>
        {/* Tail */}
        <View style={{
          width: 0, height: 0,
          borderLeftWidth: 4, borderRightWidth: 0, borderTopWidth: 4,
          borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: c,
          alignSelf: 'flex-start', marginLeft: 5, marginTop: -1,
        }} />
        {/* AI dot */}
        {focused && (
          <Animated.View style={{
            position: 'absolute', top: -3, right: -3,
            width: 7, height: 7, borderRadius: 3.5,
            backgroundColor: '#3DCB7F',
            borderWidth: 1, borderColor: Colors.bg,
            transform: [{ scale: pulseAnim }],
          }} />
        )}
      </View>
    </AnimatedTabItem>
  );
};

const ProfileIcon: React.FC<{ focused: boolean }> = ({ focused }) => {
  const c = focused ? Colors.tabActive : Colors.tabInactive;
  return (
    <AnimatedTabItem focused={focused} label="PROFILE">
      <View style={{ alignItems: 'center', gap: 2 }}>
        {/* Head */}
        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: c }} />
        {/* Shoulders */}
        <View style={{ width: 18, height: 8, borderTopLeftRadius: 9, borderTopRightRadius: 9, backgroundColor: c }} />
      </View>
    </AnimatedTabItem>
  );
};

// ─── Custom Tab Bar Background ────────────────────────────────────────────────
// The tab bar gets a subtle top separator with a gold gradient glint

// ─── Navigator ────────────────────────────────────────────────────────────────

const AppNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();
  const tabBarHeight = 60 + insets.bottom;

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: Colors.tabBg,
            borderTopWidth: 0,
            height: tabBarHeight,
            paddingTop: 8,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 12,
            elevation: 0,
            shadowOpacity: 0,
            // Top border replaced with gold-tinted separator via tabBarBackground
          },
          tabBarShowLabel: false, // labels handled inside AnimatedTabItem
          tabBarHideOnKeyboard: true,
          tabBarActiveTintColor: Colors.tabActive,
          tabBarInactiveTintColor: Colors.tabInactive,
          tabBarBackground: () => (
            <View style={navStyles.tabBackground}>
              <View style={navStyles.tabTopLine} />
              {/* Glint shimmer */}
              <View style={navStyles.tabGlint} />
            </View>
          ),
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{ tabBarIcon: ({ focused }) => <HomeIcon focused={focused} /> }}
        />
        <Tab.Screen
          name="Filter"
          component={FilterScreen}
          options={{ tabBarIcon: ({ focused }) => <FilterIcon focused={focused} /> }}
        />
        <Tab.Screen
          name="Chat"
          component={ChatScreen}
          options={{ tabBarIcon: ({ focused }) => <ChatIcon focused={focused} /> }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ tabBarIcon: ({ focused }) => <ProfileIcon focused={focused} /> }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const navStyles = StyleSheet.create({
  tabBackground: {
    flex: 1,
    backgroundColor: Colors.tabBg,
  },
  tabTopLine: {
    height: 0.5,
    backgroundColor: Colors.goldBorder,
    opacity: 0.6,
  },
  tabGlint: {
    position: 'absolute',
    top: 0,
    left: '20%',
    right: '20%',
    height: 1,
    backgroundColor: Colors.gold,
    opacity: 0.12,
    borderRadius: 1,
  },
});

export default AppNavigator;