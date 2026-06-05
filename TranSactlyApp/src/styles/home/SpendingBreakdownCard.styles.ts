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

  // Pie Chart Wrapper
  pieChartWrapper: { alignItems: 'center', marginBottom: Space.lg },
  pieChartContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 130,
  },

  // Custom Legend
  customLegend: {
    width: '100%',
    gap: Space.sm,
    marginBottom: Space.lg,
    paddingTop: Space.md,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    paddingVertical: Space.sm,
  },
  legendColorBox: { width: 12, height: 12, borderRadius: 2 },
  legendContent: { flex: 1, gap: 2 },
  legendCategoryName: {
    ...Font.bodyS,
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '500',
  },
  legendAmount: {
    ...Font.labelS,
    color: Colors.gold,
    fontSize: 11,
    fontWeight: '600',
  },
  legendPercentBox: {
    paddingHorizontal: Space.sm,
    paddingVertical: 3,
    borderRadius: Radius.md,
    backgroundColor: Colors.bgElevated,
  },
  legendPercent: {
    ...Font.labelS,
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
  },

  // Total Amount Display
  totalAmountBox: {
    alignItems: 'center',
    paddingVertical: Space.md,
    paddingHorizontal: Space.lg,
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.lg,
    marginBottom: Space.lg,
  },
  totalAmountLabel: {
    ...Font.labelS,
    color: Colors.textMuted,
    fontSize: 10,
    marginBottom: 4,
  },
  totalAmountValue: {
    ...Font.displayM,
    color: Colors.gold,
    fontSize: 28,
    fontWeight: '600',
  },

  // Category Details Grid
  categoryDetailsGrid: { gap: Space.sm },
  categoryDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    paddingHorizontal: Space.md,
    paddingVertical: Space.md,
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  categoryDetailDot: { width: 10, height: 10, borderRadius: 5 },
  categoryDetailName: {
    ...Font.labelM,
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '500',
  },
  categoryDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  categoryDetailAmount: {
    ...Font.labelS,
    color: Colors.gold,
    fontSize: 11,
    fontWeight: '600',
  },
  categoryDetailPercentBadge: {
    paddingHorizontal: Space.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    backgroundColor: Colors.gold,
  },
  categoryDetailPercent: {
    ...Font.labelS,
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textInverse,
    letterSpacing: 0.5,
  },
});

export default styles;