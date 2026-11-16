import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Cross } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useClinic } from "../contexts/ClinicContext";
import { Field } from "../components/ClinicUI";
import { uid, DEMO_MODE } from "../services/clinicStore";
import apiClient from "../services/apiClient";
export default function RegisterPage() {
  const { commit } = useClinic();
  const { loginDemo } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setError("");
    const f = Object.fromEntries(new FormData(e.currentTarget));
    if (!/^0[35789]\d{8}$/.test(f.phone)) {
      setError("Số điện thoại Việt Nam không hợp lệ.");
      return;
    }
    if (f.password !== f.confirm) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    setLoading(true);
    try {
      if (DEMO_MODE) {
        const u = commit((n) => {
          if (n.users.some((u) => u.email === f.email || u.phone === f.phone))
            throw new Error("Email hoặc số điện thoại đã được sử dụng.");
          const u = {
            id: uid(),
            name: f.fullName,
            fullName: f.fullName,
            email: f.email,
            phone: f.phone,
            role: "PATIENT",
            isActive: true,
          };
          n.users.push(u);
          n.patients.push({
            id: uid(),
            userId: u.id,
            name: f.fullName,
            phone: f.phone,
            relationship: "Bản thân",
            medicalHistory: "",
          });
          return u;
        }, "Đã tạo hồ sơ xem thử.");
        loginDemo(u);
        navigate("/profiles");
      } else {
        await apiClient.post("/api/v1/auth/register", {
          fullName: f.fullName,
          phone: f.phone,
          email: f.email,
          password: f.password,
        });
        navigate("/login", { state: { registered: true } });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="clinic-auth">
      <div className="clinic-panel p-4">
        <Link
          to="/"
          className="d-flex gap-2 align-items-center mb-4 text-decoration-none"
        >
          <Cross />
          MediCare
        </Link>
        <h1 className="heading-title h2">Tạo tài khoản</h1>
        <p>Quản lý sức khỏe cho bạn và gia đình.</p>
        {DEMO_MODE && (
          <div className="clinic-callout mb-3">
            Bản xem thử: tạo hồ sơ mẫu trên trình duyệt. Mật khẩu không được
            lưu.
          </div>
        )}
        <form onSubmit={submit}>
          <Field label="Họ và tên">
            <input
              className="form-control"
              name="fullName"
              autoComplete="name"
              required
              minLength={3}
            />
          </Field>
          <Field label="Số điện thoại">
            <input
              className="form-control"
              name="phone"
              type="tel"
              autoComplete="tel"
              required
            />
          </Field>
          <Field label="Email">
            <input
              className="form-control"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </Field>
          <Field label="Mật khẩu (tối thiểu 8 ký tự)">
            <input
              className="form-control"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </Field>
          <Field label="Xác nhận mật khẩu">
            <input
              className="form-control"
              name="confirm"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </Field>
          <label className="d-flex gap-2 my-3">
            <input type="checkbox" required />
            Tôi đồng ý sử dụng thông tin để quản lý lịch khám.
          </label>
          {error && (
            <p className="clinic-error" role="alert">
              {error}
            </p>
          )}
          <button className="btn btn-primary w-100" disabled={loading}>
            {loading ? "Đang tạo..." : "Đăng ký"}
          </button>
        </form>
        <p className="mt-3 mb-0">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}
