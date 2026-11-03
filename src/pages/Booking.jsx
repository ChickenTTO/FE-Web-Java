import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, User, Phone, Mail, Stethoscope, 
  FileText, CheckCircle2, AlertCircle, ArrowLeft 
} from 'lucide-react';
import { getClinicRooms, createBooking } from '../services/api';

export default function BookingPage() {
  const [rooms, setRooms] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdBooking, setCreatedBooking] = useState(null);

  // 1. Khởi tạo Form State
  const [formData, setFormData] = useState({
    patientName: '',
    phone: '',
    email: '',
    room: '',
    doctor: '',
    date: '',
    time: '',
    note: ''
  });

  // State chứa danh sách lỗi
  const [errors, setErrors] = useState({});

  // Lấy ngày hôm nay định dạng YYYY-MM-DD để chặn chọn ngày trong quá khứ
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    // Lấy danh sách phòng khám từ Mock Data / API
    getClinicRooms().then((data) => setRooms(data));
  }, []);

  // Thay đổi thông tin chọn phòng khám -> Tự điền tên bác sĩ phụ trách
  const handleRoomChange = (e) => {
    const selectedRoomName = e.target.value;
    const roomObj = rooms.find((r) => r.name === selectedRoomName);
    setFormData({
      ...formData,
      room: selectedRoomName,
      doctor: roomObj ? roomObj.doctor : ''
    });

    // Xóa lỗi phòng khám nếu người dùng chọn lại
    if (errors.room) setErrors((prev) => ({ ...prev, room: '' }));
  };

  // Hàm Validation cơ bản theo yêu cầu đề bài
  const validateForm = () => {
    const newErrors = {};

    // 1. Họ tên bệnh nhân (Bắt buộc, tối thiểu 3 ký tự)
    if (!formData.patientName.trim()) {
      newErrors.patientName = 'Vui lòng nhập họ và tên bệnh nhân.';
    } else if (formData.patientName.trim().length < 3) {
      newErrors.patientName = 'Họ và tên phải có ít nhất 3 ký tự.';
    }

    // 2. Số điện thoại (Bắt buộc, đúng định dạng SĐT Việt Nam 10 số)
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại.';
    } else if (!phoneRegex.test(formData.phone.trim())) {
      newErrors.phone = 'Số điện thoại không hợp lệ (Phải đúng 10 số, đầu 03, 05, 07, 08, 09).';
    }

    // 3. Email (Không bắt buộc, nhưng nếu nhập thì phải đúng định dạng)
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Định dạng email không hợp lệ (ví dụ: example@gmail.com).';
      }
    }

    // 4. Chọn Phòng khám / Bác sĩ (Bắt buộc)
    if (!formData.room) {
      newErrors.room = 'Vui lòng chọn phòng khám hoặc chuyên khoa.';
    }

    // 5. Ngày khám (Bắt buộc & không được trong quá khứ)
    if (!formData.date) {
      newErrors.date = 'Vui lòng chọn ngày khám.';
    } else if (formData.date < todayStr) {
      newErrors.date = 'Ngày khám không được chọn trong quá khứ.';
    }

    // 6. Khung giờ khám (Bắt buộc)
    if (!formData.time) {
      newErrors.time = 'Vui lòng chọn khung giờ khám.';
    }

    setErrors(newErrors);
    // Trả về true nếu không có lỗi nào
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Xóa lỗi trực tiếp khi người dùng gõ lại
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Xử lý Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return; // Dừng lại nếu có lỗi validation

    setSubmitting(true);
    try {
      const result = await createBooking(formData);
      setCreatedBooking(result);
      setShowSuccessModal(true); // Hiển thị Modal thành công

      // Reset form về ban đầu
      setFormData({
        patientName: '',
        phone: '',
        email: '',
        room: '',
        doctor: '',
        date: '',
        time: '',
        note: ''
      });
      setErrors({});
    } catch (err) {
      alert('Có lỗi xảy ra khi gửi thông tin đặt lịch.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          
          {/* Header Trang */}
          <div className="text-center mb-4">
            <span className="badge bg-primary-subtle text-primary fw-bold px-3 py-2 rounded-pill mb-2">
              Dịch vụ khám bệnh
            </span>
            <h2 className="fw-extrabold text-dark">ĐĂNG KÝ ĐẶT LỊCH KHÁM BỆNH</h2>
            <p className="text-muted">
              Vui lòng điền đầy đủ thông tin bên dưới để đăng ký lịch khám trực tuyến nhanh chóng.
            </p>
          </div>

          {/* Form Card */}
          <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="card-header bg-primary text-white p-4">
              <div className="d-flex align-items-center gap-2">
                <Calendar size={22} />
                <h5 className="mb-0 fw-bold">Thông Tin Phiếu Đặt Lịch</h5>
              </div>
            </div>

            <div className="card-body p-4 p-md-5">
              <form onSubmit={handleSubmit} noValidate>
                <div className="row g-3">
                  
                  {/* Họ và tên */}
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold text-secondary">
                      <User size={15} className="me-1" /> Họ và tên bệnh nhân <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control form-control-lg ${errors.patientName ? 'is-invalid' : ''}`}
                      placeholder="Nguyễn Văn A"
                      value={formData.patientName}
                      onChange={(e) => handleChange('patientName', e.target.value)}
                    />
                    {errors.patientName && (
                      <div className="invalid-feedback fw-medium">{errors.patientName}</div>
                    )}
                  </div>

                  {/* Số điện thoại */}
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold text-secondary">
                      <Phone size={15} className="me-1" /> Số điện thoại <span className="text-danger">*</span>
                    </label>
                    <input
                      type="tel"
                      className={`form-control form-control-lg ${errors.phone ? 'is-invalid' : ''}`}
                      placeholder="0912345678"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                    />
                    {errors.phone && (
                      <div className="invalid-feedback fw-medium">{errors.phone}</div>
                    )}
                  </div>

                  {/* Email (Không bắt buộc) */}
                  <div className="col-12">
                    <label className="form-label fw-semibold text-secondary">
                      <Mail size={15} className="me-1" /> Địa chỉ Email <span className="text-muted fs-7">(Không bắt buộc)</span>
                    </label>
                    <input
                      type="email"
                      className={`form-control form-control-lg ${errors.email ? 'is-invalid' : ''}`}
                      placeholder="patient@example.com"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                    />
                    {errors.email && (
                      <div className="invalid-feedback fw-medium">{errors.email}</div>
                    )}
                  </div>

                  {/* Chọn Phòng khám / Chuyên khoa */}
                  <div className="col-12">
                    <label className="form-label fw-semibold text-secondary">
                      <Stethoscope size={15} className="me-1" /> Chọn Phòng khám / Bác sĩ <span className="text-danger">*</span>
                    </label>
                    <select
                      className={`form-select form-select-lg ${errors.room ? 'is-invalid' : ''}`}
                      value={formData.room}
                      onChange={handleRoomChange}
                    >
                      <option value="">-- Chọn phòng khám --</option>
                      {rooms.map((r) => (
                        <option key={r.id} value={r.name}>
                          {r.name} - BS: {r.doctor} ({r.specialty})
                        </option>
                      ))}
                    </select>
                    {errors.room && (
                      <div className="invalid-feedback fw-medium">{errors.room}</div>
                    )}
                    {formData.doctor && (
                      <div className="form-text text-success fw-medium mt-1">
                        ✓ Bác sĩ phụ trách: <strong>{formData.doctor}</strong>
                      </div>
                    )}
                  </div>

                  {/* Ngày khám */}
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold text-secondary">
                      <Calendar size={15} className="me-1" /> Ngày khám <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      min={todayStr}
                      className={`form-control form-control-lg ${errors.date ? 'is-invalid' : ''}`}
                      value={formData.date}
                      onChange={(e) => handleChange('date', e.target.value)}
                    />
                    {errors.date && (
                      <div className="invalid-feedback fw-medium">{errors.date}</div>
                    )}
                  </div>

                  {/* Khung giờ khám */}
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold text-secondary">
                      <Clock size={15} className="me-1" /> Khung giờ khám <span className="text-danger">*</span>
                    </label>
                    <select
                      className={`form-select form-select-lg ${errors.time ? 'is-invalid' : ''}`}
                      value={formData.time}
                      onChange={(e) => handleChange('time', e.target.value)}
                    >
                      <option value="">-- Chọn giờ khám --</option>
                      <option value="08:00">08:00 - Sáng</option>
                      <option value="09:00">09:00 - Sáng</option>
                      <option value="10:00">10:00 - Sáng</option>
                      <option value="13:30">13:30 - Chiều</option>
                      <option value="14:30">14:30 - Chiều</option>
                      <option value="15:30">15:30 - Chiều</option>
                    </select>
                    {errors.time && (
                      <div className="invalid-feedback fw-medium">{errors.time}</div>
                    )}
                  </div>

                  {/* Lý do khám / Ghi chú */}
                  <div className="col-12">
                    <label className="form-label fw-semibold text-secondary">
                      <FileText size={15} className="me-1" /> Lý do khám / Triệu chứng bệnh
                    </label>
                    <textarea
                      rows="3"
                      className="form-control"
                      placeholder="Mô tả sơ lược về triệu chứng của bạn (ví dụ: ho, đau đầu, tái khám...)"
                      value={formData.note}
                      onChange={(e) => handleChange('note', e.target.value)}
                    ></textarea>
                  </div>

                </div>

                {/* Submit Button */}
                <div className="mt-4 pt-2">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100 py-3 fw-bold rounded-3 shadow-sm"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Đang xử lý thông tin...
                      </>
                    ) : (
                      'XÁC NHẬN ĐẶT LỊCH KHÁM'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>

      {/* Modal Xác Nhận Đặt Lịch Thành Công */}
      {showSuccessModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
              <div className="modal-body p-4 text-center">
                <div className="text-success mb-3">
                  <CheckCircle2 size={64} className="animate__animated animate__bounceIn" />
                </div>
                <h4 className="fw-bold text-dark mb-2">ĐẶT LỊCH KHÁM THÀNH CÔNG!</h4>
                <p className="text-muted mb-4">
                  Mã phiếu khám của bạn đã được ghi nhận trên hệ thống. Nhân viên tư vấn sẽ liên hệ xác nhận qua SĐT sớm nhất.
                </p>

                {createdBooking && (
                  <div className="bg-light p-3 rounded-3 text-start mb-4 border">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted fs-7">Họ bệnh nhân:</span>
                      <strong className="text-dark">{createdBooking.patientName}</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted fs-7">Số điện thoại:</span>
                      <strong className="text-dark">{createdBooking.phone}</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted fs-7">Phòng khám:</span>
                      <strong className="text-primary">{createdBooking.room}</strong>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted fs-7">Thời gian:</span>
                      <strong className="text-danger">
                        {createdBooking.time} - {createdBooking.date}
                      </strong>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  className="btn btn-primary w-100 py-2 fw-bold rounded-3"
                  onClick={() => setShowSuccessModal(false)}
                >
                  Đóng & Hoàn thành
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}