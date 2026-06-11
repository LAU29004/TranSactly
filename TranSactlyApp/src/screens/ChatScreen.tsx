import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ActivityIndicator,
  ScrollView,
  useWindowDimensions,
} from 'react-native';

import { BarChart } from 'react-native-gifted-charts';
import { fetchAIInsight } from '../services/api/chatApi';

import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// ─── Theme ─────────────────────────────────────────────────────────────────────
// Improved: richer dark surfaces, warmer gold palette, better contrast ratios,
// more distinct surface layers so depth reads clearly on OLED & LCD alike.
const suggestionIcons: Record<string, string> = {
  'Top Merchants': 'store-outline',

  'Category Breakdown': 'chart-pie',

  'Savings Summary': 'piggy-bank-outline',

  'Income Breakdown': 'cash-plus',

  'Expenses Breakdown': 'cash-minus',

  'Top Category': 'trophy-outline',

  'Show Categories': 'view-grid-outline',

  'Reduce Spending': 'trending-down',
};

const C = {
  // Surfaces — each step is clearly distinguishable
  bg: '#07080A', // true-black tinted cool — OLED friendly
  bgSurface: '#0D0F12', // card base
  bgElevated: '#131619', // raised elements
  bgInput: '#0F1114', // input well
  bgTint: '#1A1D22', // hover / pressed tint

  // Gold — warmer, more luminous hierarchy
  gold: '#C9974A', // primary accent
  goldBright: '#F0CB74', // highlights, active states
  goldDim: '#1E1A0F', // gold-tinted surface (sessions)
  goldBorder: '#2E2310', // gold-hued border
  goldText: '#F5DFA0', // readable gold text

  // Structural borders — refined step between surfaces
  border: '#1E2126',
  borderSoft: '#171A1F',
  borderGold: '#2A200C',

  // Typography — higher contrast at each tier
  textPrimary: '#EEE9E2', // near-white warm
  textSecondary: '#72706C', // mid-grey warm
  textTertiary: '#3A3A38', // placeholder / timestamps
  textInverse: '#060400', // text on gold buttons

  // Semantic — green
  green: '#2EBF68',
  greenDim: '#091A10',
  greenBdr: '#163324',

  // Semantic — red
  red: '#D44F50',
  redDim: '#180C0C',
  redBdr: '#381515',

  // Semantic — amber
  amber: '#E89530',
  amberDim: '#1A1208',

  // Semantic — purple
  purple: '#7872D5',
  purpleDim: '#100F36',

  // Semantic — teal
  teal: '#1E9B74',
  tealDim: '#071A14',
};

// ─── Types ─────────────────────────────────────────────────────────────────────

type MessageRole = 'user' | 'ai';
type InsightType =
  | 'spending'
  | 'categories'
  | 'subscriptions'
  | 'income'
  | 'savings'
  | 'anomaly'
  | 'merchant'
  | 'summary';

interface Message {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: number;
  meta?: MessageMeta;
  suggestions?: string[];
}
interface MerchantChip {
  name: string;
  category: string;
  amount: string;
  color: string;
}
interface MiniBar {
  label: string;
  amount: number;
  percent: number;
  color: string;
}
interface AnomalyAlert {
  ref: string;
  desc: string;
  amount: string;
}
interface MessageMeta {
  insightType?: InsightType;
  merchants?: {
    name: string;
    category: string;
    amount: string;
    color: string;
  }[];
  bars?: MiniBar[];
  anomaly?: { ref: string; desc: string; amount: string };
  savingsTip?: string;
}
interface ChatSession {
  id: string;
  title: string;
  preview: string;
  category: InsightType;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const SESSIONS_KEY = 'smartspend_sessions_v3';
const ACTIVE_KEY = 'smartspend_active_v3';

const QUICK_PROMPTS = [
  {
    icon: 'chart-pie',
    label: 'Where did I spend most this month?',
  },
  {
    icon: 'store-outline',
    label: 'Show top merchants',
  },
  {
    icon: 'view-grid-outline',
    label: 'Spending by category',
  },
  {
    icon: 'cash-multiple',
    label: 'How much income did I receive?',
  },
  {
    icon: 'piggy-bank-outline',
    label: 'How much did I save?',
  },
  {
    icon: 'alert-circle-outline',
    label: 'Detect unusual spending',
  },
];

const LOADING_PHRASES = [
  'Analyzing spending patterns…',
  'Reviewing transaction history…',
  'Generating financial insights…',
  'Cross-referencing SMS data…',
  'Identifying merchant categories…',
];

const CAT = {
  spending: {
    icon: 'chart-pie',
    color: C.amber,
    label: 'Spending',
  },
  categories: {
    icon: 'view-grid-outline',
    color: C.teal,
    label: 'Categories',
  },
  subscriptions: {
    icon: 'repeat',
    color: C.purple,
    label: 'Subscriptions',
  },
  income: {
    icon: 'cash-multiple',
    color: C.green,
    label: 'Income',
  },
  savings: {
    icon: 'piggy-bank-outline',
    color: C.green,
    label: 'Savings',
  },
  anomaly: {
    icon: 'alert-circle-outline',
    color: C.red,
    label: 'Anomaly',
  },
  merchant: {
    icon: 'store-outline',
    color: C.teal,
    label: 'Merchant',
  },
  summary: {
    icon: 'shimmer',
    color: C.gold,
    label: 'Summary',
  },
};

// ─── Utility: derive session title from first user message ─────────────────────
// Mirrors behaviour in Claude / ChatGPT: first user question becomes the title.
// Falls back to "New chat" if no user message exists yet.
const deriveSessionTitle = (messages: Message[]): string => {
  const firstUser = messages.find(m => m.role === 'user');
  if (!firstUser) return 'New chat';
  const text = firstUser.text.trim();
  // Truncate to 42 chars with ellipsis, preserving word boundaries
  if (text.length <= 42) return text;
  const truncated = text.slice(0, 42);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 28 ? truncated.slice(0, lastSpace) : truncated) + '…';
};

