import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { useClinic } from "../contexts/ClinicContext";
import { useAuth } from "../contexts/AuthContext";
import { apiError } from "../services/apiHelpers";

const resourcesFor = (path, role) => {
  if (path === "/") return ["specialties", "doctors", "services"];
  if (["/specialties", "/doctors", "/services"].includes(path))
    return path === "/specialties" ? ["specialties"] : ["specialties", path.slice(1)];
  if (path === "/profiles") return ["patients"];
  if (path.startsWith("/catalog/")) {
    const resource = path.split("/")[2];
    return [...new Set([resource, ...(["doctors", "services"].includes(resource) ? ["specialties"] : []),
      ...(resource === "doctors" && role === "ADMIN" ? ["users"] : [])])];
  }
  if (path === "/users") return ["users"];
  if (path === "/admin") return ["specialties", "doctors", "services", "rooms", "users", "timeSlots"];
  if (["/settings", "/help"].includes(path)) return [];
  return null;
};
export function ApiUnavailable({ title = "Chức năng chưa khả dụng", children }) {
  return <div className="clinic-page container"><h1 className="h3">{title}</h1>
    <div className="clinic-callout mt-3">{children || "Máy chủ chưa hỗ trợ chức năng này. Bạn có thể tiếp tục tra cứu chuyên khoa, bác sĩ và dịch vụ khám."}</div>
    <Link className="btn btn-outline-primary mt-3" to="/services">Xem dịch vụ khám</Link>
  </div>;
}
export default function ClinicDataBoundary({ children }) {
  const { pathname } = useLocation();
  const { user, isLoading } = useAuth();
  const { isDemo, loadResources } = useClinic();
  const [state, setState] = useState({ key: "", error: "" });
  const [retry, setRetry] = useState(0);
  const key = `${pathname}:${user?.id || "public"}:${retry}`;
  const resources = resourcesFor(pathname, user?.role);
  const listKey = resources?.join(",");
  useEffect(() => {
    let active = true;
    if (isDemo || isLoading || listKey == null) return;
    loadResources(listKey ? listKey.split(",") : []).then(() => {
      if (active) setState({ key, error: "" });
    }).catch((error) => { if (active) setState({ key, error: apiError(error) }); });
    return () => { active = false; };
  }, [key, listKey, isDemo, isLoading, loadResources]);
  if (isDemo) return children;
  if (resources === null) return <ApiUnavailable />;
  if (isLoading || state.key !== key) return <div className="clinic-page container" role="status">Đang tải dữ liệu từ máy chủ...</div>;
  if (state.error) return <div className="clinic-page container"><p className="clinic-error" role="alert">{state.error}</p>
    <button className="btn btn-primary" onClick={() => setRetry((value) => value + 1)}>Thử lại</button></div>;
  return children;
}
