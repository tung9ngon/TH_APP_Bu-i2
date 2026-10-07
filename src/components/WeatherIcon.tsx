import React from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getWeatherInfo } from '../utils/weatherCode';

interface Props {
  code: number;
  isDay?: boolean;
  size?: number;
  color?: string; // ghi đè màu mặc định theo trạng thái
}

export default function WeatherIcon({ code, isDay = true, size = 28, color }: Props) {
  const info = getWeatherInfo(code, isDay);
  return <Icon name={info.icon} size={size} color={color ?? info.color} accessibilityLabel={info.label} />;
}
