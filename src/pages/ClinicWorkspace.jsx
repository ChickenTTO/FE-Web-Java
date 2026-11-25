import { useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  Package,
  ArrowUpRight,
  ShieldCheck,
  Download,
} from "lucide-react";
import { useClinic } from "../contexts/ClinicContext";
import { useAuth } from "../contexts/AuthContext";
import LiveSettings from "./LiveSettings";
import {
  Heading,
  Metrics,
  DataTable,
  Badge,
  Field,
  Action,
  Modal,
} from "../components/ClinicUI";
import {
  money,
  today,
  dateVN,
  roleOf,
  stock,
  dateAfter,
  clinicDate,
} from "../services/clinicStore";
export function ClinicDashboard() {
  const { db, isDemo } = useClinic();
  if (!isDemo) return <div className="clinic-page">
    <Heading title="Tổng quan phòng khám" description="Danh mục đang được quản lý trên máy chủ." />
    <Metrics items={[["Chuyên khoa", db.specialties.length], ["Bác sĩ", db.doctors.length],
      ["Dịch vụ", db.services.length], ["Người dùng", db.users.length]]} />
    <div className="clinic-quick-grid">{[["specialties", "Chuyên khoa"], ["rooms", "Phòng khám"],
      ["doctors", "Bác sĩ"], ["services", "Dịch vụ"], ["timeSlots", "Khung giờ"]].map(([key, label]) =>
      <Link key={key} to={`/catalog/${key}`}><strong>{label}</strong><span>{db[key].length}</span></Link>)}</div>
    <p className="clinic-callout">Thống kê lịch hẹn, doanh thu và kho đang chờ BE cung cấp API.</p>
  </div>;
  const daily = db.appointments.filter(
    (a) =>
      db.schedules.find((s) => s.id === a.scheduleId)?.workDate === today(),
  );
  const low = db.supplies.filter((s) => stock(db, s.id) <= s.minStockLevel);
  const exp = db.batches.filter(
    (b) =>
      b.status === "active" &&
      b.expirationDate > today() &&
      b.expirationDate <= dateAfter(30),
  );
  return (
    <div className="clinic-page">
      <Heading
        title="Tổng quan phòng khám"
        description={`Hôm nay, ${dateVN(today())} · Theo dõi tiếp nhận và tình hình kho vật tư.`}
        action={<Action to="/appointments">Quản lý lịch hẹn</Action>}
      />
      <Metrics
        items={[
          [
            "Lịch khám hôm nay",
            daily.length,
            `${daily.filter((a) => a.status === "pending").length} chờ xác nhận`,
          ],
          [
            "Đã hoàn tất",
            daily.filter((a) => a.status === "completed").length,
            "Ca khám trong ngày",
          ],
          [
            "Doanh thu hôm nay",
            money(
              db.payments
                .filter(
                  (p) =>
                    p.status === "paid" &&
                    p.paidAt &&
                    clinicDate(p.paidAt) === today(),
                )
                .reduce((s, p) => s + p.amount, 0),
            ),
            "Giao dịch đã thanh toán",
          ],
          [
            "Cảnh báo vật tư",
            low.length + exp.length,
            "Tồn thấp và lô sắp hết hạn",
          ],
        ]}
      />
      <div className="clinic-quick-grid">
        {[
          ["/appointments", "Tiếp nhận lịch hẹn", CalendarDays],
          ["/schedules", "Xếp lịch bác sĩ", CalendarDays],
          ["/inventory", "Quản lý kho vật tư", Package],
          ["/reports", "Báo cáo doanh thu", ShieldCheck],
        ].map(([to, label, Icon]) => (
          <Link to={to} key={to}>
            <Icon size={24} />
            <strong>{label}</strong>
            <ArrowUpRight size={20} />
          </Link>
        ))}
      </div>
      <div className="clinic-split">
        <section>
          <h2 className="h4 mb-3">Lịch khám hôm nay</h2>
          <DataTable
            rows={daily.map((a) => ({
              ...a,
              name: db.patients.find((p) => p.id === a.patientId)?.name,
            }))}
            columns={[
              { key: "appointmentCode", label: "Mã lịch hẹn" },
              { key: "name", label: "Bệnh nhân" },
              {
                key: "status",
                label: "Trạng thái",
                render: (r) => <Badge value={r.status} />,
              },
            ]}
          />
        </section>
        <section className="clinic-panel p-4">
          <span className="mono-label">ƯU TIÊN XỬ LÝ</span>
          <h2 className="h4 my-3">Cảnh báo kho</h2>
          {low.map((s) => (
            <Link className="clinic-alert-row" key={s.id} to="/inventory">
              <Package size={20} />
              <div>
                <strong>{s.name}</strong>
                <p>
                  Còn {stock(db, s.id)} {s.unit} · tối thiểu {s.minStockLevel}
                </p>
              </div>
              <ArrowUpRight size={18} />
            </Link>
          ))}
          {exp.map((b) => (
            <Link
              className="clinic-alert-row"
              key={b.id}
              to="/inventory/batches"
            >
              <CalendarDays size={20} />
              <div>
                <strong>{b.batchNumber}</strong>
                <p>Hết hạn {dateVN(b.expirationDate)}</p>
              </div>
              <ArrowUpRight size={18} />
            </Link>
          ))}
          {!low.length && !exp.length && <p>Chưa có cảnh báo cần xử lý.</p>}
        </section>
      </div>
    </div>
  );
}
export function ClinicReports() {
  const { db } = useClinic();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState(today());
  const rows = db.payments
    .filter((p) => {
      const d = clinicDate(p.paidAt || p.createdAt);
      return (!from || d >= from) && (!to || d <= to);
    })
    .map((p) => ({
      ...p,
      appointmentCode: db.appointments.find((a) => a.id === p.appointmentId)
        ?.appointmentCode,
    }));
  function download() {
    const data = [
      ["Mã lịch hẹn", "Số tiền", "Phương thức", "Trạng thái", "Thời gian"],
      ...rows.map((r) => [
        r.appointmentCode,
        r.amount,
        r.method,
        r.status,
        r.paidAt || r.createdAt,
      ]),
    ];
    const csv =
      "\uFEFF" +
      data
        .map((r) =>
          r
            .map((v) => '"' + String(v ?? "").replaceAll('"', '""') + '"')
            .join(","),
        )
        .join("\r\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `doanh-thu-${today()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <div className="clinic-page">
      <Heading
        title="Báo cáo doanh thu"
        description="Tổng hợp thanh toán và hoàn tiền theo khoảng thời gian."
        action={
          <Action onClick={download}>
            <Download size={17} />
            Xuất CSV
          </Action>
        }
      />
      <div className="clinic-toolbar mb-4">
        <Field label="Từ ngày">
          <input
            className="form-control"
            type="date"
            value={from}
            max={to}
            onChange={(e) => setFrom(e.target.value)}
          />
        </Field>
        <Field label="Đến ngày">
          <input
            className="form-control"
            type="date"
            value={to}
            min={from}
            onChange={(e) => setTo(e.target.value)}
          />
        </Field>
      </div>
      <Metrics
        items={[
          [
            "Doanh thu thuần",
            money(
              rows
                .filter((r) => r.status === "paid")
                .reduce((s, r) => s + r.amount, 0),
            ),
            "Giao dịch đã thu, chưa hoàn",
          ],
          [
            "Đã hoàn",
            money(
              rows
                .filter((r) => r.status === "refunded")
                .reduce((s, r) => s + r.amount, 0),
            ),
            "Tổng giá trị hoàn tiền",
          ],
          ["Giao dịch", rows.length, "Trong kỳ được chọn"],
        ]}
      />
      <DataTable
        rows={rows}
        columns={[
          { key: "appointmentCode", label: "Mã lịch hẹn" },
          { key: "amount", label: "Giá trị", render: (r) => money(r.amount) },
          { key: "method", label: "Phương thức" },
          {
            key: "status",
            label: "Trạng thái",
            render: (r) => <Badge value={r.status} />,
          },
        ]}
      />
    </div>
  );
}
export function ClinicSecurity({ audit = false }) {
  const { db, commit } = useClinic();
  const { user, logout } = useAuth();
  const [target, setTarget] = useState(null);
  const rows = audit
    ? db.auditLogs
    : db.sessions.filter((s) => s.userId === user.id);
  return (
    <div className="clinic-page">
      <Heading
        title={audit ? "Nhật ký bảo mật" : "Thiết bị đăng nhập"}
        description={
          audit
            ? "Lịch sử đăng nhập, thu hồi phiên và hoạt động bảo mật."
            : "Kiểm tra các phiên truy cập và đăng xuất thiết bị từ xa."
        }
      />
      <DataTable
        rows={rows}
        columns={
          audit
            ? [
                {
                  key: "at",
                  label: "Thời gian",
                  render: (r) => new Date(r.at).toLocaleString("vi-VN"),
                },
                { key: "userName", label: "Tài khoản" },
                { key: "action", label: "Hành động" },
                { key: "reason", label: "Chi tiết" },
              ]
            : [
                { key: "deviceName", label: "Thiết bị" },
                {
                  key: "lastUsedAt",
                  label: "Truy cập gần nhất",
                  render: (r) => new Date(r.lastUsedAt).toLocaleString("vi-VN"),
                },
                {
                  key: "expiresAt",
                  label: "Hết hạn",
                  render: (r) => dateVN(r.expiresAt),
                },
                {
                  key: "revoked",
                  label: "Trạng thái",
                  render: (r) => (
                    <Badge
                      value={
                        r.isRevoked
                          ? "Đã thu hồi"
                          : r.id === user.sessionId
                            ? "Thiết bị hiện tại"
                            : "active"
                      }
                    />
                  ),
                },
                {
                  key: "action",
                  label: "Thao tác",
                  render: (r) =>
                    !r.isRevoked && (
                      <button
                        className="btn btn-light btn-sm"
                        onClick={() => setTarget(r.id)}
                      >
                        Đăng xuất thiết bị
                      </button>
                    ),
                },
              ]
        }
      />
      {target && (
        <Modal title="Thu hồi phiên đăng nhập" onClose={() => setTarget(null)}>
          <p>Thiết bị này sẽ cần đăng nhập lại để tiếp tục sử dụng.</p>
          <Action
            onClick={async () => {
              commit((n) => {
                n.sessions.find((s) => s.id === target).isRevoked = true;
                n.auditLogs.unshift({
                  id: crypto.randomUUID(),
                  userName: user.fullName || user.username,
                  action: "REVOKE_SESSION",
                  at: new Date().toISOString(),
                  reason: "Thu hồi thiết bị",
                });
              });
              if (target === user.sessionId) await logout();
              setTarget(null);
            }}
          >
            Xác nhận đăng xuất
          </Action>
        </Modal>
      )}
    </div>
  );
}
export function ClinicSettings() {
  const { db, commit, isDemo } = useClinic();
  const { user } = useAuth();
  const role = roleOf(user);
  const doctor = db.doctors.find((d) => d.userId === user.id);
  const [error, setError] = useState("");
  if (!isDemo) return <LiveSettings />;
  return (
    <div className="clinic-page">
      <Heading
        title="Tài khoản & cài đặt"
        description="Thông tin cá nhân và tùy chọn hiển thị trên thiết bị này."
      />
      <section className="clinic-panel p-4">
        <h2 className="h4">{user.fullName || user.username}</h2>
        <span className="mint-tag">{role}</span>
        <div className="clinic-form-grid mt-4">
          <Field label="Email">{user.email || "Chưa cập nhật"}</Field>
          <Field label="Số điện thoại">{user.phone || "Chưa cập nhật"}</Field>
        </div>
        <Link to="/sessions" className="btn btn-outline-primary mt-4">
          Quản lý thiết bị đăng nhập
        </Link>
      </section>
      {role === "DOCTOR" && doctor && (
        <form
          className="clinic-panel p-4 mt-4"
          onSubmit={(e) => {
            e.preventDefault();
            setError("");
            const f = Object.fromEntries(new FormData(e.currentTarget));
            try {
              commit((n) =>
                Object.assign(
                  n.doctors.find((d) => d.id === doctor.id),
                  f,
                ),
              );
            } catch (err) {
              setError(err.message);
            }
          }}
        >
          <h2 className="h4">Hồ sơ chuyên môn</h2>
          <Field label="Học vị / Chức danh">
            <input
              className="form-control"
              name="qualification"
              defaultValue={doctor.qualification}
              required
            />
          </Field>
          <Field label="Giới thiệu">
            <textarea
              className="form-control"
              name="description"
              defaultValue={doctor.description}
            />
          </Field>
          {error && <p role="alert">{error}</p>}
          <button className="btn btn-primary mt-3">Cập nhật hồ sơ</button>
        </form>
      )}
    </div>
  );
}
export function ClinicHelp() {
  return (
    <div className="clinic-page">
      <Heading
        title="Hướng dẫn sử dụng"
        description="Các bước thao tác trong phòng khám và khu vực bệnh nhân."
      />
      <div className="clinic-panel p-4">
        {[
          [
            "Đặt lịch khám như thế nào?",
            "Tạo hồ sơ trong Hồ sơ của tôi, chọn dịch vụ và bác sĩ tại Đặt lịch, sau đó chọn ngày và ca còn chỗ. Theo dõi xác nhận tại Lịch hẹn của tôi.",
          ],
          [
            "Tiếp nhận và hoàn tất khám",
            "Lễ tân xác nhận lịch hẹn và thu tiền tại quầy. Bác sĩ mở Tiếp nhận & khám bệnh, xem tiền sử, bổ sung vật tư nếu cần và hoàn tất khám.",
          ],
          [
            "Kho xuất vật tư theo nguyên tắc nào?",
            "Vật tư được phân bổ từ lô còn hạn gần nhất (FEFO). Không xuất lô hết hạn; giao dịch thiếu tồn sẽ không được lưu.",
          ],
          [
            "Quản lý phiên đăng nhập",
            "Vào Thiết bị đăng nhập để xem và thu hồi phiên truy cập.",
          ],
          [
            "Dữ liệu trong bản xem thử",
            "Dữ liệu mẫu được lưu trong trình duyệt. Tài khoản xem thử tách biệt với đăng nhập BE; thanh toán trực tuyến được mô phỏng và không phát sinh giao dịch thực.",
          ],
        ].map(([q, a]) => (
          <details className="clinic-faq" key={q}>
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
