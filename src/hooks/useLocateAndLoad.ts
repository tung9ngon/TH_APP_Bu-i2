import { useCallback, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getDeviceLocation } from '../services/location';
import { useWeather } from '../context/WeatherContext';
import { RootStackParamList } from '../navigation/types';

/** GPS -> tải thời tiết -> điều hướng. Bị từ chối quyền -> sang màn Search. */
export function useLocateAndLoad() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { loadPlace } = useWeather();
  const [locating, setLocating] = useState(false);

  const locate = useCallback(async () => {
    setLocating(true);
    const result = await getDeviceLocation();
    setLocating(false);

    if (!result.ok) {
      navigation.navigate('Search', { reason: result.reason });
      return;
    }
    if (route.name !== 'Home') {
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    }
    loadPlace({ name: '', lat: result.lat, lon: result.lon, gps: true });
  }, [navigation, route.name, loadPlace]);

  return { locate, locating };
}
