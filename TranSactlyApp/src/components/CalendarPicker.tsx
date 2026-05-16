import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { Colors, Radius, Space, Font } from '../theme';

interface Props {
  value: Date;
  onChange: (date: Date) => void;
  label: string;
  minDate?: Date;
  maxDate?: Date;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const CalendarPicker: React.FC<Props> = ({ value, onChange, label, minDate, maxDate }) => {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date(value));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const isSelected = (d: number) =>
    value.getFullYear() === year && value.getMonth() === month && value.getDate() === d;

  const isDisabled = (d: number) => {
    const date = new Date(year, month, d);
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const handleSelect = (d: number) => {
    const selected = new Date(year, month, d);
    onChange(selected);
    setOpen(false);
  };

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const displayValue = value.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  return (
    <>
      <TouchableOpacity style={styles.trigger} onPress={() => setOpen(true)} activeOpacity={0.8}>
        <View>
          <Text style={styles.triggerLabel}>{label}</Text>
          <Text style={styles.triggerValue}>{displayValue}</Text>
        </View>
        <View style={styles.calIcon}>
          <Text style={styles.calIconText}>▦</Text>
        </View>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.picker}>
            {/* Header */}
            <View style={styles.pickerHeader}>
              <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
                <Text style={styles.navIcon}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.monthYear}>{MONTHS[month]} {year}</Text>
              <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
                <Text style={styles.navIcon}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Day headers */}
            <View style={styles.dayRow}>
              {DAYS.map(d => (
                <Text key={d} style={styles.dayHeader}>{d}</Text>
              ))}
            </View>

            {/* Calendar grid */}
            <View style={styles.grid}>
              {cells.map((d, i) => {
                if (!d) return <View key={`e-${i}`} style={styles.cell} />;
                const selected = isSelected(d);
                const disabled = isDisabled(d);
                return (
                  <TouchableOpacity
                    key={`d-${d}`}
                    style={[styles.cell, selected && styles.cellSelected, disabled && styles.cellDisabled]}
                    onPress={() => !disabled && handleSelect(d)}
                    activeOpacity={0.7}
                    disabled={disabled}
                  >
                    <Text style={[
                      styles.cellText,
                      selected && styles.cellTextSelected,
                      disabled && styles.cellTextDisabled,
                    ]}>
                      {d}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Cancel */}
            <TouchableOpacity onPress={() => setOpen(false)} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>CANCEL</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const CELL_SIZE = 38;

const styles = StyleSheet.create({
  trigger: {
    backgroundColor: Colors.bgInput,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Space.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  triggerLabel: {
    ...Font.labelS,
    color: Colors.textMuted,
    marginBottom: Space.xs,
  },
  triggerValue: {
    ...Font.labelL,
    color: Colors.textPrimary,
    fontSize: 15,
  },
  calIcon: {
    width: 34,
    height: 34,
    borderRadius: Radius.sm,
    backgroundColor: Colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calIconText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Space.xl,
  },
  picker: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: Space.xl,
    width: '100%',
    maxWidth: 340,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Space.lg,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: Colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIcon: {
    fontSize: 20,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  monthYear: {
    ...Font.displayM,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Space.sm,
  },
  dayHeader: {
    ...Font.labelS,
    color: Colors.textMuted,
    width: CELL_SIZE,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 4,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  cellSelected: {
    backgroundColor: Colors.gold,
  },
  cellDisabled: {
    opacity: 0.25,
  },
  cellText: {
    ...Font.bodyM,
    color: Colors.textPrimary,
    fontSize: 13,
  },
  cellTextSelected: {
    color: Colors.textInverse,
    fontWeight: '700',
  },
  cellTextDisabled: {
    color: Colors.textMuted,
  },
  cancelBtn: {
    marginTop: Space.lg,
    alignItems: 'center',
    paddingVertical: Space.md,
  },
  cancelText: {
    ...Font.labelM,
    color: Colors.textSecondary,
  },
});

export default CalendarPicker;