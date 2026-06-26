import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import HomeScreen from '../screens/HomeScreen';
import FilterScreen from '../screens/FilterScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { Colors, Radius, Font } from '../theme';
import LoginScreen from '../screens/LoginScreen';
import SplashScreen from '../screens/SplashScreen';
import TranSactlyOnboardingScreen from '../screens/TranSactlyOnboarding';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TranSactlyOnboarding from '../screens/TranSactlyOnboarding';

export type RootTabParamList = {
  Home: undefined;
  Filter: undefined;
  Chat: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator();
const NAVIGATION_STATE_KEY = 'NAVIGATION_STATE';

// ─── Constants ─────────────────────────────────────────────────────────────────

const TAB_CONTENT_HEIGHT = 56;
const ICON_WRAP_SIZE = 28;
const PILL_H = 34;
const PILL_W = 52;
const PILL_RADIUS = PILL_H / 2;

// ─── AnimatedTabItem ───────────────────────────────────────────────────────────

interface TabItemProps {
  focused: boolean;
  label: string;
  children: React.ReactNode;
}

const AnimatedTabItem: React.FC<TabItemProps> = ({
  focused,
  label,
  children,
}) => {
  // Icon bounce on focus
  const iconScale = useRef(new Animated.Value(1)).current;
  const iconTranslateY = useRef(new Animated.Value(0)).current;

  // Pill: opacity + width expand
  const pillOpacity = useRef(new Animated.Value(0)).current;
  const pillScaleX = useRef(new Animated.Value(0.4)).current;
  const pillScaleY = useRef(new Animated.Value(0.7)).current;

  // Label: fade + slide up
  const labelOpacity = useRef(new Animated.Value(focused ? 1 : 0.45)).current;
  const labelTranslateY = useRef(new Animated.Value(0)).current;
  const labelScale = useRef(new Animated.Value(focused ? 1.05 : 1)).current;

  // Glow behind icon when focused
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const glowScale = useRef(new Animated.Value(0.6)).current;

  const prevFocused = useRef(focused);

  useEffect(() => {
    const wasFocused = prevFocused.current;
    prevFocused.current = focused;

    if (focused) {
      // ── Entering focused state ──

      // Icon: quick bounce up then settle
      Animated.sequence([
        Animated.timing(iconTranslateY, {
          toValue: -4,
          duration: 120,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(iconTranslateY, {
          toValue: 0,
          tension: 280,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();

      // Icon scale: pop
      Animated.sequence([
        Animated.timing(iconScale, {
          toValue: 1.22,
          duration: 110,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(iconScale, {
          toValue: 1.06,
          tension: 260,
          friction: 11,
          useNativeDriver: true,
        }),
      ]).start();

      // Pill: expand from center with elastic spring
      Animated.parallel([
        Animated.timing(pillOpacity, {
          toValue: 1,
          duration: 160,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(pillScaleX, {
          toValue: 1,
          tension: 180,
          friction: 12,
          useNativeDriver: true,
        }),
        Animated.spring(pillScaleY, {
          toValue: 1,
          tension: 200,
          friction: 11,
          useNativeDriver: true,
        }),
      ]).start();

      // Label: slide up subtly and brighten
      Animated.parallel([
        Animated.timing(labelOpacity, {
          toValue: 1,
          duration: 180,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(labelTranslateY, {
          toValue: -1,
          tension: 220,
          friction: 12,
          useNativeDriver: true,
        }),
        Animated.spring(labelScale, {
          toValue: 1.08,
          tension: 200,
          friction: 12,
          useNativeDriver: true,
        }),
      ]).start();

      // Glow: bloom then settle
      Animated.sequence([
        Animated.parallel([
          Animated.timing(glowOpacity, {
            toValue: 0.28,
            duration: 200,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.spring(glowScale, {
            toValue: 1.2,
            tension: 140,
            friction: 10,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(glowOpacity, {
            toValue: 0.12,
            duration: 400,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.spring(glowScale, {
            toValue: 1,
            tension: 120,
            friction: 14,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    } else {
      // ── Leaving focused state ──

      // Icon: shrink and settle
      Animated.spring(iconScale, {
        toValue: 1,
        tension: 220,
        friction: 12,
        useNativeDriver: true,
      }).start();

      Animated.spring(iconTranslateY, {
        toValue: 0,
        tension: 220,
        friction: 14,
        useNativeDriver: true,
      }).start();

      // Pill: collapse inward
      Animated.parallel([
        Animated.timing(pillOpacity, {
          toValue: 0,
          duration: 200,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(pillScaleX, {
          toValue: 0.4,
          duration: 200,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pillScaleY, {
          toValue: 0.7,
          duration: 180,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();

      // Label: fade and settle
      Animated.parallel([
        Animated.timing(labelOpacity, {
          toValue: 0.45,
          duration: 160,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(labelTranslateY, {
          toValue: 0,
          tension: 220,
          friction: 14,
          useNativeDriver: true,
        }),
        Animated.spring(labelScale, {
          toValue: 1,
          tension: 220,
          friction: 12,
          useNativeDriver: true,
        }),
      ]).start();

      // Glow: fade out
      Animated.timing(glowOpacity, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    }
  }, [focused]);

  return (
    <Animated.View style={[tab.cell, { transform: [{ scale: iconScale }] }]}>
      {/* Radial glow behind the pill */}
      <Animated.View
        style={[
          tab.glow,
          {
            opacity: glowOpacity,
            transform: [{ scale: glowScale }],
          },
        ]}
      />

      {/* Pill highlight — expands from center */}
      <Animated.View
        style={[
          tab.pill,
          {
            opacity: pillOpacity,
            backgroundColor: Colors.goldMuted,
            borderColor: Colors.goldBorder,
            transform: [{ scaleX: pillScaleX }, { scaleY: pillScaleY }],
          },
        ]}
      />

      {/* Icon with vertical float */}
      <Animated.View
        style={[tab.iconWrap, { transform: [{ translateY: iconTranslateY }] }]}
      >
        {children}
      </Animated.View>

      {/* Label with slide + fade */}
      <Animated.Text
        style={[
          tab.label,
          focused && tab.labelActive,
          {
            opacity: labelOpacity,
            transform: [{ translateY: labelTranslateY }, { scale: labelScale }],
          },
        ]}
      >
        {label}
      </Animated.Text>
    </Animated.View>
  );
};

const tab = StyleSheet.create({
  cell: {
    width: PILL_W + 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingTop: 2,
  },
  // Soft radial glow that blooms on focus
  glow: {
    position: 'absolute',
    width: PILL_W + 16,
    height: PILL_H + 16,
    borderRadius: (PILL_H + 16) / 2,
    backgroundColor: Colors.gold,
    top: -8,
  },
  pill: {
    position: 'absolute',
    width: PILL_W,
    height: PILL_H,
    borderRadius: PILL_RADIUS,
    borderWidth: 0.5,
    top: 0,
  },
  iconWrap: {
    width: ICON_WRAP_SIZE,
    height: ICON_WRAP_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: Colors.tabInactive,
    textAlign: 'center',
  },
  labelActive: {
    color: Colors.tabActive,
  },
});

// ─── Icons ─────────────────────────────────────────────────────────────────────

const HomeIcon: React.FC<{ focused: boolean }> = ({ focused }) => {
  const c = focused ? Colors.tabActive : Colors.tabInactive;
  return (
    <AnimatedTabItem focused={focused} label="HOME">
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          width: 20,
          height: 20,
        }}
      >
        <View
          style={{
            width: 0,
            height: 0,
            borderLeftWidth: 10,
            borderRightWidth: 10,
            borderBottomWidth: 7,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderBottomColor: c,
          }}
        />
        <View
          style={{
            width: 14,
            height: 8,
            backgroundColor: c,
            marginTop: -1,
            borderBottomLeftRadius: 1,
            borderBottomRightRadius: 1,
            alignItems: 'center',
          }}
        >
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              width: 4,
              height: 5,
              backgroundColor: Colors.tabBg,
              borderTopLeftRadius: 1.5,
              borderTopRightRadius: 1.5,
            }}
          />
        </View>
      </View>
    </AnimatedTabItem>
  );
};

const FilterIcon: React.FC<{ focused: boolean }> = ({ focused }) => {
  const c = focused ? Colors.tabActive : Colors.tabInactive;
  return (
    <AnimatedTabItem focused={focused} label="FILTER">
      <View
        style={{
          width: 20,
          height: 20,
          justifyContent: 'center',
          alignItems: 'center',
          gap: 4,
        }}
      >
        {[18, 13, 8].map((w, i) => (
          <View
            key={i}
            style={{
              width: w,
              height: 1.5,
              borderRadius: 1,
              backgroundColor: c,
            }}
          />
        ))}
      </View>
    </AnimatedTabItem>
  );
};

const ChatIcon: React.FC<{ focused: boolean }> = ({ focused }) => {
  const c = focused ? Colors.tabActive : Colors.tabInactive;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!focused) {
      pulseAnim.setValue(1);
      pulseOpacity.setValue(0);
      return;
    }

    // Ripple pulse: scale out + fade out repeatedly
    const loop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 2.2,
            duration: 900,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(pulseOpacity, {
              toValue: 0.55,
              duration: 120,
              useNativeDriver: true,
            }),
            Animated.timing(pulseOpacity, {
              toValue: 0,
              duration: 780,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
        ]),
        Animated.delay(400),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [focused]);

  return (
    <AnimatedTabItem focused={focused} label="AI CHAT">
      <View
        style={{
          width: 20,
          height: 20,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Bubble body */}
        <View
          style={{
            width: 20,
            height: 14,
            borderRadius: 5,
            backgroundColor: c,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View style={{ flexDirection: 'row', gap: 2.5 }}>
            {[0, 1, 2].map(i => (
              <View
                key={i}
                style={{
                  width: 3,
                  height: 3,
                  borderRadius: 1.5,
                  backgroundColor: Colors.tabBg,
                }}
              />
            ))}
          </View>
        </View>

        {/* Tail */}
        <View
          style={{
            width: 0,
            height: 0,
            borderLeftWidth: 4,
            borderRightWidth: 0,
            borderTopWidth: 4,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderTopColor: c,
            alignSelf: 'flex-start',
            marginLeft: 4,
            marginTop: -1,
          }}
        />

        {/* AI online dot with ripple */}
        {focused && (
          <>
            {/* Ripple ring */}
            <Animated.View
              style={{
                position: 'absolute',
                top: -1,
                right: -1,
                width: 7,
                height: 7,
                borderRadius: 3.5,
                backgroundColor: '#3DCB7F',
                opacity: pulseOpacity,
                transform: [{ scale: pulseAnim }],
              }}
            />
            {/* Solid dot */}
            <View
              style={{
                position: 'absolute',
                top: -1,
                right: -1,
                width: 7,
                height: 7,
                borderRadius: 3.5,
                backgroundColor: '#3DCB7F',
                borderWidth: 1.5,
                borderColor: Colors.tabBg,
              }}
            />
          </>
        )}
      </View>
    </AnimatedTabItem>
  );
};

const ProfileIcon: React.FC<{ focused: boolean }> = ({ focused }) => {
  const c = focused ? Colors.tabActive : Colors.tabInactive;
  return (
    <AnimatedTabItem focused={focused} label="PROFILE">
      <View
        style={{
          width: 20,
          height: 20,
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
      >
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: c,
            marginBottom: 2,
          }}
        />
        <View
          style={{
            width: 18,
            height: 8,
            backgroundColor: c,
            borderTopLeftRadius: 9,
            borderTopRightRadius: 9,
          }}
        />
      </View>
    </AnimatedTabItem>
  );
};

// ─── Custom Tab Bar Background ─────────────────────────────────────────────────

const TabBackground: React.FC = () => (
  <View style={nav.tabBg}>
    <View style={nav.topLine} />
    <View style={nav.glint} />
  </View>
);

// ─── Navigator ─────────────────────────────────────────────────────────────────

const MainTabs = () => {
  const insets = useSafeAreaInsets();
  const tabBarHeight = TAB_CONTENT_HEIGHT + insets.bottom;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.tabBg,
          borderTopWidth: 0,
          height: tabBarHeight,
          paddingTop: 8,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: Colors.tabActive,
        tabBarInactiveTintColor: Colors.tabInactive,
        tabBarBackground: () => <TabBackground />,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => <HomeIcon focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Filter"
        component={FilterScreen}
        options={{
          tabBarIcon: ({ focused }) => <FilterIcon focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarIcon: ({ focused }) => <ChatIcon focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => <ProfileIcon focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator: React.FC = () => {
  const [initialState, setInitialState] = useState<any>();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const restoreState = async () => {
      try {
        const savedState = await AsyncStorage.getItem(NAVIGATION_STATE_KEY);
        if (savedState) {
          setInitialState(JSON.parse(savedState));
        }
      } catch (e) {
      } finally {
        setIsReady(true);
      }
    };
    restoreState();
  }, []);

  const insets = useSafeAreaInsets();
  const tabBarHeight = TAB_CONTENT_HEIGHT + insets.bottom;

  if (!isReady) return null;

  return (
    <NavigationContainer
      initialState={initialState}
      onStateChange={async state => {
        try {
          await AsyncStorage.setItem(
            NAVIGATION_STATE_KEY,
            JSON.stringify(state),
          );
        } catch (e) {
        }
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="Onboarding"
          component={TranSactlyOnboardingScreen}
        />
        <Stack.Screen name="Splash" component={SplashScreen} />

        <Stack.Screen name="Login" component={LoginScreen} />

        <Stack.Screen name="MainTabs" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// ─── Styles ────────────────────────────────────────────────────────────────────

const nav = StyleSheet.create({
  tabBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.tabBg,
  },
  topLine: {
    height: 0.5,
    backgroundColor: Colors.goldBorder,
    opacity: 0.7,
  },
  glint: {
    position: 'absolute',
    top: 0,
    left: '25%',
    right: '25%',
    height: 1,
    backgroundColor: Colors.gold,
    opacity: 0.15,
    borderRadius: 1,
  },
});

export default AppNavigator;
