import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { WeatherProvider } from './src/context/WeatherContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <WeatherProvider>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <RootNavigator />
      </WeatherProvider>
    </SafeAreaProvider>
  );
}
