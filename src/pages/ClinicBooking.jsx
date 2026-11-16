import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Calendar, ArrowRight } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useClinic } from "../contexts/ClinicContext";
import { Heading, Field, Modal, Action, Empty } from "../components/ClinicUI";
import {
  uid,
  code,
  today,
  money,
  dateVN,
  roleOf,
} from "../services/clinicStore";
export default function ClinicBooking() {
  const { db, commit } = useClinic();
  const { user } = useAuth();
  const [params] = useSearchParams();
  const preset = db.schedules.find((s) => s.id === params.get("schedule"));
  const [doctorId, setDoctor] = useState(
    preset?.doctorId || params.get("doctor") || "",
  );
  const [serviceId, setService] = useState(params.get("service") || "");
  const [date, setDate] = useState(preset?.workDate || today());
  const [scheduleId, setSchedule] = useState(preset?.id || "");
  const [patientId, setPatient] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);
  const service = db.services.find((s) => s.id === serviceId);
  const doctor = db.doctors.find((d) => d.id === doctorId);
  const patients = db.patients.filter(
    (p) => roleOf(user) !== "PATIENT" || p.userId === user?.id,
  );
  const schedules = db.schedules.filter(
    (s) => s.doctorId === doctorId && s.workDate === date,
  );
  const selected = db.schedules.find((s) => s.id === scheduleId);
  function count(id) {
    return db.appointments.filter(
      (a) => a.scheduleId === id && a.status !== "cancelled",
    ).length;
  }
  function submit(e) {
    e.preventDefault();
    setError("");
    try {
      if (!user) throw new Error("Vui lòng đăng nhập để đặt lịch khám.");
      if (!["PATIENT", "STAFF"].includes(roleOf(user)))
        throw new Error(
          "Vui lòng sử dụng vai trò bệnh nhân hoặc lễ tân để đặt lịch.",
        );
      if (
        !patients.some((p) => p.id === patientId) ||
        !service ||
        !doctor ||
        !selected
      )
        throw new Error("Vui lòng chọn hồ sơ, dịch vụ, bác sĩ và ca khám.");
      if (service.specialtyId !== doctor.specialtyId)
        throw new Error("Dịch vụ không thuộc chuyên khoa của bác sĩ đã chọn.");
      if (
        selected.status !== "available" ||
        selected.workDate < today() ||
        count(selected.id) >= selected.maxPatients
      )
        throw new Error(
          "SCHEDULE_FULL · Ca khám đã đầy hoặc không còn tiếp nhận. Vui lòng chọn ca khác.",
        );
      const result = commit((n) => {
        if (
          n.appointments.some(
            (a) =>
              a.patientId === patientId &&
              a.scheduleId === scheduleId &&
              !["cancelled", "no_show"].includes(a.status),
          )
        )
          throw new Error("Hồ sơ này đã có lịch trong ca khám.");
        const queueNumber =
          Math.max(
            0,
            ...n.appointments
              .filter((a) => a.scheduleId === scheduleId)
              .map((a) => a.queueNumber),
          ) + 1;
        const a = {
          id: uid(),
          appointmentCode: code("APT"),
          patientId,
          scheduleId,
          serviceId,
          status: "pending",
          queueNumber,
          note,
          logs: [
            {
              status: "pending",
              at: new Date().toISOString(),
              note: "Đặt lịch khám",
            },
          ],
        };
        n.appointments.unshift(a);
        if (count(scheduleId) + 1 >= selected.maxPatients)
          n.schedules.find((s) => s.id === scheduleId).status = "booked";
        return a;
      }, "Đặt lịch thành công.");
      setSuccess(result);
    } catch (err) {
      setError(err.message);
    }
  }
  return (
    <div className="container clinic-page">
      <Heading
        eyebrow="MEDICARE / ĐẶT LỊCH"
        title="Chủ động lịch khám"
        description="Chọn hồ sơ, dịch vụ và ca khám phù hợp. Lễ tân sẽ xác nhận lịch hẹn của bạn."
      />
      {!user && (
        <div className="clinic-callout mb-4">
          Bạn cần đăng nhập để lưu lịch hẹn.{" "}
          <Link to="/login" state={{ from: { pathname: "/booking" } }}>
            Đăng nhập
          </Link>{" "}
          hoặc <Link to="/register">tạo tài khoản</Link>.
        </div>
      )}
      <div className="clinic-booking-layout">
        <form className="clinic-panel p-4" onSubmit={submit}>
          <div className="mono-label mb-4">01 / THÔNG TIN KHÁM</div>
          <div className="clinic-form-grid">
            <Field label="Hồ sơ bệnh nhân">
              <select
                className="form-select"
                value={patientId}
                onChange={(e) => setPatient(e.target.value)}
                required
              >
                <option value="">Chọn hồ sơ</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} · {p.relationship || "Khách tại quầy"}
                  </option>
                ))}
              </select>
              <Link to={roleOf(user) === "STAFF" ? "/patients" : "/profiles"}>
                + Tạo hồ sơ mới
              </Link>
            </Field>
            <Field label="Dịch vụ">
              <select
                className="form-select"
                value={serviceId}
                onChange={(e) => {
                  setService(e.target.value);
                  setDoctor("");
                  setSchedule("");
                }}
                required
              >
                <option value="">Chọn dịch vụ</option>
                {db.services
                  .filter((s) => s.isActive)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} · {money(s.price)}
                    </option>
                  ))}
              </select>
            </Field>
            <Field label="Bác sĩ">
              <select
                className="form-select"
                value={doctorId}
                onChange={(e) => {
                  setDoctor(e.target.value);
                  setSchedule("");
                }}
                required
              >
                <option value="">Chọn bác sĩ</option>
                {db.doctors
                  .filter(
                    (d) =>
                      d.isActive &&
                      (!service || d.specialtyId === service.specialtyId),
                  )
                  .map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
              </select>
            </Field>
            <Field label="Ngày khám">
              <input
                className="form-control"
                type="date"
                min={today()}
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setSchedule("");
                }}
                required
              />
            </Field>
          </div>
          <div className="mono-label my-4">02 / CHỌN CA KHÁM</div>
          <div className="clinic-slot-grid">
            {schedules.map((s) => {
              const slot = db.timeSlots.find((t) => t.id === s.timeSlotId);
              const full =
                s.status !== "available" || count(s.id) >= s.maxPatients;
              return (
                <button
                  type="button"
                  className={`bk-chip ${scheduleId === s.id ? "active" : ""}`}
                  key={s.id}
                  disabled={full}
                  onClick={() => setSchedule(s.id)}
                >
                  <Calendar size={18} />
                  <strong>{slot?.name}</strong>
                  <span>
                    {slot?.startTime} – {slot?.endTime}
                  </span>
                  <small>
                    {full
                      ? "Không còn chỗ"
                      : `Còn ${s.maxPatients - count(s.id)} chỗ`}{" "}
                    · {db.rooms.find((r) => r.id === s.roomId)?.name}
                  </small>
                </button>
              );
            })}
          </div>
          {!schedules.length && (
            <Empty text="Chưa có ca khám cho lựa chọn này. Hãy đổi bác sĩ hoặc ngày khám." />
          )}
          <Field label="Triệu chứng / Ghi chú">
            <textarea
              className="form-control"
              maxLength={500}
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Thông tin giúp bác sĩ chuẩn bị tốt hơn..."
            />
          </Field>
          {error && (
            <div className="clinic-error" role="alert">
              {error}
            </div>
          )}
          <button className="btn btn-primary mt-4" disabled={!user}>
            Xác nhận đặt lịch <ArrowRight size={17} />
          </button>
        </form>
        <aside className="clinic-panel clinic-booking-summary">
          <span className="mint-tag">LỊCH KHÁM CỦA BẠN</span>
          <h2>Chăm sóc bắt đầu từ đây.</h2>
          {[
            ["Bệnh nhân", patients.find((p) => p.id === patientId)?.name],
            ["Dịch vụ", service?.name],
            ["Bác sĩ", doctor?.name],
            ["Ngày khám", dateVN(date)],
            [
              "Phòng khám",
              db.rooms.find((r) => r.id === selected?.roomId)?.name,
            ],
          ].map(([k, v]) => (
            <div className="clinic-summary-line" key={k}>
              <small>{k}</small>
              <strong>{v || "Chưa chọn"}</strong>
            </div>
          ))}
          <div className="clinic-summary-line">
            <small>Phí khám dự kiến</small>
            <strong className="clinic-price">{money(service?.price)}</strong>
          </div>
          <p>Vui lòng đến sớm 15 phút và mang theo CCCD, thẻ BHYT nếu có.</p>
        </aside>
      </div>
      {success && (
        <Modal title="Đặt lịch thành công" onClose={() => setSuccess(null)}>
          <div className="text-center">
            <CheckCircle2 size={56} />
            <h3 className="my-3">{success.appointmentCode}</h3>
            <p>
              Số thứ tự <strong>{success.queueNumber}</strong> · {dateVN(date)}
            </p>
            <p>Lịch hẹn đang chờ lễ tân xác nhận.</p>
            <Action
              to={
                roleOf(user) === "STAFF" ? "/appointments" : "/my-appointments"
              }
            >
              Xem lịch hẹn
            </Action>
          </div>
        </Modal>
      )}
    </div>
  );
}
