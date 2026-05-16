import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, StatusBar,
  TouchableOpacity, TextInput, KeyboardAvoidingView,
  Platform, Animated, Dimensions, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Space, Radius, Font } from '../theme';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Types ────────────────────────────────────────────────────────────────────

type MessageRole = 'user' | 'ai';

interface Message {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: number;
}

interface ChatSession {
  id: string;
  title: string;
  preview: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const SESSIONS_KEY = 'smartspend_chat_sessions';
const ACTIVE_SESSION_KEY = 'smartspend_active_session';

// ─── AI Quick Replies ─────────────────────────────────────────────────────────

const QUICK_PROMPTS = [
  { icon: 'chart-pie', label: 'Spending breakdown' },
  { icon: 'trending-down', label: 'Save money tips' },
  { icon: 'alert-circle-outline', label: 'Unusual transactions' },
  { icon: 'calendar-month', label: 'Monthly summary' },
];

const AI_RESPONSES: Record<string, string> = {
  default: "I'm analysing your financial data. Based on your recent transactions, here's what I found...",
  spending: "Your top spending categories this month are Food & Dining (28%), Travel (20%), and Entertainment (14%). You've spent ₹41.1K so far — 74% of your monthly budget.",
  save: "Here are 3 personalised saving tips:\n\n1. **Cut subscriptions** — You have 3 recurring charges totalling ₹2,097/month. Review if all are in use.\n2. **Reduce food delivery** — Swiggy/Zomato orders are up 18% this week.\n3. **Set auto-save** — Transfer ₹5K on salary day before you spend.",
  unusual: "🚨 I flagged 1 suspicious transaction:\n\n• MPAY23819 — ₹2,340 on 14 May\n\nThis merchant is unrecognised and the amount is atypical for your profile. Tap below to dispute it immediately.",
  summary: "**May 2026 Summary**\n\nIncome: ₹1,10,000\nSpending: ₹41,100 (↓6.2%)\nSavings: ₹24,800\nInvested: ₹12,200\n\nYou're on track to hit your savings goal this month! 🎯",
};

const getAIResponse = (input: string): string => {
  const lower = input.toLowerCase();
  if (lower.includes('spend') || lower.includes('breakdown') || lower.includes('categor')) return AI_RESPONSES.spending;
  if (lower.includes('save') || lower.includes('tip') || lower.includes('cut')) return AI_RESPONSES.save;
  if (lower.includes('unusual') || lower.includes('suspicious') || lower.includes('fraud')) return AI_RESPONSES.unusual;
  if (lower.includes('summary') || lower.includes('month') || lower.includes('overview')) return AI_RESPONSES.summary;
  return AI_RESPONSES.default;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const AIPulseDot: React.FC = () => {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.4, duration: 800, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return <Animated.View style={[styles.pulseDot, { transform: [{ scale }] }]} />;
};

const TypingIndicator: React.FC = () => {
  const dots = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];
  useEffect(() => {
    const anims = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 200),
          Animated.timing(dot, { toValue: -6, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
        ])
      )
    );
    anims.forEach(a => a.start());
    return () => anims.forEach(a => a.stop());
  }, []);
  return (
    <View style={styles.typingBubble}>
      <View style={styles.typingDots}>
        {dots.map((dot, i) => (
          <Animated.View key={i} style={[styles.typingDot, { transform: [{ translateY: dot }] }]} />
        ))}
      </View>
    </View>
  );
};

