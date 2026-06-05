import { StyleSheet } from 'react-native';
import { Colors, Space, Radius, Font } from '../../theme';

const styles = StyleSheet.create({
  periodSelector: {
    flexDirection: 'row',
    gap: Space.sm,
    marginBottom: Space.lg,
    marginTop: Space.md,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: Space.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.bgElevated,
    borderWidth: 0.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodBtnActive: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  periodBtnText: { ...Font.labelS, fontSize: 10, color: Colors.textSecondary },
  periodBtnTextActive: { color: Colors.textInverse },
});

export default styles;