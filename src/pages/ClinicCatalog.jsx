import { useState } from "react";
import { Pencil, Power } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useClinic } from "../contexts/ClinicContext";
import {
  Heading,
  DataTable,
  Modal,
  Field,
  AddButton,
  Badge,
} from "../components/ClinicUI";
import { uid, money, roleOf, today } from "../services/clinicStore";

// Fields reflect BE resources; all identifiers stay intact for API integration.
const catalogs = {
  specialties: {
    title: "Chuyên khoa",
    description: "Danh mục chuyên môn và tình trạng tiếp nhận.",
    fields: [
      ["name", "Tên chuyên khoa"],
      ["description", "Mô tả", "textarea"],
    ],
  },
  rooms: {
    title: "Phòng khám",
    description: "Không gian khám và chuyên khoa phụ trách.",
    fields: [
      ["name", "Tên / mã phòng"],
      ["location", "Vị trí"],
      ["specialtyId", "Chuyên khoa", "specialties"],
    ],
  },
  doctors: {
    title: "Đội ngũ bác sĩ",
    description: "Hồ sơ chuyên môn, kinh nghiệm và chuyên khoa.",
    fields: [
      ["name", "Họ tên bác sĩ"],
      ["userId", "Tài khoản bác sĩ", "doctorUsers"],
      ["specialtyId", "Chuyên khoa", "specialties"],
      ["qualification", "Học vị / Chức danh"],
      ["experience", "Số năm kinh nghiệm", "number"],
      ["description", "Giới thiệu", "textarea"],
    ],
  },
  services: {
    title: "Dịch vụ y tế",
    description: "Danh mục dịch vụ, chuyên khoa và giá khám.",
    fields: [
      ["name", "Tên dịch vụ"],
      ["specialtyId", "Chuyên khoa", "specialties"],
      ["price", "Giá dịch vụ (VNĐ)", "number"],
      ["description", "Mô tả", "textarea"],
    ],
  },
  timeSlots: {
    title: "Khung giờ khám",
    description: "Cấu hình các ca khám để sử dụng khi xếp lịch bác sĩ.",
    fields: [
      ["name", "Tên ca"],
      ["startTime", "Bắt đầu", "time"],
      ["endTime", "Kết thúc", "time"],
    ],
  },
  patients: {
    title: "Hồ sơ bệnh nhân",
    description: "Thông tin cá nhân, người thân, BHYT và tiền sử bệnh.",
    fields: [
      ["name", "Họ và tên"],
      ["phone", "Số điện thoại", "tel"],
      ["dateOfBirth", "Ngày sinh", "date"],
      ["gender", "Giới tính", "enum:Nam,Nữ,Khác"],
      ["relationship", "Quan hệ", "enum:Bản thân,Con,Cha,Mẹ,Vợ / Chồng,Khác"],
      ["identityNumber", "CCCD (không bắt buộc)", "optional"],
      ["insuranceNumber", "Mã BHYT (không bắt buộc)", "optional"],
      ["address", "Địa chỉ", "optional"],
      ["medicalHistory", "Tiền sử bệnh / Dị ứng", "textarea"],
    ],
  },
  categories: {
    title: "Nhóm vật tư",
    description: "Phân loại vật tư theo nhóm cha và nhóm con.",
    fields: [
      ["name", "Tên nhóm"],
      ["parentId", "Nhóm cha (không bắt buộc)", "categories?"],
    ],
  },
  suppliers: {
    title: "Nhà cung cấp",
    description: "Đối tác cung ứng vật tư và thông tin liên hệ.",
    fields: [
      ["name", "Tên nhà cung cấp"],
      ["phone", "Số điện thoại", "tel"],
      ["email", "Email", "email"],
      ["address", "Địa chỉ"],
    ],
  },
  supplies: {
    title: "Danh mục vật tư",
    description: "Thông tin vật tư gốc, đơn vị tính và ngưỡng tồn tối thiểu.",
    fields: [
      ["sku", "Mã SKU"],
      ["name", "Tên vật tư"],
      ["categoryId", "Nhóm vật tư", "categories"],
      ["unit", "Đơn vị tính"],
      ["minStockLevel", "Ngưỡng tồn tối thiểu", "number"],
    ],
  },
  norms: {
    title: "Định mức tiêu hao",
    description: "Vật tư tự động trừ khi bác sĩ hoàn tất dịch vụ khám.",
    fields: [
      ["serviceId", "Dịch vụ", "services"],
      ["supplyId", "Vật tư", "supplies"],
      ["quantity", "Số lượng tiêu hao", "positive"],
    ],
  },
  users: {
    title: "Tài khoản người dùng",
    description: "Phân quyền và khóa / mở khóa tài khoản hệ thống.",
    fields: [
      ["name", "Họ và tên"],
      ["email", "Email", "email"],
      ["phone", "Số điện thoại", "tel"],
      ["role", "Vai trò", "enum:ADMIN,DOCTOR,STAFF,PATIENT"],
    ],
  },
};
export default function ClinicCatalog({ resource }) {
  const { db, commit } = useClinic();
  const { user } = useAuth();
  const role = roleOf(user);
  const config = catalogs[resource];
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const own = resource === "patients" && role === "PATIENT";
  const rows = db[resource].filter((r) => !own || r.userId === user.id);
  const canEdit =
    role === "ADMIN" ||
    (role === "STAFF" &&
      ["patients", "supplies", "suppliers", "categories"].includes(resource)) ||
    own;
  const relation = (type) =>
    type === "doctorUsers"
      ? db.users.filter((u) => u.role === "DOCTOR")
      : db[type?.replace("?", "")] || null;
  function save(e) {
    e.preventDefault();
    setError("");
    try {
      const values = Object.fromEntries(new FormData(e.currentTarget));
      config.fields.forEach(([key, , type]) => {
        if (["number", "positive"].includes(type))
          values[key] = Number(values[key]);
        if (typeof values[key] === "string") values[key] = values[key].trim();
      });
      if (
        config.fields.some(
          ([key, , type]) =>
            !["optional", "textarea"].includes(type) &&
            !type?.endsWith("?") &&
            values[key] === "",
        )
      )
        throw new Error("Vui lòng điền đầy đủ thông tin bắt buộc.");
      if (values.phone && !/^0\d{9}$/.test(values.phone))
        throw new Error("Số điện thoại phải gồm 10 chữ số, bắt đầu bằng 0.");
      if (resource === "patients" && values.dateOfBirth > today())
        throw new Error("Ngày sinh không được ở tương lai.");
      if (resource === "timeSlots" && values.startTime >= values.endTime)
        throw new Error("Giờ kết thúc phải sau giờ bắt đầu.");
      if (
        resource === "users" &&
        values.role === "DOCTOR" &&
        editing.id === user.id
      )
        throw new Error(
          "Không thể tự thay đổi quyền của tài khoản đang sử dụng.",
        );
      if (resource === "categories" && values.parentId) {
        let parent = values.parentId;
        while (parent) {
          if (parent === editing.id)
            throw new Error("Nhóm cha không được tạo vòng lặp.");
          parent = db.categories.find((c) => c.id === parent)?.parentId;
        }
      }
      if (
        resource === "norms" &&
        db.norms.some(
          (r) =>
            r.id !== editing.id &&
            r.serviceId === values.serviceId &&
            r.supplyId === values.supplyId,
        )
      )
        throw new Error(
          "Dịch vụ đã có định mức cho vật tư này. Hãy sửa dòng hiện có.",
        );
      for (const key of ["sku", "email", "userId"])
        if (
          values[key] &&
          resource !== "patients" &&
          db[resource].some(
            (r) => r.id !== editing.id && r[key] === values[key],
          )
        )
          throw new Error("Mã / email / tài khoản đã được sử dụng.");
      if (
        resource === "users" &&
        editing.id === user.id &&
        values.role !== editing.role
      )
        throw new Error("Không thể tự thay đổi vai trò hiện tại.");
      commit((next) => {
        const row = {
          ...editing,
          ...values,
          id: editing.id || uid(),
          ...(own ? { userId: user.id } : {}),
          ...(resource === "patients" && !own && !editing.id
            ? { userId: null }
            : {}),
        };
        const i = next[resource].findIndex((r) => r.id === row.id);
        if (i < 0) next[resource].push(row);
        else next[resource][i] = row;
      });
      setEditing(null);
    } catch (err) {
      setError(err.message);
    }
  }
  const columns = config.fields
    .slice(0, resource === "patients" ? 5 : 4)
    .map(([key, label, type]) => ({
      key,
      label,
      render: (r) =>
        key === "price"
          ? money(r[key])
          : relation(type)
            ? relation(type).find((x) => x.id === r[key])?.name || "—"
            : String(r[key] ?? "—"),
    }));
  if (
    !["patients", "norms", "timeSlots", "categories", "supplies"].includes(
      resource,
    )
  )
    columns.push({
      key: "isActive",
      label: "Trạng thái",
      render: (r) => <Badge value={r.isActive === false ? "off" : "active"} />,
    });
  columns.push({
    key: "actions",
    label: "Thao tác",
    render: (r) => (
      <div className="d-flex gap-2">
        <button
          className="btn btn-light btn-sm"
          onClick={() => {
            setError("");
            setEditing(r);
          }}
        >
          <Pencil size={14} /> {canEdit ? "Chỉnh sửa" : "Chi tiết"}
        </button>
        {canEdit && "isActive" in r && r.id !== user.id && (
          <button
            className="btn btn-light btn-sm"
            aria-label={r.isActive ? "Ngừng hoạt động" : "Kích hoạt"}
            onClick={() =>
              commit((n) => {
                n[resource].find((x) => x.id === r.id).isActive = !r.isActive;
              })
            }
          >
            <Power size={14} />
          </button>
        )}
      </div>
    ),
  });
  return (
    <div className="clinic-page">
      <Heading
        title={own ? "Hồ sơ của tôi" : config.title}
        description={config.description}
        action={
          canEdit && (
            <AddButton
              onClick={() => {
                setError("");
                setEditing({ isActive: true });
              }}
            />
          )
        }
      />
      <DataTable rows={rows} columns={columns} />
      {editing && (
        <Modal
          title={
            editing.id
              ? "Thông tin chi tiết"
              : `Thêm ${config.title.toLowerCase()}`
          }
          onClose={() => setEditing(null)}
        >
          <form onSubmit={save}>
            <div className="clinic-form-grid">
              {config.fields.map(([key, label, type]) => (
                <Field key={key} label={label}>
                  {relation(type) ? (
                    <select
                      className="form-select"
                      name={key}
                      defaultValue={editing[key] || ""}
                      required={!type.endsWith("?")}
                      disabled={!canEdit}
                    >
                      <option value="">Chọn {label.toLowerCase()}</option>
                      {relation(type)
                        .filter((x) => x.id !== editing.id)
                        .map((x) => (
                          <option key={x.id} value={x.id}>
                            {x.name}
                          </option>
                        ))}
                    </select>
                  ) : type?.startsWith("enum:") ? (
                    <select
                      className="form-select"
                      name={key}
                      defaultValue={editing[key] || type.slice(5).split(",")[0]}
                      disabled={!canEdit}
                    >
                      {type
                        .slice(5)
                        .split(",")
                        .map((v) => (
                          <option key={v}>{v}</option>
                        ))}
                    </select>
                  ) : type === "textarea" ? (
                    <textarea
                      className="form-control"
                      name={key}
                      defaultValue={editing[key] || ""}
                      disabled={!canEdit}
                      rows={3}
                    />
                  ) : (
                    <input
                      className="form-control"
                      name={key}
                      defaultValue={editing[key] ?? ""}
                      disabled={!canEdit}
                      type={
                        ["number", "positive"].includes(type)
                          ? "number"
                          : ["email", "date", "time", "tel"].includes(type)
                            ? type
                            : "text"
                      }
                      min={type === "positive" ? 1 : 0}
                      max={key === "dateOfBirth" ? today() : undefined}
                      required={type !== "optional"}
                      maxLength={key === "phone" ? 10 : 250}
                    />
                  )}
                </Field>
              ))}
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
                onClick={() => setEditing(null)}
              >
                Đóng
              </button>
              {canEdit && (
                <button className="btn btn-primary">Lưu thông tin</button>
              )}
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
