import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScreenProps } from '../navigation/types';
import { useLocateAndLoad } from '../hooks/useLocateAndLoad';
import { hasLocationPermission } from '../services/location';
import { LoadingView, PrimaryButton } from '../components/StateViews';
import { colors } from '../theme/colors';

export default function PermissionScreen({ navigation }: ScreenProps<'Permission'>) {
  const insets = useSafeAreaInsets();
  const { locate, locating } = useLocateAndLoad();
  const ring = useRef(new Animated.Value(0)).current;

  // Đã cấp quyền từ trước (Android) -> lấy vị trí luôn
  useEffect(() => {
    hasLocationPermission().then(ok => {
      if (ok) locate();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const loop = Animated.loop(Animated.timing(ring, { toValue: 1, duration: 2400, easing: Easing.out(Easing.ease), useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [ring]);

  if (locating) return <LoadingView message="Đang xác định vị trí của bạn…" />;

  const scale = ring.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1.25] });
  const opacity = ring.interpolate({ inputRange: [0, 1], outputRange: [0.7, 0] });

  return (
    <View style={[styles.root, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.center}>
        <View style={styles.illus}>
          <Animated.View style={[styles.ring, { transform: [{ scale }], opacity }]} />
          <View style={styles.inner} />
          <View style={styles.pin}>
            <Icon name="navigation-variant" size={42} color="#fff" />
          </View>
        </View>
        <Text style={styles.h1}>Cho phép truy cập vị trí</Text>
        <Text style={styles.body}>
          Ứng dụng dùng GPS để hiển thị thời tiết chính xác tại nơi bạn đang đứng. Vị trí chỉ dùng để lấy dự báo và không được lưu lại.
        </Text>
      </View>
      <PrimaryButton icon="crosshairs-gps" label="Cho phép truy cập vị trí" onPress={locate} />
      <Pressable onPress={() => navigation.navigate('Search')} style={({ pressed }) => [styles.link, pressed && { backgroundColor: colors.primarySoft }]}>
        <Text style={styles.linkText}>Chọn thành phố thủ công</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 24, gap: 6 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  illus: { width: 168, height: 168, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  ring: { position: 'absolute', width: 168, height: 168, borderRadius: 84, backgroundColor: colors.primaryTint },
  inner: { position: 'absolute', width: 112, height: 112, borderRadius: 56, backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: colors.primaryTint },
  pin: { width: 88, height: 88, borderRadius: 44, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', elevation: 6, shadowColor: colors.primary, shadowOpacity: 0.35, shadowRadius: 14, shadowOffset: { width: 0, height: 10 } },
  h1: { fontSize: 26, fontWeight: '700', color: colors.text, textAlign: 'center' },
  body: { fontSize: 15, lineHeight: 23, color: '#4b5563', textAlign: 'center', maxWidth: 310 },
  link: { height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  linkText: { color: colors.primaryDark, fontSize: 15, fontWeight: '600' },
});
