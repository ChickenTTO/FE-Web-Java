# Hoàn thiện FE và chuẩn bị ghép API

## Chạy và kiểm tra

```sh
npm install
npm run dev
npm run build
npm run lint
npm test
```

Mở `/login`, chọn **Bệnh nhân**, **Bác sĩ**, **Lễ tân / Kho** hoặc **Quản trị viên** trong phần xem thử. Đăng nhập tài khoản BE hiện tại vẫn sử dụng form đăng nhập cũ. Không tự chuyển sang tài khoản mẫu khi đăng nhập BE thất bại.

Các trang nghiệp vụ mới dùng dữ liệu mẫu tại `ClinicContext`, lưu vào localStorage với khóa `medicare_clinic_demo_v1`. Các tài khoản xem thử không phải tài khoản BE. Đăng ký trong chế độ xem thử không lưu mật khẩu. Xóa riêng khóa dữ liệu mẫu và `medicare_auth_user` để bắt đầu lại. Không nhập dữ liệu bệnh nhân thật vào bản xem thử.

`VITE_DEMO_MODE=false` ẩn nút chọn vai trò và chuyển đăng ký sang endpoint BE. **Biến này chưa thay thế nguồn dữ liệu các trang nghiệp vụ**. Các trang mới vẫn có dữ liệu mẫu, và cần thay adapter trước khi dùng thật.

## Danh sách màn hình

| Phân hệ | Đường dẫn | Vai trò |
| --- | --- | --- |
| Công khai | `/`, `/specialties`, `/doctors`, `/services`, `/booking` | Xem công khai; đặt lịch cần PATIENT hoặc STAFF |
| Xác thực | `/login`, `/register` | Công khai |
| Bệnh nhân | `/profiles`, `/my-appointments` | PATIENT |
| Tiếp nhận | `/patients`, `/appointments` | STAFF, ADMIN |
| Khám bệnh | `/consultations` | DOCTOR |
| Lịch trực | `/schedules` | STAFF, ADMIN xếp lịch; DOCTOR xem lịch cá nhân / đăng ký nghỉ |
| Danh mục | `/catalog/specialties`, `/catalog/rooms`, `/catalog/doctors`, `/catalog/services`, `/catalog/timeSlots` | ADMIN chỉnh sửa; STAFF xem |
| Kho | `/inventory` | STAFF, ADMIN, DOCTOR |
| Lô và thẻ kho | `/inventory/batches`, `/inventory/transactions` | STAFF, ADMIN |
| Danh mục kho | `/inventory/supplies`, `/inventory/categories`, `/inventory/suppliers` | STAFF, ADMIN |
| Định mức | `/inventory/norms` | ADMIN |
| Thanh toán | `/payments` | PATIENT của mình; STAFF thu tiền; ADMIN xem / hoàn tiền |
| Báo cáo | `/admin`, `/reports` | ADMIN |
| Quản trị | `/users`, `/audit-logs` | ADMIN |
| Cá nhân | `/sessions`, `/settings`, `/help` | Mọi tài khoản |
| Thiết bị có sẵn | `/equipment` | ADMIN, STAFF |

Điều hướng ẩn theo vai trò và route guard kiểm tra quyền ở FE. BE vẫn phải xác thực quyền, quyền sở hữu hồ sơ và dữ liệu trả về trên mọi endpoint. Không dùng localStorage làm nguồn phân quyền thật.

## Adapter API

`src/services/clinicApi.js` tập trung các endpoint được mô tả cụ thể trong tài liệu BE và bóc lớp `ApiResponse.data`. Các page hiện dùng `useClinic()`; khi tích hợp, thay nguồn dữ liệu và các lệnh `commit` bằng adapter hoặc các hook truy vấn tương ứng. Giữ `id` thật từ BE, ánh xạ DTO cho từng resource, xử lý phân trang phía server và trạng thái loading/error/retry trước khi bỏ mock. `patientId`, `scheduleId`, `serviceId`, `supplyId`, `roomId` đang là tên khóa FE, cần đối chiếu DTO OpenAPI trước khi gửi request.

