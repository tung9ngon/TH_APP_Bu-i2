import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScreenProps } from '../navigation/types';
import { useWeather } from '../context/WeatherContext';
import { useLocateAndLoad } from '../hooks/useLocateAndLoad';
import { useDebounce } from '../hooks/useDebounce';
import { searchCities } from '../api/openMeteo';
import { EmptyView, LoadingView } from '../components/StateViews';
import { SectionLabel } from '../components/Card';
import { POPULAR_CITIES } from '../constants/cities';
import { Place } from '../types/weather';
import { colors, radius, shadow } from '../theme/colors';

type SearchState = 'idle' | 'loading' | 'done' | 'error';

export default function SearchScreen({ navigation, route }: ScreenProps<'Search'>) {
  const insets = useSafeAreaInsets();
  const { forecast, loadPlace } = useWeather();
  const { locate, locating } = useLocateAndLoad();
  const reason = route.params?.reason;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Place[]>([]);
  const [state, setState] = useState<SearchState>('idle');
  const [retryKey, setRetryKey] = useState(0);
  const debounced = useDebounce(query.trim(), 350);

  useEffect(() => {
    if (!debounced) {
      setState('idle');
      setResults([]);
      return;
    }
    const ctrl = new AbortController();
    setState('loading');
    searchCities(debounced, ctrl.signal)
      .then(list => {
        setResults(list);
        setState('done');
      })
      .catch(() => {
        if (!ctrl.signal.aborted) setState('error');
      });
    return () => ctrl.abort();
  }, [debounced, retryKey]);

  const choose = (p: Place) => {
    loadPlace(p);
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  if (locating) return <LoadingView message="Đang xác định vị trí của bạn…" />;

  const showPopular = !query.trim();
  const isTyping = !!query.trim() && (query.trim() !== debounced || state === 'loading');

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.headerRow}>
        {forecast || navigation.canGoBack() ? (
          <Pressable onPress={navigation.goBack} style={styles.back} accessibilityLabel="Quay lại">
            <Icon name="arrow-left" size={22} color={colors.text} />
          </Pressable>
        ) : null}
        <Text style={styles.h1}>Chọn địa điểm</Text>
      </View>

      {reason ? (
        <View style={styles.banner}>
          <Icon name="map-marker-off-outline" size={22} color="#d46213" />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.bannerTitle}>{reason === 'denied' ? 'Bạn chưa cấp quyền vị trí' : 'Không lấy được vị trí GPS'}</Text>
            <Text style={styles.bannerText}>
              {reason === 'denied'
                ? 'Hãy chọn thành phố bên dưới, hoặc bật quyền vị trí trong Cài đặt của thiết bị.'
                : 'Tín hiệu GPS yếu hoặc thiết bị không hỗ trợ. Hãy chọn thành phố thủ công.'}
            </Text>
            <Pressable onPress={locate}>
              <Text style={styles.bannerAction}>Thử lại quyền vị trí</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      <View style={styles.inputWrap}>
        <Icon name="magnify" size={22} color={colors.textMuted} style={styles.inputIcon} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Nhập tên thành phố…"
          placeholderTextColor={colors.textFaint}
          style={styles.input}
          autoCorrect={false}
          returnKeyType="search"
        />
        {query ? (
          <Pressable onPress={() => setQuery('')} style={styles.clear} hitSlop={6}>
            <Icon name="close" size={18} color="#4b5563" />
          </Pressable>
        ) : null}
      </View>

      {showPopular ? (
        <FlatList
          data={POPULAR_CITIES}
          keyExtractor={c => c.name}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={{ gap: 12, marginBottom: 12 }}>
              <Pressable onPress={locate} style={({ pressed }) => [styles.gpsRow, pressed && { backgroundColor: colors.primarySoft }]}>
                <View style={[styles.avatar, { backgroundColor: colors.primarySoft }]}>
                  <Icon name="crosshairs-gps" size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.rowTitle, { color: colors.primaryDark }]}>Dùng vị trí hiện tại</Text>
                  <Text style={styles.rowSub}>Lấy toạ độ bằng GPS của thiết bị</Text>
                </View>
              </Pressable>
              <SectionLabel>Thành phố phổ biến</SectionLabel>
            </View>
          }
          renderItem={({ item, index }) => <PlaceRow place={item} onPress={() => choose(item)} first={index === 0} last={index === POPULAR_CITIES.length - 1} />}
        />
      ) : isTyping ? (
        <View style={styles.skeletonCard}>
          {[0, 1, 2].map(i => (
            <View key={i} style={styles.skelRow}>
              <View style={styles.skelAvatar} />
              <View style={{ flex: 1, gap: 6 }}>
                <View style={[styles.skelLine, { width: '55%' }]} />
                <View style={[styles.skelLine, { width: '35%', height: 10, backgroundColor: colors.divider }]} />
              </View>
            </View>
          ))}
        </View>
      ) : state === 'error' ? (
        <EmptyView title="Không thể tìm kiếm" message="Kiểm tra kết nối mạng rồi thử lại." actionLabel="Thử lại" onAction={() => setRetryKey(k => k + 1)} />
      ) : results.length === 0 ? (
        <EmptyView
          title={`Không tìm thấy “${query.trim()}”`}
          message="Kiểm tra lại chính tả hoặc thử tên thành phố khác, ví dụ “Đà Nẵng”, “Huế”."
          actionLabel="Xoá tìm kiếm"
          onAction={() => setQuery('')}
        />
      ) : (
        <FlatList
          data={results}
          keyExtractor={p => `${p.lat},${p.lon}`}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item, index }) => <PlaceRow place={item} onPress={() => choose(item)} highlight first={index === 0} last={index === results.length - 1} />}
        />
      )}
    </View>
  );
}

