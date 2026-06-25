import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Space, Radius, Font } from '../../theme';
import { PermState } from '../../services/smsPermissions';

interface EmptyStateProps {
  permState?: PermState;
  message?: string;
  icon?: string;
  onRequest?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  permState,
  message,
  icon = 'inbox-outline',
  onRequest,
}) => {
  // If using old-style props (permState + onRequest)
  if (permState && onRequest) {
    const isUnavailable = permState === 'unavailable';
    const isDenied = permState === 'denied';

    return (
      <View style={styles.container}>
        <View style={styles.iconBox}>
          <View style={styles.iconInner}>
            <MaterialCommunityIcons
              name={
                isDenied || isUnavailable
                  ? 'alert-circle-outline'
                  : 'inbox-outline'
              }
              size={40}
              color={Colors.gold}
            />
          </View>
        </View>
        <Text style={styles.title}>
          {isUnavailable
            ? 'Not Available on iOS'
            : isDenied
            ? 'Permission Denied'
            : 'No Transactions Yet'}
        </Text>
        <Text style={styles.desc}>
          {isUnavailable
            ? 'SMS reading is only supported on Android. Connect your bank account to import transactions.'
            : isDenied
            ? 'SMS access was denied. Grant permission in device Settings.'
            : 'Grant SMS permission so centfluence can detect your bank transactions automatically.'}
        </Text>
        {!isUnavailable && (
          <TouchableOpacity
            style={styles.btn}
            onPress={onRequest}
            activeOpacity={0.85}
            accessibilityLabel={
              isDenied ? 'Open device settings' : 'Grant SMS permission'
            }
            accessibilityRole="button"
          >
            <Text style={styles.btnText}>
              {isDenied ? 'OPEN SETTINGS' : 'GIVE MESSAGE PERMISSION'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // New-style props (message + icon)
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name={icon}
        size={32}
        color={Colors.textMuted}
        style={{ marginBottom: Space.md }}
      />
      <Text style={styles.desc}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Space.xxl,
    paddingHorizontal: Space.xl,
    gap: Space.lg,
  },
  iconBox: {
    width: 88,
    height: 88,
    borderRadius: Radius.xl,
    backgroundColor: Colors.goldMuted,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconInner: {
    width: 64,
    height: 64,
    borderRadius: Radius.lg,
    backgroundColor: Colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...Font.displayM,
    color: Colors.textPrimary,
    textAlign: 'center',
    fontSize: 20,
  },
  desc: {
    ...Font.bodyM,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  btn: {
    height: 50,
    borderRadius: Radius.full,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Space.xxl,
    marginTop: Space.sm,
  },
  btnText: {
    ...Font.labelM,
    fontSize: 11,
    letterSpacing: 1.4,
    color: Colors.textInverse,
  },
});

export default EmptyState;