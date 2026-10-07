import React, { useEffect, useRef } from 'react';
import { Animated, RefreshControl, StatusBar, StyleSheet, Text, View } from 'react-native';
import { ScreenProps } from '../navigation/types';
import { useWeather } from '../context/WeatherContext';
import { useLocateAndLoad } from '../hooks/useLocateAndLoad';
import CurrentWeatherHeader from '../components/CurrentWeatherHeader';
import HourlyForecast from '../components/HourlyForecast';
import DailyForecast from '../components/DailyForecast';
import MetricsGrid from '../components/metrics/MetricsGrid';
import { SectionLabel } from '../components/Card';
import { ErrorView, LoadingView } from '../components/StateViews';
import { colors } from '../theme/colors';

export default function HomeScreen({ navigation }: ScreenProps<'Home'>) {
  const { forecast, status, error, refresh } = useWeather();
  const { locate, locating } = useLocateAndLoad();
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (status === 'success') {
      fade.setValue(0);
      Animated.timing(fade, { toValue: 1, duration: 420, useNativeDriver: true }).start();
    }
  }, [status, fade]);

  if (locating) return <LoadingView message="Đang xác định vị trí của bạn…" />;
  if (status === 'idle' || status === 'loading') return <LoadingView />;
  if (status === 'error' || !forecast) {
    return <ErrorView error={error} onRetry={refresh} onChangePlace={() => navigation.navigate('Search')} />;
  }

  const translateY = fade.interpolate({ inputRange: [0, 1], outputRange: [16, 0] });

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <Animated.ScrollView
        style={{ opacity: fade, transform: [{ translateY }] }}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refresh} tintColor={colors.primary} />}>
        <CurrentWeatherHeader
          forecast={forecast}
          onPressPlace={() => navigation.navigate('Search')}
          onPressLocate={locate}
          onPressRefresh={refresh}
        />
        <View style={styles.body}>
          <HourlyForecast forecast={forecast} onSelect={index => navigation.navigate('Detail', { kind: 'hour', index })} />
          <DailyForecast forecast={forecast} onSelect={index => navigation.navigate('Detail', { kind: 'day', index })} />
          <SectionLabel>Chỉ số thời tiết hiện tại</SectionLabel>
          <MetricsGrid forecast={forecast} />
          <Text style={styles.footer}>Dữ liệu thời tiết: Open-Meteo · Cập nhật {forecast.current.time.slice(11, 16)}</Text>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingBottom: 32 },
  body: { padding: 16, gap: 16, width: '100%', maxWidth: 640, alignSelf: 'center' },
  footer: { textAlign: 'center', fontSize: 12, color: colors.textFaint, marginTop: 4 },
});
