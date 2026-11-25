# Tích hợp API BE

Đối chiếu ngày 25/11/2026 với Swagger: https://covetable-unthreateningly-nia.ngrok-free.dev/swagger-ui/index.html. OpenAPI JSON thực tế nằm tại `/api-docs`, không phải `/v3/api-docs`.

## Chạy FE với BE thật

```sh
npm install
npm run dev
```

Mở `http://localhost:5173`. Không cần tạo env để dùng BE ở trên. Mặc định đã tắt mock và tài khoản xem thử. Nếu muốn thay cấu hình, sao chép `.env.example` thành `.env.local`:

```dotenv
VITE_API_BASE_URL=
API_PROXY_TARGET=https://covetable-unthreateningly-nia.ngrok-free.dev
VITE_DEMO_MODE=false
```

Browser gọi `/api` cùng origin với FE. Vite proxy chuyển request sang BE, thêm `ngrok-skip-browser-warning`, giữ cookie và bỏ Domain cố định của cookie từ upstream. Đổi `API_PROXY_TARGET` khi link ngrok thay đổi và khởi động lại Vite. Có thể dùng `http://localhost:8082` cho BE local.

**Production:** proxy Vite chỉ có trong dev, không nằm trong thư mục build. Cần reverse proxy `/api` trên domain FE tới BE. Hoặc đặt `VITE_API_BASE_URL` thành origin BE trước khi build; BE phải cho phép origin FE, credentials, header Authorization và `ngrok-skip-browser-warning` qua CORS, đồng thời cấu hình cookie phù hợp với HTTPS/SameSite. Không đưa bí mật vào biến `VITE_*`.

## Phạm vi đã ghép

| Chức năng FE | API chính | Thao tác đã nối vào UI |
| --- | --- | --- |
| `/register`, `/login` | `/api/v1/auth/register`, `/login` | Đăng ký, đăng nhập; phản hồi lỗi BE |
| Đăng xuất / khôi phục phiên | `/api/v1/auth/logout`, `/refresh-token`, `/api/v1/users/profile` | Xóa phiên, lấy access token mới, xác thực lại user khi tải trang |
| `/specialties`, trang chủ | `/api/v1/specialties/active` | Danh mục chuyên khoa công khai |
| `/doctors`, `/services` | `/api/v1/doctor-profiles`, `/medical-services` | Danh sách, tìm kiếm/lọc tại FE trên toàn bộ dữ liệu đã tải |
| `/catalog/specialties` | `/api/v1/specialties` | ADMIN tạo/sửa/đổi trạng thái; STAFF xem |
| `/catalog/rooms` | `/api/v1/examination-rooms` | ADMIN tạo/sửa/đổi trạng thái; STAFF xem |
| `/catalog/doctors` | `/api/v1/doctor-profiles` | ADMIN tạo/sửa/đổi trạng thái; STAFF xem/đổi trạng thái nhận khám |
| `/catalog/services` | `/api/v1/medical-services` | ADMIN tạo/sửa/đổi trạng thái; STAFF xem/đổi trạng thái |
| `/catalog/timeSlots` | `/api/v1/time-slots` | ADMIN tạo/sửa; STAFF xem |
| `/users` | `/api/v1/users` | ADMIN tạo/sửa/khóa/mở khóa; mật khẩu khởi tạo nhập trong form |
| `/profiles` | `/api/v1/patient-profile/me` | PATIENT xem hồ sơ của mình; chưa có API tạo/sửa hồ sơ |
| `/settings` | `/api/v1/users/profile`, `/users/change-password` | Xem/sửa hồ sơ cá nhân và đổi mật khẩu |
| Hồ sơ chuyên môn tại `/settings` | `/api/v1/doctor-profiles/me` | DOCTOR xem hồ sơ và sửa tiểu sử |
| `/admin` | Các API danh mục | Tổng số chuyên khoa, bác sĩ, dịch vụ, người dùng; điều hướng danh mục |

Adapter có thêm các method đã được Swagger định nghĩa như xóa chuyên khoa/phòng/khung giờ/người dùng và reset mật khẩu người dùng. Các thao tác này chưa có nút mới trong UI hiện tại.

## Xác thực và dữ liệu

