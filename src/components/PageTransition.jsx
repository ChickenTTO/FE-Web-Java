// src/components/PageTransition.jsx
// Bọc <Outlet /> để mỗi lần đổi route trang mới fade/slide vào mượt mà,
// đồng thời tự cuộn lên đầu trang (hoặc tới #anchor nếu có).
import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

export default function PageTransition() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, hash]);

  return (
    <div key={pathname} className="page-transition">
      <Outlet />
    </div>
  );
}
