import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Eye,
  Shield,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  XCircle,
  KeyRound,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getStaffList,
  createStaff,
  updateStaff,
  deleteStaff,
  toggleStaffStatus,
  resetStaffPassword,
  getStaffMeta,
  clearMessage,
  clearError,
} from "../store/slices/staffSlice";

const DEPARTMENTS = ["Management", "Operations", "Sales", "Support", "Finance", "Logistics"];

const emptyForm = { name: "", email: "", mobile: "", roleId: "", department: "", status: "active" };

export default function Staff() {
  const dispatch = useDispatch();
  const { staffList, stats, loading, error, message, pagination, meta } = useSelector((state) => state.staff);
  const ROLES = meta?.roles || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteConfirm, setIsDeleteConfirm] = useState(null);
  const [isResetConfirm, setIsResetConfirm] = useState(null);
  const [editingStaff, setEditingStaff] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ search: "", status: "", role: "", department: "" });

  // Fetch staff on mount & filter change
  useEffect(() => {
    const params = { page: 1, limit: 50 };
    if (filters.search) params.search = filters.search;
    if (filters.status) params.status = filters.status;
    if (filters.role) params.role = filters.role;
    if (filters.department) params.department = filters.department;
    dispatch(getStaffList(params));
  }, [dispatch, filters]);

  // Load roles & departments dropdown data once
  useEffect(() => {
    dispatch(getStaffMeta());
  }, [dispatch]);

  // Toast messages
  useEffect(() => {
    if (message) { toast.success(message); dispatch(clearMessage()); }
    if (error) { toast.error(error); dispatch(clearError()); }
  }, [message, error, dispatch]);

  const openAddModal = () => {
    setEditingStaff(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  };

  const openEditModal = (staff) => {
    setEditingStaff(staff);
    setFormData({
      name: staff.name,
      email: staff.email,
      mobile: staff.mobile,
      roleId: staff.roleId?._id || staff.roleId || "",
      department: staff.department,
      status: staff.status,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStaff(null);
    setFormData(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.mobile || !formData.roleId || !formData.department) {
      toast.error("Please fill all required fields");
      return;
    }
    if (editingStaff) {
      await dispatch(updateStaff({ id: editingStaff._id, data: formData }));
    } else {
      await dispatch(createStaff(formData));
    }
    closeModal();
    dispatch(getStaffList({ page: 1, limit: 50 }));
  };

  const handleDelete = async (id) => {
    await dispatch(deleteStaff(id));
    setIsDeleteConfirm(null);
    dispatch(getStaffList({ page: 1, limit: 50 }));
  };

  const handleStatusToggle = async (id, newStatus) => {
    await dispatch(toggleStaffStatus({ id, status: newStatus }));
  };

  const handleResetPassword = async (id) => {
    await dispatch(resetStaffPassword(id));
    setIsResetConfirm(null);
  };

  const getStatusBadge = (status) => {
    const map = {
      active: "bg-green-50 text-green-600 border-green-200",
      inactive: "bg-yellow-50 text-yellow-600 border-yellow-200",
      blocked: "bg-red-50 text-red-600 border-red-200",
    };
    return map[status] || map.inactive;
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "N/A";
  const formatDateTime = (d) => d ? new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Never";

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-sm text-gray-500">Manage staff members and their access</p>
        </div>
        <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Staff
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Staff" value={stats?.total || 0} icon={<Shield size={20} />} color="blue" />
        <StatCard label="Active" value={stats?.active || 0} icon={<UserCheck size={20} />} color="green" />
        <StatCard label="Inactive" value={stats?.inactive || 0} icon={<UserX size={20} />} color="yellow" />
        <StatCard label="Blocked" value={stats?.blocked || 0} icon={<XCircle size={20} />} color="red" />
      </div>

      {/* FILTERS */}
      <div className="bg-white border rounded-xl p-4">
        <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="flex items-center gap-2 text-gray-700 font-medium">
          <Filter size={18} /> Filters
          {isFilterOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {isFilterOpen && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative lg:col-span-2">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search by name, email, mobile..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} className="input-field pl-10" />
            </div>
            <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="input-field">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="blocked">Blocked</option>
            </select>
            <select value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })} className="input-field">
              <option value="">All Roles</option>
              {ROLES.map((r) => <option key={r._id || r} value={r.name || r}>{r.name || r}</option>)}
            </select>
            <select value={filters.department} onChange={(e) => setFilters({ ...filters, department: e.target.value })} className="input-field">
              <option value="">All Departments</option>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <button onClick={() => setFilters({ search: "", status: "", role: "", department: "" })} className="btn-secondary flex items-center gap-2"><X size={16} /> Clear</button>
          </div>
        )}
      </div>

      {/* LOADING */}
      {loading && staffList.length === 0 && (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-sm text-gray-600">
              <tr>
                <th className="p-4 text-left">Staff</th>
                <th className="p-4 text-left">Contact</th>
                <th className="p-4 text-left">Role</th>
                <th className="p-4 text-left">Department</th>
                <th className="p-4 text-left">Joined</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!loading && staffList.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">No staff found</td></tr>
              ) : (
                staffList.map((s) => (
                  <tr key={s._id} className="border-t hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-semibold text-sm">
                          {s.name?.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{s.name}</p>
                          <p className="text-xs text-gray-500">{s.staffId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-600 space-y-0.5">
                        <p className="flex items-center gap-1"><Mail size={12} /> {s.email}</p>
                        <p className="flex items-center gap-1"><Phone size={12} /> {s.mobile}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                        <Shield size={12} /> {s.role}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-700">{s.department}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar size={14} /> {formatDate(s.createdAt)}
                      </div>
                    </td>
                    <td className="p-4">
                      <select
                        value={s.status}
                        onChange={(e) => handleStatusToggle(s._id, e.target.value)}
                        className={`px-2 py-1 rounded-lg text-xs border ${getStatusBadge(s.status)} cursor-pointer`}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="blocked">Blocked</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => { setSelectedStaff(s); setIsDetailOpen(true); }} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="View"><Eye size={16} /></button>
                        <button onClick={() => openEditModal(s)} className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg" title="Edit"><Edit2 size={16} /></button>
                        <button onClick={() => setIsResetConfirm(s._id)} className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg" title="Reset Password"><KeyRound size={16} /></button>
                        <button onClick={() => setIsDeleteConfirm(s._id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Delete"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {pagination.total > 0 && (
          <div className="p-4 border-t text-sm text-gray-500">
            Showing {staffList.length} of {pagination.total} staff members
          </div>
        )}
      </div>

      {/* ADD/EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold">{editingStaff ? "Edit Staff" : "Add Staff"}</h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-field" placeholder="Enter full name" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input-field" placeholder="Enter email" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile *</label>
                  <input type="tel" value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} className="input-field" placeholder="Enter mobile" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                  <select value={formData.roleId} onChange={(e) => setFormData({ ...formData, roleId: e.target.value })} className="input-field" required>
                    <option value="">Select Role</option>
                    {ROLES.map((r) => <option key={r._id} value={r._id}>{r.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                  <select value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="input-field" required>
                    <option value="">Select Department</option>
                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="input-field">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>

              {!editingStaff && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-700">
                    <strong>Default Password:</strong> Pass@123 — Staff can change it after first login.
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1">
                  {loading ? "Saving..." : editingStaff ? "Update Staff" : "Add Staff"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {isDetailOpen && selectedStaff && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold">Staff Details</h2>
              <button onClick={() => { setIsDetailOpen(false); setSelectedStaff(null); }} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-xl">
                  {selectedStaff.name?.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedStaff.name}</h3>
                  <p className="text-sm text-gray-500">{selectedStaff.staffId}</p>
                  <div className="flex gap-2 mt-1">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs border ${getStatusBadge(selectedStaff.status)}`}>{selectedStaff.status}</span>
                    <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">{selectedStaff.role}</span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <InfoRow label="Email" value={selectedStaff.email} />
                <InfoRow label="Mobile" value={selectedStaff.mobile} />
                <InfoRow label="Department" value={selectedStaff.department} />
                <InfoRow label="Joined" value={formatDate(selectedStaff.createdAt)} />
                <InfoRow label="Last Login" value={formatDateTime(selectedStaff.lastLogin)} />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setIsDetailOpen(false); setSelectedStaff(null); openEditModal(selectedStaff); }} className="btn-primary flex-1 flex items-center justify-center gap-2"><Edit2 size={16} /> Edit</button>
                <button onClick={() => { setIsResetConfirm(selectedStaff._id); }} className="btn-secondary flex-1 flex items-center justify-center gap-2"><KeyRound size={16} /> Reset Password</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {isDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Staff?</h3>
            <p className="text-sm text-gray-500 mb-6">This staff member will be deactivated and removed from the list.</p>
            <div className="flex gap-3">
              <button onClick={() => setIsDeleteConfirm(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => handleDelete(isDeleteConfirm)} disabled={loading} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm">
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESET PASSWORD CONFIRM */}
      {isResetConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <KeyRound size={24} className="text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Reset Password?</h3>
            <p className="text-sm text-gray-500 mb-6">The staff member's password will be reset to <strong>Pass@123</strong>.</p>
            <div className="flex gap-3">
              <button onClick={() => setIsResetConfirm(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => handleResetPassword(isResetConfirm)} disabled={loading} className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm">
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-green-50 text-green-600 border-green-100",
    yellow: "bg-yellow-50 text-yellow-600 border-yellow-100",
    red: "bg-red-50 text-red-600 border-red-100",
  };
  return (
    <div className={`p-4 rounded-xl border ${colorClasses[color]}`}>
      <div className="flex items-center gap-3">
        <div className="opacity-80">{icon}</div>
        <div>
          <p className="text-xs font-medium opacity-80">{label}</p>
          <p className="text-lg font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}
