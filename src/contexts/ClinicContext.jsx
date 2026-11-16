import { createContext, useContext, useState } from "react";
import { initialClinic } from "../services/clinicStore";
const ClinicContext = createContext(null);
const KEY = "medicare_clinic_demo_v1";
export function ClinicProvider({ children }) {
  const [db, setDb] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || initialClinic();
    } catch {
      return initialClinic();
    }
  });
  const [notice, setNotice] = useState("");
  // Clone and validate before committing so failed FEFO operations leave no partial changes.
  function commit(fn, message = "Đã lưu thay đổi.") {
    const next = structuredClone(db);
    const result = fn(next);
    localStorage.setItem(KEY, JSON.stringify(next));
    setDb(next);
    setNotice(message);
    return result;
  }
  return (
    <ClinicContext.Provider value={{ db, commit, notice, setNotice }}>
      {children}
      {notice && (
        <div className="clinic-toast" role="status">
          {notice}
          <button aria-label="Đóng thông báo" onClick={() => setNotice("")}>
            ×
          </button>
        </div>
      )}
    </ClinicContext.Provider>
  );
}
export const useClinic = () => useContext(ClinicContext);
