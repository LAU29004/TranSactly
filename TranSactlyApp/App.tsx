import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { Colors } from './src/theme';
import { TransactionProvider } from './src/context/TransactionContext';

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <TransactionProvider>
        <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
        <AppNavigator />
      </TransactionProvider>
    </SafeAreaProvider>
  );
};

export default App;