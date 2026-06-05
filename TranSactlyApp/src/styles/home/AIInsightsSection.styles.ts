import { StyleSheet, Dimensions } from 'react-native';
import { Colors, Space, Font } from '../../theme';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_W * 0.75;

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Space.md,
    marginTop: Space.lg,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.sm,
  },
  sectionTitle: { ...Font.labelS, color: Colors.textMuted },
  sectionAction: { ...Font.labelS, color: Colors.gold },
  insightScroll: {
    paddingRight: Space.sm,
    gap: Space.sm,
    marginBottom: Space.md,
  },
});

export default styles;