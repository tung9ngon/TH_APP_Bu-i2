import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, radius, shadow } from '../theme/colors';

interface Props {
  title?: string;
  icon?: string;
  subtitle?: string;
  style?: ViewStyle;
  children: React.ReactNode;
}

export default function Card({ title, icon, subtitle, style, children }: Props) {
  return (
    <View style={[styles.card, style]}>
      {title ? (
        <View style={styles.header}>
          <View style={styles.titleRow}>
            {icon ? <Icon name={icon} size={16} color={colors.textMuted} /> : null}
            <Text style={styles.title}>{title}</Text>
          </View>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      ) : null}
      {children}
    </View>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <Text style={styles.section}>{children}</Text>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: radius.md, padding: 12, ...shadow },
  header: { paddingHorizontal: 4, paddingBottom: 10, marginBottom: 6, borderBottomWidth: 1, borderBottomColor: colors.divider, gap: 3 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { fontSize: 12, fontWeight: '600', letterSpacing: 0.7, textTransform: 'uppercase', color: colors.textMuted },
  subtitle: { fontSize: 14, color: colors.textBody },
  section: { fontSize: 12, fontWeight: '600', letterSpacing: 0.7, textTransform: 'uppercase', color: colors.textMuted, paddingHorizontal: 4, marginTop: 4 },
});
