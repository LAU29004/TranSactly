import { StyleSheet } from 'react-native';
import { Colors, Space, Radius, Font } from '../../theme';

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 32,
    right: Space.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: Radius.full,
    backgroundColor: Colors.gold,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: Colors.textInverse,
  },
});

export default styles;