// ─── Tiny utilities ────────────────────────────────────────────────────────────

const fmtTime = (ts: number) =>
  new Date(ts).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

const fmtDate = (ts: number) =>
  new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

// ═══════════════════════════════════════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════════════════════════════════════

// ── Pulse dot ──────────────────────────────────────────────────────────────────

const PulseDot: React.FC = () => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.6,
            duration: 950,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 950,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0.3,
            duration: 950,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 950,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View style={[g.pulseDot, { transform: [{ scale }], opacity }]} />
  );
};

// ── Waveform loading indicator ─────────────────────────────────────────────────

const WaveformLoader: React.FC<{ phrase: string }> = ({ phrase }) => {
  const anims = useRef(
    Array.from({ length: 9 }, (_, i) => ({
      a: new Animated.Value(0.2),
      d: i * 70,
    })),
  ).current;

  useEffect(() => {
    const loops = anims.map(({ a, d }) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(d),
          Animated.timing(a, {
            toValue: 1,
            duration: 380,
            useNativeDriver: true,
          }),
          Animated.timing(a, {
            toValue: 0.2,
            duration: 380,
            useNativeDriver: true,
          }),
        ]),
      ),
    );
    loops.forEach(l => l.start());
    return () => loops.forEach(l => l.stop());
  }, []);

  return (
    <View style={g.waveRow}>
      <View style={g.waveBars}>
        {anims.map(({ a }, i) => (
          <Animated.View
            key={i}
            style={[g.waveBar, { transform: [{ scaleY: a }] }]}
          />
        ))}
      </View>
      <Text style={g.waveLabel}>{phrase}</Text>
    </View>
  );
};

// ── Income card ────────────────────────────────────────────────────────────────
const IncomeCard = ({ text }: { text: string }) => (
  <View
    style={{
      marginTop: 10,
      backgroundColor: C.greenDim,
      borderWidth: 1,
      borderColor: C.greenBdr,
      borderRadius: 12,
      padding: 12,
    }}
  >
    <MaterialCommunityIcons name="cash-multiple" size={20} color={C.green} />
    <Text style={{ color: C.green, marginTop: 6, fontWeight: '600' }}>
      Income Summary
    </Text>
    <Text style={{ color: C.textPrimary, marginTop: 4 }}>{text}</Text>
  </View>
);

const SubscriptionCard: React.FC<{ merchants: MerchantChip[] }> = ({
  merchants,
}) => (
  <View style={g.subscriptionCard}>
    <Text style={{ color: C.purple, fontWeight: '600', marginBottom: 8 }}>
      Recurring Subscriptions
    </Text>
    {merchants.map(sub => (
      <View
        key={sub.name}
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingVertical: 4,
        }}
      >
        <Text style={{ color: C.textPrimary, fontSize: 12 }}>{sub.name}</Text>
        <Text style={{ color: C.purple, fontSize: 12, fontWeight: '600' }}>
          {sub.amount}
        </Text>
      </View>
    ))}
  </View>
);

// ── Merchant chip row ──────────────────────────────────────────────────────────

const MerchantRow: React.FC<{ merchants: MerchantChip[] }> = ({
  merchants,
}) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    style={{ marginTop: 11 }}
    contentContainerStyle={{ gap: 8, flexDirection: 'row', paddingRight: 4 }}
  >
    {merchants.map((m, i) => (
      <View
        key={i}
        style={[
          g.merchantChip,
          { borderLeftColor: m.color, borderLeftWidth: 2 },
        ]}
      >
        <View style={[g.merchantDot, { backgroundColor: m.color }]} />
        <View>
          <Text style={g.merchantName}>{m.name}</Text>
          <Text style={g.merchantMeta}>
            {m.category}
            {'  '}
            <Text style={{ color: m.color, fontWeight: '600' }}>
              {m.amount}
            </Text>
          </Text>
        </View>
      </View>
    ))}
  </ScrollView>
);

