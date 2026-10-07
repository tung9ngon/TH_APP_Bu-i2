import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { clamp } from '../../utils/format';
import { colors } from '../../theme/colors';

/** Thanh phần trăm đơn sắc (độ ẩm, gió, tầm nhìn). */
export function FillBar({ percent, color }: { percent: number; color: string }) {
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${clamp(percent)}%`, backgroundColor: color }]} />
    </View>
  );
}

/** Thanh gradient + chấm đánh dấu (nhiệt độ, UV, áp suất). */
export function MarkerBar({
  percent,
  gradient,
  markerColor = colors.text,
  labels,
}: {
  percent: number;
  gradient: string[];
  markerColor?: string;
  labels?: [string, string];
}) {
  return (
    <View style={{ gap: 6 }}>
      <View style={styles.markerTrack}>
        <LinearGradient colors={gradient.length > 1 ? gradient : [gradient[0], gradient[0]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
        <View style={[styles.marker, { left: `${clamp(percent)}%`, borderColor: markerColor }]} />
      </View>
      {labels ? (
        <View style={styles.labels}>
          <Text style={styles.label}>{labels[0]}</Text>
          <Text style={styles.label}>{labels[1]}</Text>
        </View>
      ) : null}
    </View>
  );
}

/** La bàn hướng gió: mũi tên chỉ hướng gió thổi tới. */
export function Compass({ deg, size = 78 }: { deg: number; size?: number }) {
  return (
    <View style={[styles.compass, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.cardinal, styles.n]}>B</Text>
      <Text style={[styles.cardinal, styles.e]}>Đ</Text>
      <Text style={[styles.cardinal, styles.s]}>N</Text>
      <Text style={[styles.cardinal, styles.w]}>T</Text>
      <View style={{ transform: [{ rotate: `${(deg + 180) % 360}deg` }] }}>
        <Icon name="navigation" size={28} color={colors.teal} />
      </View>
    </View>
  );
}

/** Biểu đồ cột lượng mưa 12 giờ tới. */
export function PrecipBars({ values }: { values: number[] }) {
  const max = Math.max(0.5, ...values);
  return (
    <View style={{ gap: 4 }}>
      <View style={styles.bars}>
        {values.map((v, i) => (
          <View key={i} style={[styles.bar, { height: v > 0 ? `${Math.max(12, (v / max) * 100)}%` : 3, backgroundColor: v > 0 ? colors.primary : colors.border }]} />
        ))}
      </View>
      <View style={styles.labels}>
        <Text style={styles.tiny}>Bây giờ</Text>
        <Text style={styles.tiny}>+12 giờ</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 6, borderRadius: 3, backgroundColor: colors.divider, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
  markerTrack: { height: 6, borderRadius: 3, overflow: 'visible', justifyContent: 'center' },
  marker: { position: 'absolute', width: 12, height: 12, marginLeft: -6, borderRadius: 6, backgroundColor: '#fff', borderWidth: 3 },
  labels: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: 11, color: colors.textMuted },
  tiny: { fontSize: 10, color: colors.textFaint },
  compass: { borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  cardinal: { position: 'absolute', fontSize: 10, fontWeight: '600', color: colors.textFaint },
  n: { top: 3, color: colors.red },
  e: { right: 6 },
  s: { bottom: 3 },
  w: { left: 6 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 30 },
  bar: { flex: 1, borderRadius: 2 },
});