- Login trả `data.accessToken` và `data.user`. Refresh token được BE lưu bằng cookie HttpOnly; access token chỉ giữ trong bộ nhớ và gửi qua `Authorization: Bearer ...`.
- `localStorage` chỉ lưu thông tin user để khởi động khôi phục phiên. Khi tải lại trang, FE refresh rồi gọi `/users/profile`; không dùng cached user làm phiên đã xác thực.
- Các lỗi 401 đồng thời dùng chung một lần refresh. Login/register/logout không kích hoạt vòng lặp refresh; retry tối đa một lần. Refresh thất bại hoặc token mới vẫn bị 401 sẽ xóa phiên.
- Dữ liệu tài khoản thật không dùng `ClinicContext.commit` hoặc dữ liệu mẫu. Các trang tải API có trạng thái loading, lỗi và nút thử lại. Dữ liệu hiển thị chỉ đổi sau khi BE xác nhận lưu thành công.
- `apiHelpers.js` bóc `ApiResponse.data`, phát hiện mã lỗi nghiệp vụ, ánh xạ DTO/ID và đọc đủ các trang server. Dịch vụ khám bắt đầu trang 0, các danh mục phân trang khác bắt đầu trang 1. BE thực tế nhận `page`/`size`; tên `argN` trong Swagger không có tác dụng khi kiểm tra trực tiếp.
- ID từ BE được đổi sang chuỗi trong UI để so sánh với giá trị select; payload gửi ID số và đúng tên field: `roomNumber/building`, `title/experienceYears/biography/consultationFee`, `fullName/roleId`, `specialtyId` nullable của dịch vụ.
- BE vẫn chịu trách nhiệm kiểm tra quyền, quyền sở hữu dữ liệu và các ràng buộc nghiệp vụ trên mọi request.

## Các phần BE chưa cung cấp

Swagger hiện không có API đặt lịch/ca trực, hoàn tất khám, kho vật tư, thanh toán/hoàn tiền, báo cáo doanh thu, nhật ký bảo mật, danh sách/thu hồi thiết bị đăng nhập hoặc thiết bị y tế. Hồ sơ bệnh nhân chỉ có GET của tài khoản hiện tại; chưa có CRUD hoặc tìm hồ sơ tại quầy.

Trong chế độ API thật, các route tương ứng hiển thị chức năng chưa khả dụng. Không tạo lịch, trừ kho, ghi thanh toán hoặc lưu hồ sơ giả vào localStorage. Dashboard không đưa ra số liệu doanh thu/lịch khám giả.

## Chế độ xem thử

Đặt `VITE_DEMO_MODE=true` rồi khởi động lại Vite để bật lại nút chọn bốn vai trò và đăng ký mẫu. User xem thử có `isDemo: true`; user đăng nhập bằng tài khoản BE vẫn dùng API thật kể cả khi đã bật cờ xem thử. Đăng ký mẫu không gửi BE và không lưu mật khẩu.

Dữ liệu mẫu dùng khóa `medicare_clinic_demo_v1`; thông tin user dùng `medicare_auth_user`. Tắt demo sẽ bỏ phiên demo cũ. Không nhập dữ liệu bệnh nhân thật vào chế độ xem thử.

## Kiểm tra

```sh
npm run build
npm run lint
npm test
```

`npm test` kiểm tra adapter DTO, lỗi phản hồi, phân trang 0/1, chuẩn hóa quan hệ/role, cùng các kiểm tra FEFO của chế độ mẫu.

`tests/browser-api.mjs` cần Playwright và Microsoft Edge. Khởi động FE ở chế độ API thật, sau đó chạy `node tests/browser-api.mjs`. Có thể đặt `PLAYWRIGHT_MODULE` thành module URL của Playwright đã cài và `API_TEST_BASE_URL` nếu đổi port. Kiểm tra đọc danh mục công khai từ BE thật; mọi thao tác ghi và xác thực trong bài test được chặn bằng mock network trong context riêng, không tạo tài khoản hay thay dữ liệu BE.

Bài test browser kiểm tra lỗi đăng nhập, Bearer token, refresh đồng thời, khôi phục/hết hạn phiên, không lưu token/mock, tạo/đổi trạng thái danh mục, cập nhật hồ sơ/đổi mật khẩu, lỗi/thử lại, hồ sơ bệnh nhân chỉ đọc và giao diện mobile. Chưa kiểm chứng cookie và các thao tác ghi với tài khoản BE thật vì chưa có thông tin đăng nhập kiểm thử.

`tests/browser-smoke.mjs` kiểm tra các luồng mẫu với `VITE_DEMO_MODE=true`. Có thể đặt `SMOKE_BASE_URL` khi dùng server demo trên port khác.
