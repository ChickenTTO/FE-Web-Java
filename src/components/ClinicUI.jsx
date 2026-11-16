import {
  useEffect,
  useRef,
  useState,
  useId,
  Children,
  isValidElement,
  cloneElement,
} from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ArrowUpRight,
  X,
  Inbox,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
const labels = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  completed: "Đã hoàn tất",
  cancelled: "Đã hủy",
  no_show: "Không đến",
  paid: "Đã thanh toán",
  unpaid: "Chưa thanh toán",
  refunded: "Đã hoàn tiền",
  active: "Khả dụng",
  expired: "Hết hạn",
  depleted: "Đã hết",
  disposed: "Đã hủy lô",
  available: "Còn chỗ",
  booked: "Đã đầy",
  off: "Nghỉ",
  IMPORT: "Nhập kho",
  EXPORT_ROOM: "Xuất phòng",
  USAGE: "Tiêu hao ca khám",
  ADJUSTMENT: "Kiểm kê / Hủy",
};
export function Badge({ value }) {
  return (
    <span className={`clinic-badge status-${value}`}>
      {labels[value] || value}
    </span>
  );
}
export function Heading({
  eyebrow = "MEDICARE / WORKSPACE",
  title,
  description,
  action,
}) {
  return (
    <div className="clinic-heading">
      <div>
        <div className="mono-label mb-2">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}
export function Action({ to, children, onClick, secondary = false, ...props }) {
  const cls = `btn ${secondary ? "btn-outline-primary" : "btn-primary"} d-inline-flex align-items-center justify-content-center gap-2`;
  return to ? (
    <Link to={to} className={cls} {...props}>
      {children}
      <ArrowUpRight size={16} />
    </Link>
  ) : (
    <button type="button" className={cls} onClick={onClick} {...props}>
      {children}
    </button>
  );
}
export function Empty({ text = "Không có kết quả phù hợp.", children }) {
  return (
    <div className="empty-state">
      <Inbox size={36} />
      <p>{text}</p>
      {children}
    </div>
  );
}
export function Modal({ title, children, onClose }) {
  const ref = useRef(null);
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  }, [onClose]);
  useEffect(() => {
    const old = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    const key = (e) => {
      if (e.key === "Escape") close.current();
      if (e.key === "Tab") {
        const els = ref.current?.querySelectorAll(
          "button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href]",
        );
        if (!els?.length) return;
        const first = els[0],
          last = els[els.length - 1];
        if (
          e.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === ref.current)
        ) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", key);
      old?.focus();
    };
  }, []);
  return (
    <div
      className="clinic-modal-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <section
        ref={ref}
        tabIndex={-1}
        className="clinic-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header>
          <h2>{title}</h2>
          <button className="btn-icon" aria-label="Đóng" onClick={onClose}>
            <X size={20} />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}
export function Field({ label, children }) {
  const id = useId();
  return (
    <label className="clinic-field">
      <span id={id}>{label}</span>
      {Children.map(children, (child) =>
        isValidElement(child) &&
        ["input", "select", "textarea"].includes(child.type)
          ? cloneElement(child, { "aria-labelledby": id })
          : child,
      )}
    </label>
  );
}
export function Metrics({ items }) {
  return (
    <div className="clinic-metrics">
      {items.map(([label, value, sub]) => (
        <div className="stat-card" key={label}>
          <div className="mono-label">{label}</div>
          <strong>{value}</strong>
          <span>{sub}</span>
        </div>
      ))}
    </div>
  );
}
export function DataTable({
  columns,
  rows,
  searchPlaceholder = "Tìm kiếm...",
  filters,
  actions,
}) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const filtered = rows.filter((r) =>
    Object.values(r).some(
      (v) =>
        typeof v !== "object" &&
        String(v ?? "")
          .toLocaleLowerCase("vi")
          .includes(q.toLocaleLowerCase("vi")),
    ),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 8));
  const current = Math.min(page, pages);
  return (
    <section className="clinic-panel">
      <div className="clinic-toolbar">
        <label className="clinic-search">
          <Search size={18} />
          <input
            aria-label={searchPlaceholder}
            placeholder={searchPlaceholder}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
          />
        </label>
        {filters}
        {actions}
      </div>
      <div className="table-responsive">
        <table className="table-custom w-100">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.slice((current - 1) * 8, current * 8).map((r) => (
              <tr key={r.id}>
                {columns.map((c) => (
                  <td key={c.key}>
                    {c.render ? c.render(r) : String(r[c.key] ?? "—")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!filtered.length && <Empty />}
      <div className="clinic-pagination">
        <span>
          {filtered.length} kết quả · Trang {current}/{pages}
        </span>
        <div>
          <button
            className="btn btn-light"
            aria-label="Trang trước"
            disabled={current === 1}
            onClick={() => setPage(current - 1)}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            className="btn btn-light"
            aria-label="Trang sau"
            disabled={current === pages}
            onClick={() => setPage(current + 1)}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
export function AddButton({ onClick, children = "Thêm mới" }) {
  return (
    <Action onClick={onClick}>
      <Plus size={17} />
      {children}
    </Action>
  );
}
