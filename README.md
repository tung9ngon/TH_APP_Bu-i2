# WeatherApp

Ứng dụng xem thời tiết viết bằng React Native 0.76 (TypeScript). Lấy vị trí hiện tại hoặc tìm theo tên thành phố, hiển thị thời tiết hiện tại, dự báo theo giờ và 7 ngày.

- Dữ liệu thời tiết và tìm kiếm địa điểm: [Open-Meteo](https://open-meteo.com/) (không cần API key).
- Tên địa điểm từ toạ độ: BigDataCloud reverse geocode (không cần API key).

## 1. Yêu cầu môi trường

| Thành phần | Phiên bản | Ghi chú |
|---|---|---|
| Node.js | >= 18 (đã chạy với 20.19.6) | theo `engines` trong `package.json` |
| npm | đi kèm Node | dự án dùng `package-lock.json` |
| JDK | 17 | để build Android |
| Android Studio | Android SDK 35, Build-Tools 35.0.0, NDK 26.1.10909125 | theo `android/build.gradle` |
| Xcode (chỉ macOS) | >= 15.1 | để build iOS |
| Ruby + Bundler | Ruby >= 2.6.10 | để cài CocoaPods theo `Gemfile` |
| Watchman (khuyến nghị, macOS) | bản mới nhất | `brew install watchman` |

Nếu chưa cài môi trường React Native, làm theo hướng dẫn chính thức: <https://reactnative.dev/docs/set-up-your-environment>.

## 2. Cài đặt

```bash
# Tại thư mục gốc dự án
npm install
```

Riêng iOS (macOS), cài thêm CocoaPods:

```bash
bundle install          # lần đầu, cài CocoaPods theo Gemfile
cd ios
bundle exec pod install
cd ..
```

> File `ios/.xcode.env.local` đang trỏ `NODE_BINARY` tới đường dẫn Node trên máy tác giả. Nếu build iOS báo không tìm thấy node, sửa lại theo kết quả `which node` trên máy bạn (hoặc xoá file này để dùng mặc định trong `ios/.xcode.env`).

## 3. Chạy ứng dụng

Mở terminal thứ nhất, khởi động Metro bundler:

```bash
npm start
```

Mở terminal thứ hai, chạy trên nền tảng mong muốn:

```bash
# Android: cần mở sẵn emulator hoặc cắm thiết bị đã bật USB debugging
npm run android

# iOS (chỉ macOS)
npm run ios
```

Có thể mở trực tiếp `ios/WeatherApp.xcworkspace` bằng Xcode (không mở file `.xcodeproj`) rồi bấm Run.

### Quyền vị trí

Lần đầu mở, ứng dụng hiện màn hình xin quyền vị trí. Nếu từ chối, vẫn dùng được chức năng tìm kiếm thành phố.

Trên máy ảo, cần giả lập vị trí:
- **iOS Simulator:** menu *Features → Location* → chọn *Custom Location…*
- **Android Emulator:** nút *⋯ (Extended controls) → Location* → đặt toạ độ → *Set location*

Máy chạy ứng dụng cần có kết nối Internet để gọi API.

## 4. Các lệnh khác

| Lệnh | Tác dụng |
|---|---|
| `npm run lint` | Kiểm tra code bằng ESLint |
| `npm run tsc` | Kiểm tra kiểu TypeScript (không xuất file) |
| `npm test` | Chạy test bằng Jest |

## 5. Cấu trúc thư mục

```
App.tsx              Điểm vào, bọc SafeAreaProvider + WeatherProvider
src/
  api/               Gọi API: Open-Meteo, reverse geocode, hàm fetch chung
  components/        Thành phần giao diện (thẻ, dự báo giờ/ngày, chỉ số)
  constants/         Danh sách thành phố gợi ý
  context/           WeatherContext – trạng thái thời tiết dùng chung
  hooks/             useDebounce, useLocateAndLoad
  navigation/        Stack điều hướng: Permission → Home → Search / Detail
  screens/           Các màn hình
  services/          Lấy vị trí thiết bị
  theme/             Bảng màu
  types/             Kiểu dữ liệu
  utils/             Định dạng số liệu, ánh xạ mã thời tiết
android/  ios/       Mã native
```

## 6. Lỗi thường gặp

| Hiện tượng | Cách xử lý |
|---|---|
| Lỗi lạ sau khi đổi dependency | `npm start -- --reset-cache` |
| Android build lỗi sau khi cập nhật | `cd android && ./gradlew clean && cd ..` rồi chạy lại |
| iOS build lỗi liên quan Pods | `cd ios && bundle exec pod install && cd ..` |
| Icon hiển thị ô vuông / dấu hỏi | Build lại app native (không chỉ reload JS) để nạp font `MaterialCommunityIcons.ttf` |
| `adb: device not found` | Kiểm tra `adb devices`, mở emulator trước khi chạy `npm run android` |
