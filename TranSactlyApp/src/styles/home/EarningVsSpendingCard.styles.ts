import { StyleSheet } from 'react-native';
import { Colors, Space, Radius, Font } from '../../theme';

const styles = StyleSheet.create({
  chartSection: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: Space.xl,
    marginBottom: Space.md,
    marginTop: Space.lg,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Space.lg,
  },
  chartTitle: { ...Font.labelS, color: Colors.textMuted },
  barChartContainer: {
    alignItems: 'center',
    marginBottom: Space.lg,
    marginHorizontal: -Space.xl,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Space.xl,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: Space.sm },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { ...Font.labelS, fontSize: 11, color: Colors.textSecondary },
});

export default styles;