//CUSTOM HORIZONTAL CHART
const CategoryChart: React.FC<{ bars: MiniBar[] }> = ({ bars }) => (
  <View style={g.categoryCard}>
    {bars.map(item => {
      const max = Math.max(...bars.map(b => b.amount));

      const width = (item.amount / max) * 100;

      return (
        <View key={item.label} style={g.categoryRow}>
          <View style={g.categoryHeader}>
            <Text style={g.categoryLabel}>{item.label}</Text>

            <Text style={g.categoryAmount}>₹{item.amount}</Text>
          </View>

          <View style={g.progressTrack}>
            <View
              style={[
                g.progressFill,
                {
                  width: `${width}%`,
                  backgroundColor: item.color,
                },
              ]}
            />
          </View>

          <Text style={g.categoryPercent}>{item.percent?.toFixed(1)}%</Text>
        </View>
      );
    })}
  </View>
);

// ── Anomaly alert card ─────────────────────────────────────────────────────────

const AnomalyCard: React.FC<{ anomaly: AnomalyAlert }> = ({ anomaly }) => (
  <View style={g.anomalyCard}>
    <View style={{ flexDirection: 'row', gap: 9, alignItems: 'flex-start' }}>
      <MaterialCommunityIcons
        name="alert-circle"
        size={15}
        color={C.red}
        style={{ marginTop: 1 }}
      />
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={g.anomalyRef}>{anomaly.ref}</Text>
        <Text style={g.anomalyDesc}>{anomaly.desc}</Text>
        <View style={g.anomalyFooter}>
          <Text style={g.anomalyAmt}>{anomaly.amount}</Text>
          <TouchableOpacity style={g.reviewBtn} activeOpacity={0.8}>
            <Text style={g.reviewBtnText}>Review now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </View>
);

// ── Savings tip pill ───────────────────────────────────────────────────────────

const SavingsPill: React.FC<{ tip: string }> = ({ tip }) => (
  <View style={g.savingsPill}>
    <MaterialCommunityIcons name="trending-up" size={13} color={C.green} />
    <Text style={g.savingsPillText}>{tip}</Text>
  </View>
);

// ── Message bubble ─────────────────────────────────────────────────────────────

