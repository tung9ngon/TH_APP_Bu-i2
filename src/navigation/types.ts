import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { LocationFailReason } from '../services/location';

export type RootStackParamList = {
  Permission: undefined;
  Home: undefined;
  Search: { reason?: LocationFailReason } | undefined;
  Detail: { kind: 'hour' | 'day'; index: number };
};

export type ScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;
