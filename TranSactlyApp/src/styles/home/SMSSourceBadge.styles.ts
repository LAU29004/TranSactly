import { StyleSheet } from 'react-native';
import { Colors, Space, Radius, Font } from '../../theme';

const styles = StyleSheet.create({
  smsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Space.sm,
    paddingHorizontal: Space.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgElevated,
    borderWidth: 0.5,
    borderColor: Colors.border,
    alignSelf: 'flex-start',
  },
  smsBadgeText: {
    ...Font.labelS,
    fontSize: 9,
    color: Colors.textMuted,
    fontWeight: '500',
  },
});

export default styles;