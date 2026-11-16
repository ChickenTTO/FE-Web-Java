import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useClinic } from "../contexts/ClinicContext";
import { useAuth } from "../contexts/AuthContext";
import {
  Heading,
  DataTable,
  Badge,
  Modal,
  Field,
  AddButton,
  Metrics,
} from "../components/ClinicUI";
import { money, uid, roleOf } from "../services/clinicStore";
export default function ClinicPayments() {
  const { db, commit } = useClinic();
  const { user } = useAuth();
  const role = roleOf(user);
  const [params] = useSearchParams();
  const [modal, setModal] = useState(Boolean(params.get("appointment")));
  const [error, setError] = useState("");
  const [refund, setRefund] = useState(null);
  const [method, setMethod] = useState(role === "STAFF" ? "CASH" : "VNPAY");
  const allowed = db.appointments.filter(
    (a) =>
      role !== "PATIENT" ||
      db.patients.some((p) => p.id === a.patientId && p.userId === user.id),
  );
  const ids = new Set(allowed.map((a) => a.id));
  const rows = db.payments
    .filter((p) => ids.has(p.appointmentId))
    .map((p) => ({
      ...p,
      appointmentCode: db.appointments.find((a) => a.id === p.appointmentId)
        ?.appointmentCode,
      patient: db.patients.find(
        (x) =>
          x.id ===
          db.appointments.find((a) => a.id === p.appointmentId)?.patientId,
      )?.name,
    }));
  function save(e) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget));
    setError("");
    try {
      commit(
        (n) => {
          const a = allowed.find((a) => a.id === f.appointmentId);
          if (!a || a.status === "cancelled")
            throw new Error("Lịch hẹn không hợp lệ.");
          if (n.payments.some((p) => p.appointmentId === a.id))
            throw new Error("Lịch hẹn đã có giao dịch thanh toán.");
          const cash = f.method === "CASH";
          if (cash && role === "PATIENT")
            throw new Error("Thu tiền mặt do lễ tân thực hiện.");
          n.payments.unshift({
            id: uid(),
            appointmentId: a.id,
            amount: Number(n.services.find((s) => s.id === a.serviceId)?.price),
            method: f.method,
            status: cash ? "paid" : "pending",
            paidAt: cash ? new Date().toISOString() : null,
            createdAt: new Date().toISOString(),
          });
        },
        method === "CASH"
          ? "Đã ghi nhận thu tiền tại quầy."
          : "Đã tạo yêu cầu thanh toán.",
      );
      setModal(false);
    } catch (err) {
      setError(err.message);
    }
  }
  function simulate(id) {
    commit((n) => {
      const p = n.payments.find((p) => p.id === id);
      if (p.status !== "pending")
        throw new Error("Giao dịch không còn chờ thanh toán.");
      p.status = "paid";
      p.paidAt = new Date().toISOString();
    }, "Đã mô phỏng kết quả thanh toán thành công.");
  }
  return (
    <div className="clinic-page">
      <Heading
        title="Thanh toán"
        description="Theo dõi phí khám, thu tiền tại quầy và trạng thái thanh toán trực tuyến."
        action={
          ["STAFF", "PATIENT"].includes(role) && (
            <AddButton
              onClick={() => {
                setError("");
                setModal(true);
              }}
            >
              Tạo thanh toán
            </AddButton>
          )
        }
      />
      <Metrics
        items={[
          [
            "Đã thu",
            money(
              rows
                .filter((p) => p.status === "paid")
                .reduce((s, p) => s + p.amount, 0),
            ),
            "Các giao dịch đã thanh toán",
          ],
          [
            "Đang chờ",
            rows.filter((p) => p.status === "pending").length,
            "Chờ kết quả thanh toán",
          ],
          [
            "Hoàn tiền",
            rows.filter((p) => p.status === "refunded").length,
            "Giao dịch đã hoàn tiền",
          ],
        ]}
      />
      <DataTable
        rows={rows}
        columns={[
          { key: "appointmentCode", label: "Lịch hẹn" },
          { key: "patient", label: "Bệnh nhân" },
          { key: "amount", label: "Số tiền", render: (r) => money(r.amount) },
          { key: "method", label: "Phương thức" },
          {
            key: "status",
            label: "Trạng thái",
            render: (r) => <Badge value={r.status} />,
          },
          {
            key: "paidAt",
            label: "Thời gian thu",
            render: (r) =>
              r.paidAt ? new Date(r.paidAt).toLocaleString("vi-VN") : "—",
          },
          {
            key: "action",
            label: "Thao tác",
            render: (r) => (
              <>
                {r.status === "pending" && user.isDemo && (
                  <button
                    className="btn btn-light btn-sm"
                    onClick={() => simulate(r.id)}
                  >
                    Mô phỏng đã thanh toán
                  </button>
                )}
                {r.status === "paid" && role === "ADMIN" && (
                  <button
                    className="btn btn-light btn-sm"
                    onClick={() => {
                      setRefund(r.id);
                      setError("");
                    }}
                  >
                    Hoàn tiền
                  </button>
                )}
              </>
            ),
          },
        ]}
      />
      {modal && (
        <Modal title="Tạo giao dịch thanh toán" onClose={() => setModal(false)}>
          <form onSubmit={save}>
            <Field label="Lịch hẹn">
              <select
                className="form-select"
                name="appointmentId"
                required
                defaultValue={params.get("appointment") || ""}
              >
                <option value="">Chọn lịch hẹn</option>
                {allowed
                  .filter(
                    (a) =>
                      a.status !== "cancelled" &&
                      !db.payments.some((p) => p.appointmentId === a.id),
                  )
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.appointmentCode} ·{" "}
                      {money(
                        db.services.find((s) => s.id === a.serviceId)?.price,
                      )}
                    </option>
                  ))}
              </select>
            </Field>
            <Field label="Phương thức">
              <select
                className="form-select"
                name="method"
                value={
                  role === "PATIENT" && method === "CASH" ? "VNPAY" : method
                }
                onChange={(e) => setMethod(e.target.value)}
              >
                {role === "STAFF" && (
                  <option value="CASH">Tiền mặt tại quầy</option>
                )}
                <option value="VNPAY">VNPay</option>
                <option value="MOMO">MoMo</option>
              </select>
            </Field>
            <div className="clinic-callout mt-3">
              {role === "STAFF" && method === "CASH"
                ? "Chỉ lưu khi đã nhận đủ tiền từ bệnh nhân."
                : "Bản xem thử tạo giao dịch chờ xử lý. Cổng thanh toán sẽ hoạt động sau khi nối BE."}
            </div>
            {error && (
              <p className="clinic-error" role="alert">
                {error}
              </p>
            )}
            <div className="clinic-form-actions">
              <button className="btn btn-primary">Xác nhận</button>
            </div>
          </form>
        </Modal>
      )}
      {refund && (
        <Modal title="Xác nhận hoàn tiền" onClose={() => setRefund(null)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const note = new FormData(e.currentTarget).get("reason").trim();
              if (!note) {
                setError("Vui lòng nhập lý do.");
                return;
              }
              commit((n) => {
                const p = n.payments.find((p) => p.id === refund);
                p.status = "refunded";
                p.refundReason = note;
                p.refundedAt = new Date().toISOString();
              }, "Đã ghi nhận hoàn tiền trong bản xem thử.");
              setRefund(null);
            }}
          >
            <p>
              Hoàn toàn bộ{" "}
              {money(db.payments.find((p) => p.id === refund)?.amount)}.
            </p>
            <Field label="Lý do hoàn tiền">
              <textarea className="form-control" name="reason" required />
            </Field>
            {error && <p role="alert">{error}</p>}
            <div className="clinic-form-actions">
              <button className="btn btn-primary">Xác nhận hoàn tiền</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
