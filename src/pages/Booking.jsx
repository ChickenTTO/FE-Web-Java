import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Calendar, Clock, User, Phone, Mail, Stethoscope, FileText,
  CheckCircle2, AlertCircle, MapPin, Sun, Sunset, ShieldCheck, ArrowRight,
} from 'lucide-react';
import { getClinicRooms, createBooking } from '../services/api';

/* ─────────────────────────────────────────────────────────────
   Hằng số & helper
   ───────────────────────────────────────────────────────────── */

const TIME_SLOTS = [
  { group: 'Sáng',  icon: Sun,    slots: ['08:00', '09:00', '10:00'] },
  { group: 'Chiều', icon: Sunset, slots: ['13:30', '14:30', '15:30'] },
];

const EMPTY_FORM = {
  patientName: '', phone: '', email: '',
  room: '', doctor: '', date: '', time: '', note: '',
};

const REQUIRED_FIELDS = ['patientName', 'phone', 'room', 'date', 'time'];
const FIELD_ORDER = ['patientName', 'phone', 'email', 'room', 'date', 'time'];
const NOTE_MAX = 300;

const pad = (n) => String(n).padStart(2, '0');

// YYYY-MM-DD theo giờ địa phương (toISOString dùng UTC nên sai múi giờ VN lúc 0h–7h)
const toLocalISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const formatDateVN = (iso) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

function buildQuickDates(count = 5) {
  const out = [];
  for (let i = 0; i < count; i += 1) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    out.push({
      value: toLocalISO(d),
      top: i === 0 ? 'Hôm nay' : i === 1 ? 'Ngày mai' : WEEKDAYS[d.getDay()],
      bottom: `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`,
    });
  }
  return out;
}

function getErrors(data, todayStr) {
  const e = {};

  if (!data.patientName.trim()) e.patientName = 'Vui lòng nhập họ và tên bệnh nhân.';
  else if (data.patientName.trim().length < 3) e.patientName = 'Họ và tên phải có ít nhất 3 ký tự.';

  if (!data.phone.trim()) e.phone = 'Vui lòng nhập số điện thoại.';
  else if (!/^0[35789][0-9]{8}$/.test(data.phone.trim()))
    e.phone = 'Số điện thoại không hợp lệ (đúng 10 số, đầu 03, 05, 07, 08, 09).';

  if (data.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim()))
    e.email = 'Định dạng email không hợp lệ (ví dụ: example@gmail.com).';

  if (!data.room) e.room = 'Vui lòng chọn phòng khám hoặc chuyên khoa.';

  if (!data.date) e.date = 'Vui lòng chọn ngày khám.';
  else if (data.date < todayStr) e.date = 'Ngày khám không được chọn trong quá khứ.';

  if (!data.time) e.time = 'Vui lòng chọn khung giờ khám.';

  return e;
}

/* ─────────────────────────────────────────────────────────────
   Sub-components
   ───────────────────────────────────────────────────────────── */

function Field({ id, label, icon: Icon, required, hint, error, children }) {
  return (
    <>
      <label htmlFor={id} className="form-label fw-semibold text-secondary">
        <Icon size={15} className="me-1" /> {label}{' '}
        {required && <span className="text-danger">*</span>}
        {hint && <span className="text-muted small fw-normal">{hint}</span>}
      </label>
      {children}
      {error && (
        <div className="bk-error" role="alert">
          <AlertCircle size={14} /> {error}
        </div>
      )}
    </>
  );
}

