import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
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

export type RootTabParamList = {
  Home: undefined;
  Filter: undefined;
  Chat: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const NAVIGATION_STATE_KEY = 'NAVIGATION_STATE';
// ─── Constants ─────────────────────────────────────────────────────────────────

const TAB_CONTENT_HEIGHT = 56; // icon + label + padding, excludes insets.bottom
const ICON_WRAP_SIZE = 28; // fixed icon canvas
const PILL_H = 34; // highlight pill height
const PILL_W = 52; // highlight pill width
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
  const scale = useRef(new Animated.Value(1)).current;
  const bgOpacity = useRef(new Animated.Value(0)).current;
  const labelScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: focused ? 1.06 : 1,
        useNativeDriver: true,
        tension: 200,
        friction: 12,
      }),
      Animated.timing(bgOpacity, {
        toValue: focused ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(labelScale, {
        toValue: focused ? 1.05 : 1,
        useNativeDriver: true,
        tension: 200,
        friction: 12,
      }),
    ]).start();
  }, [focused]);

  return (
    <Animated.View style={[tab.cell, { transform: [{ scale }] }]}>
      {/* Pill highlight */}
      <Animated.View
        style={[
          tab.pill,
          {
            opacity: bgOpacity,
            backgroundColor: Colors.goldMuted,
            borderColor: Colors.goldBorder,
          },
        ]}
      />

      {/* Icon */}
      <View style={tab.iconWrap}>{children}</View>

      {/* Label */}
      <Animated.Text
        style={[
          tab.label,
          focused && tab.labelActive,
          { transform: [{ scale: labelScale }] },
        ]}
      >
        {label}
      </Animated.Text>
    </Animated.View>
  );
};

const tab = StyleSheet.create({
  // Fixed-size cell — every tab occupies the same space so icons are centred
  cell: {
    width: PILL_W + 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingTop: 2,
  },
  // Pill sits behind icon + label, precisely sized
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
// Every icon is drawn to fit within a 20×20 optical box inside the 28×28 wrap.

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
        {/* Roof triangle */}
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
        {/* Body */}
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
          {/* Door */}
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

  useEffect(() => {
    if (!focused) {
      pulseAnim.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.35,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 750,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [focused]);

  return (
    <AnimatedTabItem focused={focused} label="AI CHAT">
      {/*
       * Outer container is exactly ICON_WRAP_SIZE × ICON_WRAP_SIZE.
       * The AI dot is positioned inside this box so it never clips outside
       * the AnimatedTabItem pill.
       */}
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

        {/* AI online dot — sits within the 20×20 box, top-right */}
        {focused && (
          <Animated.View
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
              transform: [{ scale: pulseAnim }],
            }}
          />
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
        {/* Head */}
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: c,
            marginBottom: 2,
          }}
        />
        {/* Shoulders — semi-ellipse */}
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
    {/* Gold-tinted top separator */}
    <View style={nav.topLine} />
    {/* Subtle centre glint */}
    <View style={nav.glint} />
  </View>
);

// ─── Navigator ─────────────────────────────────────────────────────────────────

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
        console.log('NAV RESTORE ERROR:', e);
      } finally {
        setIsReady(true);
      }
    };
    restoreState();
  }, []);
  const insets = useSafeAreaInsets();

  const tabBarHeight = TAB_CONTENT_HEIGHT + insets.bottom;

  if (!isReady) {
    return null;
  }

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
          console.log('NAV SAVE ERROR:', e);
        }
      }}
    >
      <Tab.Navigator
        screenOptions={{
          headerShown: false,

          tabBarStyle: {
            backgroundColor: Colors.tabBg,
            borderTopWidth: 0, // handled by TabBackground
            height: tabBarHeight,
            paddingTop: 8,

            paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
            elevation: 0,
            shadowOpacity: 0,
          },

          tabBarShowLabel: false, // labels rendered inside AnimatedTabItem
          tabBarHideOnKeyboard: true, // hide on Android keyboard open
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
    </NavigationContainer>
  );
};

// ─── Styles ────────────────────────────────────────────────────────────────────

const nav = StyleSheet.create({
  /*
   * FIX 7: absoluteFillObject ensures the background fills the entire tab bar
   * region, including the bottom safe-area padding. Without this the bg colour
   * only covers the icon/label area and leaves a raw surface strip at the bottom.
   */
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
