import { createContext, useContext, useState, useCallback, useRef, useLayoutEffect } from "react";
import { DEMO_MODE, initialClinic } from "../services/clinicStore";
import { clinicApi } from "../services/clinicApi";
import { useAuth } from "./AuthContext";
const ClinicContext = createContext(null);
const KEY = "medicare_clinic_demo_v1";
const emptyClinic = () => Object.fromEntries([
  "specialties", "rooms", "doctors", "services", "timeSlots", "schedules", "patients",
  "appointments", "payments", "categories", "suppliers", "supplies", "batches",
  "transactions", "norms", "users", "sessions", "auditLogs",
].map((key) => [key, []]));
export function ClinicProvider({ children }) {
  const { user } = useAuth();
  const isDemo = DEMO_MODE && (!user || user.isDemo === true);
  const [demoDb, setDemoDb] = useState(() => {
    if (!DEMO_MODE) return emptyClinic();
    try { return JSON.parse(localStorage.getItem(KEY)) || initialClinic(); }
    catch { return initialClinic(); }
  });
  // Bind remote data to its authenticated owner; never expose a previous user's cache.
  const owner = user?.id || "public";
  const activeOwner = useRef(owner);
  useLayoutEffect(() => { activeOwner.current = owner; }, [owner]);
  const [remote, setRemote] = useState({ owner: null, db: emptyClinic() });
  const [notice, setNotice] = useState("");
  const db = isDemo ? demoDb : remote.owner === owner ? remote.db : emptyClinic();
  function commit(fn, message = "Đã lưu thay đổi.") {
    if (!isDemo) throw new Error("Thao tác này chưa có API trong Swagger hiện tại.");
    const next = structuredClone(demoDb);
    const result = fn(next);
    localStorage.setItem(KEY, JSON.stringify(next));
    setDemoDb(next);
    setNotice(message);
    return result;
  }
  const loadResources = useCallback(async (resources) => {
    const entries = await Promise.all(resources.map(async (resource) => [resource,
      await clinicApi.list(resource, { publicOnly: !["ADMIN", "STAFF"].includes(user?.role) })]));
    const data = Object.fromEntries(entries);
    if (activeOwner.current !== owner) return;
    setRemote((previous) => ({ owner, db: { ...(previous.owner === owner ? previous.db : emptyClinic()), ...data } }));
  }, [owner, user?.role]);
  async function saveResource(resource, values) {
    const row = await clinicApi.save(resource, values);
    if (activeOwner.current !== owner) return row;
    setRemote((previous) => ({ owner, db: { ...previous.db,
      [resource]: [...previous.db[resource].filter((item) => item.id !== row.id), row] } }));
    setNotice("Đã lưu lên máy chủ.");
    return row;
  }
  async function toggleStatus(resource, row) {
    const updated = await clinicApi.status(resource, row);
    if (activeOwner.current !== owner) return;
    setRemote((previous) => ({ owner, db: { ...previous.db,
      [resource]: previous.db[resource].map((item) => item.id === updated.id ? updated : item) } }));
    setNotice("Đã cập nhật trạng thái trên máy chủ.");
  }
  return <ClinicContext.Provider value={{ db, commit, notice, setNotice, isDemo, loadResources, saveResource, toggleStatus }}>
    {children}
    {notice && <div className="clinic-toast" role="status">{notice}
      <button aria-label="Đóng thông báo" onClick={() => setNotice("")}>×</button>
    </div>}
  </ClinicContext.Provider>;
}
export const useClinic = () => useContext(ClinicContext);
