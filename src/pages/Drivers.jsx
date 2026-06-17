import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import usePolling from "../hooks/usePolling";
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
  ShieldOff,
  CheckCircle,
  XCircle,
  Calendar,
  Truck,
  FileText,
  Landmark,
  ExternalLink,
  Clock,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getDrivers,
  getDeletedDrivers,
  getDriver,
  updateDriver,
  deleteDriver,
  restoreDriver,
  permanentDeleteDriver,
  toggleDriverStatus,
  approveDriver,
  rejectDriver,
  approveDocument,
  rejectDocument,
  approveVehicleDocument,
  rejectVehicleDocument,
  clearMessage,
  clearError,
  clearDriver,
} from "../store/slices/driverSlice";

// Driver-owned doc — lives on driver.documents
const DRIVER_DOCUMENT_TYPES = [
  { key: "drivingLicense", label: "Driving License" },
];

// Vehicle-owned docs — live on each vehicle's documents subdoc
const VEHICLE_DOCUMENT_TYPES = [
  { key: "rcBook", label: "RC Book" },
  { key: "insurance", label: "Insurance" },
  { key: "pollutionCertificate", label: "Pollution Certificate" },
];

export default function Drivers() {
  const dispatch = useDispatch();
  const {
    drivers,
    deletedDrivers,
    driver,
    stats,
    loading,
    error,
    message,
    pagination,
  } = useSelector((state) => state.drivers);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeletedModalOpen, setIsDeletedModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [rejectionTarget, setRejectionTarget] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const [filters, setFilters] = useState({
    search: "",
    approvalStatus: "",
    status: "",
    city: "",
    state: "",
    fromDate: "",
    toDate: "",
  });

  const fetchDrivers = useCallback(() => {
    const params = { page: 1, limit: 20 };
    if (filters.search) params.search = filters.search;
    if (filters.approvalStatus) params.approvalStatus = filters.approvalStatus;
    if (filters.status) params.status = filters.status;
    if (filters.city) params.city = filters.city;
    if (filters.state) params.state = filters.state;
    if (filters.fromDate) params.fromDate = filters.fromDate;
    if (filters.toDate) params.toDate = filters.toDate;
    dispatch(getDrivers(params));
  }, [dispatch, filters]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  // Keep the list fresh so newly registered drivers appear (at the top) in
  // near real time without a manual reload.
  usePolling(fetchDrivers);

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

  const openDetailModal = async (d) => {
    setSelectedDriver(d);
    await dispatch(getDriver(d._id));
    setIsDetailModalOpen(true);
  };

  const closeModals = () => {
    setIsDetailModalOpen(false);
    setSelectedDriver(null);
    dispatch(clearDriver());
  };

  const openDeletedModal = () => {
    dispatch(getDeletedDrivers());
    setIsDeletedModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this driver?")) {
      await dispatch(deleteDriver(id));
    }
  };

  const handleRestore = async (id) => {
    await dispatch(restoreDriver(id));
    dispatch(getDeletedDrivers());
  };

  const handlePermanentDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to permanently delete this driver? This action cannot be undone.",
      )
    ) {
      await dispatch(permanentDeleteDriver(id));
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    await dispatch(toggleDriverStatus({ id, status: newStatus }));
  };

  const handleApprove = async (id) => {
    if (window.confirm("Approve this driver? They will be able to log in.")) {
      await dispatch(approveDriver(id));
    }
  };

  const openRejectModal = (target) => {
    setRejectionTarget(target);
    setRejectionReason("");
    setIsRejectModalOpen(true);
  };

  const submitRejection = async () => {
    if (!rejectionTarget) return;
    if (rejectionTarget.kind === "driver") {
      await dispatch(
        rejectDriver({ id: rejectionTarget.id, reason: rejectionReason }),
      );
    } else if (rejectionTarget.kind === "document") {
      await dispatch(
        rejectDocument({
          id: rejectionTarget.id,
          docType: rejectionTarget.docType,
          reason: rejectionReason,
        }),
      );
    } else if (rejectionTarget.kind === "vehicleDocument") {
      await dispatch(
        rejectVehicleDocument({
          id: rejectionTarget.id,
          vehicleId: rejectionTarget.vehicleId,
          docType: rejectionTarget.docType,
          reason: rejectionReason,
        }),
      );
    }
    setIsRejectModalOpen(false);
    setRejectionTarget(null);
    setRejectionReason("");
  };

  const handleApproveDoc = async (id, docType) => {
    await dispatch(approveDocument({ id, docType }));
  };

  const handleApproveVehicleDoc = async (id, vehicleId, docType) => {
    await dispatch(approveVehicleDocument({ id, vehicleId, docType }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      approvalStatus: "",
      status: "",
      city: "",
      state: "",
      fromDate: "",
      toDate: "",
    });
  };

  const formatDate = (d) => {
    if (!d) return "N/A";
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (d) => {
    if (!d) return "N/A";
    return new Date(d).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const map = {
      active: "bg-green-50 text-green-600 border-green-200",
      inactive: "bg-yellow-50 text-yellow-600 border-yellow-200",
      blocked: "bg-red-50 text-red-600 border-red-200",
    };
    return map[status] || map.inactive;
  };

  const getApprovalBadge = (status) => {
    const map = {
      pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
      approved: "bg-green-50 text-green-700 border-green-200",
      rejected: "bg-red-50 text-red-700 border-red-200",
    };
    return map[status] || map.pending;
  };

  const getDocBadge = (status) => {
    const map = {
      pending: "bg-gray-100 text-gray-600",
      approved: "bg-green-50 text-green-700",
      rejected: "bg-red-50 text-red-700",
    };
    return map[status] || map.pending;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Drivers</h1>
          <p className="text-sm text-gray-500">
            Manage onboarded drivers and verify their documents
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={openDeletedModal} className="btn-secondary">
            <Trash size={18} /> Deleted
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <StatCard
          label="Total"
          value={stats?.total || 0}
          icon={<UserIcon size={20} />}
          color="blue"
        />
        <StatCard
          label="Pending"
          value={stats?.pending || 0}
          icon={<Clock size={20} />}
          color="yellow"
        />
        <StatCard
          label="Approved"
          value={stats?.approved || 0}
          icon={<CheckCircle size={20} />}
          color="green"
        />
        <StatCard
          label="Rejected"
          value={stats?.rejected || 0}
          icon={<XCircle size={20} />}
          color="red"
        />
        <StatCard
          label="Active"
          value={stats?.active || 0}
          icon={<Truck size={20} />}
          color="purple"
        />
        <StatCard
          label="Blocked"
          value={stats?.blocked || 0}
          icon={<ShieldOff size={20} />}
          color="red"
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
            <div className="relative lg:col-span-2">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search by name, mobile, email, any vehicle reg…"
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="input-field pl-10"
              />
            </div>

            <select
              value={filters.approvalStatus}
              onChange={(e) =>
                setFilters({ ...filters, approvalStatus: e.target.value })
              }
              className="input-field"
            >
              <option value="">All Approval States</option>
              <option value="pending">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

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

            <input
              type="text"
              placeholder="Filter by city"
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              className="input-field"
            />
            <input
              type="text"
              placeholder="Filter by state"
              value={filters.state}
              onChange={(e) =>
                setFilters({ ...filters, state: e.target.value })
              }
              className="input-field"
            />

            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) =>
                setFilters({ ...filters, fromDate: e.target.value })
              }
              className="input-field"
            />
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) =>
                setFilters({ ...filters, toDate: e.target.value })
              }
              className="input-field"
            />

            <button
              onClick={clearFilters}
              className="btn-secondary flex items-center gap-2"
            >
              <X size={16} /> Clear
            </button>
          </div>
        )}
      </div>

      {/* TABLE */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-sm text-gray-600">
              <tr>
                <th className="p-4 text-left">Owner / Driver</th>
                <th className="p-4 text-left">Mobile</th>
                <th className="p-4 text-left">Vehicle</th>
                <th className="p-4 text-left">Approval</th>
                <th className="p-4 text-left">Joined</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    Loading drivers...
                  </td>
                </tr>
              ) : drivers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    No drivers found
                  </td>
                </tr>
              ) : (
                drivers.map((d) => (
                  <tr key={d._id} className="border-t hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          {d.profileImage ? (
                            <img
                              src={d.profileImage}
                              alt={d.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <UserIcon size={20} className="text-orange-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {d.owner?.name || d.name || (
                              <span className="text-gray-400">Pending</span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500">
                            {d.owner?.name
                              ? `Owner${d.name ? ` · Driver: ${d.name}` : ""}`
                              : d.email || "Driver not yet registered"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-gray-700 text-sm">
                        <div className="flex items-center gap-2">
                          <Phone size={14} />
                          {d.owner?.contact || d.mobile}
                        </div>
                        {d.owner?.contact &&
                          d.owner.contact !== d.mobile && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              Login: {d.mobile}
                            </p>
                          )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-600">
                        {d.vehicles && d.vehicles.length > 0 ? (
                          <>
                            <p className="font-medium text-gray-800">
                              {d.vehicles[0].brand} {d.vehicles[0].model}
                            </p>
                            <p className="text-xs text-gray-500">
                              {d.vehicles[0].registrationNo || "—"}
                              {d.vehicles.length > 1 && (
                                <span className="ml-1 text-orange-600">
                                  +{d.vehicles.length - 1} more
                                </span>
                              )}
                            </p>
                          </>
                        ) : (
                          <span className="text-gray-400">Not provided</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-lg text-xs border capitalize ${getApprovalBadge(
                          d.approvalStatus,
                        )}`}
                      >
                        {d.approvalStatus || "pending"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar size={14} />
                        {formatDate(d.createdAt)}
                      </div>
                    </td>
                    <td className="p-4">
                      <select
                        value={d.status}
                        onChange={(e) =>
                          handleStatusChange(d._id, e.target.value)
                        }
                        className={`px-2 py-1 rounded-lg text-xs border ${getStatusBadge(
                          d.status,
                        )} cursor-pointer`}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="blocked">Blocked</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        {d.approvalStatus === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(d._id)}
                              className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg"
                              title="Approve"
                            >
                              <ThumbsUp size={16} />
                            </button>
                            <button
                              onClick={() =>
                                openRejectModal({ kind: "driver", id: d._id })
                              }
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                              title="Reject"
                            >
                              <ThumbsDown size={16} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => openDetailModal(d)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(d._id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete"
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

        {pagination.totalPages > 1 && (
          <div className="p-4 border-t flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Showing {drivers.length} of {pagination.total} drivers
            </p>
            <div className="flex gap-2">
              {Array.from({ length: pagination.totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() =>
                    dispatch(
                      getDrivers({
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

      {/* DETAIL MODAL */}
      {isDetailModalOpen && (selectedDriver || driver) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[92vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold">Driver Details</h2>
              <button
                onClick={closeModals}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
                    {driver?.profileImage ? (
                      <img
                        src={driver.profileImage}
                        alt={driver.name}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <UserIcon size={36} className="text-orange-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {driver?.owner?.name ||
                        driver?.name || (
                          <span className="text-gray-400">
                            Owner not yet registered
                          </span>
                        )}
                    </h3>
                    {driver?.name && driver?.owner?.name && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        Driver: {driver.name}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Phone size={14} />
                        {driver?.owner?.contact || driver?.mobile}
                      </span>
                      {driver?.owner?.contact &&
                        driver.owner.contact !== driver.mobile && (
                          <span className="text-xs text-gray-400">
                            Login: {driver.mobile}
                          </span>
                        )}
                      {driver?.email && (
                        <span className="flex items-center gap-1">
                          <Mail size={14} /> {driver.email}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs border capitalize ${getApprovalBadge(
                          driver?.approvalStatus,
                        )}`}
                      >
                        {driver?.approvalStatus}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs border capitalize ${getStatusBadge(
                          driver?.status,
                        )}`}
                      >
                        {driver?.status}
                      </span>
                    </div>
                  </div>
                </div>

                {driver?.approvalStatus === "pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(driver._id)}
                      className="btn-primary flex items-center gap-2"
                    >
                      <ThumbsUp size={16} /> Approve
                    </button>
                    <button
                      onClick={() =>
                        openRejectModal({ kind: "driver", id: driver._id })
                      }
                      className="btn-secondary flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <ThumbsDown size={16} /> Reject
                    </button>
                  </div>
                )}
              </div>

              {driver?.approvalStatus === "rejected" &&
                driver?.rejectionReason && (
                  <div className="border-l-4 border-red-400 bg-red-50 p-3 rounded">
                    <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">
                      Rejection Reason
                    </p>
                    <p className="text-sm text-red-700 mt-1">
                      {driver.rejectionReason}
                    </p>
                  </div>
                )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* PERSONAL */}
                <Section title="Personal" icon={<UserIcon size={16} />}>
                  <Field label="Full Name" value={driver?.name} />
                  <Field label="Email" value={driver?.email} />
                  <Field
                    label="Date of Birth"
                    value={
                      driver?.dateOfBirth
                        ? formatDate(driver.dateOfBirth)
                        : null
                    }
                  />
                  <Field
                    label="Address"
                    value={
                      driver?.address?.full ||
                      [
                        driver?.address?.street,
                        driver?.address?.city,
                        driver?.address?.state,
                        driver?.address?.pincode,
                      ]
                        .filter(Boolean)
                        .join(", ") ||
                      null
                    }
                  />
                </Section>

                {/* VEHICLES (driver may have multiple) */}
                <div className="border rounded-lg p-4 md:col-span-2">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Truck size={16} /> Vehicles
                    {driver?.vehicles && (
                      <span className="text-xs text-gray-500 font-normal">
                        ({driver.vehicles.length})
                      </span>
                    )}
                  </h4>
                  {!driver?.vehicles || driver.vehicles.length === 0 ? (
                    <p className="text-sm text-gray-400">
                      No vehicles registered
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {driver.vehicles.map((v) => (
                        <div
                          key={v._id}
                          className="border rounded-lg p-3 bg-gray-50"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-semibold text-gray-800 text-sm">
                              {v.brand || "Vehicle"}{" "}
                              {v.model ? `· ${v.model}` : ""}
                            </p>
                            {v.type && (
                              <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-800">
                                {v.type} Wheeler
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <Field
                              label="Reg No"
                              value={v.registrationNo}
                            />
                            <Field label="Color" value={v.color} />
                            <Field label="Year" value={v.year} />
                            <Field
                              label="Capacity"
                              value={v.liftingCapacity}
                            />
                            <Field
                              label="Insurance No"
                              value={v.insuranceNo}
                            />
                            <Field
                              label="Insurance Expiry"
                              value={
                                v.insuranceExpiry
                                  ? formatDate(v.insuranceExpiry)
                                  : null
                              }
                            />
                          </div>

                          {/* Per-vehicle documents (RC / insurance / pollution) */}
                          <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                              Vehicle Documents
                            </p>
                            {VEHICLE_DOCUMENT_TYPES.map(({ key, label }) => {
                              const doc = v.documents?.[key];
                              const status = doc?.status || "pending";
                              const uploaded = !!doc?.url;
                              return (
                                <div
                                  key={key}
                                  className="bg-white border rounded p-2 flex flex-col gap-1.5"
                                >
                                  <div className="flex items-center justify-between">
                                    <p className="text-xs font-medium text-gray-700">
                                      {label}
                                    </p>
                                    <span
                                      className={`px-1.5 py-0.5 rounded-full text-[10px] capitalize ${getDocBadge(
                                        status,
                                      )}`}
                                    >
                                      {uploaded ? status : "not uploaded"}
                                    </span>
                                  </div>
                                  {uploaded && (
                                    <a
                                      href={doc.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                                    >
                                      <ExternalLink size={12} /> View
                                    </a>
                                  )}
                                  {status === "rejected" &&
                                    doc?.rejectionReason && (
                                      <p className="text-[11px] text-red-600">
                                        Reason: {doc.rejectionReason}
                                      </p>
                                    )}
                                  {uploaded && (
                                    <div className="flex gap-1.5 pt-0.5">
                                      <button
                                        onClick={() =>
                                          handleApproveVehicleDoc(
                                            driver._id,
                                            v._id,
                                            key,
                                          )
                                        }
                                        disabled={status === "approved"}
                                        className="text-[11px] px-2 py-0.5 rounded border border-green-200 text-green-700 hover:bg-green-50 disabled:opacity-50"
                                      >
                                        Approve
                                      </button>
                                      <button
                                        onClick={() =>
                                          openRejectModal({
                                            kind: "vehicleDocument",
                                            id: driver._id,
                                            vehicleId: v._id,
                                            docType: key,
                                          })
                                        }
                                        className="text-[11px] px-2 py-0.5 rounded border border-red-200 text-red-700 hover:bg-red-50"
                                      >
                                        Reject
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* OWNER */}
                <Section title="Owner" icon={<UserIcon size={16} />}>
                  <Field label="Owner Name" value={driver?.owner?.name} />
                  <Field
                    label="Contact Number"
                    value={driver?.owner?.contact}
                  />
                  <Field label="Address" value={driver?.owner?.address} />
                </Section>

                {/* BANK */}
                <Section title="Bank" icon={<Landmark size={16} />}>
                  <Field
                    label="Account Holder"
                    value={driver?.bank?.accountHolder}
                  />
                  <Field label="Bank Name" value={driver?.bank?.bankName} />
                  <Field
                    label="Account Number"
                    value={driver?.bank?.accountNumber}
                  />
                  <Field label="IFSC" value={driver?.bank?.ifsc} />
                  <Field label="Branch" value={driver?.bank?.branch} />
                  {driver?.bank?.passbookUrl && (
                    <a
                      href={driver.bank.passbookUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1"
                    >
                      <ExternalLink size={14} /> View Passbook/Cheque
                    </a>
                  )}
                </Section>
              </div>

              {/* DRIVER DOCUMENTS (driving license) */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <FileText size={16} /> Driver Documents
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {DRIVER_DOCUMENT_TYPES.map(({ key, label }) => {
                    const doc = driver?.documents?.[key];
                    const status = doc?.status || "pending";
                    const uploaded = !!doc?.url;
                    return (
                      <div
                        key={key}
                        className="border rounded-lg p-3 flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-800 text-sm">
                            {label}
                          </p>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs capitalize ${getDocBadge(
                              status,
                            )}`}
                          >
                            {uploaded ? status : "not uploaded"}
                          </span>
                        </div>
                        {uploaded ? (
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <ExternalLink size={14} /> View document
                          </a>
                        ) : (
                          <p className="text-xs text-gray-400">
                            Driver has not uploaded this document yet
                          </p>
                        )}
                        {status === "rejected" && doc?.rejectionReason && (
                          <p className="text-xs text-red-600">
                            Reason: {doc.rejectionReason}
                          </p>
                        )}
                        {uploaded && (
                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={() =>
                                handleApproveDoc(driver._id, key)
                              }
                              disabled={status === "approved"}
                              className="text-xs px-2 py-1 rounded border border-green-200 text-green-700 hover:bg-green-50 disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() =>
                                openRejectModal({
                                  kind: "document",
                                  id: driver._id,
                                  docType: key,
                                })
                              }
                              className="text-xs px-2 py-1 rounded border border-red-200 text-red-700 hover:bg-red-50"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* META */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar size={16} /> Account Information
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Created</p>
                    <p className="text-gray-900">
                      {formatDateTime(driver?.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Updated</p>
                    <p className="text-gray-900">
                      {formatDateTime(driver?.updatedAt)}
                    </p>
                  </div>
                  {driver?.approvedBy && (
                    <div>
                      <p className="text-gray-500">Approved By</p>
                      <p className="text-gray-900">
                        {driver.approvedBy.name || driver.approvedBy.email}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDateTime(driver?.approvedAt)}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-500">Last Login</p>
                    <p className="text-gray-900">
                      {formatDateTime(driver?.deviceInfo?.lastLoginAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REJECT REASON MODAL */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-lg font-bold">
                {rejectionTarget?.kind === "document"
                  ? "Reject Document"
                  : "Reject Driver"}
              </h2>
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="input-field"
                  rows={4}
                  placeholder={
                    rejectionTarget?.kind === "document"
                      ? "Tell the driver what's wrong so they can re-upload the correct document"
                      : "Explain why this driver is being rejected"
                  }
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsRejectModalOpen(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={submitRejection}
                  className="btn-primary flex-1 bg-red-500 hover:bg-red-600 border-red-500"
                >
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETED MODAL */}
      {isDeletedModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-red-600">
                Deleted Drivers
              </h2>
              <button
                onClick={() => setIsDeletedModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              {deletedDrivers.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Trash size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No deleted drivers found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {deletedDrivers.map((d) => (
                    <div
                      key={d._id}
                      className="border rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <UserIcon size={20} className="text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {d.name || "N/A"}
                          </p>
                          <p className="text-sm text-gray-500">{d.mobile}</p>
                          <p className="text-xs text-red-500">
                            Deleted on: {formatDate(d.deletedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRestore(d._id)}
                          className="btn-secondary flex items-center gap-2 text-green-600 border-green-200 hover:bg-green-50"
                        >
                          <RotateCcw size={16} /> Restore
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(d._id)}
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

function Section({ title, icon, children }) {
  return (
    <div className="border rounded-lg p-4">
      <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
        {icon} {title}
      </h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm text-gray-900">
        {value || <span className="text-gray-400">—</span>}
      </p>
    </div>
  );
}
