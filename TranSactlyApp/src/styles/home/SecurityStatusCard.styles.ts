import { StyleSheet } from 'react-native';
import { Colors, Space, Radius, Font } from '../../theme';

const styles = StyleSheet.create({
  securityCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    borderColor: 'rgba(61,203,127,0.2)',
    padding: Space.xl,
    marginBottom: Space.md,
    marginTop: Space.lg,
  },
  securityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Space.lg,
  },
  securityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.sm,
  },
  securityGreenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3DCB7F',
  },
  securityTitle: { ...Font.labelS, color: Colors.textPrimary },
  securityActivePill: {
    paddingHorizontal: Space.md,
    paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(61,203,127,0.1)',
    borderWidth: 0.5,
    borderColor: 'rgba(61,203,127,0.25)',
  },
  securityActiveText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#3DCB7F',
  },
  securityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.sm },
  securityItem: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.sm,
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.md,
    padding: Space.md,
  },
  securityItemLabel: { ...Font.labelS, color: Colors.textMuted, fontSize: 9 },
  securityItemValue: { ...Font.labelS, color: '#3DCB7F', fontSize: 11 },
});

export default styles;