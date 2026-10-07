import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

Geolocation.setRNConfiguration({
  skipPermissionRequests: false,
  authorizationLevel: 'whenInUse',
  locationProvider: 'auto',
});

export type LocationFailReason = 'denied' | 'unavailable';
export type LocationResult =
  | { ok: true; lat: number; lon: number }
  | { ok: false; reason: LocationFailReason };

export async function hasLocationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    const [fine, coarse] = await Promise.all([
      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION),
      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION),
    ]);
    return fine || coarse;
  }
  return false; // iOS: chỉ biết khi gọi getCurrentPosition
}

export async function requestLocationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    // Android 12+: phải xin FINE cùng COARSE; người dùng chọn "Vị trí gần đúng" thì chỉ COARSE được cấp.
    const { ACCESS_FINE_LOCATION: FINE, ACCESS_COARSE_LOCATION: COARSE } = PermissionsAndroid.PERMISSIONS;
    const result = await PermissionsAndroid.requestMultiple([FINE, COARSE]);
    const { GRANTED } = PermissionsAndroid.RESULTS;
    return result[FINE] === GRANTED || result[COARSE] === GRANTED;
  }
  // iOS: không gọi Geolocation.requestAuthorization — callback của nó chỉ chạy khi trạng thái quyền
  // THAY ĐỔI, nên nếu quyền đã quyết định từ trước thì Promise treo mãi. getCurrentPosition phía native
  // tự xin quyền khi chưa hỏi, trả lỗi code 1 khi bị từ chối và luôn có timeout.
  return true;
}

export function getCurrentPosition(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      err => reject(err),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5 * 60 * 1000 },
    );
  });
}

/** Xin quyền + lấy toạ độ GPS. Không bao giờ throw. */
export async function getDeviceLocation(): Promise<LocationResult> {
  const granted = await requestLocationPermission();
  if (!granted) return { ok: false, reason: 'denied' };
  try {
    const coords = await getCurrentPosition();
    return { ok: true, ...coords };
  } catch (e: any) {
    return { ok: false, reason: e?.code === 1 ? 'denied' : 'unavailable' };
  }
}
