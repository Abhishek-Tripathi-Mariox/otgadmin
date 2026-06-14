import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Edit2,
  Trash2,
  RotateCcw,
  X,
  Trash,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  MapPin,
  User as UserIcon,
  Eye,
  Shield,
  ShieldOff,
  CheckCircle,
  XCircle,
  Calendar,
  Smartphone,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getUsers,
  getDeletedUsers,
  getUser,
  updateUser,
  deleteUser,
  restoreUser,
  permanentDeleteUser,
  toggleUserStatus,
  clearMessage,
  clearError,
  clearUser,
} from "../store/slices/userSlice";

export default function Users() {
  const dispatch = useDispatch();
  const {
    users,
    deletedUsers,
    user,
    stats,
    loading,
    error,
    message,
    pagination,
    deletedPagination,
  } = useSelector((state) => state.users);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeletedModalOpen, setIsDeletedModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
    },
    status: "active",
  });

  // Filter states
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    isVerified: "",
    city: "",
    state: "",
    fromDate: "",
    toDate: "",
  });

  // Fetch users with filters
  useEffect(() => {
    const params = { page: 1, limit: 20 };
    if (filters.search) params.search = filters.search;
    if (filters.status) params.status = filters.status;
    if (filters.isVerified) params.isVerified = filters.isVerified;
    if (filters.city) params.city = filters.city;
    if (filters.state) params.state = filters.state;
    if (filters.fromDate) params.fromDate = filters.fromDate;
    if (filters.toDate) params.toDate = filters.toDate;
    dispatch(getUsers(params));
  }, [dispatch, filters]);

  // Handle success/error messages
  useEffect(() => {
    if (message) {
      toast.success(message);
      dispatch(clearMessage());
    }
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [message, error, dispatch]);

  const openEditModal = (userData) => {
    setSelectedUser(userData);
    setFormData({
      name: userData.name || "",
      email: userData.email || "",
      address: {
        street: userData.address?.street || "",
        city: userData.address?.city || "",
        state: userData.address?.state || "",
        pincode: userData.address?.pincode || "",
      },
      status: userData.status || "active",
    });
    setIsEditModalOpen(true);
  };

  const openDetailModal = async (userData) => {
    setSelectedUser(userData);
    await dispatch(getUser(userData._id));
    setIsDetailModalOpen(true);
  };

  const closeModals = () => {
    setIsEditModalOpen(false);
    setIsDetailModalOpen(false);
    setSelectedUser(null);
    dispatch(clearUser());
    setFormData({
      name: "",
      email: "",
      address: {
        street: "",
        city: "",
        state: "",
        pincode: "",
      },
      status: "active",
    });
  };

  const openDeletedModal = () => {
    dispatch(getDeletedUsers());
    setIsDeletedModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error("Name is required");
      return;
    }

    const payload = {
      name: formData.name,
      email: formData.email || undefined,
      address: formData.address,
      status: formData.status,
    };

    await dispatch(updateUser({ id: selectedUser._id, data: payload }));
    closeModals();
    dispatch(getUsers({ page: 1, limit: 20 }));
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      await dispatch(deleteUser(id));
    }
  };

  const handleRestore = async (id) => {
    await dispatch(restoreUser(id));
    dispatch(getDeletedUsers());
  };

  const handlePermanentDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to permanently delete this user? This action cannot be undone.",
      )
    ) {
      await dispatch(permanentDeleteUser(id));
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    await dispatch(toggleUserStatus({ id, status: newStatus }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "",
      isVerified: "",
      city: "",
      state: "",
      fromDate: "",
      toDate: "",
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: "bg-green-50 text-green-600 border-green-200",
      inactive: "bg-yellow-50 text-yellow-600 border-yellow-200",
      blocked: "bg-red-50 text-red-600 border-red-200",
    };
    return statusConfig[status] || statusConfig.inactive;
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500">
            Manage app users (Registered from mobile app)
          </p>
        </div>

        <div className="flex gap-3">
          <button onClick={openDeletedModal} className="btn-secondary">
            <Trash size={18} /> Deleted
          </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatCard
          label="Total Users"
          value={stats?.total || 0}
          icon={<UserIcon size={20} />}
          color="blue"
        />
        <StatCard
          label="Active"
          value={stats?.active || 0}
          icon={<CheckCircle size={20} />}
          color="green"
        />
        <StatCard
          label="Inactive"
          value={stats?.inactive || 0}
          icon={<XCircle size={20} />}
          color="yellow"
        />
        <StatCard
          label="Blocked"
          value={stats?.blocked || 0}
          icon={<ShieldOff size={20} />}
          color="red"
        />
        <StatCard
          label="Verified"
          value={stats?.verified || 0}
          icon={<Shield size={20} />}
          color="purple"
        />
      </div>

      {/* FILTERS */}
      <div className="bg-white border rounded-xl p-4">
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center gap-2 text-gray-700 font-medium"
        >
          <Filter size={18} />
          Filters
          {isFilterOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {isFilterOpen && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search by name, mobile, email..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="input-field pl-10"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="input-field"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="blocked">Blocked</option>
            </select>

            {/* Verified Filter */}
            <select
              value={filters.isVerified}
              onChange={(e) =>
                setFilters({ ...filters, isVerified: e.target.value })
              }
              className="input-field"
            >
              <option value="">All Verification</option>
              <option value="true">Verified</option>
              <option value="false">Not Verified</option>
            </select>

            {/* City Filter */}
            <input
              type="text"
              placeholder="Filter by city"
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              className="input-field"
            />

            {/* State Filter */}
            <input
              type="text"
              placeholder="Filter by state"
              value={filters.state}
              onChange={(e) =>
                setFilters({ ...filters, state: e.target.value })
              }
              className="input-field"
            />

            {/* Date Range */}
            <div className="flex gap-2">
              <input
                type="date"
                value={filters.fromDate}
                onChange={(e) =>
                  setFilters({ ...filters, fromDate: e.target.value })
                }
                className="input-field"
                placeholder="From Date"
              />
            </div>
            <div className="flex gap-2">
              <input
                type="date"
                value={filters.toDate}
                onChange={(e) =>
                  setFilters({ ...filters, toDate: e.target.value })
                }
                className="input-field"
                placeholder="To Date"
              />
            </div>

            {/* Clear Filters */}
            <button
              onClick={clearFilters}
              className="btn-secondary flex items-center gap-2"
            >
              <X size={16} /> Clear
            </button>
          </div>
        )}
      </div>

      {/* USERS TABLE */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-sm text-gray-600">
              <tr>
                <th className="p-4 text-left">User</th>
                <th className="p-4 text-left">Mobile</th>
                <th className="p-4 text-left">Location</th>
                <th className="p-4 text-left">Verified</th>
                <th className="p-4 text-left">Joined</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="border-t hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          {u.profileImage ? (
                            <img
                              src={u.profileImage}
                              alt={u.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <UserIcon size={20} className="text-orange-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {u.name || "N/A"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {u.email || "No email"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Phone size={14} />
                        {u.mobile}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="text-sm text-gray-600">
                        {u.address?.city && u.address?.state ? (
                          <div className="flex items-center gap-1">
                            <MapPin size={14} />
                            {u.address.city}, {u.address.state}
                          </div>
                        ) : (
                          <span className="text-gray-400">Not set</span>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      {u.isVerified ? (
                        <span className="flex items-center gap-1 text-green-600 text-sm">
                          <CheckCircle size={16} /> Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-gray-400 text-sm">
                          <XCircle size={16} /> Pending
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar size={14} />
                        {formatDate(u.createdAt)}
                      </div>
                    </td>

                    <td className="p-4">
                      <select
                        value={u.status}
                        onChange={(e) =>
                          handleStatusChange(u._id, e.target.value)
                        }
                        className={`px-2 py-1 rounded-lg text-xs border ${getStatusBadge(
                          u.status,
                        )} cursor-pointer`}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="blocked">Blocked</option>
                      </select>
                    </td>

                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openDetailModal(u)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg"
                          title="Edit User"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(u._id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Showing {users.length} of {pagination.total} users
            </p>
            <div className="flex gap-2">
              {Array.from({ length: pagination.totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() =>
                    dispatch(
                      getUsers({
                        ...filters,
                        page: i + 1,
                        limit: pagination.limit,
                      }),
                    )
                  }
                  className={`px-3 py-1 rounded ${
                    pagination.page === i + 1
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold">Edit User</h2>
              <button
                onClick={closeModals}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Mobile (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number (Cannot be changed)
                </label>
                <input
                  type="text"
                  value={selectedUser?.mobile || ""}
                  disabled
                  className="input-field bg-gray-100 cursor-not-allowed"
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="input-field"
                  placeholder="Enter name"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="input-field"
                  placeholder="Enter email"
                />
              </div>

              {/* Address */}
              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-900 mb-3">Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={formData.address.street}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: {
                            ...formData.address,
                            street: e.target.value,
                          },
                        })
                      }
                      className="input-field"
                      placeholder="Enter street address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.address.city}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: {
                            ...formData.address,
                            city: e.target.value,
                          },
                        })
                      }
                      className="input-field"
                      placeholder="Enter city"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      value={formData.address.state}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: {
                            ...formData.address,
                            state: e.target.value,
                          },
                        })
                      }
                      className="input-field"
                      placeholder="Enter state"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode
                    </label>
                    <input
                      type="text"
                      value={formData.address.pincode}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: {
                            ...formData.address,
                            pincode: e.target.value,
                          },
                        })
                      }
                      className="input-field"
                      placeholder="Enter pincode"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="input-field"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="blocked">Blocked</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModals}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {isDetailModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold">User Details</h2>
              <button
                onClick={closeModals}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {/* Profile Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <UserIcon size={36} className="text-orange-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {user?.name || "N/A"}
                  </h3>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1 text-gray-600">
                      <Phone size={14} /> {user?.mobile}
                    </span>
                    {user?.email && (
                      <span className="flex items-center gap-1 text-gray-600">
                        <Mail size={14} /> {user?.email}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${getStatusBadge(
                        user?.status,
                      )}`}
                    >
                      {user?.status}
                    </span>
                    {user?.isVerified && (
                      <span className="px-3 py-1 rounded-full text-xs bg-green-50 text-green-600 flex items-center gap-1">
                        <CheckCircle size={12} /> Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Address Section */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <MapPin size={16} /> Address
                  </h4>
                  {user?.address?.street ||
                  user?.address?.city ||
                  user?.address?.state ? (
                    <div className="text-sm text-gray-600 space-y-1">
                      {user?.address?.street && <p>{user.address.street}</p>}
                      <p>
                        {user?.address?.city}
                        {user?.address?.city && user?.address?.state && ", "}
                        {user?.address?.state}
                        {user?.address?.pincode && ` - ${user.address.pincode}`}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No address set</p>
                  )}
                </div>

                {/* Device Info Section */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Smartphone size={16} /> Device Info
                  </h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      <span className="text-gray-500">Device Type:</span>{" "}
                      {user?.deviceInfo?.deviceType || "N/A"}
                    </p>
                    <p>
                      <span className="text-gray-500">Last Login:</span>{" "}
                      {formatDateTime(user?.deviceInfo?.lastLoginAt)}
                    </p>
                  </div>
                </div>

                {/* Account Info Section */}
                <div className="border rounded-lg p-4 md:col-span-2">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar size={16} /> Account Information
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Created At</p>
                      <p className="text-gray-900">
                        {formatDateTime(user?.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Updated At</p>
                      <p className="text-gray-900">
                        {formatDateTime(user?.updatedAt)}
                      </p>
                    </div>
                    {user?.updatedBy && (
                      <div>
                        <p className="text-gray-500">Updated By</p>
                        <p className="text-gray-900">
                          {user.updatedBy.name || user.updatedBy.email}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-gray-500">Verification Status</p>
                      <p className="text-gray-900">
                        {user?.isVerified ? "Verified" : "Pending"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  onClick={() => {
                    closeModals();
                    openEditModal(user);
                  }}
                  className="btn-primary flex-1"
                >
                  <Edit2 size={16} /> Edit User
                </button>
                <button onClick={closeModals} className="btn-secondary flex-1">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETED USERS MODAL */}
      {isDeletedModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-red-600">Deleted Users</h2>
              <button
                onClick={() => setIsDeletedModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {deletedUsers.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Trash size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No deleted users found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {deletedUsers.map((u) => (
                    <div
                      key={u._id}
                      className="border rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <UserIcon size={20} className="text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {u.name || "N/A"}
                          </p>
                          <p className="text-sm text-gray-500">{u.mobile}</p>
                          <p className="text-xs text-red-500">
                            Deleted on: {formatDate(u.deletedAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRestore(u._id)}
                          className="btn-secondary flex items-center gap-2 text-green-600 border-green-200 hover:bg-green-50"
                        >
                          <RotateCcw size={16} /> Restore
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(u._id)}
                          className="btn-secondary flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Trash2 size={16} /> Delete Forever
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* STAT CARD COMPONENT */
function StatCard({ label, value, icon, color }) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-green-50 text-green-600 border-green-100",
    yellow: "bg-yellow-50 text-yellow-600 border-yellow-100",
    red: "bg-red-50 text-red-600 border-red-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
  };

  return (
    <div className={`p-4 rounded-xl border ${colorClasses[color]}`}>
      <div className="flex items-center gap-3">
        <div className="opacity-80">{icon}</div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm opacity-80">{label}</p>
        </div>
      </div>
    </div>
  );
}
