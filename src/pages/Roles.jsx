import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Check,
  Eye,
  Users,
  Lock,
  Unlock,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  clearError,
  clearMessage,
} from "../store/slices/roleSlice";

// Display labels for the module keys returned by the backend
const MODULE_LABELS = {
  dashboard: "Dashboard",
  users: "User Management",
  vendors: "Vendor Management",
  drivers: "Driver Management",
  materials: "Material Management",
  categories: "Categories",
  subCategories: "Sub Categories",
  bookings: "Bookings",
  transactions: "Transactions",
  staff: "Staff Management",
  roles: "Roles & Permissions",
  cms: "CMS",
  notifications: "Notifications",
  banners: "Banners",
  reports: "Reports",
  settings: "Settings",
};

const buildEmptyPerms = (modules, actions) => {
  const perms = {};
  modules.forEach((m) => {
    perms[m] = {};
    actions.forEach((a) => {
      perms[m][a] = false;
    });
  });
  return perms;
};

export default function Roles() {
  const dispatch = useDispatch();
  const { roles, meta, loading, error, message } = useSelector(
    (s) => s.roles,
  );

  const modules = meta.modules?.length ? meta.modules : Object.keys(MODULE_LABELS);
  const actions = meta.actions?.length ? meta.actions : ["view", "create", "edit", "delete", "export"];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteConfirm, setIsDeleteConfirm] = useState(null);
  const [editingRole, setEditingRole] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "active",
    permissions: {},
  });

  useEffect(() => {
    dispatch(getRoles());
  }, [dispatch]);

  useEffect(() => {
    if (message) { toast.success(message); dispatch(clearMessage()); }
    if (error) { toast.error(error); dispatch(clearError()); }
  }, [message, error, dispatch]);

  const totalPermissions = modules.length * actions.length;

  const openAddModal = () => {
    setEditingRole(null);
    setFormData({
      name: "",
      description: "",
      status: "active",
      permissions: buildEmptyPerms(modules, actions),
    });
    setIsModalOpen(true);
  };

  const openEditModal = (role) => {
    setEditingRole(role);
    // ensure every module/action is present
    const merged = buildEmptyPerms(modules, actions);
    Object.entries(role.permissions || {}).forEach(([m, perms]) => {
      if (!merged[m]) merged[m] = {};
      Object.entries(perms || {}).forEach(([a, v]) => {
        merged[m][a] = !!v;
      });
    });
    setFormData({
      name: role.name,
      description: role.description || "",
      status: role.status,
      permissions: merged,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRole(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) { toast.error("Role name is required"); return; }

    if (editingRole) {
      await dispatch(updateRole({ id: editingRole._id, data: formData }));
    } else {
      await dispatch(createRole(formData));
    }
    closeModal();
  };

  const handleDelete = async (id) => {
    await dispatch(deleteRole(id));
    setIsDeleteConfirm(null);
  };

  const togglePermission = (moduleKey, permKey) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [moduleKey]: {
          ...prev.permissions[moduleKey],
          [permKey]: !prev.permissions[moduleKey]?.[permKey],
        },
      },
    }));
  };

  const toggleModuleAll = (moduleKey) => {
    const allOn = actions.every((p) => formData.permissions[moduleKey]?.[p]);
    const newPerms = { ...formData.permissions };
    newPerms[moduleKey] = {};
    actions.forEach((p) => { newPerms[moduleKey][p] = !allOn; });
    setFormData({ ...formData, permissions: newPerms });
  };

  const toggleAllPermissions = (grant) => {
    const newPerms = {};
    modules.forEach((m) => {
      newPerms[m] = {};
      actions.forEach((p) => { newPerms[m][p] = grant; });
    });
    setFormData({ ...formData, permissions: newPerms });
  };

  const countPermissions = (perms) => {
    let count = 0;
    if (!perms) return 0;
    Object.values(perms).forEach((mod) => {
      Object.values(mod || {}).forEach((v) => { if (v) count++; });
    });
    return count;
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
          <p className="text-sm text-gray-500">Define roles and assign granular permissions per module</p>
        </div>
        <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Create Role
        </button>
      </div>

      {loading && roles.length === 0 && (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      )}

      {/* ROLES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role) => {
          const permCount = countPermissions(role.permissions);
          return (
            <div key={role._id} className="bg-white border rounded-xl p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${role.isSystem ? "bg-purple-100 text-purple-600" : "bg-orange-100 text-orange-600"}`}>
                    {role.isSystem ? <ShieldAlert size={20} /> : <Shield size={20} />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{role.name}</h3>
                    <p className="text-xs text-gray-500">{role.roleId}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${role.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {role.status}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{role.description || "—"}</p>

              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span className="flex items-center gap-1"><Users size={12} /> {role.staffCount || 0} staff</span>
                <span className="flex items-center gap-1"><Lock size={12} /> {permCount}/{totalPermissions} permissions</span>
              </div>

              <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4">
                <div className="bg-orange-500 h-1.5 rounded-full transition-all" style={{ width: `${totalPermissions ? (permCount / totalPermissions) * 100 : 0}%` }} />
              </div>

              <div className="flex gap-2">
                <button onClick={() => { setSelectedRole(role); setIsViewOpen(true); }} className="flex-1 btn-secondary text-xs py-2 flex items-center justify-center gap-1"><Eye size={14} /> View</button>
                <button onClick={() => openEditModal(role)} className="flex-1 btn-secondary text-xs py-2 flex items-center justify-center gap-1"><Edit2 size={14} /> Edit</button>
                {!role.isSystem && (
                  <button onClick={() => setIsDeleteConfirm(role._id)} className="btn-secondary text-xs py-2 px-2 text-red-500 hover:bg-red-50" title="Delete"><Trash2 size={14} /></button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE/EDIT ROLE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold">{editingRole ? "Edit Role" : "Create Role"}</h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    placeholder="e.g. Sales Manager"
                    disabled={editingRole?.isSystem}
                    required
                  />
                  {editingRole?.isSystem && (
                    <p className="text-xs text-gray-400 mt-1">System role names cannot be renamed.</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="input-field">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input-field" rows={2} placeholder="Brief description of this role" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">Permissions</h3>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => toggleAllPermissions(true)} className="text-xs px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 flex items-center gap-1">
                      <Unlock size={12} /> Grant All
                    </button>
                    <button type="button" onClick={() => toggleAllPermissions(false)} className="text-xs px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 flex items-center gap-1">
                      <Lock size={12} /> Revoke All
                    </button>
                  </div>
                </div>

                <div className="border rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-3 text-left text-sm font-medium text-gray-600 w-1/3">Module</th>
                        {actions.map((p) => (
                          <th key={p} className="p-3 text-center text-sm font-medium text-gray-600 capitalize">{p}</th>
                        ))}
                        <th className="p-3 text-center text-sm font-medium text-gray-600">All</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modules.map((mod) => {
                        const allOn = actions.every((p) => formData.permissions[mod]?.[p]);
                        return (
                          <tr key={mod} className="border-t hover:bg-gray-50">
                            <td className="p-3 text-sm font-medium text-gray-800">{MODULE_LABELS[mod] || mod}</td>
                            {actions.map((p) => (
                              <td key={p} className="p-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => togglePermission(mod, p)}
                                  className={`w-7 h-7 rounded-md flex items-center justify-center transition ${
                                    formData.permissions[mod]?.[p]
                                      ? "bg-green-500 text-white"
                                      : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                                  }`}
                                >
                                  <Check size={14} />
                                </button>
                              </td>
                            ))}
                            <td className="p-3 text-center">
                              <button
                                type="button"
                                onClick={() => toggleModuleAll(mod)}
                                className={`w-7 h-7 rounded-md flex items-center justify-center mx-auto transition ${
                                  allOn ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                                }`}
                              >
                                <ShieldCheck size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  {countPermissions(formData.permissions)} of {totalPermissions} permissions granted
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button type="button" onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1">
                  {loading ? "Saving..." : editingRole ? "Update Role" : "Create Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW ROLE MODAL */}
      {isViewOpen && selectedRole && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedRole.isSystem ? "bg-purple-100 text-purple-600" : "bg-orange-100 text-orange-600"}`}>
                  {selectedRole.isSystem ? <ShieldAlert size={20} /> : <Shield size={20} />}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{selectedRole.name}</h2>
                  <p className="text-sm text-gray-500">{selectedRole.description || "—"}</p>
                </div>
              </div>
              <button onClick={() => { setIsViewOpen(false); setSelectedRole(null); }} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap gap-4 mb-6 text-sm">
                <span className="flex items-center gap-1 text-gray-600"><Users size={14} /> {selectedRole.staffCount || 0} staff assigned</span>
                <span className="flex items-center gap-1 text-gray-600"><Lock size={14} /> {countPermissions(selectedRole.permissions)}/{totalPermissions} permissions</span>
                <span className="flex items-center gap-1 text-gray-600">Created: {formatDate(selectedRole.createdAt)}</span>
                {selectedRole.isSystem && <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">System Role</span>}
              </div>

              <div className="border rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-3 text-left text-sm font-medium text-gray-600">Module</th>
                      {actions.map((p) => (
                        <th key={p} className="p-3 text-center text-sm font-medium text-gray-600 capitalize">{p}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {modules.map((mod) => (
                      <tr key={mod} className="border-t">
                        <td className="p-3 text-sm font-medium text-gray-800">{MODULE_LABELS[mod] || mod}</td>
                        {actions.map((p) => (
                          <td key={p} className="p-3 text-center">
                            {selectedRole.permissions?.[mod]?.[p] ? (
                              <span className="inline-flex w-6 h-6 bg-green-100 text-green-600 rounded-full items-center justify-center"><Check size={14} /></span>
                            ) : (
                              <span className="inline-flex w-6 h-6 bg-gray-50 text-gray-300 rounded-full items-center justify-center"><X size={14} /></span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <button onClick={() => { setIsViewOpen(false); openEditModal(selectedRole); }} className="btn-primary flex items-center gap-2"><Edit2 size={16} /> Edit Role</button>
                <button onClick={() => { setIsViewOpen(false); setSelectedRole(null); }} className="btn-secondary">Close</button>
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
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Role?</h3>
            <p className="text-sm text-gray-500 mb-6">This role will be permanently deleted. Staff assigned to this role will need reassignment.</p>
            <div className="flex gap-3">
              <button onClick={() => setIsDeleteConfirm(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => handleDelete(isDeleteConfirm)} disabled={loading} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm">
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
