// src/pages/EquipmentManagement.jsx
import React, { useEffect, useState } from 'react';
import { 
  Wrench, Plus, Search, Edit3, Trash2, RefreshCw, 
  X, CheckCircle, AlertTriangle, Activity 
} from 'lucide-react';
import { 
  getEquipments, createEquipment, updateEquipment, 
  deleteEquipment, updateEquipmentStatus 
} from '../services/api';

const CATEGORY_OPTIONS = [
  'Chẩn đoán hình ảnh', 
  'Theo dõi bệnh nhân', 
  'Hô hấp', 
  'Tim mạch', 
  'Phẫu thuật', 
  'Xét nghiệm'
];

const EMPTY_FORM = { name: '', code: '', category: '', status: 'Active', room: '' };

// Visual-only: flat black outline for invalid fields (replaces Bootstrap red)
const INVALID_STYLE = { borderColor: 'var(--color-carbon-black)', backgroundImage: 'none' };
const INVALID_SELECT_STYLE = { borderColor: 'var(--color-carbon-black)' };
const INVALID_FEEDBACK_STYLE = { color: 'var(--color-carbon-black)', fontWeight: 500, fontSize: 14 };

export default function EquipmentManagement() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  // State Modal & Form
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null); // null = Thêm mới, object = Chỉnh sửa
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Load danh sách thiết bị
  const loadData = () => {
    setLoading(true);
    getEquipments()
      .then(setItems)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Lọc theo tìm kiếm và trạng thái
  const filteredItems = items.filter((item) => {
    const matchesSearch = 
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.code.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus ? item.status === filterStatus : true;
    return matchesSearch && matchesStatus;
  });

  // Mở Modal Thêm Mới
  const handleOpenCreate = () => {
    setEditItem(null);
    setFormData(EMPTY_FORM);
    setFormErrors({});
    setShowModal(true);
  };

  // Mở Modal Sửa
  const handleOpenEdit = (item) => {
    setEditItem(item);
    setFormData({ ...item });
    setFormErrors({});
    setShowModal(true);
  };

  // Validation Form
  const validateForm = () => {
    const errs = {};
    if (!formData.code.trim()) errs.code = 'Mã thiết bị là bắt buộc';
    if (!formData.name.trim()) errs.name = 'Tên thiết bị là bắt buộc';
    if (!formData.category) errs.category = 'Vui lòng chọn phân loại';
    if (!formData.room.trim()) errs.room = 'Phòng trang bị là bắt buộc';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit Form (Thêm hoặc Sửa)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      if (editItem) {
        // Cập nhật
        const updated = await updateEquipment(editItem.id, formData);
        setItems((prev) => prev.map((x) => (x.id === editItem.id ? updated : x)));
      } else {
        // Thêm mới
        const newItem = await createEquipment(formData);
        setItems((prev) => [...prev, newItem]);
      }
      setShowModal(false);
    } catch (err) {
      alert('Có lỗi xảy ra khi lưu thiết bị!');
    } finally {
      setSubmitting(false);
    }
  };

  // Xóa thiết bị
  const handleDelete = async (id, name) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa thiết bị "${name}"?`)) {
      try {
        await deleteEquipment(id);
        setItems((prev) => prev.filter((item) => item.id !== id));
      } catch (err) {
        alert('Có lỗi xảy ra khi xóa thiết bị!');
      }
    }
  };

  // Đổi nhanh trạng thái
  const handleToggleStatus = async (item) => {
    const newStatus = item.status === 'Active' ? 'Maintenance' : 'Active';
    const updated = await updateEquipmentStatus(item.id, newStatus);
    setItems((prev) => prev.map((x) => (x.id === item.id ? updated : x)));
  };

  return (
    <div className="container-fluid py-4">
      {/* Header & Button */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h3 className="heading-title mb-1" style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', color: 'var(--color-carbon-black)' }}>Quản Lý Thiết Bị Y Tế</h3>
          <p className="fs-7 mb-0" style={{ fontSize: 16, color: 'var(--color-slate)' }}>Danh sách, bảo trì và cập nhật vị trí thiết bị trong bệnh viện</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary d-flex align-items-center gap-1" onClick={loadData}>
            <RefreshCw size={16} /> Làm mới
          </button>
          <button className="btn btn-primary d-flex align-items-center gap-2" onClick={handleOpenCreate}>
            <Plus size={18} /> Thêm thiết bị mới
          </button>
        </div>
      </div>

      {/* Card chứa Thanh tìm kiếm & Bộ lọc */}
      <div className="card-custom mb-4">
        <div className="card-body p-3">
          <div className="row g-3">
            <div className="col-12 col-md-6 col-lg-8">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0" style={{ borderWidth: 1.5, borderColor: 'var(--color-ash)' }}>
                  <Search size={16} style={{ color: 'var(--color-slate)' }} />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Tìm kiếm theo tên thiết bị hoặc mã thiết bị..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="col-12 col-md-6 col-lg-4">
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">-- Tất cả trạng thái --</option>
                <option value="Active">Hoạt động (Active)</option>
                <option value="Maintenance">Đang bảo trì (Maintenance)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Bảng Danh Sách Thiết Bị (Bootstrap Responsive Table) */}
      <div className="card-custom">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table-custom align-middle mb-0">
              <thead className="text-uppercase fs-7">
                <tr>
                  <th className="ps-4">Mã THB</th>
                  <th>Tên Thiết Bị</th>
                  <th>Phân Loại</th>
                  <th>Phòng Trang Bị</th>
                  <th>Trạng Thái</th>
                  <th className="text-end pe-4">Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      <div className="spinner-border spinner-border-sm text-primary me-2" />
                      <span>Đang tải danh sách...</span>
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      Không tìm thấy thiết bị nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item.id}>
                      <td className="ps-4">
                        <code className="mono-label" style={{ background: 'var(--color-mist-gray)', color: 'var(--color-carbon-black)', padding: '4px 8px', borderRadius: 4 }}>
                          {item.code}
                        </code>
                      </td>
                      <td style={{ fontWeight: 500, color: 'var(--color-carbon-black)' }}>{item.name}</td>
                      <td>{item.category}</td>
                      <td>{item.room}</td>
                      <td>
                        <button
                          className={`badge-custom ${
                            item.status === 'Active'
                              ? 'badge-active'
                              : 'badge-maintenance'
                          }`}
                          style={{ border: 0, cursor: 'pointer' }}
                          onClick={() => handleToggleStatus(item)}
                          title="Bấm để đổi nhanh trạng thái"
                        >
                          {item.status === 'Active' ? (
                            <><Activity size={12} className="me-1" /> Đang hoạt động</>
                          ) : (
                            <><AlertTriangle size={12} className="me-1" /> Đang bảo trì</>
                          )}
                        </button>
                      </td>
                      <td className="text-end pe-4">
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => handleOpenEdit(item)}
                            title="Chỉnh sửa"
                          >
                            <Edit3 size={14} /> Sửa
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleDelete(item.id, item.name)}
                            title="Xóa thiết bị"
                          >
                            <Trash2 size={14} /> Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bootstrap Modal Form Thêm / Sửa Thiết Bị */}
      {showModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0">
              <div className="modal-header" style={{ background: 'var(--color-carbon-black)', color: 'var(--color-paper-white)', borderBottom: 0 }}>
                <h5 className="modal-title heading-title" style={{ fontSize: 20 }}>
                  {editItem ? 'Chỉnh Sửa Thông Tin Thiết Bị' : 'Thêm Thiết Bị Y Tế Mới'}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                />
              </div>
              <form onSubmit={handleSubmit} noValidate>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    {/* Mã thiết bị */}
                    <div className="col-6">
                      <label className="form-label">Mã thiết bị (*)</label>
                      <input
                        type="text"
                        className={`form-control ${formErrors.code ? 'is-invalid' : ''}`}
                        placeholder="EQ-XRAY-01"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        style={formErrors.code ? INVALID_STYLE : undefined}
                      />
                      {formErrors.code && <div className="invalid-feedback" style={INVALID_FEEDBACK_STYLE}>{formErrors.code}</div>}
                    </div>

                    {/* Trạng thái */}
                    <div className="col-6">
                      <label className="form-label">Trạng thái</label>
                      <select
                        className="form-select"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="Active">Đang hoạt động</option>
                        <option value="Maintenance">Đang bảo trì</option>
                      </select>
                    </div>

                    {/* Tên thiết bị */}
                    <div className="col-12">
                      <label className="form-label">Tên thiết bị (*)</label>
                      <input
                        type="text"
                        className={`form-control ${formErrors.name ? 'is-invalid' : ''}`}
                        placeholder="Máy Siêu Âm Màu 4D"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        style={formErrors.name ? INVALID_STYLE : undefined}
                      />
                      {formErrors.name && <div className="invalid-feedback" style={INVALID_FEEDBACK_STYLE}>{formErrors.name}</div>}
                    </div>

                    {/* Phân loại */}
                    <div className="col-12">
                      <label className="form-label">Phân loại (*)</label>
                      <select
                        className={`form-select ${formErrors.category ? 'is-invalid' : ''}`}
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        style={formErrors.category ? INVALID_SELECT_STYLE : undefined}
                      >
                        <option value="">-- Chọn danh mục --</option>
                        {CATEGORY_OPTIONS.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      {formErrors.category && <div className="invalid-feedback" style={INVALID_FEEDBACK_STYLE}>{formErrors.category}</div>}
                    </div>

                    {/* Phòng trang bị */}
                    <div className="col-12">
                      <label className="form-label">Phòng trang bị (*)</label>
                      <input
                        type="text"
                        className={`form-control ${formErrors.room ? 'is-invalid' : ''}`}
                        placeholder="Phòng Siêu âm 202"
                        value={formData.room}
                        onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                        style={formErrors.room ? INVALID_STYLE : undefined}
                      />
                      {formErrors.room && <div className="invalid-feedback" style={INVALID_FEEDBACK_STYLE}>{formErrors.room}</div>}
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-0" style={{ background: 'var(--color-paper-white)' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Hủy bỏ
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Đang lưu...' : editItem ? 'Cập nhật thiết bị' : 'Thêm thiết bị mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}