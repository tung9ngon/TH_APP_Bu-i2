import React from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import MetricTile from './MetricTile';
import { Compass, FillBar, MarkerBar, PrecipBars } from './Visuals';
import { Forecast } from '../../types/weather';
import {
  clamp,
  dewPoint,
  formatTemp,
  formatVisibility,
  pressureLabel,
  uvLevel,
  visibilityLabel,
  windDirName,
  windLabel,
} from '../../utils/format';
import { colors, tempRange, uvRange } from '../../theme/colors';

const GAP = 12;
const H_PADDING = 16;

export default function MetricsGrid({ forecast }: { forecast: Forecast }) {
  const { width } = useWindowDimensions();
  const columns = width >= 900 ? 4 : width >= 600 ? 3 : 2;
  const contentWidth = Math.min(width, 640) - H_PADDING * 2;
  const tileWidth = (contentWidth - GAP * (columns - 1)) / columns;
  const tile = { width: tileWidth };

  const { current: c, daily, hourly, nowIndex } = forecast;
  const today = daily[0];
  const tempPos = ((c.temp - today.min) / (today.max - today.min || 1)) * 100;
  const next12 = hourly.slice(nowIndex, nowIndex + 12).map(h => h.precip);

  return (
    <View style={styles.grid}>
      <MetricTile style={tile} icon="thermometer" iconColor={colors.orange} title="Nhiệt độ" value={formatTemp(c.temp)} caption={`Cảm nhận như ${formatTemp(c.feels)}`}>
        <MarkerBar percent={tempPos} gradient={tempRange} labels={[formatTemp(today.min), formatTemp(today.max)]} />
      </MetricTile>

      <MetricTile style={tile} icon="water-percent" iconColor={colors.cyan} title="Độ ẩm" value={Math.round(c.humidity)} unit="%" caption={`Điểm sương ${formatTemp(dewPoint(c.temp, c.humidity))}`}>
        <FillBar percent={c.humidity} color={colors.cyan} />
      </MetricTile>

      <MetricTile style={tile} icon="weather-windy" iconColor={colors.teal} title="Tốc độ gió" value={Math.round(c.windSpeed)} unit="km/h" caption={`${windLabel(c.windSpeed)} · Giật tới ${Math.round(today.windMax)} km/h`}>
        <FillBar percent={(c.windSpeed / 60) * 100} color={colors.teal} />
      </MetricTile>

      <MetricTile style={tile} icon="compass-outline" iconColor={colors.teal} title="Hướng gió">
        <View style={styles.compassRow}>
          <Compass deg={c.windDir} />
          <View style={{ flexShrink: 1 }}>
            <Text style={styles.dirName}>{windDirName(c.windDir)}</Text>
            <Text style={styles.dirDeg}>Gió thổi từ {Math.round(c.windDir)}°</Text>
          </View>
        </View>
      </MetricTile>

      <MetricTile style={tile} icon="white-balance-sunny" iconColor={colors.yellow} title="Chỉ số UV" value={Math.round(c.uv)} badge={uvLevel(c.uv)} caption={`Cao nhất hôm nay: ${Math.round(today.uvMax)} · ${uvLevel(today.uvMax)}`}>
        <MarkerBar percent={(c.uv / 11) * 100} gradient={uvRange} />
      </MetricTile>

      <MetricTile style={tile} icon="water" iconColor={colors.primary} title="Lượng mưa" value={c.precip.toFixed(1)} unit="mm" caption={`Tổng hôm nay ${today.precipSum.toFixed(1)} mm`}>
        <PrecipBars values={next12} />
      </MetricTile>

      <MetricTile style={tile} icon="gauge" iconColor={colors.indigo} title="Áp suất" value={Math.round(c.pressure)} unit="hPa" caption={pressureLabel(c.pressure)}>
        <MarkerBar percent={((c.pressure - 980) / 60) * 100} gradient={['#dadafc']} markerColor={colors.indigo} labels={['Thấp', 'Cao']} />
      </MetricTile>

      <MetricTile style={tile} icon="eye-outline" iconColor={colors.slate} title="Tầm nhìn" value={formatVisibility(c.visibility)} unit="km" caption={visibilityLabel(c.visibility)}>
        <FillBar percent={clamp((c.visibility / 20) * 100)} color={colors.slate} />
      </MetricTile>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  compassRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dirName: { fontSize: 17, fontWeight: '600', color: colors.text },
  dirDeg: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
});
