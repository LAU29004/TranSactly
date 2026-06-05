import { PermissionsAndroid, Platform } from 'react-native';

export type PermState = 'idle' | 'checking' | 'granted' | 'denied' | 'unavailable';

export const requestSmsPermission = async (): Promise<PermState> => {
  if (Platform.OS !== 'android') return 'unavailable';
  try {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_SMS,
      {
        title: 'SmartSpend AI — SMS Access',
        message:
          'SmartSpend AI reads your bank SMS messages to detect and categorise transactions automatically. No messages leave your device.',
        buttonPositive: 'Allow Access',
        buttonNegative: 'Not Now',
      },
    );
    return result === PermissionsAndroid.RESULTS.GRANTED ? 'granted' : 'denied';
  } catch {
    return 'denied';
  }
};

export const checkSmsPermission = async (): Promise<PermState> => {
  if (Platform.OS !== 'android') return 'unavailable';
  try {
    const granted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.READ_SMS,
    );
    return granted ? 'granted' : 'idle';
  } catch {
    return 'idle';
  }
};