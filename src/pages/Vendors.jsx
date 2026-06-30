import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import usePolling from "../hooks/usePolling";
import {
  Plus,
  Edit2,
  Trash2,
  Store,
  RotateCcw,
  X,
  Trash,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  MapPin,
  Phone,
  Mail,
  Package,
  CheckCircle,
  XCircle,
  Map,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getVendors,
  getDeletedVendors,
  createVendor,
  updateVendor,
  deleteVendor,
  restoreVendor,
  permanentDeleteVendor,
  toggleVendorStatus,
  approveVendor,
  rejectVendor,
  getStates,
  clearMessage,
  clearError,
} from "../store/slices/vendorSlice";
import LocationPicker from "../components/LocationPicker";

export default function Vendors() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    vendors,
    deletedVendors,
    states,
    loading,
    error,
    message,
    pagination,
  } = useSelector((state) => state.vendors);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeletedModalOpen, setIsDeletedModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    business: {
      name: "",
      gstNumber: "",
      panNumber: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
    },
    bankDetails: {
      accountHolderName: "",
      accountNumber: "",
      bankName: "",
      ifscCode: "",
      branchName: "",
    },
    location: {
      latitude: "",
      longitude: "",
      address: "",
    },
    status: "active",
  });

  // Filter states
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    city: "",
    fromDate: "",
    toDate: "",
  });

  // Fetch initial data
  useEffect(() => {
    dispatch(getStates());
  }, [dispatch]);

  // Fetch vendors with filters
  const fetchVendors = useCallback(() => {
    const params = { page: 1, limit: 20 };
    if (filters.search) params.search = filters.search;
    if (filters.status) params.status = filters.status;
    if (filters.city) params.city = filters.city;
    if (filters.fromDate) params.fromDate = filters.fromDate;
    if (filters.toDate) params.toDate = filters.toDate;
    dispatch(getVendors(params));
  }, [dispatch, filters]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  // Refresh the list periodically so changes show in near real time.
  usePolling(fetchVendors);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.mobile || !/^[6-9]\d{9}$/.test(formData.mobile)) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }

    if (!formData.business.name) {
      toast.error("Business name is required");
      return;
    }

    if (
      formData.business.gstNumber
    ) {
      const cleanGst = formData.business.gstNumber.trim().toUpperCase();
      if (
        cleanGst.length > 0 &&
        !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
          cleanGst,
        )
      ) {
        toast.error("Enter a valid 15-character GST number");
        return;
      }
      // Update formData with cleaned GST for submission
      formData.business.gstNumber = cleanGst;
    }

    if (
      !formData.bankDetails.accountHolderName ||
      !formData.bankDetails.accountNumber ||
      !formData.bankDetails.bankName ||
      !formData.bankDetails.ifscCode
    ) {
      toast.error(
        "Bank details (Account Holder, Account Number, Bank Name, IFSC) are required",
      );
      return;
    }

    if (!formData.location.latitude || !formData.location.longitude) {
      toast.error("Location coordinates are required");
      return;
    }

    const payload = {
      name: formData.name,
      mobile: formData.mobile,
      email: formData.email || undefined,
      business: {
        name: formData.business.name,
        gstNumber: formData.business.gstNumber || undefined,
        panNumber: formData.business.panNumber || undefined,
        address: formData.business.address,
        city: formData.business.city,
        state: formData.business.state,
        pincode: formData.business.pincode,
      },
      location: {
        latitude: parseFloat(formData.location.latitude),
        longitude: parseFloat(formData.location.longitude),
        address: formData.location.address || undefined,
      },
      bankDetails: {
        accountHolderName: formData.bankDetails.accountHolderName,
        accountNumber: formData.bankDetails.accountNumber,
        bankName: formData.bankDetails.bankName,
        ifscCode: formData.bankDetails.ifscCode,
        branchName: formData.bankDetails.branchName || undefined,
      },
      status: formData.status,
    };

    try {
      if (editingId) {
        await dispatch(updateVendor({ id: editingId, data: payload })).unwrap();
      } else {
        await dispatch(createVendor(payload)).unwrap();
      }
      closeModal();
    } catch (err) {
      // Error handled by redux
    }
  };

  const openModal = (vendor = null) => {
    if (vendor) {
      setEditingId(vendor._id);
      setFormData({
        name: vendor.name || "",
        mobile: vendor.mobile || "",
        email: vendor.email || "",
        business: {
          name: vendor.business?.name || "",
          gstNumber: vendor.business?.gstNumber || "",
          panNumber: vendor.business?.panNumber || "",
          address: vendor.business?.address || "",
          city: vendor.business?.city || "",
          state: vendor.business?.state || "",
          pincode: vendor.business?.pincode || "",
        },
        bankDetails: {
          accountHolderName: vendor.bankDetails?.accountHolderName || "",
          accountNumber: vendor.bankDetails?.accountNumber || "",
          bankName: vendor.bankDetails?.bankName || "",
          ifscCode: vendor.bankDetails?.ifscCode || "",
          branchName: vendor.bankDetails?.branchName || "",
        },
        location: {
          latitude: vendor.location?.coordinates?.[1] || "",
          longitude: vendor.location?.coordinates?.[0] || "",
          address: vendor.location?.address || "",
        },
        status: vendor.status || "active",
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        mobile: "",
        email: "",
        business: {
          name: "",
          gstNumber: "",
          panNumber: "",
          address: "",
          city: "",
          state: "",
          pincode: "",
        },
        bankDetails: {
          accountHolderName: "",
          accountNumber: "",
          bankName: "",
          ifscCode: "",
          branchName: "",
        },
        location: {
          latitude: "",
          longitude: "",
          address: "",
        },
        status: "active",
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this vendor?")) {
      await dispatch(deleteVendor(id));
    }
  };

  const handleToggleStatus = async (id) => {
    await dispatch(toggleVendorStatus(id));
  };

  const handleApproveVendor = async (id) => {
    if (
      window.confirm(
        "Approve this vendor? They will be able to receive orders.",
      )
    ) {
      await dispatch(approveVendor(id));
    }
  };

  const openRejectModal = (id) => {
    setRejectTargetId(id);
    setRejectReason("");
    setRejectModalOpen(true);
  };

  const confirmRejectVendor = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please enter a reason for rejection.");
      return;
    }
    const res = await dispatch(
      rejectVendor({ id: rejectTargetId, reason: rejectReason.trim() }),
    );
    if (!res.error) {
      setRejectModalOpen(false);
      setRejectTargetId(null);
      setRejectReason("");
    }
  };

  // Deleted vendors modal handlers
  const openDeletedModal = () => {
    dispatch(getDeletedVendors());
    setIsDeletedModalOpen(true);
  };

  const handleRestore = async (id) => {
    await dispatch(restoreVendor(id));
  };

  const handlePermanentDelete = async (id) => {
    if (
      confirm(
        "Are you sure you want to permanently delete this vendor? This will also delete all their materials. This action cannot be undone.",
      )
    ) {
      await dispatch(permanentDeleteVendor(id));
    }
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "",
      city: "",
      fromDate: "",
      toDate: "",
    });
  };

  const handleLocationSelect = (location) => {
    setFormData({
      ...formData,
      business: {
        ...formData.business,
        // Only update if we got values from the map
        city: location.city || formData.business.city,
        state: location.state || formData.business.state,
        pincode: location.pincode || formData.business.pincode,
      },
      location: {
        latitude: location.latitude.toString(),
        longitude: location.longitude.toString(),
        address: location.address || formData.location.address,
      },
    });
    toast.success("Location selected successfully");
  };

  const getInitialMapPosition = () => {
    if (formData.location.latitude && formData.location.longitude) {
      return {
        lat: parseFloat(formData.location.latitude),
        lng: parseFloat(formData.location.longitude),
      };
    }
    return null;
  };

  const handleManageMaterials = (vendorId) => {
    navigate(`/vendors/${vendorId}/materials`);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
          <p className="text-sm text-gray-500">
            Manage material vendors and suppliers
          </p>
        </div>

        <div className="flex gap-3">
          <button onClick={openDeletedModal} className="btn-secondary">
            <Trash size={18} /> Deleted
          </button>
          <button onClick={() => openModal()} className="btn-primary">
            <Plus size={18} /> Add Vendor
          </button>
        </div>
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
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search by name, mobile, business..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="input-field pl-10"
              />
            </div>

            {/* City Filter */}
            <input
              type="text"
              placeholder="Filter by city"
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              className="input-field"
            />

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
            </select>

            {/* From Date */}
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
        )}

        {isFilterOpen && (
          <div className="mt-4 flex justify-between items-center">
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) =>
                setFilters({ ...filters, toDate: e.target.value })
              }
              className="input-field w-48"
              placeholder="To Date"
            />
            <button onClick={clearFilters} className="btn-secondary text-sm">
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* LOADING STATE */}
      {loading && vendors.length === 0 && (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 font-medium text-gray-600">
                Vendor
              </th>
              <th className="text-left p-4 font-medium text-gray-600">
                Contact
              </th>
              <th className="text-left p-4 font-medium text-gray-600">
                Business
              </th>
              <th className="text-left p-4 font-medium text-gray-600">
                Location
              </th>
              <th className="text-left p-4 font-medium text-gray-600">
                Status
              </th>
              <th className="text-right p-4 font-medium text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((vendor) => (
              <tr
                key={vendor._id}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <Store size={20} className="text-orange-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {vendor.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {vendor.vendorCode && (
                          <span className="text-orange-600 font-medium">
                            {vendor.vendorCode} •{" "}
                          </span>
                        )}
                        {vendor.business?.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Phone size={14} />
                    {vendor.mobile}
                  </div>
                  {vendor.email && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <Mail size={12} />
                      {vendor.email}
                    </div>
                  )}
                </td>
                <td className="p-4">
                  <div className="text-sm text-gray-600">
                    {vendor.business?.city}, {vendor.business?.state}
                  </div>
                  {vendor.business?.gstNumber && (
                    <div className="text-xs text-gray-500 mt-1">
                      GST: {vendor.business.gstNumber}
                    </div>
                  )}
                </td>
                <td className="p-4">
                  {vendor.location?.coordinates && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin size={14} className="text-red-500" />
                      <span className="truncate max-w-[150px]">
                        {vendor.location.address ||
                          `${vendor.location.coordinates[1].toFixed(4)}, ${vendor.location.coordinates[0].toFixed(4)}`}
                      </span>
                    </div>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex flex-col items-start gap-1">
                    {/* Approval state for self-registered vendors */}
                    {vendor.approvalStatus === "pending" ? (
                      <span className="text-xs px-3 py-1 rounded-full bg-yellow-100 text-yellow-700">
                        Pending Approval
                      </span>
                    ) : vendor.approvalStatus === "rejected" ? (
                      <span
                        className="text-xs px-3 py-1 rounded-full bg-red-100 text-red-700"
                        title={vendor.rejectionReason || ""}
                      >
                        Rejected
                      </span>
                    ) : (
                      <button
                        onClick={() => handleToggleStatus(vendor._id)}
                        className={`text-xs px-3 py-1 rounded-full cursor-pointer transition ${
                          vendor.status === "active"
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-red-100 text-red-700 hover:bg-red-200"
                        }`}
                      >
                        {vendor.status === "active" ? "Active" : "Inactive"}
                      </button>
                    )}
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    {/* Quick approve/reject for self-registered vendors */}
                    {(vendor.approvalStatus === "pending" ||
                      vendor.approvalStatus === "rejected") && (
                      <button
                        onClick={() => handleApproveVendor(vendor._id)}
                        className="text-green-600 hover:text-green-800 p-1"
                        title="Approve vendor"
                      >
                        <CheckCircle size={18} />
                      </button>
                    )}
                    {vendor.approvalStatus === "pending" && (
                      <button
                        onClick={() => openRejectModal(vendor._id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Reject vendor"
                      >
                        <XCircle size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => handleManageMaterials(vendor._id)}
                      className="text-purple-600 hover:text-purple-800 p-1"
                      title="Manage Materials"
                    >
                      <Package size={18} />
                    </button>
                    <button
                      onClick={() => openModal(vendor)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(vendor._id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {!loading && vendors.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center text-gray-500 py-20">
                  No vendors found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ADD/EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingId ? "Edit Vendor" : "Add Vendor"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vendor Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      className="input-field"
                      placeholder="Enter vendor name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      className="input-field"
                      placeholder="Enter 10-digit mobile number"
                      maxLength={10}
                      pattern="[6-9][0-9]{9}"
                      title="Enter a valid 10-digit mobile number starting with 6-9"
                      value={formData.mobile}
                      onChange={(e) => {
                        const val = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10);
                        setFormData({ ...formData, mobile: val });
                      }}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      {formData.mobile.length}/10 digits
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-gray-400">(Optional)</span>
                    </label>
                    <input
                      type="email"
                      className="input-field"
                      placeholder="Enter email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      className="input-field"
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Business Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Business Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      className="input-field"
                      placeholder="Enter business name"
                      value={formData.business.name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          business: {
                            ...formData.business,
                            name: e.target.value,
                          },
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      GST Number{" "}
                      <span className="text-gray-400">(Optional)</span>
                    </label>
                    <input
                      className="input-field uppercase"
                      placeholder="Enter 15-character GST number"
                      maxLength={15}
                      value={formData.business.gstNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          business: {
                            ...formData.business,
                            gstNumber: e.target.value
                              .toUpperCase()
                              .slice(0, 15),
                          },
                        })
                      }
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      {formData.business.gstNumber.length}/15 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      PAN Number{" "}
                      <span className="text-gray-400">(Optional)</span>
                    </label>
                    <input
                      className="input-field"
                      placeholder="Enter PAN number"
                      value={formData.business.panNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          business: {
                            ...formData.business,
                            panNumber: e.target.value,
                          },
                        })
                      }
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      className="input-field"
                      placeholder="Enter business address"
                      value={formData.business.address}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          business: {
                            ...formData.business,
                            address: e.target.value,
                          },
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      className="input-field"
                      placeholder="Enter city"
                      value={formData.business.city}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          business: {
                            ...formData.business,
                            city: e.target.value,
                          },
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      className="input-field"
                      value={formData.business.state}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          business: {
                            ...formData.business,
                            state: e.target.value,
                          },
                        })
                      }
                    >
                      <option value="">Select State</option>
                      {states.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      className="input-field"
                      placeholder="Enter pincode"
                      value={formData.business.pincode}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          business: {
                            ...formData.business,
                            pincode: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Bank Details <span className="text-red-500">*</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Holder Name{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      className="input-field"
                      placeholder="Enter account holder name"
                      value={formData.bankDetails.accountHolderName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bankDetails: {
                            ...formData.bankDetails,
                            accountHolderName: e.target.value,
                          },
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      className="input-field"
                      placeholder="Enter account number"
                      value={formData.bankDetails.accountNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bankDetails: {
                            ...formData.bankDetails,
                            accountNumber: e.target.value,
                          },
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bank Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      className="input-field"
                      placeholder="Enter bank name"
                      value={formData.bankDetails.bankName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bankDetails: {
                            ...formData.bankDetails,
                            bankName: e.target.value,
                          },
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      IFSC Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      className="input-field uppercase"
                      placeholder="Enter IFSC code"
                      maxLength={11}
                      value={formData.bankDetails.ifscCode}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bankDetails: {
                            ...formData.bankDetails,
                            ifscCode: e.target.value.toUpperCase(),
                          },
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Branch Name{" "}
                      <span className="text-gray-400">(Optional)</span>
                    </label>
                    <input
                      className="input-field"
                      placeholder="Enter branch name"
                      value={formData.bankDetails.branchName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bankDetails: {
                            ...formData.bankDetails,
                            branchName: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Location Info */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Location (GPS Coordinates)
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsLocationPickerOpen(true)}
                    className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1 bg-orange-50 px-3 py-1.5 rounded-lg"
                  >
                    <Map size={14} />
                    Select on Map
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Latitude <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="number"
                      step="any"
                      className="input-field"
                      placeholder="e.g., 28.6139"
                      value={formData.location.latitude}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          location: {
                            ...formData.location,
                            latitude: e.target.value,
                          },
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Longitude <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="number"
                      step="any"
                      className="input-field"
                      placeholder="e.g., 77.2090"
                      value={formData.location.longitude}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          location: {
                            ...formData.location,
                            longitude: e.target.value,
                          },
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location Label{" "}
                      <span className="text-gray-400">(Optional)</span>
                    </label>
                    <input
                      className="input-field"
                      placeholder="e.g., Near Main Market"
                      value={formData.location.address}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          location: {
                            ...formData.location,
                            address: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Documents & Approval (self-registered vendors) */}
              {editingId &&
                (() => {
                  const ev = vendors.find((v) => v._id === editingId);
                  if (!ev) return null;
                  const docs = ev.documents || {};
                  const docList = [
                    { key: "gstCertificate", label: "GST Certificate" },
                    { key: "panCard", label: "PAN Card" },
                    { key: "tradeLicense", label: "Trade License" },
                    { key: "bankCheque", label: "Bank Cheque / Passbook" },
                  ];
                  const isPending = ev.approvalStatus === "pending";
                  const isRejected = ev.approvalStatus === "rejected";
                  return (
                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-gray-700">
                          Documents &amp; Approval
                        </h3>
                        <span
                          className={`text-xs px-3 py-1 rounded-full ${
                            isPending
                              ? "bg-yellow-100 text-yellow-700"
                              : isRejected
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-700"
                          }`}
                        >
                          {isPending
                            ? "Pending Approval"
                            : isRejected
                              ? "Rejected"
                              : "Approved"}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-3">
                        {docList.map((d) => (
                          <div
                            key={d.key}
                            className="flex items-center justify-between border rounded-lg p-2"
                          >
                            <span className="text-xs text-gray-600">
                              {d.label}
                            </span>
                            {docs[d.key] ? (
                              <a
                                href={docs[d.key]}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-blue-600 hover:underline"
                              >
                                View
                              </a>
                            ) : (
                              <span className="text-xs text-gray-400">
                                Not uploaded
                              </span>
                            )}
                          </div>
                        ))}
                      </div>

                      {isRejected && ev.rejectionReason && (
                        <p className="text-xs text-red-600 mb-3">
                          Reason: {ev.rejectionReason}
                        </p>
                      )}

                      {(isPending || isRejected) && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleApproveVendor(ev._id)}
                            className="btn-primary text-sm"
                          >
                            Approve
                          </button>
                          {!isRejected && (
                            <button
                              type="button"
                              onClick={() => openRejectModal(ev._id)}
                              className="btn-secondary text-sm text-red-600 border-red-200 hover:bg-red-50"
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? "Saving..." : editingId ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REJECT VENDOR MODAL */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Reject Vendor
              </h2>
              <button
                onClick={() => setRejectModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <label className="block text-sm text-gray-600 mb-1">
              Reason for rejection <span className="text-red-500">*</span>
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              placeholder="e.g. Documents unclear / details don't match…"
              className="input-field w-full text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">
              This reason will be shown to the vendor in their app.
            </p>
            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={confirmRejectVendor}
                disabled={loading}
                className="btn-primary bg-red-600 hover:bg-red-700"
              >
                {loading ? "Rejecting..." : "Reject Vendor"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETED VENDORS MODAL */}
      {isDeletedModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Deleted Vendors</h2>
              <button
                onClick={() => setIsDeletedModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            {loading && deletedVendors.length === 0 ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              </div>
            ) : deletedVendors.length === 0 ? (
              <div className="text-center text-gray-500 py-10">
                No deleted vendors
              </div>
            ) : (
              <div className="space-y-4">
                {deletedVendors.map((vendor) => (
                  <div
                    key={vendor._id}
                    className="flex items-center justify-between p-4 border rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <Store size={24} className="text-gray-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {vendor.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {vendor.business?.name} • {vendor.mobile}
                        </p>
                        <p className="text-xs text-gray-400">
                          Deleted on:{" "}
                          {new Date(vendor.deletedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRestore(vendor._id)}
                        className="flex items-center gap-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
                        title="Restore"
                      >
                        <RotateCcw size={16} />
                        Restore
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(vendor._id)}
                        className="flex items-center gap-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                        title="Delete Permanently"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* LOCATION PICKER MODAL */}
      <LocationPicker
        isOpen={isLocationPickerOpen}
        onClose={() => setIsLocationPickerOpen(false)}
        onSelect={handleLocationSelect}
        initialPosition={getInitialMapPosition()}
      />
    </div>
  );
}
