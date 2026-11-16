import { useState } from "react";
import { useClinic } from "../contexts/ClinicContext";
import { useAuth } from "../contexts/AuthContext";
import {
  Heading,
  DataTable,
  Badge,
  Modal,
  Field,
  AddButton,
} from "../components/ClinicUI";
import { today, dateVN, uid, roleOf } from "../services/clinicStore";
export default function ClinicSchedules() {
  const { db, commit } = useClinic();
  const { user } = useAuth();
  const role = roleOf(user);
  const doctor = db.doctors.find((d) => d.userId === user.id);
  const [modal, setModal] = useState(false);
  const [error, setError] = useState("");
  const [date, setDate] = useState("");
  const rows = db.schedules
    .filter(
      (s) =>
        (role !== "DOCTOR" || s.doctorId === doctor?.id) &&
        (!date || s.workDate === date),
    )
    .map((s) => ({
      ...s,
      doctor: db.doctors.find((d) => d.id === s.doctorId)?.name,
      room: db.rooms.find((r) => r.id === s.roomId)?.name,
      slot: db.timeSlots.find((t) => t.id === s.timeSlotId)?.name,
      count: db.appointments.filter(
        (a) => a.scheduleId === s.id && a.status !== "cancelled",
      ).length,
    }));
  function save(e) {
    e.preventDefault();
    setError("");
    const f = Object.fromEntries(new FormData(e.currentTarget));
    try {
      if (f.start < today() || f.end < f.start)
        throw new Error("Khoảng ngày không hợp lệ.");
      const days =
        Math.round((new Date(f.end) - new Date(f.start)) / 86400000) + 1;
      if (days > 31) throw new Error("Mỗi lần chỉ tạo tối đa 31 ngày.");
      if (
        db.doctors.find((d) => d.id === f.doctorId)?.specialtyId !==
        db.rooms.find((r) => r.id === f.roomId)?.specialtyId
      )
        throw new Error("Phòng khám phải thuộc chuyên khoa của bác sĩ.");
      commit((n) => {
        for (let i = 0; i < days; i++) {
          const d = new Date(`${f.start}T12:00:00`);
          d.setDate(d.getDate() + i);
          const workDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
          if (
            n.schedules.some(
              (s) =>
                s.workDate === workDate &&
                s.timeSlotId === f.timeSlotId &&
                s.status !== "off" &&
                (s.doctorId === f.doctorId || s.roomId === f.roomId),
            )
          )
            throw new Error(
              `Trùng lịch bác sĩ hoặc phòng ngày ${dateVN(workDate)}. Toàn bộ đợt chưa được lưu.`,
            );
          n.schedules.push({
            id: uid(),
            doctorId: f.doctorId,
            roomId: f.roomId,
            timeSlotId: f.timeSlotId,
            workDate,
            maxPatients: Number(f.maxPatients),
            status: "available",
          });
        }
      }, "Đã tạo đợt lịch trực.");
      setModal(false);
    } catch (err) {
      setError(err.message);
    }
  }
  function off(row) {
    try {
      commit((n) => {
        if (
          n.appointments.some(
            (a) =>
              a.scheduleId === row.id &&
              ["pending", "confirmed"].includes(a.status),
          )
        )
          throw new Error(
            "Ca còn lịch hẹn. Cần xử lý lịch hẹn trước khi đăng ký nghỉ.",
          );
        n.schedules.find((s) => s.id === row.id).status =
          row.status === "off" ? "available" : "off";
      }, "Đã cập nhật lịch trực.");
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }
  return (
    <div className="clinic-page">
      <Heading
        title={role === "DOCTOR" ? "Lịch trực của tôi" : "Xếp lịch bác sĩ"}
        description="Phân ca theo ngày, phòng khám và số lượng bệnh nhân tối đa."
        action={
          role !== "DOCTOR" && (
            <AddButton
              onClick={() => {
                setError("");
                setModal(true);
              }}
            >
              Tạo lịch hàng loạt
            </AddButton>
          )
        }
      />
      {error && !modal && (
        <p className="clinic-error" role="alert">
          {error}
        </p>
      )}
      <DataTable
        rows={rows}
        filters={
          <input
            className="form-control"
            aria-label="Lọc ngày trực"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        }
        columns={[
          {
            key: "workDate",
            label: "Ngày trực",
            render: (r) => dateVN(r.workDate),
          },
          { key: "doctor", label: "Bác sĩ" },
          { key: "room", label: "Phòng" },
          { key: "slot", label: "Ca khám" },
          {
            key: "count",
            label: "Đã đặt / Tối đa",
            render: (r) => `${r.count} / ${r.maxPatients}`,
          },
          {
            key: "status",
            label: "Trạng thái",
            render: (r) => <Badge value={r.status} />,
          },
          {
            key: "action",
            label: "Thao tác",
            render: (r) =>
              r.workDate >= today() && (
                <button className="btn btn-light btn-sm" onClick={() => off(r)}>
                  {r.status === "off" ? "Mở lại ca" : "Đăng ký nghỉ"}
                </button>
              ),
          },
        ]}
      />
      {modal && (
        <Modal title="Tạo lịch trực hàng loạt" onClose={() => setModal(false)}>
          <form onSubmit={save}>
            <div className="clinic-form-grid">
              {[
                ["doctorId", "Bác sĩ", db.doctors],
                ["roomId", "Phòng khám", db.rooms],
                ["timeSlotId", "Ca khám", db.timeSlots],
              ].map(([name, label, items]) => (
                <Field key={name} label={label}>
                  <select className="form-select" name={name} required>
                    <option value="">Chọn {label.toLowerCase()}</option>
                    {items
                      .filter((x) => x.isActive !== false)
                      .map((x) => (
                        <option key={x.id} value={x.id}>
                          {x.name}
                        </option>
                      ))}
                  </select>
                </Field>
              ))}
              <Field label="Số bệnh nhân tối đa / ca">
                <input
                  className="form-control"
                  type="number"
                  name="maxPatients"
                  min="1"
                  max="200"
                  defaultValue="15"
                  required
                />
              </Field>
              <Field label="Từ ngày">
                <input
                  className="form-control"
                  type="date"
                  name="start"
                  min={today()}
                  required
                />
              </Field>
              <Field label="Đến ngày (tối đa 31 ngày)">
                <input
                  className="form-control"
                  type="date"
                  name="end"
                  min={today()}
                  required
                />
              </Field>
            </div>
            {error && (
              <p className="clinic-error" role="alert">
                {error}
              </p>
            )}
            <div className="clinic-form-actions">
              <button className="btn btn-primary">Tạo lịch trực</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
