import { StyleSheet } from 'react-native';
import { Colors, Space, Font } from '../../theme';

const styles = StyleSheet.create({
  noTxBox: { padding: Space.xxl, alignItems: 'center' },
  noTxText: { ...Font.bodyM, color: Colors.textMuted, textAlign: 'center' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Space.md,
    marginTop: Space.lg,
  },
  sectionTitle: { ...Font.labelS, color: Colors.textMuted },
});

export default styles;