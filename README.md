# MediCare — React + Vite

Web mặc định dùng dữ liệu mock để chạy báo cáo, không cần bật BE.

```sh
npm install
npm run dev
```

Mở `http://localhost:5173/login`. Đăng nhập bằng tài khoản mẫu `admin`, `doctor`, `staff` hoặc `patient`, cùng mật khẩu `123456`. Có thể dùng email hoặc số điện thoại của tài khoản mẫu. Dữ liệu được lưu trên trình duyệt.

Khi cần nối lại BE, đặt `VITE_DEMO_MODE=false` trong `.env.local` rồi khởi động lại Vite. Chi tiết tích hợp BE được giữ tại [API_INTEGRATION.md](./API_INTEGRATION.md).

```sh
npm run build
npm run lint
npm test
```
