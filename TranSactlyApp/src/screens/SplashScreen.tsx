import React, { useEffect } from 'react';
import {
  View,
  ActivityIndicator,
  Text,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { getToken } from '../services/auth/authStorage';

const SplashScreen = () => {
  const navigation = useNavigation<any>();

  useEffect(() => {

    const bootstrap = async () => {

      const token =
        await getToken();

      if (token) {

        navigation.replace(
          'MainTabs',
        );

      } else {

        navigation.replace(
          'Login',
        );
      }
    };

    bootstrap();

  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <ActivityIndicator size="large" />
    </View>
  );
};

export default SplashScreen;