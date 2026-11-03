// src/components/Footer.jsx
import { Heart } from 'lucide-react';

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="app-footer">
      <span>© {year} MediCare Hospital Management System</span>
      <span className="d-flex align-items-center gap-1">
        Phát triển với <Heart size={13} fill="currentColor" color="#e5383b" /> bởi nhóm Dev
      </span>
    </footer>
  );
}

export default Footer;
