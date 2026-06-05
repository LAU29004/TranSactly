import { StyleSheet } from 'react-native';
import { Colors, Space, Font } from '../theme';

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: Space.xl, paddingBottom: 100 },
  loadingCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space.lg,
  },
  loadingText: { ...Font.labelM, color: Colors.textSecondary },
});

export default styles;