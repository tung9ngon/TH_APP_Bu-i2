import { Place } from '../types/weather';

/** Gợi ý nhanh trên màn Search (chỉ là toạ độ — dữ liệu thời tiết vẫn lấy từ API). */
export const POPULAR_CITIES: Place[] = [
  { name: 'Hà Nội', sub: 'Việt Nam', lat: 21.0285, lon: 105.8542 },
  { name: 'TP. Hồ Chí Minh', sub: 'Việt Nam', lat: 10.8231, lon: 106.6297 },
  { name: 'Đà Nẵng', sub: 'Việt Nam', lat: 16.0544, lon: 108.2022 },
  { name: 'Hải Phòng', sub: 'Việt Nam', lat: 20.8449, lon: 106.6881 },
  { name: 'Huế', sub: 'Việt Nam', lat: 16.4637, lon: 107.5909 },
  { name: 'Cần Thơ', sub: 'Việt Nam', lat: 10.0452, lon: 105.7469 },
  { name: 'Nha Trang', sub: 'Khánh Hoà, Việt Nam', lat: 12.2388, lon: 109.1967 },
  { name: 'Đà Lạt', sub: 'Lâm Đồng, Việt Nam', lat: 11.9404, lon: 108.4583 },
];