const MessageBubble: React.FC<{ message: Message; index: number }> = ({ message, index }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;
  const isUser = message.role === 'user';

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 350, useNativeDriver: true }),
    ]).start();
  }, []);

  const time = new Date(message.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  // Parse bold markdown for AI messages
  const renderText = (text: string) => {
    if (isUser) return <Text style={styles.userMsgText}>{text}</Text>;
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return (
      <Text style={styles.aiMsgText}>
        {parts.map((p, i) =>
          p.startsWith('**') && p.endsWith('**')
            ? <Text key={i} style={styles.aiMsgBold}>{p.slice(2, -2)}</Text>
            : p
        )}
      </Text>
    );
  };

  return (
    <Animated.View
      style={[
        styles.msgRow,
        isUser ? styles.msgRowUser : styles.msgRowAI,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      {!isUser && (
        <View style={styles.aiAvatar}>
          <MaterialCommunityIcons name="sparkles" size={12} color={Colors.textInverse} />
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
        {renderText(message.text)}
        <Text style={[styles.msgTime, isUser ? styles.msgTimeUser : styles.msgTimeAI]}>{time}</Text>
      </View>
    </Animated.View>
  );
};

const SessionItem: React.FC<{
  session: ChatSession;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}> = ({ session, isActive, onSelect, onDelete }) => (
  <TouchableOpacity
    style={[styles.sessionItem, isActive && styles.sessionItemActive]}
    onPress={onSelect}
    activeOpacity={0.75}
  >
    <View style={styles.sessionIconBox}>
      <MaterialCommunityIcons name="chat-processing-outline" size={16} color={isActive ? Colors.gold : Colors.textSecondary} />
    </View>
    <View style={{ flex: 1, gap: 3 }}>
      <Text style={[styles.sessionTitle, isActive && { color: Colors.gold }]} numberOfLines={1}>{session.title}</Text>
      <Text style={styles.sessionPreview} numberOfLines={1}>{session.preview}</Text>
      <Text style={styles.sessionDate}>
        {new Date(session.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
      </Text>
    </View>
    <TouchableOpacity onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
      <MaterialCommunityIcons name="close" size={14} color={Colors.textMuted} />
    </TouchableOpacity>
  </TouchableOpacity>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

const ChatScreen: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const historySlide = useRef(new Animated.Value(-SCREEN_W * 0.75)).current;

  // ─── Persistence ───────────────────────────────────────────────────────────

  const saveSessions = useCallback(async (data: ChatSession[]) => {
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(data));
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(SESSIONS_KEY);
        const activeId = await AsyncStorage.getItem(ACTIVE_SESSION_KEY);
        if (raw) {
          const loaded: ChatSession[] = JSON.parse(raw);
          setSessions(loaded);
          const target = activeId ? loaded.find(s => s.id === activeId) : loaded[0];
          if (target) {
            setActiveSessionId(target.id);
            setMessages(target.messages);
          } else {
            createNewSession(loaded);
          }
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

  const createNewSession = useCallback((existingSessions: ChatSession[]) => {
    const welcome: Message = {
      id: Date.now().toString(),
      role: 'ai',
      text: "Hi! I'm your SmartSpend AI assistant. Ask me anything about your finances — spending patterns, saving tips, suspicious transactions, or monthly summaries.",
      timestamp: Date.now(),
    };
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      preview: welcome.text.slice(0, 60) + '...',
      messages: [welcome],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = [newSession, ...existingSessions];
    setSessions(updated);
    setActiveSessionId(newSession.id);
    setMessages([welcome]);
    saveSessions(updated);
    AsyncStorage.setItem(ACTIVE_SESSION_KEY, newSession.id);
  }, [saveSessions]);

  const updateActiveSession = useCallback((newMessages: Message[], allSessions: ChatSession[], sessionId: string) => {
    const updated = allSessions.map(s => {
      if (s.id !== sessionId) return s;
      const firstUserMsg = newMessages.find(m => m.role === 'user');
      return {
        ...s,
        title: firstUserMsg ? firstUserMsg.text.slice(0, 32) + (firstUserMsg.text.length > 32 ? '...' : '') : s.title,
        preview: newMessages[newMessages.length - 1]?.text.slice(0, 60) + '...',
        messages: newMessages,
        updatedAt: Date.now(),
      };
    });
    setSessions(updated);
    saveSessions(updated);
  }, [saveSessions]);

  // ─── History Panel ─────────────────────────────────────────────────────────

  const toggleHistory = useCallback(() => {
    if (showHistory) {
      Animated.timing(historySlide, { toValue: -SCREEN_W * 0.75, duration: 300, useNativeDriver: true }).start(() => setShowHistory(false));
    } else {
      setShowHistory(true);
      Animated.timing(historySlide, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    }
  }, [showHistory]);

  const selectSession = useCallback((session: ChatSession) => {
    setActiveSessionId(session.id);
    setMessages(session.messages);
    AsyncStorage.setItem(ACTIVE_SESSION_KEY, session.id);
    toggleHistory();
  }, [toggleHistory]);

  const deleteSession = useCallback((sessionId: string) => {
    setSessions(prev => {
      const updated = prev.filter(s => s.id !== sessionId);
      saveSessions(updated);
      if (sessionId === activeSessionId) {
        if (updated.length > 0) {
          setActiveSessionId(updated[0].id);
          setMessages(updated[0].messages);
        } else {
          createNewSession([]);
        }
      }
      return updated;
    });
  }, [activeSessionId, saveSessions, createNewSession]);

  // ─── Messaging ─────────────────────────────────────────────────────────────

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || !activeSessionId) return;
    setInputText('');

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: text.trim(), timestamp: Date.now() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    updateActiveSession(newMessages, sessions, activeSessionId);

    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    setIsTyping(true);
    await new Promise<void>((resolve) => { setTimeout(() => { resolve(); }, 1200 + Math.random() * 600); });
    setIsTyping(false);

    const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'ai', text: getAIResponse(text), timestamp: Date.now() };
    const finalMessages = [...newMessages, aiMsg];
    setMessages(finalMessages);
    setSessions(prev => {
      const updated = prev.map(s => s.id === activeSessionId ? { ...s, preview: aiMsg.text.slice(0, 60) + '...', messages: finalMessages, updatedAt: Date.now() } : s);
      saveSessions(updated);
      return updated;
    });

    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, activeSessionId, sessions, updateActiveSession, saveSessions]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={Colors.gold} />
          <Text style={styles.loadingText}>Loading AI Chat...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const activeSession = sessions.find(s => s.id === activeSessionId);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      {/* ── History Drawer ── */}
      {showHistory && (
        <TouchableOpacity style={styles.drawerOverlay} activeOpacity={1} onPress={toggleHistory} />
      )}
      {showHistory && (
        <Animated.View style={[styles.historyDrawer, { transform: [{ translateX: historySlide }] }]}>
          <View style={styles.drawerHeader}>
            <Text style={styles.drawerTitle}>CHAT HISTORY</Text>
            <TouchableOpacity onPress={() => createNewSession(sessions)} style={styles.newChatBtn}>
              <MaterialCommunityIcons name="plus" size={14} color={Colors.textInverse} />
              <Text style={styles.newChatBtnText}>NEW</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={sessions}
            keyExtractor={s => s.id}
            renderItem={({ item }) => (
              <SessionItem
                session={item}
                isActive={item.id === activeSessionId}
                onSelect={() => selectSession(item)}
                onDelete={() => deleteSession(item.id)}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: Space.xxl }}
            ListEmptyComponent={
              <Text style={styles.emptyHistory}>No chats yet</Text>
            }
          />
        </Animated.View>
      )}

      {/* ── Top Bar ── */}
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <TouchableOpacity style={styles.historyBtn} onPress={toggleHistory} activeOpacity={0.8}>
            <MaterialCommunityIcons name="menu" size={18} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.aiHeaderInfo}>
            <View style={styles.aiAvatarHeader}>
              <MaterialCommunityIcons name="sparkles" size={14} color={Colors.textInverse} />
            </View>
            <View>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {activeSession?.title || 'SmartSpend AI'}
              </Text>
              <View style={styles.headerStatusRow}>
                <AIPulseDot />
                <Text style={styles.headerStatus}>AI ASSISTANT • ONLINE</Text>
              </View>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => createNewSession(sessions)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="plus-circle-outline" size={18} color={Colors.gold} />
        </TouchableOpacity>
      </View>

      {/* ── Messages ── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={m => m.id}
          renderItem={({ item, index }) => <MessageBubble message={item} index={index} />}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListHeaderComponent={
            messages.length <= 1 ? (
              <View style={styles.welcomeBanner}>
                <View style={styles.welcomeIconBox}>
                  <MaterialCommunityIcons name="robot-excited-outline" size={32} color={Colors.gold} />
                </View>
                <Text style={styles.welcomeTitle}>SmartSpend AI</Text>
                <Text style={styles.welcomeSub}>Your personal finance intelligence</Text>
              </View>
            ) : null
          }
          ListFooterComponent={isTyping ? <TypingIndicator /> : null}
        />

        {/* ── Quick Prompts ── */}
        {messages.length <= 1 && (
          <View style={styles.quickPromptsRow}>
            {QUICK_PROMPTS.map(q => (
              <TouchableOpacity
                key={q.label}
                style={styles.quickBtn}
                onPress={() => sendMessage(q.label)}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name={q.icon} size={13} color={Colors.gold} />
                <Text style={styles.quickBtnText}>{q.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── Input Bar ── */}
        <View style={styles.inputBar}>
          <View style={styles.inputWrap}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask about your finances..."
              placeholderTextColor={Colors.textMuted}
              multiline
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={() => sendMessage(inputText)}
              blurOnSubmit
            />
          </View>
          <TouchableOpacity
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            onPress={() => sendMessage(inputText)}
            disabled={!inputText.trim() || isTyping}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="send" size={16} color={inputText.trim() ? Colors.textInverse : Colors.textMuted} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  loadingCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Space.lg },
  loadingText: { ...Font.labelM, color: Colors.textSecondary },

  // Drawer
  drawerOverlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10 },
  historyDrawer: {
    position: 'absolute', top: 0, left: 0, bottom: 0,
    width: SCREEN_W * 0.75, backgroundColor: Colors.bgCard,
    borderRightWidth: 0.5, borderRightColor: Colors.border,
    zIndex: 20, paddingTop: Space.xl,
  },
  drawerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Space.xl, paddingBottom: Space.lg, borderBottomWidth: 0.5, borderBottomColor: Colors.border, marginBottom: Space.sm },
  drawerTitle: { ...Font.labelS, color: Colors.textMuted, letterSpacing: 1.5 },
  newChatBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Space.md, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: Colors.gold },
  newChatBtnText: { fontSize: 10, fontWeight: '700', letterSpacing: 1, color: Colors.textInverse },

  sessionItem: { flexDirection: 'row', alignItems: 'center', gap: Space.md, paddingHorizontal: Space.xl, paddingVertical: Space.md, borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  sessionItemActive: { backgroundColor: Colors.goldMuted },
  sessionIconBox: { width: 32, height: 32, borderRadius: Radius.sm, backgroundColor: Colors.bgElevated, alignItems: 'center', justifyContent: 'center' },
  sessionTitle: { ...Font.labelM, color: Colors.textPrimary, fontSize: 12 },
  sessionPreview: { ...Font.bodyS, color: Colors.textSecondary, fontSize: 11 },
  sessionDate: { ...Font.labelS, color: Colors.textMuted, fontSize: 9, marginTop: 2 },
  emptyHistory: { ...Font.bodyS, color: Colors.textMuted, textAlign: 'center', paddingTop: Space.xxl },

  // Top bar
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Space.xl, paddingVertical: Space.md, borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  topLeft: { flexDirection: 'row', alignItems: 'center', gap: Space.md },
  historyBtn: { width: 36, height: 36, borderRadius: Radius.sm, backgroundColor: Colors.bgCard, borderWidth: 0.5, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  aiHeaderInfo: { flexDirection: 'row', alignItems: 'center', gap: Space.sm },
  aiAvatarHeader: { width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.gold, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...Font.labelM, color: Colors.textPrimary, fontSize: 13, maxWidth: SCREEN_W * 0.4 },
  headerStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  headerStatus: { fontSize: 9, fontWeight: '700', letterSpacing: 0.8, color: '#3DCB7F' },
  pulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#3DCB7F' },
  iconBtn: { width: 36, height: 36, borderRadius: Radius.sm, backgroundColor: Colors.bgCard, borderWidth: 0.5, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },

  // Messages
  messageList: { paddingHorizontal: Space.xl, paddingVertical: Space.lg, paddingBottom: Space.md, gap: Space.sm },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: Space.sm },
  msgRowUser: { justifyContent: 'flex-end' },
  msgRowAI: { justifyContent: 'flex-start' },
  aiAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.gold, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  bubble: { maxWidth: SCREEN_W * 0.72, borderRadius: Radius.lg, padding: Space.md },
  userBubble: { backgroundColor: Colors.gold, borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: Colors.bgCard, borderWidth: 0.5, borderColor: Colors.border, borderBottomLeftRadius: 4 },
  userMsgText: { ...Font.bodyM, color: Colors.textInverse, lineHeight: 20 },
  aiMsgText: { ...Font.bodyM, color: Colors.textPrimary, lineHeight: 20 },
  aiMsgBold: { fontWeight: '700', color: Colors.gold },
  msgTime: { fontSize: 9, marginTop: 4 },
  msgTimeUser: { color: 'rgba(255,255,255,0.6)', textAlign: 'right' },
  msgTimeAI: { color: Colors.textMuted },

  // Typing
  typingBubble: { backgroundColor: Colors.bgCard, borderWidth: 0.5, borderColor: Colors.border, borderRadius: Radius.lg, borderBottomLeftRadius: 4, paddingHorizontal: Space.md, paddingVertical: Space.md, alignSelf: 'flex-start', marginLeft: Space.xl + 28 + Space.sm, marginBottom: Space.sm },
  typingDots: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  typingDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: Colors.gold },

  // Welcome banner
  welcomeBanner: { alignItems: 'center', paddingVertical: Space.xxl, gap: Space.md },
  welcomeIconBox: { width: 72, height: 72, borderRadius: Radius.xl, backgroundColor: Colors.goldMuted, borderWidth: 1, borderColor: Colors.goldBorder, alignItems: 'center', justifyContent: 'center', marginBottom: Space.sm },
  welcomeTitle: { ...Font.displayM, color: Colors.textPrimary, fontSize: 22, fontWeight: '300' },
  welcomeSub: { ...Font.bodyS, color: Colors.textSecondary },

  // Quick prompts
  quickPromptsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.sm, paddingHorizontal: Space.xl, paddingBottom: Space.sm },
  quickBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: Space.md, paddingVertical: Space.sm, borderRadius: Radius.full, backgroundColor: Colors.bgCard, borderWidth: 0.5, borderColor: Colors.goldBorder },
  quickBtnText: { ...Font.labelS, fontSize: 11, color: Colors.textSecondary },

  // Input
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', gap: Space.sm, paddingHorizontal: Space.xl, paddingTop: Space.sm, paddingBottom: Space.md, borderTopWidth: 0.5, borderTopColor: Colors.border, backgroundColor: Colors.bg },
  inputWrap: { flex: 1, backgroundColor: Colors.bgCard, borderRadius: Radius.lg, borderWidth: 0.5, borderColor: Colors.border, paddingHorizontal: Space.md, paddingVertical: Platform.OS === 'ios' ? Space.sm : 2, minHeight: 44 },
  input: { ...Font.bodyM, color: Colors.textPrimary, maxHeight: 100, fontSize: 14 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.gold, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: Colors.bgElevated },
});

export default ChatScreen;