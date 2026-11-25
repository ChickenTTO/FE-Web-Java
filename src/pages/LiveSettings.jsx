import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useClinic } from "../contexts/ClinicContext";
import { Heading, Field } from "../components/ClinicUI";
import { clinicApi } from "../services/clinicApi";
import { apiError, normalizeUser } from "../services/apiHelpers";
import authService from "../services/authService";
import { today } from "../services/clinicStore";

export default function LiveSettings() {
  const { user, setUser } = useAuth();
  const { setNotice } = useClinic();
  const [profile, setProfile] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [retry, setRetry] = useState(0);
  const role = user.role;
  useEffect(() => {
    let active = true;
    Promise.all([clinicApi.profile(), role === "DOCTOR" ? clinicApi.myDoctorProfile() : Promise.resolve(null)])
      .then(([p, d]) => { if (active) { setProfile(p); setDoctor(d); } })
      .catch((err) => { if (active) setError(apiError(err)); });
    return () => { active = false; };
  }, [role, retry]);
  async function save(event, kind) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    setError(""); setBusy(true);
    try {
      if (kind === "password") {
        if (values.newPassword !== values.confirmPassword) throw new Error("Mật khẩu xác nhận không khớp.");
        await clinicApi.changePassword(values);
        form.reset();
      } else if (kind === "doctor") {
        await clinicApi.updateMyDoctorProfile(values);
        setDoctor((previous) => ({ ...previous, description: values.biography }));
      } else {
        const data = await clinicApi.updateProfile({ ...values, dateOfBirth: values.dateOfBirth || null });
        const updated = normalizeUser(data);
        authService.setCurrentUser(updated); setUser(updated); setProfile(data);
      }
      setNotice(kind === "password" ? "Đã đổi mật khẩu." : "Đã cập nhật hồ sơ trên máy chủ.");
    } catch (err) { setError(apiError(err)); }
    finally { setBusy(false); }
  }
  return <div className="clinic-page">
    <Heading title="Tài khoản & cài đặt" description="Cập nhật thông tin cá nhân và bảo mật tài khoản." />
    {error && <div role="alert" className="clinic-error mb-3">{error}
      {!profile && <button className="btn btn-light ms-3" onClick={() => { setError(""); setRetry((v) => v + 1); }}>Thử lại</button>}</div>}
    {!profile && !error && <p role="status">Đang tải hồ sơ...</p>}
    {profile && <form className="clinic-panel p-4" onSubmit={(event) => save(event, "profile")}>
      <h2 className="h4">Thông tin cá nhân</h2><p>{profile.phone} · {profile.email} · {role}</p>
      <div className="clinic-form-grid">
        <Field label="Họ và tên"><input className="form-control" name="fullName" defaultValue={profile.fullName} required minLength={2} maxLength={100} /></Field>
        <Field label="Giới tính"><select className="form-select" name="gender" defaultValue={profile.gender || "other"}>
          <option value="male">Nam</option><option value="female">Nữ</option><option value="other">Khác</option>
        </select></Field>
        <Field label="Ngày sinh"><input className="form-control" name="dateOfBirth" type="date" max={today()} defaultValue={profile.dateOfBirth || ""} /></Field>
        <Field label="Địa chỉ"><input className="form-control" name="address" maxLength={255} defaultValue={profile.address || ""} /></Field>
      </div><button className="btn btn-primary mt-3" disabled={busy}>Cập nhật thông tin</button>
    </form>}
    {doctor && <form className="clinic-panel p-4 mt-4" onSubmit={(event) => save(event, "doctor")}>
      <h2 className="h4">Hồ sơ chuyên môn</h2><p>{doctor.qualification} · {doctor.experience} năm kinh nghiệm</p>
      <Field label="Tiểu sử chuyên môn"><textarea className="form-control" name="biography" defaultValue={doctor.description} maxLength={5000} rows={5} /></Field>
      <button className="btn btn-primary mt-3" disabled={busy}>Cập nhật tiểu sử</button>
    </form>}
    <form className="clinic-panel p-4 mt-4" onSubmit={(event) => save(event, "password")}>
      <h2 className="h4">Đổi mật khẩu</h2><div className="clinic-form-grid">
        <Field label="Mật khẩu hiện tại"><input className="form-control" name="currentPassword" type="password" autoComplete="current-password" required /></Field>
        <Field label="Mật khẩu mới"><input className="form-control" name="newPassword" type="password" autoComplete="new-password" minLength={6} maxLength={50} required /></Field>
        <Field label="Xác nhận mật khẩu mới"><input className="form-control" name="confirmPassword" type="password" autoComplete="new-password" minLength={6} maxLength={50} required /></Field>
      </div><button className="btn btn-primary mt-3" disabled={busy}>Đổi mật khẩu</button>
    </form>
  </div>;
}
