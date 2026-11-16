import { useState } from "react";
import { Link } from "react-router-dom";
import { useClinic } from "../contexts/ClinicContext";
import { useAuth } from "../contexts/AuthContext";
import {
  Heading,
  DataTable,
  Badge,
  Modal,
  Field,
  Action,
} from "../components/ClinicUI";
import {
  roleOf,
  money,
  dateVN,
  today,
  allocate,
} from "../services/clinicStore";
export default function ClinicAppointments({ consultation = false }) {
  const { db, commit } = useClinic();
  const { user } = useAuth();
  const role = roleOf(user);
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");
  const [doctorId, setDoctor] = useState("");
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [extra, setExtra] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");
  const own = role === "PATIENT";
  const doctor = db.doctors.find((d) => d.userId === user.id);
  const all = db.appointments.filter((a) =>
    own
      ? db.patients.some((p) => p.id === a.patientId && p.userId === user.id)
      : role === "DOCTOR"
        ? db.schedules.some(
            (s) => s.id === a.scheduleId && s.doctorId === doctor?.id,
          )
        : true,
  );
  const rows = all
    .map((a) => ({
      ...a,
      patient: db.patients.find((p) => p.id === a.patientId)?.name,
      doctor: db.doctors.find(
        (d) =>
          d.id === db.schedules.find((s) => s.id === a.scheduleId)?.doctorId,
      )?.name,
      date: db.schedules.find((s) => s.id === a.scheduleId)?.workDate,
    }))
    .filter(
      (a) =>
        (!status || a.status === status) &&
        (!date || a.date === date) &&
        (!doctorId ||
          db.schedules.find((s) => s.id === a.scheduleId)?.doctorId ===
            doctorId),
    );
  const current = db.appointments.find((a) => a.id === selected);
  const schedule = db.schedules.find((s) => s.id === current?.scheduleId);
  const service = db.services.find((s) => s.id === current?.serviceId);
  const payment = db.payments.find((p) => p.appointmentId === current?.id);
  function change(nextStatus) {
    setError("");
    try {
      commit((n) => {
        const a = n.appointments.find((x) => x.id === selected);
        if (!a) throw new Error("Không tìm thấy lịch hẹn.");
        if (nextStatus === "completed") {
          if (role !== "DOCTOR" || a.status !== "confirmed")
            throw new Error("Chỉ bác sĩ được hoàn tất ca đã xác nhận.");
          const needs = n.norms
            .filter((x) => x.serviceId === a.serviceId)
            .map((x) => ({ ...x }));
          if (extra) {
            if (!(Number(quantity) > 0 && Number.isInteger(Number(quantity))))
              throw new Error("Số lượng bổ sung phải là số nguyên dương.");
            needs.push({ supplyId: extra, quantity: Number(quantity) });
          }
          needs.forEach((x) =>
            allocate(
              n,
              x.supplyId,
              Number(x.quantity),
              "USAGE",
              a.appointmentCode,
            ),
          );
        } else if (
          nextStatus === "confirmed" &&
          (!["STAFF", "ADMIN"].includes(role) || a.status !== "pending")
        )
          throw new Error("Không thể xác nhận lịch hẹn này.");
        else if (
          nextStatus === "cancelled" &&
          (!["pending", "confirmed"].includes(a.status) || role === "DOCTOR")
        )
          throw new Error("Không thể hủy lịch hẹn này.");
        else if (
          nextStatus === "no_show" &&
          (!["STAFF", "ADMIN"].includes(role) ||
            !["pending", "confirmed"].includes(a.status))
        )
          throw new Error("Không thể đánh dấu không đến.");
        if (["cancelled", "no_show"].includes(nextStatus) && !reason.trim())
          throw new Error("Vui lòng nhập lý do thay đổi trạng thái.");
        a.status = nextStatus;
        a.logs.push({
          status: nextStatus,
          at: new Date().toISOString(),
          note: reason || "Hoàn tất thao tác",
          actor: user.fullName || user.name || user.username,
        });
        if (nextStatus === "cancelled") {
          const s = n.schedules.find((s) => s.id === a.scheduleId);
          if (s.status === "booked") s.status = "available";
        }
      }, "Đã cập nhật lịch hẹn.");
      setExtra("");
      setReason("");
    } catch (err) {
      setError(err.message);
    }
  }
  return (
    <div className="clinic-page">
      <Heading
        title={
          consultation
            ? "Tiếp nhận & khám bệnh"
            : own
              ? "Lịch hẹn của tôi"
              : "Quản lý lịch hẹn"
        }
        description={
          consultation
            ? "Danh sách chờ khám, định mức và vật tư phát sinh trong ca khám."
            : "Tra cứu lịch hẹn, theo dõi trạng thái và số thứ tự tiếp nhận."
        }
        action={
          ["PATIENT", "STAFF"].includes(role) && (
            <Action to="/booking">Đặt lịch mới</Action>
          )
        }
      />
      <DataTable
        rows={rows}
        filters={
          <>
            <input
              className="form-control"
              type="date"
              aria-label="Lọc ngày khám"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <select
              className="form-select"
              aria-label="Lọc trạng thái"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">Mọi trạng thái</option>
              {[
                "pending",
                "confirmed",
                "completed",
                "cancelled",
                "no_show",
              ].map((s) => (
                <option value={s} key={s}>
                  {
                    {
                      pending: "Chờ xác nhận",
                      confirmed: "Đã xác nhận",
                      completed: "Hoàn tất",
                      cancelled: "Đã hủy",
                      no_show: "Không đến",
                    }[s]
                  }
                </option>
              ))}
            </select>
            {!own && role !== "DOCTOR" && (
              <select
                className="form-select"
                aria-label="Lọc bác sĩ"
                value={doctorId}
                onChange={(e) => setDoctor(e.target.value)}
              >
                <option value="">Tất cả bác sĩ</option>
                {db.doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            )}
          </>
        }
        columns={[
          { key: "appointmentCode", label: "Mã lịch hẹn" },
          { key: "patient", label: "Bệnh nhân" },
          { key: "date", label: "Ngày khám", render: (r) => dateVN(r.date) },
          { key: "doctor", label: "Bác sĩ" },
          { key: "queueNumber", label: "STT" },
          {
            key: "status",
            label: "Trạng thái",
            render: (r) => <Badge value={r.status} />,
          },
          {
            key: "action",
            label: "Thao tác",
            render: (r) => (
              <button
                className="btn btn-light btn-sm"
                onClick={() => {
                  setSelected(r.id);
                  setError("");
                  setReason("");
                  setExtra("");
                }}
              >
                Chi tiết {consultation ? " / Khám" : ""}
              </button>
            ),
          },
        ]}
      />
      {current && (
        <Modal
          title={current.appointmentCode}
          onClose={() => setSelected(null)}
        >
          <div className="d-flex justify-content-between mb-3">
            <Badge value={current.status} />
            <strong>Số thứ tự {current.queueNumber}</strong>
          </div>
          <div className="clinic-detail-grid">
            <Field label="Bệnh nhân">
              {db.patients.find((p) => p.id === current.patientId)?.name}
            </Field>
            <Field label="Ngày / Phòng">
              {dateVN(schedule?.workDate)} ·{" "}
              {db.rooms.find((r) => r.id === schedule?.roomId)?.name}
            </Field>
            <Field label="Dịch vụ">{service?.name}</Field>
            <Field label="Chi phí">
              {money(service?.price)} ·{" "}
              <Badge value={payment?.status || "unpaid"} />
            </Field>
          </div>
          <p>{current.note || "Không có ghi chú."}</p>
          {consultation && (
            <>
              <div className="clinic-callout">
                Tiền sử / Dị ứng:{" "}
                {db.patients.find((p) => p.id === current.patientId)
                  ?.medicalHistory || "Chưa ghi nhận"}
              </div>
              <h3 className="h5 mt-4">Vật tư theo định mức</h3>
              {db.norms
                .filter((n) => n.serviceId === current.serviceId)
                .map((n) => (
                  <p key={n.id}>
                    {db.supplies.find((s) => s.id === n.supplyId)?.name} ×{" "}
                    {n.quantity}
                  </p>
                ))}
              {current.status === "confirmed" && (
                <div className="clinic-form-grid">
                  <Field label="Vật tư phát sinh">
                    <select
                      className="form-select"
                      value={extra}
                      onChange={(e) => setExtra(e.target.value)}
                    >
                      <option value="">Không bổ sung</option>
                      {db.supplies.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Số lượng">
                    <input
                      className="form-control"
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                    />
                  </Field>
                </div>
              )}
            </>
          )}
          {["pending", "confirmed"].includes(current.status) && (
            <Field label="Lý do / Ghi chú xử lý">
              <textarea
                className="form-control"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
              />
            </Field>
          )}
          {error && (
            <p className="clinic-error" role="alert">
              {error}
            </p>
          )}
          <div className="clinic-form-actions flex-wrap">
            {["STAFF", "ADMIN"].includes(role) &&
              current.status === "pending" && (
                <button
                  className="btn btn-primary"
                  onClick={() => change("confirmed")}
                >
                  Xác nhận lịch
                </button>
              )}
            {consultation &&
              role === "DOCTOR" &&
              current.status === "confirmed" && (
                <button
                  className="btn btn-primary"
                  onClick={() => change("completed")}
                >
                  Hoàn tất khám & trừ vật tư
                </button>
              )}
            {["pending", "confirmed"].includes(current.status) &&
              role !== "DOCTOR" && (
                <button
                  className="btn btn-outline-primary"
                  onClick={() => change("cancelled")}
                >
                  Hủy lịch
                </button>
              )}
            {["STAFF", "ADMIN"].includes(role) &&
              ["pending", "confirmed"].includes(current.status) &&
              schedule?.workDate <= today() && (
                <button
                  className="btn btn-light"
                  onClick={() => change("no_show")}
                >
                  Không đến khám
                </button>
              )}
            {["PATIENT", "STAFF"].includes(role) &&
              !payment &&
              current.status !== "cancelled" && (
                <Link
                  className="btn btn-primary"
                  to={`/payments?appointment=${current.id}`}
                >
                  Thanh toán
                </Link>
              )}
          </div>
          <h3 className="h5 mt-4">Lịch sử trạng thái</h3>
          <ol className="clinic-timeline">
            {current.logs.map((l, i) => (
              <li key={i}>
                <Badge value={l.status} />
                <small>{new Date(l.at).toLocaleString("vi-VN")}</small>
                <p>
                  {l.note}
                  {l.actor ? ` · ${l.actor}` : ""}
                </p>
              </li>
            ))}
          </ol>
        </Modal>
      )}
    </div>
  );
}
