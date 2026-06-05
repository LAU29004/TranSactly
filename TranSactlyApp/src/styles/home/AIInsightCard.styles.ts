import { StyleSheet, Dimensions } from 'react-native';
import { Colors, Space, Radius, Font } from '../../theme';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_W * 0.75;

const styles = StyleSheet.create({
  insightCard: {
    width: CARD_WIDTH,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    padding: Space.lg,
    gap: Space.sm,
  },
  insightCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  insightIconBox: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightConfPill: {
    paddingHorizontal: Space.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 0.5,
  },
  insightConfText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.8 },
  insightBody: { ...Font.bodyS, color: Colors.textPrimary, lineHeight: 20 },
  insightCategory: {
    ...Font.labelS,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  insightMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  insightMeta: { ...Font.labelS, fontSize: 9 },
  insightCta: { ...Font.labelS, fontSize: 10, letterSpacing: 0.8 },
});

export default styles;