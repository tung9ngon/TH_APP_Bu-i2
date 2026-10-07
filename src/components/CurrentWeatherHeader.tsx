import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import WeatherIcon from './WeatherIcon';
import { Forecast } from '../types/weather';
import { getTone, getWeatherInfo } from '../utils/weatherCode';
import { formatTemp } from '../utils/format';
import { heroGradients } from '../theme/colors';

interface Props {
  forecast: Forecast;
  onPressPlace: () => void;
  onPressLocate: () => void;
  onPressRefresh: () => void;
}

export default function CurrentWeatherHeader({ forecast, onPressPlace, onPressLocate, onPressRefresh }: Props) {
  const insets = useSafeAreaInsets();
  const { current: c, daily, place } = forecast;
  const today = daily[0];
  const info = getWeatherInfo(c.code, c.isDay);
  const tone = getTone(c.code, c.isDay);
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [float]);

  const translateY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });

  return (
    <View style={[styles.hero, { paddingTop: insets.top + 12 }]}>
      <LinearGradient colors={heroGradients[tone]} start={{ x: 0, y: 0 }} end={{ x: 0.4, y: 1 }} style={StyleSheet.absoluteFill} />
      <View style={styles.topRow}>
        <Pressable onPress={onPressPlace} style={styles.place} accessibilityRole="button" accessibilityLabel="Đổi địa điểm">
          <View style={styles.placeRow}>
            <Icon name={place.gps ? 'navigation' : 'map-marker'} size={18} color="#fff" />
            <Text style={styles.placeName} numberOfLines={1}>{place.name}</Text>
            <Icon name="chevron-down" size={22} color="#fff" />
          </View>
          <Text style={styles.placeSub} numberOfLines={1}>{place.gps ? 'Vị trí hiện tại' : place.sub || ' '}</Text>
        </Pressable>
        <View style={styles.actions}>
          <RoundButton icon="crosshairs-gps" onPress={onPressLocate} label="Vị trí hiện tại" />
          <RoundButton icon="refresh" onPress={onPressRefresh} label="Làm mới" />
        </View>
      </View>

      <View style={styles.center}>
        <Animated.View style={{ transform: [{ translateY }] }}>
          <WeatherIcon code={c.code} isDay={c.isDay} size={104} color={tone === 'clear' && c.isDay ? '#f2d166' : '#ffffff'} />
        </Animated.View>
        <Text style={styles.temp}>{formatTemp(c.temp)}</Text>
        <Text style={styles.cond}>{info.label}</Text>
        <View style={styles.meta}>
          <Text style={styles.metaText}>Cao {formatTemp(today.max)}</Text>
          <Text style={styles.metaText}>Thấp {formatTemp(today.min)}</Text>
          <Text style={styles.metaText}>Cảm nhận {formatTemp(c.feels)}</Text>
        </View>
      </View>
    </View>
  );
}

function RoundButton({ icon, onPress, label }: { icon: string; onPress: () => void; label: string }) {
  return (
    <Pressable onPress={onPress} accessibilityLabel={label} hitSlop={6} style={({ pressed }) => [styles.roundBtn, pressed && { backgroundColor: 'rgba(255,255,255,0.32)' }]}>
      <Icon name={icon} size={20} color="#fff" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hero: { paddingHorizontal: 20, paddingBottom: 30, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, gap: 18, overflow: 'hidden' },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  place: { flexShrink: 1, gap: 3 },
  placeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  placeName: { color: '#fff', fontSize: 20, fontWeight: '600', flexShrink: 1 },
  placeSub: { color: '#fff', fontSize: 13, paddingLeft: 22 },
  actions: { flexDirection: 'row', gap: 8 },
  roundBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  center: { alignItems: 'center' },
  temp: { color: '#fff', fontSize: 88, fontWeight: '300', letterSpacing: -3, marginTop: 4, paddingLeft: 20 },
  cond: { color: '#fff', fontSize: 21, fontWeight: '500', marginTop: 4 },
  meta: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', columnGap: 14, rowGap: 4, marginTop: 8 },
  metaText: { color: '#fff', fontSize: 15 },
});
