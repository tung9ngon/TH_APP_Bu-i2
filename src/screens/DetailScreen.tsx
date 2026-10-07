import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScreenProps } from '../navigation/types';
import { useWeather } from '../context/WeatherContext';
import WeatherIcon from '../components/WeatherIcon';
import { SectionLabel } from '../components/Card';
import { EmptyView } from '../components/StateViews';
import { getTone, getWeatherInfo } from '../utils/weatherCode';
import {
  dayMonth,
  dewPoint,
  formatTemp,
  formatVisibility,
  hourOf,
  pressureLabel,
  rainAdvice,
  relativeDayName,
  uvLevel,
  visibilityLabel,
  weekdayOf,
  windDirName,
  windLabel,
} from '../utils/format';
import { colors, heroGradients } from '../theme/colors';

interface Row {
  icon: string;
  color: string;
  label: string;
  value: string;
  sub: string;
}

export default function DetailScreen({ navigation, route }: ScreenProps<'Detail'>) {
  const insets = useSafeAreaInsets();
  const { forecast } = useWeather();
  const { kind } = route.params;
  const [index, setIndex] = useState(route.params.index);

  const view = useMemo(() => {
    if (!forecast) return null;
    const { hourly, daily, nowIndex, current, place } = forecast;
    const firstDate = daily[0].date;

    if (kind === 'hour') {
      const h = hourly[index];
      const isNow = index === nowIndex;
      const x = isNow ? { ...h, temp: current.temp, feels: current.feels, code: current.code, humidity: current.humidity, windSpeed: current.windSpeed, windDir: current.windDir, pressure: current.pressure } : h;
      const rows: Row[] = [
        { icon: 'thermometer', color: colors.orange, label: 'Nhiệt độ', value: formatTemp(x.temp), sub: `Cảm nhận ${formatTemp(x.feels)}` },
        { icon: 'umbrella-outline', color: colors.primary, label: 'Khả năng mưa', value: `${h.pop}%`, sub: rainAdvice(h.pop) },
        { icon: 'water', color: colors.primary, label: 'Lượng mưa', value: `${h.precip.toFixed(1)} mm`, sub: 'Trong 1 giờ' },
        { icon: 'water-percent', color: colors.cyan, label: 'Độ ẩm', value: `${Math.round(x.humidity)}%`, sub: `Điểm sương ${formatTemp(dewPoint(x.temp, x.humidity))}` },
        { icon: 'weather-windy', color: colors.teal, label: 'Tốc độ gió', value: `${Math.round(x.windSpeed)} km/h`, sub: windLabel(x.windSpeed) },
        { icon: 'compass-outline', color: colors.teal, label: 'Hướng gió', value: windDirName(x.windDir), sub: `${Math.round(x.windDir)}°` },
        { icon: 'white-balance-sunny', color: colors.yellow, label: 'Chỉ số UV', value: `${Math.round(h.uv)}`, sub: uvLevel(h.uv) },
        { icon: 'gauge', color: colors.indigo, label: 'Áp suất', value: `${Math.round(x.pressure)} hPa`, sub: pressureLabel(x.pressure) },
        { icon: 'eye-outline', color: colors.slate, label: 'Tầm nhìn', value: `${formatVisibility(h.visibility)} km`, sub: visibilityLabel(h.visibility) },
      ];
      return {
        title: isNow ? 'Bây giờ' : `${hourOf(h.time)}:00 · ${relativeDayName(h.time, firstDate)}`,
        sub: `${place.name} · ${weekdayOf(h.time)}, ${dayMonth(h.time)}`,
        code: x.code,
        isDay: h.isDay,
        temp: formatTemp(x.temp),
        line: `Cảm nhận như ${formatTemp(x.feels)}`,
        rows,
        strip: [] as typeof hourly,
        min: nowIndex,
        max: Math.min(nowIndex + 23, hourly.length - 1),
      };
    }

    const d = daily[index];
    const hs = hourly.filter(h => h.time.startsWith(d.date));
    const avg = (k: 'humidity' | 'pressure' | 'visibility') => (hs.length ? hs.reduce((a, h) => a + h[k], 0) / hs.length : 0);
    const rows: Row[] = [
      { icon: 'thermometer', color: colors.orange, label: 'Cao / Thấp', value: `${formatTemp(d.max)} / ${formatTemp(d.min)}`, sub: `Chênh lệch ${Math.round(d.max - d.min)}°` },
      { icon: 'umbrella-outline', color: colors.primary, label: 'Khả năng mưa', value: `${d.pop}%`, sub: rainAdvice(d.pop) },
      { icon: 'water', color: colors.primary, label: 'Tổng lượng mưa', value: `${d.precipSum.toFixed(1)} mm`, sub: 'Cả ngày' },
      { icon: 'water-percent', color: colors.cyan, label: 'Độ ẩm TB', value: `${Math.round(avg('humidity'))}%`, sub: 'Trung bình trong ngày' },
      { icon: 'weather-windy', color: colors.teal, label: 'Gió tối đa', value: `${Math.round(d.windMax)} km/h`, sub: windLabel(d.windMax) },
      { icon: 'compass-outline', color: colors.teal, label: 'Hướng gió chính', value: windDirName(d.windDir), sub: `${Math.round(d.windDir)}°` },
      { icon: 'white-balance-sunny', color: colors.yellow, label: 'UV cao nhất', value: `${Math.round(d.uvMax)}`, sub: uvLevel(d.uvMax) },
      { icon: 'gauge', color: colors.indigo, label: 'Áp suất TB', value: `${Math.round(avg('pressure'))} hPa`, sub: pressureLabel(avg('pressure')) },
      { icon: 'eye-outline', color: colors.slate, label: 'Tầm nhìn TB', value: `${formatVisibility(avg('visibility'))} km`, sub: visibilityLabel(avg('visibility')) },
      { icon: 'weather-sunset-up', color: colors.orange, label: 'Bình minh', value: d.sunrise || '–', sub: 'Giờ địa phương' },
      { icon: 'weather-sunset-down', color: colors.indigo, label: 'Hoàng hôn', value: d.sunset || '–', sub: 'Giờ địa phương' },
    ];
    return {
      title: relativeDayName(d.date, firstDate),
      sub: `${place.name} · ${weekdayOf(d.date)}, ${dayMonth(d.date)}`,
      code: d.code,
      isDay: true,
      temp: `${formatTemp(d.max)} / ${formatTemp(d.min)}`,
      line: `Khả năng mưa ${d.pop}%`,
      rows,
      strip: hs.filter(h => +hourOf(h.time) % 3 === 0),
      min: 0,
      max: daily.length - 1,
    };
  }, [forecast, kind, index]);

  if (!forecast || !view) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + 40 }]}>
        <EmptyView title="Chưa có dữ liệu" message="Hãy quay lại và tải dự báo trước." actionLabel="Quay lại" onAction={navigation.goBack} />
      </View>
    );
  }

  const info = getWeatherInfo(view.code, view.isDay);
  const tone = getTone(view.code, view.isDay);
  const canPrev = index > view.min;
  const canNext = index < view.max;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        <Pressable onPress={navigation.goBack} style={styles.back} hitSlop={8} accessibilityLabel="Quay lại">
          <Icon name="arrow-left" size={24} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{view.title}</Text>
          <Text style={styles.subtitle}>{view.sub}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}>
        <View style={styles.hero}>
          <LinearGradient colors={heroGradients[tone]} start={{ x: 0, y: 0 }} end={{ x: 0.4, y: 1 }} style={StyleSheet.absoluteFill} />
          <StepButton icon="chevron-left" disabled={!canPrev} onPress={() => setIndex(i => i - 1)} />
          <View style={styles.heroCenter}>
            <WeatherIcon code={view.code} isDay={view.isDay} size={68} color={tone === 'clear' && view.isDay ? '#f2d166' : '#fff'} />
            <Text style={styles.heroTemp}>{view.temp}</Text>
            <Text style={styles.heroCond}>{info.label}</Text>
            <Text style={styles.heroLine}>{view.line}</Text>
          </View>
          <StepButton icon="chevron-right" disabled={!canNext} onPress={() => setIndex(i => i + 1)} />
        </View>

        {view.strip.length > 0 ? (
          <View style={{ gap: 10 }}>
            <SectionLabel>Diễn biến trong ngày</SectionLabel>
            <View style={styles.strip}>
              {view.strip.map(h => (
                <View key={h.time} style={styles.stripItem}>
                  <Text style={styles.stripTime}>{+hourOf(h.time)}h</Text>
                  <WeatherIcon code={h.code} isDay={h.isDay} size={22} />
                  <Text style={styles.stripTemp}>{formatTemp(h.temp)}</Text>
                  <Text style={[styles.stripPop, { color: h.pop >= 30 ? colors.rain : colors.textFaint }]}>{h.pop}%</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View style={{ gap: 10 }}>
          <SectionLabel>Thông tin chi tiết</SectionLabel>
          <View style={styles.grid}>
            {view.rows.map(r => (
              <View key={r.label} style={styles.cell}>
                <View style={styles.cellLabelRow}>
                  <Icon name={r.icon} size={16} color={r.color} />
                  <Text style={styles.cellLabel}>{r.label}</Text>
                </View>
                <Text style={styles.cellValue}>{r.value}</Text>
                <Text style={styles.cellSub}>{r.sub}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function StepButton({ icon, disabled, onPress }: { icon: string; disabled: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[styles.step, disabled && { opacity: 0.35 }]} hitSlop={6}>
      <Icon name={icon} size={24} color="#fff" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: colors.divider },
  back: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 17, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 13, color: colors.textMuted },
  content: { padding: 16, gap: 20, width: '100%', maxWidth: 640, alignSelf: 'center' },
  hero: { borderRadius: 20, paddingVertical: 20, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
  heroCenter: { flex: 1, alignItems: 'center', gap: 4 },
  heroTemp: { color: '#fff', fontSize: 44, fontWeight: '300', letterSpacing: -1 },
  heroCond: { color: '#fff', fontSize: 17, fontWeight: '600' },
  heroLine: { color: '#fff', fontSize: 14 },
  step: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  strip: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 4 },
  stripItem: { flex: 1, alignItems: 'center', gap: 6 },
  stripTime: { fontSize: 11, color: colors.textMuted },
  stripTemp: { fontSize: 14, fontWeight: '600', color: colors.text },
  stripPop: { fontSize: 10, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cell: { flexGrow: 1, flexBasis: '45%', padding: 12, paddingHorizontal: 14, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, gap: 6 },
  cellLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cellLabel: { fontSize: 12, fontWeight: '500', color: colors.textMuted },
  cellValue: { fontSize: 20, fontWeight: '600', color: colors.text },
  cellSub: { fontSize: 12, color: '#4b5563' },
});
