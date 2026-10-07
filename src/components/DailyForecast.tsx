import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Card from './Card';
import WeatherIcon from './WeatherIcon';
import { Forecast } from '../types/weather';
import { clamp, dayMonth, formatTemp, weekdayOf } from '../utils/format';
import { getWeatherInfo } from '../utils/weatherCode';
import { colors, tempRange } from '../theme/colors';

interface Props {
  forecast: Forecast;
  onSelect: (dayIndex: number) => void;
}

export default function DailyForecast({ forecast, onSelect }: Props) {
  const { daily, current } = forecast;
  const weekMin = Math.min(...daily.map(d => d.min));
  const weekMax = Math.max(...daily.map(d => d.max));
  const span = weekMax - weekMin || 1;

  return (
    <Card title={`Dự báo ${daily.length} ngày`} icon="calendar-month-outline">
      {daily.map((d, i) => {
        const left = ((d.min - weekMin) / span) * 100;
        const width = Math.max(6, ((d.max - d.min) / span) * 100);
        const dot = clamp(((current.temp - d.min) / (d.max - d.min || 1)) * 100);
        const popColor = d.pop >= 30 ? colors.rain : colors.textFaint;
        return (
          <Pressable key={d.date} onPress={() => onSelect(i)} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
            <View style={styles.dayCol}>
              <Text style={styles.day} numberOfLines={1}>{i === 0 ? 'Hôm nay' : weekdayOf(d.date)}</Text>
              <Text style={styles.date}>{dayMonth(d.date)}</Text>
              <Text style={styles.cond} numberOfLines={2}>{getWeatherInfo(d.code).label}</Text>
            </View>
            <WeatherIcon code={d.code} size={26} />
            <View style={styles.popCol}>
              <Icon name="water" size={12} color={popColor} />
              <Text style={[styles.pop, { color: popColor }]}>{d.pop}%</Text>
            </View>
            <Text style={styles.min}>{formatTemp(d.min)}</Text>
            <View style={styles.track}>
              <LinearGradient colors={tempRange} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.fill, { left: `${left}%`, width: `${width}%` }]} />
              {i === 0 ? <View style={[styles.dot, { left: `${left + (width * dot) / 100}%` }]} /> : null}
            </View>
            <Text style={styles.max}>{formatTemp(d.max)}</Text>
          </Pressable>
        );
      })}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 9, paddingHorizontal: 4, borderRadius: 10 },
  pressed: { backgroundColor: colors.primarySoft },
  dayCol: { width: 70 },
  day: { fontSize: 15, fontWeight: '600', color: colors.text },
  date: { fontSize: 12, color: colors.textMuted },
  cond: { fontSize: 12, color: colors.textBody, marginTop: 2 },
  popCol: { width: 40, flexDirection: 'row', alignItems: 'center' },
  pop: { fontSize: 12, fontWeight: '600' },
  min: { width: 32, textAlign: 'right', fontSize: 15, color: colors.textMuted },
  max: { width: 32, textAlign: 'right', fontSize: 15, fontWeight: '600', color: colors.text },
  track: { flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.divider, marginHorizontal: 4 },
  fill: { position: 'absolute', top: 0, bottom: 0, borderRadius: 3 },
  dot: { position: 'absolute', top: -2, width: 10, height: 10, marginLeft: -5, borderRadius: 5, backgroundColor: '#fff', borderWidth: 2, borderColor: colors.text },
});