const MessageBubble: React.FC<{
  message: Message;
  onSuggestionPress?: (text: string) => void;
}> = ({ message, onSuggestionPress }) => {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(14)).current;
  const isUser = message.role === 'user';
  const { width } = useWindowDimensions();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 340,
        useNativeDriver: true,
      }),
      Animated.spring(slide, {
        toValue: 0,
        tension: 90,
        friction: 13,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const cat = message.meta?.insightType ? CAT[message.meta.insightType] : null;
  const meta = message.meta;
  const merchants = meta?.merchants ?? [];
  const bars = meta?.bars ?? [];
  const insightType = meta?.insightType;

  if (isUser) {
    return (
      <Animated.View
        style={[
          g.userRow,
          { opacity: fade, transform: [{ translateY: slide }] },
        ]}
      >
        <View style={[g.userBubble, { maxWidth: width * 0.72 }]}>
          <Text style={g.userText}>{message.text}</Text>
          <Text style={g.userTime}>{fmtTime(message.timestamp)}</Text>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[g.aiRow, { opacity: fade, transform: [{ translateY: slide }] }]}
    >
      <View style={g.aiAvatarSm}>
        <MaterialCommunityIcons name="shimmer" size={12} color={C.gold} />
      </View>

      <View style={{ flex: 1, gap: 5 }}>
        {cat && (
          <View
            style={[
              g.insightBadge,
              {
                backgroundColor: cat.color + '1A',
                borderColor: cat.color + '40',
              },
            ]}
          >
            <MaterialCommunityIcons
              name={cat.icon}
              size={11}
              color={cat.color}
            />
            <Text style={[g.insightBadgeText, { color: cat.color }]}>
              {cat.label} insight
            </Text>
          </View>
        )}

        <View style={g.aiCard}>
          <Text style={g.aiText}>{message.text}</Text>
          {message.suggestions?.length ? (
            <View style={g.suggestionContainer}>
              {message.suggestions.map(suggestion => (
                <TouchableOpacity
                  key={suggestion}
                  style={g.suggestionChip}
                  onPress={() => onSuggestionPress?.(suggestion)}
                >
                  <View style={g.suggestionContent}>
                    <MaterialCommunityIcons
                      name={suggestionIcons[suggestion] || 'lightbulb-outline'}
                      size={16}
                      color="#D4AF37"
                    />

                    <Text style={g.suggestionText}>{suggestion}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}

          {insightType === 'merchant' && merchants.length > 0 && (
            <MerchantRow merchants={merchants} />
          )}
          {bars.length > 0 && <CategoryChart bars={bars} />}
          {message.meta?.anomaly && (
            <AnomalyCard anomaly={message.meta.anomaly} />
          )}
          {message.meta?.savingsTip && (
            <SavingsPill tip={message.meta.savingsTip} />
          )}
          {insightType === 'subscriptions' && (merchants?.length ?? 0) > 0 && (
            <SubscriptionCard merchants={merchants!} />
          )}
          {insightType === 'income' && <IncomeCard text={message.text} />}
          <Text style={g.aiTime}>
            {fmtTime(message.timestamp)} · SmartSpend AI
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

// ── Session history item ───────────────────────────────────────────────────────

const SessionItem: React.FC<{
  item: Omit<ChatSession, 'messages'>;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}> = ({ item, isActive, onSelect, onDelete }) => {
  const cat = CAT[item.category];
  return (
    <TouchableOpacity
      style={[g.sessionItem, isActive && g.sessionItemActive]}
      onPress={onSelect}
      activeOpacity={0.72}
    >
      <View style={[g.sessionIcon, { backgroundColor: cat.color + '18' }]}>
        <MaterialCommunityIcons name={cat.icon} size={15} color={cat.color} />
      </View>

      <View style={{ flex: 1, gap: 3 }}>
        {/* Title = first user question (set by deriveSessionTitle) */}
        <Text
          style={[g.sessionTitle, isActive && { color: C.goldBright }]}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text style={g.sessionPreview} numberOfLines={1}>
          {item.preview}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
          <View style={[g.catPill, { backgroundColor: cat.color + '18' }]}>
            <Text style={[g.catPillText, { color: cat.color }]}>
              {cat.label}
            </Text>
          </View>
          <Text style={g.sessionDate}>{fmtDate(item.updatedAt)}</Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={onDelete}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <MaterialCommunityIcons name="close" size={13} color={C.textTertiary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ChatScreen — main component
// ═══════════════════════════════════════════════════════════════════════════════

const ChatScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { width: SCREEN_W } = useWindowDimensions();

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loadingPhrase, setLoadingPhrase] = useState(LOADING_PHRASES[0]);
  const [showHistory, setShowHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [headerH, setHeaderH] = useState(56);

  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const historySlide = useRef(new Animated.Value(-SCREEN_W * 0.84)).current;
  const historyAlpha = useRef(new Animated.Value(0)).current;
  const phraseIdx = useRef(0);

  // ─── Persistence ─────────────────────────────────────────────────────────

  const saveSessions = useCallback(async (data: ChatSession[]) => {
    try {
      await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(data));
    } catch {}
  }, []);

  const createNewSession = useCallback(
    (existing: ChatSession[]) => {
      const welcome: Message = {
        id: `m${Date.now()}`,
        role: 'ai',
        text: 'Ask me about your spending, savings, categories, subscriptions or anomalies.',
        timestamp: Date.now(),
      };
      const session: ChatSession = {
        id: `s${Date.now()}`,
        // Title starts as 'New chat' — updated to first user question on send
        title: 'New chat',
        preview: welcome.text.slice(0, 64) + '…',
        category: 'summary',
        messages: [welcome],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      const next = [session, ...existing];
      setSessions(next);
      setActiveSessionId(session.id);
      setMessages([welcome]);
      saveSessions(next);
      AsyncStorage.setItem(ACTIVE_KEY, session.id).catch(() => {});
    },
    [saveSessions],
  );

useEffect(() => {
  if (messages.length > 0) {
    flatListRef.current?.scrollToEnd({
      animated: true,
    });
  }
}, [messages.length]);
      
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(SESSIONS_KEY);
        const activeId = await AsyncStorage.getItem(ACTIVE_KEY);
        if (raw) {
          const loaded: ChatSession[] = JSON.parse(raw);
          setSessions(loaded);
          const target = activeId
            ? loaded.find(s => s.id === activeId)
            : loaded[0];
          if (target) {
            setActiveSessionId(target.id);
            setMessages(target.messages);
          } else createNewSession(loaded);
        } else {
          createNewSession([]);
        }
      } catch {
        createNewSession([]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // ── persistUpdate: uses deriveSessionTitle so title always = first user Q ──
  const persistUpdate = useCallback(
    (msgs: Message[], all: ChatSession[], sid: string) => {
      const next = all.map(s => {
        if (s.id !== sid) return s;
        const last = msgs[msgs.length - 1];
        return {
          ...s,
          title: deriveSessionTitle(msgs),
          preview: (last?.text?.slice(0, 64) ?? '') + '…',
          category: last?.meta?.insightType ?? s.category,
          messages: msgs,
          updatedAt: Date.now(),
        };
      });
      setSessions(next);
      saveSessions(next);
    },
    [saveSessions],
  );

  // ─── History drawer ───────────────────────────────────────────────────────

  const openHistory = useCallback(() => {
    setShowHistory(true);
    Animated.parallel([
      Animated.spring(historySlide, {
        toValue: 0,
        tension: 68,
        friction: 14,
        useNativeDriver: true,
      }),
      Animated.timing(historyAlpha, {
        toValue: 1,
        duration: 230,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const closeHistory = useCallback(() => {
    Animated.parallel([
      Animated.timing(historySlide, {
        toValue: -SCREEN_W * 0.84,
        duration: 290,
        useNativeDriver: true,
      }),
      Animated.timing(historyAlpha, {
        toValue: 0,
        duration: 240,
        useNativeDriver: true,
      }),
    ]).start(() => setShowHistory(false));
  }, [SCREEN_W]);

  const selectSession = useCallback(
    (session: ChatSession) => {
      setActiveSessionId(session.id);
      setMessages(session.messages);
      AsyncStorage.setItem(ACTIVE_KEY, session.id).catch(() => {});
      closeHistory();
    },
    [closeHistory],
  );

  const deleteSession = useCallback(
    (sid: string) => {
      setSessions(prev => {
        const next = prev.filter(s => s.id !== sid);
        saveSessions(next);
        if (sid === activeSessionId) {
          if (next.length > 0) {
            setActiveSessionId(next[0].id);
            setMessages(next[0].messages);
          } else createNewSession([]);
        }
        return next;
      });
    },
    [activeSessionId, saveSessions, createNewSession],
  );

  // ─── Messaging ────────────────────────────────────────────────────────────
  const cyclePhrase = useCallback(() => {
    phraseIdx.current = (phraseIdx.current + 1) % LOADING_PHRASES.length;
    setLoadingPhrase(LOADING_PHRASES[phraseIdx.current]);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || !activeSessionId || isTyping) return;
      setInputText('');

      const userMsg: Message = {
        id: `m${Date.now()}`,
        role: 'user',
        text: text.trim(),
        timestamp: Date.now(),
      };
      const withUser = [...messages, userMsg];
      setMessages(withUser);
      // persistUpdate now derives title from first user question automatically
      persistUpdate(withUser, sessions, activeSessionId);
      setIsTyping(true);
      setLoadingPhrase(LOADING_PHRASES[0]);
      phraseIdx.current = 0;

      const timer = setInterval(cyclePhrase, 1100);

      try {
        const aiResponse = await fetchAIInsight(text);
        let suggestions: string[] = [];
        console.log('INSIGHT TYPE:', aiResponse.insightType);
        switch (aiResponse.insightType) {
          case 'merchant':
            suggestions = [
              'Category Breakdown',
              'Savings Summary',
              'How can I reduce spending?',
            ];
            break;

          case 'spending':
            suggestions = [
              'Top Merchants',
              'Savings Summary',
              'Show Categories',
            ];
            break;

          case 'savings':
            suggestions = [
              'Income Breakdown',
              'Expenses Breakdown',
              'Top Category',
            ];
            break;

          case 'income':
            suggestions = [
              'Top Income Sources',
              'Savings Summary',
              'Monthly Overview',
            ];
            break;

          default:
            suggestions = [
              'Top Merchants',
              'Category Breakdown',
              'Savings Summary',
            ];
        }
        const aiMsg: Message = {
          id: `m${Date.now() + 1}`,
          role: 'ai',
          text: aiResponse.text,
          timestamp: Date.now(),

          suggestions,
          meta: {
            insightType: aiResponse.insightType,
            bars: aiResponse.bars || [],
            merchants: aiResponse.merchants || [],
            savingsTip: aiResponse.savingsTip,
            anomaly: aiResponse.anomaly,
          },
        };

        const final = [...withUser, aiMsg];
        setMessages(final);

        setSessions(prev => {
          const next = prev.map(s =>
            s.id === activeSessionId
              ? {
                  ...s,
                  // Keep first-user-question as title even after AI replies
                  title: deriveSessionTitle(final),
                  preview: aiResponse.text.slice(0, 64) + '…',
                  category: aiResponse.insightType ?? s.category,
                  messages: final,
                  updatedAt: Date.now(),
                }
              : s,
          );
          saveSessions(next);
          return next;
        });
      } catch (err) {
        const errorMsg: Message = {
          id: `m${Date.now()}`,
          role: 'ai',
          text: 'Unable to fetch insights right now.',
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, errorMsg]);
        console.log('AI CHAT ERROR:', err);
      } finally {
        clearInterval(timer);
        setIsTyping(false);
      }
    },
    [
      messages,
      activeSessionId,
      sessions,
      isTyping,
      persistUpdate,
      saveSessions,
      cyclePhrase,
    ],
  );

  // ─── Derived state ────────────────────────────────────────────────────────

  const allHistory = useMemo(() => {
    return sessions
      .map(({ id, title, preview, category, createdAt, updatedAt }) => ({
        id,
        title,
        preview,
        category,
        createdAt,
        updatedAt,
      }))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [sessions]);

  const activeSession = sessions.find(s => s.id === activeSessionId);
  const showWelcome = messages.length <= 1;

  // ─── Loading screen ───────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <SafeAreaView style={g.safe}>
        <StatusBar barStyle="light-content" backgroundColor={C.bg} />
        <View style={g.loadingCenter}>
          <ActivityIndicator size="large" color={C.gold} />
          <Text style={g.loadingText}>Initializing AI engine…</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Input bar bottom padding ─────────────────────────────────────────────
  // Ensures comfortable gap above home indicator on all devices (iPhone SE →
  // Dynamic Island) without double-applying insets when keyboard is visible.
  const inputPaddingBottom = Math.max(insets.bottom, 12);

  // ─── Main render ──────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={g.safe} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* ── Drawer overlay ── */}
      {showHistory && (
        <Animated.View
          style={[g.drawerOverlay, { opacity: historyAlpha }]}
          pointerEvents="auto"
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={closeHistory}
          />
        </Animated.View>
      )}

      {/* ── History drawer ── */}
      <Animated.View
        style={[
          g.drawer,
          {
            width: SCREEN_W * 0.84,
            paddingTop: insets.top + 12,
            transform: [{ translateX: historySlide }],
          },
        ]}
        pointerEvents={showHistory ? 'auto' : 'none'}
      >
        <View style={g.drawerHeader}>
          <View>
            <Text style={g.drawerTitle}>Session history</Text>
            <Text style={g.drawerSub}>SMS-analyzed conversations</Text>
          </View>
          <TouchableOpacity
            style={g.newChatBtn}
            activeOpacity={0.82}
            onPress={() => {
              closeHistory();
              setTimeout(() => createNewSession(sessions), 310);
            }}
          >
            <MaterialCommunityIcons
              name="plus"
              size={13}
              color={C.textInverse}
            />
            <Text style={g.newChatBtnText}>New</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={allHistory}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          renderItem={({ item }) => {
            const real = sessions.find(s => s.id === item.id);
            return (
              <SessionItem
                item={item}
                isActive={item.id === activeSessionId}
                onSelect={() => (real ? selectSession(real) : closeHistory())}
                onDelete={() => real && deleteSession(item.id)}
              />
            );
          }}
          ListEmptyComponent={
            <Text style={g.emptyHistory}>No sessions yet</Text>
          }
        />
      </Animated.View>

      {/* ── Top header ── */}
      <View
        style={g.header}
        onLayout={e => setHeaderH(e.nativeEvent.layout.height)}
      >
        <View style={g.headerRow}>
          <TouchableOpacity
            style={g.iconBtn}
            onPress={openHistory}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="menu"
              size={18}
              color={C.textSecondary}
            />
          </TouchableOpacity>

          <View style={g.headerMid}>
            <View style={g.aiAvatarLg}>
              <MaterialCommunityIcons name="shimmer" size={17} color={C.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={g.headerName} numberOfLines={1}>
                {activeSession && activeSession.title !== 'New chat'
                  ? activeSession.title
                  : 'SmartSpend AI'}
              </Text>
              <View style={g.statusRow}>
                <PulseDot />
                <Text style={g.statusText}>AI active · encrypted</Text>
              </View>
            </View>
          </View>

          <View style={g.headerRight}>
            <View style={g.encBadge}>
              <MaterialCommunityIcons
                name="lock-outline"
                size={10}
                color={C.textTertiary}
              />
              <Text style={g.encText}>E2E</Text>
            </View>
            <TouchableOpacity
              style={[g.iconBtn, { borderColor: C.goldBorder }]}
              onPress={() => createNewSession(sessions)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="plus-circle-outline"
                size={17}
                color={C.gold}
              />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={g.headerSub}>
          AI-powered financial insights from your SMS transaction history
        </Text>
      </View>

      {/* ── Keyboard-aware content area ── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={headerH}
      >
        {/* ── Messages list ── */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={m => m.id}
          renderItem={({ item }) => (
            <MessageBubble message={item} onSuggestionPress={sendMessage} />
          )}
          contentContainerStyle={g.msgList}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            showWelcome ? (
              <View style={g.welcomeBlock}>
                <View style={g.welcomeAvatarXL}>
                  <MaterialCommunityIcons
                    name="shimmer"
                    size={32}
                    color={C.gold}
                  />
                </View>
                <Text style={g.welcomeTitle}>SmartSpend AI</Text>
                <Text style={g.welcomeSub}>
                  Personal financial intelligence copilot
                </Text>
              </View>
            ) : null
          }
          ListFooterComponent={
            isTyping ? (
              <View style={[g.aiRow, { marginTop: 4 }]}>
                <View style={g.aiAvatarSm}>
                  <MaterialCommunityIcons
                    name="shimmer"
                    size={12}
                    color={C.gold}
                  />
                </View>
                <View style={g.aiCard}>
                  <WaveformLoader phrase={loadingPhrase} />
                </View>
              </View>
            ) : null
          }
        />

        {/* ── Quick prompt chips (welcome state only) ── */}
        {showWelcome && (
          <View style={g.promptsWrap}>
            <Text style={g.promptsLabel}>Suggested questions</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="always"
              contentContainerStyle={{
                gap: 8,
                flexDirection: 'row',
                paddingRight: 16,
              }}
            >
              {QUICK_PROMPTS.map(q => (
                <TouchableOpacity
                  key={q.label}
                  style={g.promptChip}
                  onPress={() => sendMessage(q.label)}
                  activeOpacity={0.76}
                >
                  <MaterialCommunityIcons
                    name={q.icon}
                    size={13}
                    color={C.gold}
                  />
                  <Text style={g.promptChipText}>{q.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── Input bar ──
            paddingBottom = Math.max(insets.bottom, 12) so there is always a
            comfortable gap above the home indicator on all devices.
            iOS removes the bottom inset automatically when keyboard is visible. */}
        <View style={[g.inputBar, { paddingBottom: inputPaddingBottom }]}>
          <View style={g.inputSep} />

          <View style={g.inputRow}>
            <View style={g.inputWrap}>
              <TextInput
                ref={inputRef}
                style={g.input}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Ask about spending, savings, subscriptions…"
                placeholderTextColor={C.textTertiary}
                multiline
                maxLength={500}
                keyboardAppearance="dark"
                returnKeyType="send"
                onSubmitEditing={() => sendMessage(inputText)}
              />
            </View>

            <TouchableOpacity
              style={[
                g.sendBtn,
                inputText.trim() && !isTyping ? g.sendBtnActive : g.sendBtnIdle,
              ]}
              onPress={() => sendMessage(inputText)}
              disabled={!inputText.trim() || isTyping}
              activeOpacity={0.82}
            >
              <MaterialCommunityIcons
                name={isTyping ? 'dots-horizontal' : 'send'}
                size={15}
                color={
                  inputText.trim() && !isTyping ? C.textInverse : C.textTertiary
                }
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// Styles
// ═══════════════════════════════════════════════════════════════════════════════

const g = StyleSheet.create({
  // ── Screen ────────────────────────────────────────────────────────────────
  safe: { flex: 1, backgroundColor: C.bg },
  loadingCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  loadingText: { fontSize: 13, color: C.textSecondary, letterSpacing: 0.3 },

  // ── Drawer overlay ────────────────────────────────────────────────────────
  drawerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.76)',
    zIndex: 15,
  },

  // ── History drawer ────────────────────────────────────────────────────────
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: '#09090C',
    borderRightWidth: 0.5,
    borderRightColor: C.border,
    zIndex: 25,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingBottom: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
    marginBottom: 4,
  },
  drawerTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: C.textPrimary,
    letterSpacing: 0.2,
  },
  drawerSub: {
    fontSize: 10,
    color: C.textTertiary,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  newChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: C.gold,
  },
  newChatBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: C.textInverse,
    letterSpacing: 0.3,
  },

  // ── Session list ──────────────────────────────────────────────────────────
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: C.borderSoft,
  },
  sessionItemActive: { backgroundColor: C.goldDim },
  sessionIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Slightly larger title font for readability (was 12)
  sessionTitle: { fontSize: 13, fontWeight: '500', color: C.textPrimary },
  sessionPreview: { fontSize: 10, color: C.textSecondary, lineHeight: 14 },
  sessionDate: { fontSize: 9, color: C.textTertiary },
  catPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5 },
  catPillText: { fontSize: 9, fontWeight: '500', letterSpacing: 0.3 },
  emptyHistory: {
    fontSize: 12,
    color: C.textTertiary,
    textAlign: 'center',
    paddingTop: 32,
  },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    backgroundColor: C.bg,
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerMid: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    flex: 1,
    paddingHorizontal: 8,
    // Prevent overflow on narrow screens (iPhone SE 320pt)
    minWidth: 0,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 7 },

  aiAvatarLg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.bgElevated,
    borderWidth: 1.5,
    borderColor: C.goldBorder,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  headerName: {
    fontSize: 13,
    fontWeight: '500',
    color: C.goldText,
    letterSpacing: 0.2,
    flexShrink: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  pulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.green },
  statusText: { fontSize: 9, color: C.green, letterSpacing: 0.5 },

  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: C.bgSurface,
    borderWidth: 0.5,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  encBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: C.bgSurface,
    borderWidth: 0.5,
    borderColor: C.border,
    borderRadius: 20,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  encText: { fontSize: 9, color: C.textTertiary, letterSpacing: 0.5 },
  headerSub: {
    fontSize: 10,
    color: C.textTertiary,
    marginTop: 5,
    lineHeight: 14,
    letterSpacing: 0.15,
  },

  // ── Messages list ─────────────────────────────────────────────────────────
  msgList: {
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 14,
  },

  // ── Welcome block ─────────────────────────────────────────────────────────
  welcomeBlock: { alignItems: 'center', paddingVertical: 30, gap: 10 },
  welcomeAvatarXL: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: C.bgSurface,
    borderWidth: 1.5,
    borderColor: C.goldBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '300',
    color: C.textPrimary,
    letterSpacing: 0.4,
  },
  welcomeSub: { fontSize: 11, color: C.textSecondary, letterSpacing: 0.25 },

  // ── Quick prompts ─────────────────────────────────────────────────────────
  promptsWrap: { paddingHorizontal: 14, paddingBottom: 12, gap: 7 },
  promptsLabel: { fontSize: 9, color: C.textTertiary, letterSpacing: 0.8 },
  promptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: C.bgSurface,
    borderWidth: 0.5,
    borderColor: C.goldBorder,
  },
  promptChipText: { fontSize: 11, color: C.textSecondary },

  // ── User message ──────────────────────────────────────────────────────────
  userRow: { flexDirection: 'row', justifyContent: 'flex-end' },
  userBubble: {
    // Richer gold gradient feel via a deeper base
    backgroundColor: C.gold,
    borderRadius: 18,
    borderBottomRightRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userText: { fontSize: 13, color: C.textInverse, lineHeight: 19 },
  userTime: {
    fontSize: 9,
    color: 'rgba(8,6,0,0.40)',
    textAlign: 'right',
    marginTop: 4,
  },

  // ── AI message ────────────────────────────────────────────────────────────
  aiRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  aiAvatarSm: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: C.bgElevated,
    borderWidth: 1,
    borderColor: C.goldBorder,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 25,
  },
  insightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 0.5,
  },
  insightBadgeText: { fontSize: 9, fontWeight: '600', letterSpacing: 0.4 },
  aiCard: {
    backgroundColor: C.bgSurface,
    borderWidth: 0.5,
    borderColor: C.border,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 13,
    flex: 1,
  },
  aiText: { fontSize: 13, color: C.textPrimary, lineHeight: 20 },
  aiTime: { fontSize: 9, color: C.textTertiary, marginTop: 9 },

  // ── Merchant chips ────────────────────────────────────────────────────────
  merchantChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.bgElevated,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: C.border,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  merchantDot: { width: 7, height: 7, borderRadius: 3.5 },
  merchantName: { fontSize: 11, fontWeight: '500', color: C.textPrimary },
  merchantMeta: { fontSize: 10, color: C.textSecondary, marginTop: 1 },

  // ── Mini bars ─────────────────────────────────────────────────────────────
  barRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  barLabel: { fontSize: 10, color: C.textSecondary },
  barPct: { fontSize: 10, fontWeight: '500' },
  barTrack: {
    backgroundColor: C.bgTint,
    borderRadius: 3,
    height: 4,
    overflow: 'hidden',
  },
  barFill: { height: 4, borderRadius: 3 },

  // ── Anomaly card ──────────────────────────────────────────────────────────
  anomalyCard: {
    backgroundColor: C.redDim,
    borderWidth: 0.5,
    borderColor: C.redBdr,
    borderRadius: 10,
    padding: 10,
    marginTop: 11,
  },
  anomalyRef: {
    fontSize: 10,
    color: C.red,
    fontWeight: '500',
    marginBottom: 3,
  },
  anomalyDesc: { fontSize: 11, color: '#BB8080', lineHeight: 16 },
  anomalyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 9,
  },
  anomalyAmt: { fontSize: 15, fontWeight: '500', color: C.red },
  reviewBtn: {
    backgroundColor: C.red + '20',
    borderWidth: 0.5,
    borderColor: C.red + '50',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  reviewBtnText: { fontSize: 10, color: C.red, fontWeight: '500' },

  // ── Savings pill ──────────────────────────────────────────────────────────
  savingsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: C.greenDim,
    borderWidth: 0.5,
    borderColor: C.greenBdr,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 11,
  },
  savingsPillText: { fontSize: 11, color: C.green, fontWeight: '500' },

  // ── Waveform loader ───────────────────────────────────────────────────────
  waveRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  waveBars: { flexDirection: 'row', alignItems: 'center', gap: 3, height: 22 },
  waveBar: { width: 3, height: 18, borderRadius: 2, backgroundColor: C.gold },
  waveLabel: { fontSize: 11, color: C.textSecondary, fontStyle: 'italic' },

  // ── Input bar ─────────────────────────────────────────────────────────────
  // paddingBottom is injected inline via inputPaddingBottom
  inputBar: {
    backgroundColor: C.bg,
    paddingHorizontal: 14,
    paddingTop: 8,
  },
  inputSep: {
    height: 0.5,
    backgroundColor: C.border,
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 9,
  },
  inputWrap: {
    flex: 1,
    backgroundColor: C.bgInput,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: C.border,
    paddingHorizontal: 13,
    paddingTop: Platform.OS === 'ios' ? 11 : 7,
    paddingBottom: Platform.OS === 'ios' ? 11 : 7,
    minHeight: 44,
    justifyContent: 'flex-start',
  },
  input: {
    fontSize: 13,
    color: C.textPrimary,
    maxHeight: 120,
    lineHeight: 20,
    padding: 0,
    margin: 0,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sendBtnActive: { backgroundColor: C.gold },
  sendBtnIdle: {
    backgroundColor: C.bgElevated,
    borderWidth: 0.5,
    borderColor: C.border,
  },
  subscriptionCard: {
    marginTop: 10,
    backgroundColor: C.purpleDim,
    borderWidth: 1,
    borderColor: C.purple,
    borderRadius: 12,
    padding: 12,
  },
  categoryCard: {
    backgroundColor: '#141414',

    borderRadius: 20,

    padding: 18,

    marginTop: 12,

    borderWidth: 1,

    borderColor: 'rgba(212,175,55,0.12)',
  },

  categoryRow: {
    marginBottom: 18,
  },

  categoryHeader: {
    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'center',

    marginBottom: 8,
  },

  categoryLabel: {
    color: '#FFFFFF',

    fontSize: 15,

    fontWeight: '600',
  },

  categoryAmount: {
    color: '#D4AF37',

    fontSize: 15,

    fontWeight: '700',
  },

  progressTrack: {
    height: 10,

    backgroundColor: 'rgba(255,255,255,0.08)',

    borderRadius: 999,

    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',

    borderRadius: 999,
  },

  categoryPercent: {
    color: '#8A8A8A',

    fontSize: 12,

    marginTop: 6,

    textAlign: 'right',
  },
  suggestionContainer: {
    flexDirection: 'row',

    flexWrap: 'wrap',

    marginTop: 12,

    gap: 8,
  },

  suggestionChip: {
    backgroundColor: 'rgba(212,175,55,0.12)',

    borderWidth: 1,

    borderColor: 'rgba(212,175,55,0.25)',

    borderRadius: 20,

    paddingHorizontal: 12,

    paddingVertical: 8,
  },

  suggestionText: {
    color: '#D4AF37',

    fontSize: 12,

    fontWeight: '600',
  },
  suggestionContent: {
    flexDirection: 'row',

    alignItems: 'center',

    gap: 6,
  },
});

export default ChatScreen;
