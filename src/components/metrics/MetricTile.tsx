import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, radius, shadow } from '../../theme/colors';

interface Props {
  icon: string;
  iconColor: string;
  title: string;
  value?: string | number;
  unit?: string;
  badge?: string;
  caption?: string;
  style?: ViewStyle;
  children?: React.ReactNode;
}

export default function MetricTile({ icon, iconColor, title, value, unit, badge, caption, style, children }: Props) {
  return (
    <View style={[styles.tile, style]}>
      <View style={styles.header}>
        <Icon name={icon} size={16} color={iconColor} />
        <Text style={styles.title}>{title}</Text>
      </View>
      {value !== undefined ? (
        <View style={styles.valueRow}>
          <Text style={styles.value}>{value}</Text>
          {unit ? <Text style={styles.unit}>{unit}</Text> : null}
          {badge ? <Text style={styles.badge}>{badge}</Text> : null}
        </View>
      ) : null}
      <View style={styles.visual}>{children}</View>
      {caption ? <Text style={styles.caption}>{caption}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { backgroundColor: colors.card, borderRadius: radius.md, padding: 14, minHeight: 150, gap: 10, ...shadow },
  header: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', color: colors.textMuted },
  valueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  value: { fontSize: 30, fontWeight: '600', color: colors.text, letterSpacing: -0.5 },
  unit: { fontSize: 15, fontWeight: '500', color: colors.textMuted },
  badge: { fontSize: 14, fontWeight: '600', color: colors.textBody, marginLeft: 4 },
  visual: { marginTop: 'auto' },
  caption: { fontSize: 12, color: '#4b5563' },
});
