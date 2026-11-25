# MediCare — React + Vite

FE phòng khám đã kết nối các API hiện có trong Swagger của BE.

```sh
npm install
npm run dev
```

Mở `http://localhost:5173`. Mặc định chạy API thật, proxy tới `https://covetable-unthreateningly-nia.ngrok-free.dev`. Đăng nhập bằng tài khoản BE; nút chọn vai trò mẫu mặc định đã tắt.

Sao chép `.env.example` thành `.env.local` nếu cần đổi BE. Cấu hình, phạm vi API đã ghép, các chức năng đang chờ BE và cách kiểm tra: [API_INTEGRATION.md](./API_INTEGRATION.md).

```sh
npm run build
npm run lint
npm test
```
