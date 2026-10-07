import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppError } from '../types/weather';
import { colors, heroGradients, radius } from '../theme/colors';

/* ---------- Loading ---------- */
function usePulse() {
  const v = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(v, { toValue: 0.5, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [v]);
  return v;
}

export function LoadingView({ message = 'Đang tải dữ liệu thời tiết…' }: { message?: string }) {
  const insets = useSafeAreaInsets();
  const opacity = usePulse();
  return (
    <View style={styles.flex}>
      <View style={[styles.loadingHero, { paddingTop: insets.top + 24 }]}>
        <LinearGradient colors={heroGradients.clear} style={StyleSheet.absoluteFill} />
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>{message}</Text>
        <Animated.View style={[styles.skelHero, { opacity }]} />
        <Animated.View style={[styles.skelLine, { opacity }]} />
      </View>
      <View style={styles.skelBody}>
        <Animated.View style={[styles.skelCard, { height: 150, opacity }]} />
        <Animated.View style={[styles.skelCard, { height: 220, opacity }]} />
      </View>
    </View>
  );
}

/* ---------- Error ---------- */
const ERROR_COPY: Record<string, { msg: string; code: string }> = {
  network: { msg: 'Không kết nối được tới máy chủ thời tiết. Kiểm tra Wi‑Fi hoặc dữ liệu di động rồi thử lại.', code: 'Lỗi mạng · NETWORK_ERROR' },
  timeout: { msg: 'Máy chủ phản hồi quá lâu. Vui lòng thử lại.', code: 'Hết thời gian chờ · TIMEOUT' },
  server: { msg: 'Máy chủ dữ liệu thời tiết chưa phản hồi. Vui lòng thử lại sau ít phút.', code: 'Lỗi máy chủ · API_ERROR' },
  empty: { msg: 'Không có dữ liệu dự báo cho địa điểm này.', code: 'Không có dữ liệu · EMPTY' },
};

export function ErrorView({ error, onRetry, onChangePlace }: { error: AppError | null; onRetry: () => void; onChangePlace: () => void }) {
  const insets = useSafeAreaInsets();
  const copy = ERROR_COPY[error?.type ?? 'network'];
  return (
    <View style={[styles.full, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.centerBlock}>
        <View style={[styles.bigCircle, { backgroundColor: colors.redSoft, borderColor: '#ffd0ce' }]}>
          <Icon name="cloud-off-outline" size={52} color={colors.red} />
        </View>
        <Text style={styles.h1}>Không tải được dữ liệu</Text>
        <Text style={styles.body}>{copy.msg}</Text>
        <Text style={styles.chip}>{copy.code}</Text>
      </View>
      <PrimaryButton icon="refresh" label="Thử lại" onPress={onRetry} />
      <SecondaryButton label="Đổi địa điểm" onPress={onChangePlace} />
    </View>
  );
}

/* ---------- Empty ---------- */
export function EmptyView({ title, message, actionLabel, onAction }: { title: string; message: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <View style={styles.empty}>
      <View style={[styles.bigCircle, { width: 96, height: 96, borderRadius: 48 }]}>
        <Icon name="map-search-outline" size={46} color="#9fa9b7" />
      </View>
      <Text style={[styles.h1, { fontSize: 18 }]}>{title}</Text>
      <Text style={[styles.body, { fontSize: 14 }]}>{message}</Text>
      {actionLabel && onAction ? <SecondaryButton label={actionLabel} onPress={onAction} compact /> : null}
    </View>
  );
}

/* ---------- Buttons ---------- */
export function PrimaryButton({ label, onPress, icon }: { label: string; onPress: () => void; icon?: string }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.primary, pressed && { backgroundColor: colors.primaryDark }]}>
      {icon ? <Icon name={icon} size={20} color="#fff" /> : null}
      <Text style={styles.primaryText}>{label}</Text>
    </Pressable>
  );
}

export function SecondaryButton({ label, onPress, compact }: { label: string; onPress: () => void; compact?: boolean }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.secondary, compact && styles.compact, pressed && { backgroundColor: colors.surface }]}>
      <Text style={styles.secondaryText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  loadingHero: { minHeight: 360, alignItems: 'center', justifyContent: 'center', gap: 16, paddingBottom: 32, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, overflow: 'hidden' },
  loadingText: { color: '#fff', fontSize: 15, fontWeight: '500' },
  skelHero: { width: 132, height: 72, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', marginTop: 8 },
  skelLine: { width: 176, height: 14, borderRadius: 7, backgroundColor: 'rgba(255,255,255,0.2)' },
  skelBody: { padding: 16, gap: 16 },
  skelCard: { borderRadius: radius.md, backgroundColor: '#ffffff' },
  full: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 24, gap: 8 },
  centerBlock: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  bigCircle: { width: 112, height: 112, borderRadius: 56, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, marginBottom: 10 },
  h1: { fontSize: 24, fontWeight: '700', color: colors.text, textAlign: 'center' },
  body: { fontSize: 15, lineHeight: 22, color: '#4b5563', textAlign: 'center', maxWidth: 310 },
  chip: { marginTop: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, fontSize: 12, color: colors.textMuted, overflow: 'hidden' },
  empty: { alignItems: 'center', gap: 12, paddingVertical: 40, paddingHorizontal: 16 },
  primary: { height: 54, borderRadius: 14, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  primaryText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  secondary: { height: 52, borderRadius: 14, borderWidth: 1, borderColor: '#d1d5db', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', alignSelf: 'stretch' },
  compact: { height: 44, paddingHorizontal: 18, alignSelf: 'center', borderRadius: 12 },
  secondaryText: { color: colors.textBody, fontSize: 15, fontWeight: '600' },
});
