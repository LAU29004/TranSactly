// ── Premium Fintech Design Tokens — Obsidian & Gold ─────────────────────────
// Palette: Deep black foundations · Pure white text · 24K gold accents
// Aesthetic: Luxury private banking · Refined dark mode · Editorial precision

export const Colors = {
  // ── Backgrounds ─────────────────────────────────────────────
  bg:          '#080808',   // True near-black — premium base
  bgCard:      '#111111',   // Elevated card surface
  bgElevated:  '#181818',   // Modals, sheets, popovers
  bgInput:     '#141414',   // Input fields
  bgGlass:     'rgba(255,255,255,0.03)', // Frosted glass overlay

  // ── Borders ─────────────────────────────────────────────────
  border:      '#202020',   // Subtle separator
  borderLight: '#2E2E2E',   // Slightly more visible divider
  borderGold:  'rgba(212,175,55,0.25)', // Gold-tinted border
  borderWhite: 'rgba(255,255,255,0.06)', // Ghost white border

  // ── Gold Palette (24K / Heraldic Gold) ──────────────────────
  gold:        '#D4AF37',   // 24K heraldic gold — primary brand
  goldLight:   '#F0D060',   // Bright highlight gold
  goldDark:    '#A88A1A',   // Deep burnished gold
  goldSubtle:  '#B8962E',   // Mid-tone gold for secondary elements
  goldMuted:   'rgba(212,175,55,0.08)',  // Gold tint @ 8% — hover states
  goldBorder:  'rgba(212,175,55,0.22)',  // Gold border @ 22%
  goldGlow:    'rgba(212,175,55,0.15)',  // Gold ambient glow

  // ── White / Light Scale ──────────────────────────────────────
  white:       '#FFFFFF',   // Pure white — hero text, key figures
  white90:     'rgba(255,255,255,0.90)', // Primary body text
  white60:     'rgba(255,255,255,0.60)', // Secondary / labels
  white35:     'rgba(255,255,255,0.35)', // Muted / disabled
  white12:     'rgba(255,255,255,0.12)', // Ghost fills
  white06:     'rgba(255,255,255,0.06)', // Hairline tints

  // ── Text ────────────────────────────────────────────────────
  textPrimary:   '#FFFFFF',               // Pure white — hero numbers, titles
  textSecondary: 'rgba(255,255,255,0.70)', // Body copy
  textMuted:     'rgba(255,255,255,0.38)', // Placeholders, captions
  textDisabled:  'rgba(255,255,255,0.22)', // Disabled state
  textGold:      '#D4AF37',               // Gold accent text
  textInverse:   '#080808',               // Text on gold buttons

  // ── Semantic — green/red retained for financial literacy ────
  credit:     '#34C97B',                  // Gain / incoming
  creditBg:   'rgba(52,201,123,0.08)',
  creditText: '#34C97B',
  debit:      '#E5495A',                  // Loss / outgoing
  debitBg:    'rgba(229,73,90,0.08)',
  debitText:  '#E5495A',
  warning:    '#F5A623',                  // Caution / alerts
  warningBg:  'rgba(245,166,35,0.10)',

  // ── Gradients (as string references for RN LinearGradient) ──
  gradientGold:      ['#F0D060', '#D4AF37', '#A88A1A'] as const,
  gradientGoldFade:  ['#D4AF37', 'rgba(212,175,55,0)'] as const,
  gradientCard:      ['#181818', '#111111'] as const,
  gradientHero:      ['#1A1600', '#080808'] as const, // subtle warm-black
  gradientOverlay:   ['rgba(8,8,8,0)', 'rgba(8,8,8,0.95)'] as const,

  // ── Tab Bar ─────────────────────────────────────────────────
  tabBg:       '#0D0D0D',
  tabActive:   '#D4AF37',
  tabInactive: 'rgba(255,255,255,0.28)',
  tabBorder:   'rgba(212,175,55,0.15)',
};

// ── Border Radius ────────────────────────────────────────────────────────────
export const Radius = {
  xs:   4,    // Tags, badges
  sm:   8,    // Inputs, small cards
  md:   12,   // Standard cards
  lg:   16,   // Large cards, sheets
  xl:   20,   // Modals
  xxl:  28,   // Hero cards
  full: 999,  // Pills, avatars
};

// ── Spacing ──────────────────────────────────────────────────────────────────
export const Space = {
  xxs:  2,
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  xxl:  32,
  xxxl: 48,
  hero: 64,
};

// ── Typography ───────────────────────────────────────────────────────────────
// Font stack: 'Cormorant Garamond' (display) + 'DM Sans' (body)
// — Replace with your loaded font family names in RN config
export const Font = {
  // Display — editorial, high-contrast
  displayXL: { fontSize: 36, fontWeight: '800' as const, letterSpacing: -1.2, lineHeight: 40 },
  displayL:  { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.8, lineHeight: 34 },
  displayM:  { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.4, lineHeight: 28 },
  displayS:  { fontSize: 18, fontWeight: '600' as const, letterSpacing: -0.2, lineHeight: 24 },

  // Body — readable, airy
  bodyL:  { fontSize: 16, fontWeight: '400' as const, lineHeight: 26 },
  bodyM:  { fontSize: 14, fontWeight: '400' as const, lineHeight: 22 },
  bodyS:  { fontSize: 13, fontWeight: '400' as const, lineHeight: 20 },

  // Labels — uppercase micro-copy, tracking
  labelL:  { fontSize: 13, fontWeight: '600' as const, letterSpacing: 0.4 },
  labelM:  { fontSize: 11, fontWeight: '600' as const, letterSpacing: 1.0, textTransform: 'uppercase' as const },
  labelS:  { fontSize: 10, fontWeight: '700' as const, letterSpacing: 1.4, textTransform: 'uppercase' as const },

  // Numbers — financial figures, monospaced feel
  numXXL: { fontSize: 48, fontWeight: '800' as const, letterSpacing: -2.4, lineHeight: 52 },
  numXL:  { fontSize: 40, fontWeight: '800' as const, letterSpacing: -2.0, lineHeight: 44 },
  numL:   { fontSize: 32, fontWeight: '700' as const, letterSpacing: -1.4, lineHeight: 36 },
  numM:   { fontSize: 20, fontWeight: '700' as const, letterSpacing: -0.6, lineHeight: 24 },
  numS:   { fontSize: 15, fontWeight: '600' as const, letterSpacing: -0.2, lineHeight: 20 },
};

// ── Shadows ──────────────────────────────────────────────────────────────────
// For React Native use with shadowColor / elevation; for web use as box-shadow strings
export const Shadow = {
  xs:   { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.3,  shadowRadius: 4,  elevation: 2  },
  sm:   { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4,  shadowRadius: 8,  elevation: 4  },
  md:   { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5,  shadowRadius: 16, elevation: 8  },
  lg:   { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.6,  shadowRadius: 24, elevation: 12 },
  gold: { shadowColor: '#D4AF37', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
};

// ── Animation Durations (ms) ─────────────────────────────────────────────────
export const Duration = {
  instant: 80,
  fast:    150,
  normal:  250,
  slow:    400,
  xslow:   600,
};

// ── Z-Index Stack ────────────────────────────────────────────────────────────
export const ZIndex = {
  base:    0,
  card:    10,
  overlay: 20,
  modal:   30,
  toast:   40,
  tooltip: 50,
};