| Luồng | Adapter chuẩn bị |
| --- | --- |
| Hồ sơ bệnh nhân | `myProfiles`, `createProfile`, `updateProfile` |
| Danh mục công khai | `specialties`, `services`, `doctors`, `doctorSchedules` |
| Xếp lịch | `createSchedules` |
| Lịch hẹn | `appointments`, `createAppointment`, `updateAppointmentStatus`, `completeAppointment` |
| Thu tiền | `createPayment` |
| Vật tư | `supplies`, `createSupply`, `expiringBatches`, `importInventory`, `exportToRoom`, `adjustInventory`, `transactions` |
| Thiết bị đăng nhập | `sessions`, `revokeSession` |

Tài liệu nêu CRUD cho danh mục, người dùng, báo cáo, nhật ký bảo mật, lịch nghỉ và hoàn tiền nhưng chưa định nghĩa đầy đủ method/path/DTO. Chưa tự suy đoán các endpoint này trong adapter. Tương tự cần xác nhận API lịch hẹn của bệnh nhân, danh sách toàn bộ lô hàng, lịch sử trạng thái, danh sách hồ sơ tại quầy và schema phân trang `PageResponse`.

Auth sẵn có dùng HttpOnly cookie, endpoint refresh `/api/v1/auth/refresh-token`. Tài liệu BE ghi `/api/v1/auth/refresh` và mô tả JWT nhưng chưa chốt cách truyền token. Đã giữ cơ chế đăng nhập hiện tại; cần thống nhất với BE trước khi đổi interceptor. Token không được lưu trong dữ liệu mẫu.

## Luồng mô phỏng đã triển khai

- Đặt lịch chọn hồ sơ, dịch vụ, bác sĩ, ngày và ca còn chỗ; chặn trùng hồ sơ/ca, sai chuyên khoa và ca đầy. Số thứ tự tăng, không tái sử dụng số đã hủy.
- Lễ tân xác nhận / đánh dấu không đến; bệnh nhân hủy lịch của mình; lưu lý do và lịch sử trạng thái.
- Bác sĩ chỉ xem ca của mình, xem tiền sử, thêm vật tư phát sinh và hoàn tất ca. Thử trừ vật tư theo định mức và FEFO trên bản sao dữ liệu; lỗi thiếu tồn không lưu thay đổi nào.
- Nhập kho tạo lô và giao dịch; xuất phòng dùng FEFO; kiểm kê ghi chênh lệch; lô hết hạn chỉ được hủy về 0. Tồn khả dụng loại lô hết hạn, gồm cả lô hết hạn trong ngày.
- Thanh toán tiền mặt ghi đã thu; VNPay/MoMo tạo giao dịch chờ. Nút **Mô phỏng đã thanh toán** chỉ hiện cho tài khoản xem thử. Hoàn tiền chỉ cập nhật bản mẫu, chưa chuyển tiền thật.
- Xếp lịch theo khoảng ngày (tối đa 31 ngày); chặn trùng phòng/bác sĩ cùng ca; không nghỉ ca đang có bệnh nhân chờ.
- Báo cáo lọc thời gian và tải CSV; xem/thu hồi phiên mẫu và nhật ký đăng nhập xem thử.

Khóa đặt lịch, số thứ tự đồng thời, FEFO thực, job đánh dấu no_show/hết hạn và webhook thanh toán thuộc trách nhiệm BE. Bản mẫu không bảo đảm đồng bộ nhiều tab/người dùng và không chạy cron.

## Kiểm chứng

`npm test` kiểm tra FEFO, lô hết hạn, thiếu tồn và chuẩn hóa role. `tests/browser-smoke.mjs` dùng Playwright với Edge để kiểm tra các route, 4 vai trò, tạo danh mục, nhập kho, đặt lịch, xác nhận, hoàn tất khám và menu di động. Cài Playwright riêng khi cần chạy, hoặc đặt `PLAYWRIGHT_MODULE` trỏ tới module Playwright đã có; sau đó khởi động Vite và chạy `node tests/browser-smoke.mjs`. Mỗi lần chạy dùng browser context mới, không thay dữ liệu trình duyệt cá nhân.