function SummaryRow({ icon: Icon, label, value }) {
  return (
    <div className={`bk-summary-row ${value ? 'filled' : ''}`}>
      <div className="bk-summary-icon"><Icon size={16} /></div>
      <div className="min-w-0">
        <div className="bk-summary-label">{label}</div>
        <div className="bk-summary-value" key={value || 'empty'}>{value || 'Chưa chọn'}</div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Page
   ───────────────────────────────────────────────────────────── */

export default function BookingPage() {
  const location = useLocation();
  const preselectedRoomId = location.state?.roomId;

  const [rooms, setRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdBooking, setCreatedBooking] = useState(null);

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const preselectDone = useRef(false);

  const todayStr = useMemo(() => toLocalISO(new Date()), []);
  const quickDates = useMemo(() => buildQuickDates(5), []);

  // Lỗi tính trực tiếp từ dữ liệu → luôn đồng bộ, không cần setState thủ công
  const allErrors = useMemo(() => getErrors(formData, todayStr), [formData, todayStr]);
  const errorOf = (f) => ((touched[f] || submitted) ? allErrors[f] : undefined);
  const isValid = (f) => touched[f] && !allErrors[f] && formData[f];
  const inputClass = (f) =>
    `form-control form-control-lg ${errorOf(f) ? 'is-invalid' : isValid(f) ? 'is-valid' : ''}`;

  const completed = REQUIRED_FIELDS.filter((f) => formData[f] && !allErrors[f]).length;
  const progress = Math.round((completed / REQUIRED_FIELDS.length) * 100);

  /* Lấy danh sách phòng khám */
  useEffect(() => {
    getClinicRooms()
      .then((data) => setRooms(data))
      .finally(() => setRoomsLoading(false));
  }, []);

  /* Tự chọn phòng khi đi từ trang chủ (nút "Đặt lịch khám" trên thẻ phòng) */
  useEffect(() => {
    if (preselectDone.current || !rooms.length || preselectedRoomId == null) return;
    const room = rooms.find((r) => String(r.id) === String(preselectedRoomId));
    if (room) {
      setFormData((prev) => ({ ...prev, room: room.name, doctor: room.doctor }));
      preselectDone.current = true;
    }
  }, [rooms, preselectedRoomId]);

  /* Modal: đóng bằng ESC + khoá cuộn nền */
  const closeModal = useCallback(() => setShowSuccessModal(false), []);
  useEffect(() => {
    if (!showSuccessModal) return undefined;
    const onKey = (e) => e.key === 'Escape' && closeModal();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [showSuccessModal, closeModal]);

  const selectedRoom = rooms.find((r) => r.name === formData.room);

  const handleChange = (field, value) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      // Đổi ngày sang hôm nay → bỏ giờ đã trôi qua
      if (field === 'date' && prev.time && value === todayStr && isPastSlot(prev.time, value)) {
        next.time = '';
      }
      return next;
    });
  };

  const handleRoomChange = (e) => {
    const name = e.target.value;
    const roomObj = rooms.find((r) => r.name === name);
    setFormData((prev) => ({ ...prev, room: name, doctor: roomObj ? roomObj.doctor : '' }));
    setTouched((t) => ({ ...t, room: true }));
  };

  const handleBlur = (field) => setTouched((t) => ({ ...t, [field]: true }));

  // Khung giờ đã qua trong ngày hôm nay thì không cho chọn
  function isPastSlot(slot, dateValue) {
    if (dateValue !== todayStr) return false;
    const [h, m] = slot.split(':').map(Number);
    const now = new Date();
    return h * 60 + m <= now.getHours() * 60 + now.getMinutes();
  }

  const focusFirstError = (errs) => {
    const first = FIELD_ORDER.find((f) => errs[f]);
    if (!first) return;
    const el = document.getElementById(`bk-${first}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Đợi cuộn xong rồi focus để không bị giật
      setTimeout(() => el.focus({ preventScroll: true }), 350);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitted(true);

    if (Object.keys(allErrors).length > 0) {
      focusFirstError(allErrors);
      return;
    }

    setSubmitting(true);
    try {
      const result = await createBooking(formData);
      setCreatedBooking(result);
      setShowSuccessModal(true);
      setFormData(EMPTY_FORM);
      setTouched({});
      setSubmitted(false);
    } catch {
      setSubmitError('Có lỗi xảy ra khi gửi thông tin đặt lịch. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-5 booking-page">
      {/* Header */}
      <div className="text-center mb-4">
        <span className="badge bg-primary-subtle text-primary fw-bold px-3 py-2 rounded-pill mb-2">
          Dịch vụ khám bệnh
        </span>
        <h1 className="h2 fw-bold text-dark">ĐĂNG KÝ ĐẶT LỊCH KHÁM BỆNH</h1>
        <p className="text-muted mb-0">
          Điền thông tin bên dưới để đăng ký lịch khám trực tuyến nhanh chóng – chỉ mất chưa đến 1 phút.
        </p>
      </div>

      <div className="row g-4 justify-content-center">
        {/* ───────── Form ───────── */}
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="card-header bg-primary text-white p-4 pb-3">
              <div className="d-flex align-items-center justify-content-between gap-2 mb-3">
                <div className="d-flex align-items-center gap-2">
                  <Calendar size={22} />
                  <h2 className="h5 mb-0 fw-bold">Thông Tin Phiếu Đặt Lịch</h2>
                </div>
                <span className="small fw-semibold opacity-75">{completed}/{REQUIRED_FIELDS.length} mục</span>
              </div>
              <div
                className="bk-progress"
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Tiến độ điền phiếu"
              >
                <div className="bk-progress-bar" style={{ transform: `scaleX(${progress / 100})` }} />
              </div>
            </div>

            <div className="card-body p-4 p-md-5">
              <form onSubmit={handleSubmit} noValidate>
                <div className="row g-4">

                  {/* Họ và tên */}
                  <div className="col-12 col-md-6">
                    <Field id="bk-patientName" label="Họ và tên bệnh nhân" icon={User} required error={errorOf('patientName')}>
                      <input
                        id="bk-patientName"
                        type="text"
                        autoComplete="name"
                        className={inputClass('patientName')}
                        placeholder="Nguyễn Văn A"
                        value={formData.patientName}
                        onChange={(e) => handleChange('patientName', e.target.value)}
                        onBlur={() => handleBlur('patientName')}
                      />
                    </Field>
                  </div>

                  {/* Số điện thoại */}
                  <div className="col-12 col-md-6">
                    <Field id="bk-phone" label="Số điện thoại" icon={Phone} required error={errorOf('phone')}>
                      <input
                        id="bk-phone"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        maxLength={10}
                        className={inputClass('phone')}
                        placeholder="0912345678"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, ''))}
                        onBlur={() => handleBlur('phone')}
                      />
                    </Field>
                  </div>

                  {/* Email */}
                  <div className="col-12">
                    <Field id="bk-email" label="Địa chỉ Email" icon={Mail} hint="(Không bắt buộc)" error={errorOf('email')}>
                      <input
                        id="bk-email"
                        type="email"
                        autoComplete="email"
                        className={inputClass('email')}
                        placeholder="patient@example.com"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        onBlur={() => handleBlur('email')}
                      />
                    </Field>
                  </div>

                  {/* Phòng khám */}
                  <div className="col-12">
                    <Field id="bk-room" label="Chọn Phòng khám / Bác sĩ" icon={Stethoscope} required error={errorOf('room')}>
                      <select
                        id="bk-room"
                        className={`form-select form-select-lg ${errorOf('room') ? 'is-invalid' : isValid('room') ? 'is-valid' : ''}`}
                        value={formData.room}
                        onChange={handleRoomChange}
                        disabled={roomsLoading}
                      >
                        <option value="">
                          {roomsLoading ? 'Đang tải danh sách phòng khám...' : '-- Chọn phòng khám --'}
                        </option>
                        {rooms.map((r) => (
                          <option key={r.id} value={r.name} disabled={r.status === 'Closed'}>
                            {r.name} - BS: {r.doctor} ({r.specialty}){r.status === 'Closed' ? ' – Tạm đóng cửa' : ''}
                          </option>
                        ))}
                      </select>

                      {/* Thẻ bác sĩ phụ trách – trượt xuống mượt khi đã chọn phòng */}
                      <div className={`bk-collapse ${selectedRoom ? 'open' : ''}`}>
                        <div className="bk-collapse-inner">
                          {selectedRoom && (
                            <div className="bk-doctor-card">
                              <div className="bk-doctor-avatar">{selectedRoom.doctor.split(' ').pop()[0]}</div>
                              <div className="flex-grow-1 min-w-0">
                                <div className="fw-bold text-dark text-truncate">{selectedRoom.doctor}</div>
                                <div className="small text-muted">
                                  Bác sĩ phụ trách · Chuyên khoa {selectedRoom.specialty}
                                </div>
                              </div>
                              {selectedRoom.floor && (
                                <div className="small text-primary fw-semibold d-none d-sm-flex align-items-center gap-1">
                                  <MapPin size={14} /> {selectedRoom.floor}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </Field>
                  </div>

                  {/* Ngày khám */}
                  <div className="col-12">
                    <Field id="bk-date" label="Ngày khám" icon={Calendar} required error={errorOf('date')}>
                      <div className="bk-chips" role="group" aria-label="Chọn nhanh ngày khám">
                        {quickDates.map((d) => (
                          <button
                            key={d.value}
                            type="button"
                            className={`bk-chip ${formData.date === d.value ? 'active' : ''}`}
                            aria-pressed={formData.date === d.value}
                            onClick={() => { handleChange('date', d.value); handleBlur('date'); }}
                          >
                            <span className="bk-chip-top">{d.top}</span>
                            <span className="bk-chip-bottom">{d.bottom}</span>
                          </button>
                        ))}
                      </div>
                      <input
                        id="bk-date"
                        type="date"
                        min={todayStr}
                        className={`${inputClass('date')} mt-3`}
                        value={formData.date}
                        onChange={(e) => handleChange('date', e.target.value)}
                        onBlur={() => handleBlur('date')}
                      />
                    </Field>
                  </div>

                  {/* Khung giờ */}
                  <div className="col-12">
                    <Field id="bk-time" label="Khung giờ khám" icon={Clock} required error={errorOf('time')}>
                      <div id="bk-time" tabIndex={-1} className="bk-slots">
                        {TIME_SLOTS.map(({ group, icon: GroupIcon, slots }) => (
                          <div key={group} className="bk-slot-group">
                            <div className="bk-slot-title"><GroupIcon size={14} /> {group}</div>
                            <div className="bk-chips">
                              {slots.map((s) => {
                                const past = isPastSlot(s, formData.date);
                                return (
                                  <button
                                    key={s}
                                    type="button"
                                    disabled={past}
                                    className={`bk-chip bk-chip-slot ${formData.time === s ? 'active' : ''}`}
                                    aria-pressed={formData.time === s}
                                    title={past ? 'Khung giờ này đã qua' : undefined}
                                    onClick={() => { handleChange('time', s); handleBlur('time'); }}
                                  >
                                    {s}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </Field>
                  </div>

                  {/* Ghi chú */}
                  <div className="col-12">
                    <Field id="bk-note" label="Lý do khám / Triệu chứng bệnh" icon={FileText}>
                      <textarea
                        id="bk-note"
                        rows="3"
                        maxLength={NOTE_MAX}
                        className="form-control"
                        placeholder="Mô tả sơ lược về triệu chứng của bạn (ví dụ: ho, đau đầu, tái khám...)"
                        value={formData.note}
                        onChange={(e) => handleChange('note', e.target.value)}
                      />
                      <div className="text-end small text-muted mt-1">{formData.note.length}/{NOTE_MAX}</div>
                    </Field>
                  </div>
                </div>

                {/* Lỗi gửi form */}
                {submitError && (
                  <div className="alert alert-danger d-flex align-items-center gap-2 mt-4 mb-0 bk-alert" role="alert">
                    <AlertCircle size={18} /> {submitError}
                  </div>
                )}

                {submitted && Object.keys(allErrors).length > 0 && (
                  <div className="alert alert-warning d-flex align-items-center gap-2 mt-4 mb-0 bk-alert" role="alert">
                    <AlertCircle size={18} />
                    Còn {Object.keys(allErrors).length} mục cần chỉnh lại trước khi gửi.
                  </div>
                )}

                {/* Submit */}
                <div className="mt-4 pt-2">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100 py-3 fw-bold rounded-3 shadow-sm bk-submit"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" />
                        Đang xử lý thông tin...
                      </>
                    ) : (
                      <>XÁC NHẬN ĐẶT LỊCH KHÁM <ArrowRight size={18} className="ms-1" /></>
                    )}
                  </button>
                  <div className="text-center small text-muted mt-3 d-flex align-items-center justify-content-center gap-1">
                    <ShieldCheck size={14} /> Thông tin của bạn được bảo mật và chỉ dùng để xác nhận lịch khám.
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* ───────── Tóm tắt (sticky trên desktop) ───────── */}
        <aside className="col-12 col-lg-4" aria-label="Tóm tắt phiếu đặt lịch">
          <div className="bk-summary">
            <h2 className="h6 fw-bold text-dark mb-3">Tóm tắt lịch khám</h2>
            <SummaryRow icon={User} label="Bệnh nhân" value={formData.patientName.trim()} />
            <SummaryRow icon={Phone} label="Số điện thoại" value={formData.phone} />
            <SummaryRow icon={Stethoscope} label="Phòng khám" value={formData.room} />
            <SummaryRow icon={User} label="Bác sĩ" value={formData.doctor} />
            <SummaryRow icon={Calendar} label="Ngày khám" value={formatDateVN(formData.date)} />
            <SummaryRow icon={Clock} label="Giờ khám" value={formData.time} />
            <div className="bk-summary-foot">
              {progress === 100
                ? <span className="text-success fw-semibold d-flex align-items-center gap-1"><CheckCircle2 size={15} /> Sẵn sàng xác nhận</span>
                : <span className="text-muted">Hoàn thành {progress}% phiếu đăng ký</span>}
            </div>
          </div>
        </aside>
      </div>

      {/* ───────── Modal thành công ───────── */}
      {showSuccessModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          tabIndex="-1"
          role="dialog"
          aria-modal="true"
          aria-labelledby="bk-success-title"
          onMouseDown={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
              <div className="modal-body p-4 text-center">
                <div className="bk-success-icon mb-3">
                  <CheckCircle2 size={64} />
                </div>
                <h2 id="bk-success-title" className="h4 fw-bold text-dark mb-2">ĐẶT LỊCH KHÁM THÀNH CÔNG!</h2>
                <p className="text-muted mb-4">
                  Mã phiếu khám của bạn đã được ghi nhận trên hệ thống. Nhân viên tư vấn sẽ liên hệ xác nhận qua SĐT sớm nhất.
                </p>

                {createdBooking && (
                  <div className="bg-light p-3 rounded-3 text-start mb-4 border">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Họ bệnh nhân:</span>
                      <strong className="text-dark">{createdBooking.patientName}</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Số điện thoại:</span>
                      <strong className="text-dark">{createdBooking.phone}</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Phòng khám:</span>
                      <strong className="text-primary">{createdBooking.room}</strong>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Thời gian:</span>
                      <strong className="text-danger">
                        {createdBooking.time} - {formatDateVN(createdBooking.date)}
                      </strong>
                    </div>
                  </div>
                )}

                <div className="d-flex gap-2">
                  <Link to="/" className="btn btn-outline-primary w-100 py-2 fw-bold rounded-3">
                    Về trang chủ
                  </Link>
                  <button
                    type="button"
                    className="btn btn-primary w-100 py-2 fw-bold rounded-3"
                    onClick={closeModal}
                    autoFocus
                  >
                    Đóng &amp; Hoàn thành
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}