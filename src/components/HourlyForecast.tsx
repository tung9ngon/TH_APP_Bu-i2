import React, { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Card from './Card';
import WeatherIcon from './WeatherIcon';
import { Forecast } from '../types/weather';
import { formatTemp, hourOf } from '../utils/format';
import { colors } from '../theme/colors';

interface Props {
  forecast: Forecast;
  onSelect: (hourlyIndex: number) => void;
}

export default function HourlyForecast({ forecast, onSelect }: Props) {
  const { hourly, nowIndex, current } = forecast;

  const items = useMemo(() => hourly.slice(nowIndex, nowIndex + 24).map((h, k) => ({ ...h, index: nowIndex + k, isNow: k === 0 })), [hourly, nowIndex]);

  const summary = useMemo(() => {
    const peak = items.reduce((a, b) => (b.pop > a.pop ? b : a), items[0]);
    return peak && peak.pop >= 30 ? `Khả năng mưa cao nhất ${peak.pop}% lúc ${hourOf(peak.time)}:00` : 'Không có mưa đáng kể trong 24 giờ tới';
  }, [items]);

  return (
    <Card title="Dự báo 24 giờ" icon="clock-outline" subtitle={summary}>
      <FlatList
        horizontal
        data={items}
        keyExtractor={it => it.time}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <Pressable onPress={() => onSelect(item.index)} style={({ pressed }) => [styles.item, pressed && styles.pressed]}>
            <Text style={[styles.time, item.isNow && styles.now]}>{item.isNow ? 'Bây giờ' : `${hourOf(item.time)}:00`}</Text>
            <WeatherIcon code={item.isNow ? current.code : item.code} isDay={item.isNow ? current.isDay : item.isDay} size={28} />
            <Text style={styles.temp}>{formatTemp(item.isNow ? current.temp : item.temp)}</Text>
            <View style={styles.popRow}>
              <Icon name="water" size={12} color={item.pop >= 30 ? colors.rain : colors.textFaint} />
              <Text style={[styles.pop, { color: item.pop >= 30 ? colors.rain : colors.textFaint }]}>{item.pop}%</Text>
            </View>
          </Pressable>
        )}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  item: { width: 58, paddingVertical: 8, borderRadius: 12, alignItems: 'center', gap: 7 },
  pressed: { backgroundColor: colors.primarySoft },
  time: { fontSize: 12, fontWeight: '500', color: colors.textMuted },
  now: { fontWeight: '700', color: colors.text },
  temp: { fontSize: 16, fontWeight: '600', color: colors.text },
  popRow: { flexDirection: 'row', alignItems: 'center' },
  pop: { fontSize: 11, fontWeight: '600' },
});