function PlaceRow({ place, onPress, highlight, first, last }: { place: Place; onPress: () => void; highlight?: boolean; first?: boolean; last?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        first && styles.rowFirst,
        last && styles.rowLast,
        pressed && { backgroundColor: colors.surface },
      ]}>
      <View style={[styles.avatar, highlight && { backgroundColor: colors.primarySoft }]}>
        <Icon name="map-marker" size={18} color={highlight ? colors.primary : colors.slate} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{place.name}</Text>
        {place.sub ? <Text style={styles.rowSub}>{place.sub}</Text> : null}
      </View>
      <Icon name="chevron-right" size={20} color={colors.textFaint} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 16, gap: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 48 },
  back: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...shadow },
  h1: { fontSize: 24, fontWeight: '700', color: colors.text },
  banner: { flexDirection: 'row', gap: 12, padding: 14, borderRadius: radius.md, backgroundColor: colors.warnBg, borderWidth: 1, borderColor: colors.warnBorder },
  bannerTitle: { fontSize: 14, fontWeight: '600', color: '#642e09' },
  bannerText: { fontSize: 13, lineHeight: 19, color: colors.warnText },
  bannerAction: { fontSize: 13, fontWeight: '600', color: '#ae5110', textDecorationLine: 'underline', marginTop: 2 },
  inputWrap: { justifyContent: 'center' },
  inputIcon: { position: 'absolute', left: 14, zIndex: 1 },
  input: { height: 50, paddingLeft: 46, paddingRight: 44, borderRadius: radius.md, borderWidth: 1, borderColor: '#d1d5db', backgroundColor: '#fff', fontSize: 16, color: colors.text },
  clear: { position: 'absolute', right: 8, width: 34, height: 34, borderRadius: 17, backgroundColor: colors.divider, alignItems: 'center', justifyContent: 'center' },
  listContent: { paddingBottom: 32 },
  gpsRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: radius.md, backgroundColor: '#fff', ...shadow },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: colors.divider },
  rowFirst: { borderTopLeftRadius: radius.md, borderTopRightRadius: radius.md },
  rowLast: { borderBottomLeftRadius: radius.md, borderBottomRightRadius: radius.md, borderBottomWidth: 0 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.divider, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  rowSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  skeletonCard: { backgroundColor: '#fff', borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 6 },
  skelRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  skelAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.divider },
  skelLine: { height: 12, borderRadius: 6, backgroundColor: colors.border },
});
