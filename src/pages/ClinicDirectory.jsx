import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Stethoscope, ArrowUpRight, Clock } from "lucide-react";
import { useClinic } from "../contexts/ClinicContext";
import { Heading, Empty, Modal, Badge } from "../components/ClinicUI";
import { today, money, dateVN } from "../services/clinicStore";
export default function ClinicDirectory({ kind = "doctors" }) {
  const { db, isDemo } = useClinic();
  const [params] = useSearchParams();
  const [specialty, setSpecialty] = useState(params.get("specialty") || "");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(null);
  const title = {
    doctors: "Đội ngũ bác sĩ",
    specialties: "Chuyên khoa",
    services: "Dịch vụ & giá khám",
  }[kind];
  const items = db[kind].filter(
    (x) =>
      x.isActive !== false &&
      (!specialty || x.specialtyId === specialty || kind === "specialties") &&
      x.name.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <div className="container clinic-page">
      <Heading
        eyebrow="MEDICARE / CHĂM SÓC SỨC KHỎE"
        title={title}
        description="Lựa chọn sự chăm sóc phù hợp, chủ động lịch khám của bạn."
      />
      <div className="clinic-toolbar mb-4">
        <input
          className="form-control"
          aria-label="Tìm tên"
          placeholder="Tìm theo tên..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {kind !== "specialties" && (
          <select
            className="form-select"
            aria-label="Chuyên khoa"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
          >
            <option value="">Tất cả chuyên khoa</option>
            {db.specialties
              .filter((s) => s.isActive)
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
          </select>
        )}
      </div>
      <div className="clinic-directory-grid">
        {items.map((item) => (
          <article className="clinic-directory-card" key={item.id}>
            <div className="clinic-directory-icon">
              <Stethoscope size={30} />
            </div>
            <span className="mint-tag">
              {db.specialties.find((s) => s.id === item.specialtyId)?.name ||
                "MEDICARE"}
            </span>
            <h2>{item.name}</h2>
            <p>{item.description}</p>
            {kind === "doctors" && (
              <p>
                {item.qualification} · {item.experience} năm kinh nghiệm
              </p>
            )}
            {kind === "services" && (
              <strong className="clinic-price">{money(item.price)}</strong>
            )}
            <div className="d-flex gap-2 mt-auto flex-wrap">
              {kind === "specialties" ? (
                <Link
                  className="btn btn-primary"
                  to={`/doctors?specialty=${item.id}`}
                >
                  Xem bác sĩ <ArrowUpRight size={16} />
                </Link>
              ) : (
                <>
                  <Link
                    className="btn btn-primary"
                    to={`/booking?${kind === "doctors" ? "doctor" : "service"}=${item.id}`}
                  >
                    Đặt lịch khám <ArrowUpRight size={16} />
                  </Link>
                  {kind === "doctors" && (
                    <button
                      className="btn btn-light"
                      onClick={() => setSelected(item)}
                    >
                      Lịch khám
                    </button>
                  )}
                </>
              )}
            </div>
          </article>
        ))}
      </div>
      {!items.length && <Empty />}
      {selected && (
        <Modal title={selected.name} onClose={() => setSelected(null)}>
          <p>{selected.description}</p>
          <h3 className="h5">Lịch tiếp nhận</h3>
          {!isDemo && <p>Lịch tiếp nhận của bác sĩ hiện chưa khả dụng.</p>}
          {db.schedules
            .filter(
              (s) =>
                s.doctorId === selected.id &&
                s.workDate >= today() &&
                s.status === "available",
            )
            .map((s) => (
              <Link
                className="clinic-schedule-link"
                key={s.id}
                to={`/booking?schedule=${s.id}`}
              >
                <Clock size={18} />
                <span>
                  {dateVN(s.workDate)} ·{" "}
                  {db.timeSlots.find((t) => t.id === s.timeSlotId)?.name} ·{" "}
                  {db.rooms.find((r) => r.id === s.roomId)?.name}
                </span>
                <Badge value={s.status} />
              </Link>
            ))}
        </Modal>
      )}
    </div>
  );
}
