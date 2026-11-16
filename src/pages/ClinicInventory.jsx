import { useState } from "react";
import { Link } from "react-router-dom";
import { useClinic } from "../contexts/ClinicContext";
import { useAuth } from "../contexts/AuthContext";
import {
  Heading,
  Metrics,
  DataTable,
  Badge,
  Modal,
  Field,
  Action,
} from "../components/ClinicUI";
import {
  stock,
  today,
  dateAfter,
  dateVN,
  money,
  allocate,
  code,
  uid,
  roleOf,
} from "../services/clinicStore";
export default function ClinicInventory({ view = "supplies" }) {
  const { db, commit } = useClinic();
  const { user } = useAuth();
  const role = roleOf(user);
  const [filter, setFilter] = useState("");
  const [operation, setOperation] = useState(null);
  const [error, setError] = useState("");
  const low = db.supplies.filter(
    (s) => stock(db, s.id) <= s.minStockLevel,
  ).length;
  const expiring = db.batches.filter(
    (b) =>
      b.status === "active" &&
      b.expirationDate > today() &&
      b.expirationDate <= dateAfter(30) &&
      b.remainingQuantity > 0,
  ).length;
  const title = {
    supplies: "Kho vật tư y tế",
    batches: "Lô hàng & hạn dùng",
    transactions: "Thẻ kho & giao dịch",
  }[view];
  const rows =
    view === "supplies"
      ? db.supplies
          .map((s) => ({
            ...s,
            totalQuantity: stock(db, s.id),
            category: db.categories.find((c) => c.id === s.categoryId)?.name,
          }))
          .filter((s) => filter !== "low" || s.totalQuantity <= s.minStockLevel)
      : view === "batches"
        ? db.batches
            .map((b) => ({
              ...b,
              supply: db.supplies.find((s) => s.id === b.supplyId)?.name,
              status:
                b.status === "active" && b.expirationDate <= today()
                  ? "expired"
                  : b.status,
            }))
            .filter(
              (b) =>
                !filter ||
                (filter === "expiring"
                  ? b.status === "active" &&
                    b.expirationDate <= dateAfter(30) &&
                    b.remainingQuantity > 0
                  : b.status === filter),
            )
        : db.transactions
            .map((t) => ({
              ...t,
              supply: db.supplies.find((s) => s.id === t.supplyId)?.name,
              batch: db.batches.find((b) => b.id === t.batchId)?.batchNumber,
            }))
            .filter((t) => !filter || t.transactionType === filter);
  function submit(e) {
    e.preventDefault();
    setError("");
    const f = Object.fromEntries(new FormData(e.currentTarget));
    try {
      commit((n) => {
        if (operation === "IMPORT") {
          const qty = Number(f.quantity),
            price = Number(f.importPrice);
          if (!(qty > 0 && Number.isInteger(qty)) || price < 0)
            throw new Error(
              "Số lượng phải là số nguyên dương, giá nhập không âm.",
            );
          if (f.expirationDate <= today())
            throw new Error("Không thể nhập lô đã hết hạn.");
          if (
            n.batches.some(
              (b) =>
                b.supplyId === f.supplyId &&
                b.batchNumber === f.batchNumber.trim(),
            )
          )
            throw new Error("Số lô đã tồn tại cho vật tư này.");
          const b = {
            id: uid(),
            supplyId: f.supplyId,
            supplierId: f.supplierId,
            batchNumber: f.batchNumber.trim(),
            expirationDate: f.expirationDate,
            receivedAt: today(),
            initialQuantity: qty,
            remainingQuantity: qty,
            importPrice: price,
            status: "active",
          };
          n.batches.push(b);
          n.transactions.unshift({
            id: uid(),
            transactionCode: code("NK"),
            transactionType: "IMPORT",
            supplyId: b.supplyId,
            batchId: b.id,
            quantity: qty,
            reference: f.note || "Nhập hàng",
            at: new Date().toISOString(),
          });
        } else if (operation === "EXPORT_ROOM") {
          if (!f.roomId) throw new Error("Vui lòng chọn phòng nhận.");
          if (!Number.isInteger(Number(f.quantity)))
            throw new Error("Số lượng phải là số nguyên.");
          allocate(
            n,
            f.supplyId,
            Number(f.quantity),
            "EXPORT_ROOM",
            `${n.rooms.find((r) => r.id === f.roomId)?.name} · ${f.note}`,
          );
        } else {
          const b = n.batches.find((b) => b.id === f.batchId);
          if (!b) throw new Error("Vui lòng chọn lô.");
          const qty = Number(f.actualQuantity);
          if (!Number.isInteger(qty) || qty < 0)
            throw new Error("Tồn thực tế phải là số nguyên không âm.");
          if (!f.note.trim())
            throw new Error("Cần nhập lý do kiểm kê hoặc hủy lô.");
          if (
            (b.expirationDate <= today() || b.status === "expired") &&
            qty > 0
          )
            throw new Error("Lô hết hạn chỉ được hủy về 0.");
          if (b.status === "disposed")
            throw new Error("Lô đã hủy không thể điều chỉnh.");
          n.transactions.unshift({
            id: uid(),
            transactionCode: code("KK"),
            transactionType: "ADJUSTMENT",
            supplyId: b.supplyId,
            batchId: b.id,
            quantity: qty - b.remainingQuantity,
            reference: f.note,
            at: new Date().toISOString(),
          });
          b.remainingQuantity = qty;
          b.status =
            qty === 0
              ? b.expirationDate <= today()
                ? "disposed"
                : "depleted"
              : "active";
        }
      }, "Đã ghi nhận giao dịch kho.");
      setOperation(null);
    } catch (err) {
      setError(err.message);
    }
  }
  const columns =
    view === "supplies"
      ? [
          { key: "sku", label: "SKU" },
          { key: "name", label: "Vật tư" },
          { key: "category", label: "Nhóm" },
          { key: "unit", label: "Đơn vị" },
          {
            key: "totalQuantity",
            label: "Tồn khả dụng",
            render: (r) => <strong>{r.totalQuantity}</strong>,
          },
          { key: "minStockLevel", label: "Tồn tối thiểu" },
          {
            key: "alert",
            label: "Cảnh báo",
            render: (r) => (
              <Badge
                value={
                  r.totalQuantity <= r.minStockLevel ? "Tồn thấp" : "active"
                }
              />
            ),
          },
        ]
      : view === "batches"
        ? [
            { key: "batchNumber", label: "Số lô" },
            { key: "supply", label: "Vật tư" },
            {
              key: "expirationDate",
              label: "Hạn sử dụng",
              render: (r) => dateVN(r.expirationDate),
            },
            { key: "remainingQuantity", label: "Còn lại" },
            {
              key: "importPrice",
              label: "Giá nhập",
              render: (r) => money(r.importPrice),
            },
            {
              key: "status",
              label: "Trạng thái",
              render: (r) => <Badge value={r.status} />,
            },
          ]
        : [
            { key: "transactionCode", label: "Mã phiếu" },
            {
              key: "at",
              label: "Thời gian",
              render: (r) => new Date(r.at).toLocaleString("vi-VN"),
            },
            {
              key: "transactionType",
              label: "Loại",
              render: (r) => <Badge value={r.transactionType} />,
            },
            { key: "supply", label: "Vật tư" },
            { key: "batch", label: "Lô hàng" },
            {
              key: "quantity",
              label: "Biến động",
              render: (r) => (
                <strong>
                  {r.quantity > 0 ? "+" : ""}
                  {r.quantity}
                </strong>
              ),
            },
            { key: "reference", label: "Tham chiếu / Lý do" },
          ];
  return (
    <div className="clinic-page">
      <Heading
        title={title}
        description="Theo dõi vật tư theo lô, ưu tiên xuất lô có hạn sử dụng gần nhất (FEFO)."
        action={
          role !== "DOCTOR" && (
            <div className="d-flex gap-2 flex-wrap">
              <Action
                onClick={() => {
                  setError("");
                  setOperation("IMPORT");
                }}
              >
                Nhập kho
              </Action>
              <Action
                secondary
                onClick={() => {
                  setError("");
                  setOperation("EXPORT_ROOM");
                }}
              >
                Xuất phòng
              </Action>
              {role === "ADMIN" && (
                <Action
                  secondary
                  onClick={() => {
                    setError("");
                    setOperation("ADJUSTMENT");
                  }}
                >
                  Kiểm kê / Hủy
                </Action>
              )}
            </div>
          )
        }
      />
      <Metrics
        items={[
          ["Danh mục vật tư", db.supplies.length, "Được theo dõi theo lô"],
          ["Cần nhập thêm", low, "Tồn khả dụng ≤ ngưỡng tối thiểu"],
          ["Sắp hết hạn", expiring, "Trong 30 ngày tới"],
          [
            "Giao dịch",
            db.transactions.length,
            "Nhập · Xuất · Tiêu hao · Kiểm kê",
          ],
        ]}
      />
      <nav className="clinic-tabs">
        <Link className={view === "supplies" ? "active" : ""} to="/inventory">
          Tồn kho
        </Link>
        {role !== "DOCTOR" && (
          <>
            <Link
              className={view === "batches" ? "active" : ""}
              to="/inventory/batches"
            >
              Lô & hạn dùng
            </Link>
            <Link
              className={view === "transactions" ? "active" : ""}
              to="/inventory/transactions"
            >
              Thẻ kho
            </Link>
            <Link to="/inventory/supplies">Danh mục vật tư</Link>
          </>
        )}
      </nav>
      <DataTable
        rows={rows}
        columns={columns}
        filters={
          <select
            className="form-select"
            aria-label="Bộ lọc kho"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">Tất cả</option>
            {(view === "supplies"
              ? [["low", "Tồn thấp"]]
              : view === "batches"
                ? [
                    ["expiring", "Sắp hết hạn trong 30 ngày"],
                    ["active", "Khả dụng"],
                    ["expired", "Hết hạn"],
                    ["depleted", "Đã hết"],
                    ["disposed", "Đã hủy"],
                  ]
                : [
                    ["IMPORT", "Nhập kho"],
                    ["EXPORT_ROOM", "Xuất phòng"],
                    ["USAGE", "Tiêu hao"],
                    ["ADJUSTMENT", "Kiểm kê / Hủy"],
                  ]
            ).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        }
      />
      {operation && (
        <Modal
          title={
            {
              IMPORT: "Phiếu nhập kho",
              EXPORT_ROOM: "Phiếu xuất phòng khám",
              ADJUSTMENT: "Phiếu kiểm kê / Hủy lô",
            }[operation]
          }
          onClose={() => setOperation(null)}
        >
          <form onSubmit={submit}>
            <div className="clinic-callout mb-4">
              {operation === "EXPORT_ROOM"
                ? "Hệ thống phân bổ từ lô khả dụng có hạn gần nhất; lô hết hạn không được xuất."
                : operation === "ADJUSTMENT"
                  ? "Nhập tồn thực tế. Với lô hết hạn, nhập 0 để hủy lô."
                  : "Tồn khả dụng sẽ tăng sau khi lưu phiếu nhập."}
            </div>
            <div className="clinic-form-grid">
              {operation === "ADJUSTMENT" ? (
                <>
                  <Field label="Lô kiểm kê">
                    <select name="batchId" className="form-select" required>
                      <option value="">Chọn lô</option>
                      {db.batches
                        .filter((b) => b.status !== "disposed")
                        .map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.batchNumber} ·{" "}
                            {db.supplies.find((s) => s.id === b.supplyId)?.name}{" "}
                            · Tồn {b.remainingQuantity}
                          </option>
                        ))}
                    </select>
                  </Field>
                  <Field label="Số lượng thực tế">
                    <input
                      className="form-control"
                      type="number"
                      min="0"
                      name="actualQuantity"
                      required
                    />
                  </Field>
                </>
              ) : (
                <>
                  <Field label="Vật tư">
                    <select name="supplyId" className="form-select" required>
                      <option value="">Chọn vật tư</option>
                      {db.supplies.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} · Tồn {stock(db, s.id)}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Số lượng">
                    <input
                      className="form-control"
                      type="number"
                      min="1"
                      name="quantity"
                      required
                    />
                  </Field>
                  {operation === "IMPORT" ? (
                    <>
                      <Field label="Nhà cung cấp">
                        <select
                          className="form-select"
                          name="supplierId"
                          required
                        >
                          <option value="">Chọn nhà cung cấp</option>
                          {db.suppliers
                            .filter((s) => s.isActive)
                            .map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name}
                              </option>
                            ))}
                        </select>
                      </Field>
                      <Field label="Số lô">
                        <input
                          className="form-control"
                          name="batchNumber"
                          required
                        />
                      </Field>
                      <Field label="Hạn sử dụng">
                        <input
                          className="form-control"
                          type="date"
                          name="expirationDate"
                          min={dateAfter(1)}
                          required
                        />
                      </Field>
                      <Field label="Giá nhập / đơn vị">
                        <input
                          className="form-control"
                          type="number"
                          min="0"
                          name="importPrice"
                          required
                        />
                      </Field>
                    </>
                  ) : (
                    <Field label="Phòng nhận">
                      <select className="form-select" name="roomId" required>
                        <option value="">Chọn phòng</option>
                        {db.rooms
                          .filter((r) => r.isActive)
                          .map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name}
                            </option>
                          ))}
                      </select>
                    </Field>
                  )}
                </>
              )}
              <Field label="Ghi chú / Lý do">
                <textarea
                  className="form-control"
                  name="note"
                  required={operation === "ADJUSTMENT"}
                  rows={3}
                />
              </Field>
            </div>
            {error && (
              <p className="clinic-error" role="alert">
                {error}
              </p>
            )}
            <div className="clinic-form-actions">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setOperation(null)}
              >
                Hủy
              </button>
              <button className="btn btn-primary">Lưu phiếu</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
