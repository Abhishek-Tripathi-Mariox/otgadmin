import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Eye,
  X,
  MapPin,
  Package,
  Truck,
  User,
  Store,
  Calendar,
  CreditCard,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getBookings,
  updateBookingStatus,
  allocateVendor,
  clearMessage,
  clearError,
} from "../store/slices/bookingSlice";
import { getVendors } from "../store/slices/vendorSlice";

const STATUS_OPTIONS = [
  {
    value: "pending",
    label: "Pending",
    color: "bg-yellow-100 text-yellow-700",
  },
  {
    value: "confirmed",
    label: "Confirmed",
    color: "bg-blue-100 text-blue-700",
  },
  {
    value: "in_transit",
    label: "In Transit",
    color: "bg-orange-100 text-orange-700",
  },
  {
    value: "delivered",
    label: "Delivered",
    color: "bg-green-100 text-green-700",
  },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-700" },
];

const PAYMENT_OPTIONS = [
  {
    value: "pending",
    label: "Pending",
    color: "bg-yellow-100 text-yellow-700",
  },
  {
    value: "partial",
    label: "Partial",
    color: "bg-orange-100 text-orange-700",
  },
  {
    value: "completed",
    label: "Completed",
    color: "bg-green-100 text-green-700",
  },
];

const getStatusConfig = (status) =>
  STATUS_OPTIONS.find((s) => s.value === status) || STATUS_OPTIONS[0];

const getPaymentConfig = (status) =>
  PAYMENT_OPTIONS.find((s) => s.value === status) || PAYMENT_OPTIONS[0];

// Demo data for client preview
const DEMO_BOOKINGS = [
  {
    _id: "demo1",
    bookingId: "OTG-2026-0001",
    site: "Prestige Lakeside Habitat, Whitefield",
    createdAt: "2026-04-10T09:30:00Z",
    updatedAt: "2026-04-11T14:00:00Z",
    material: { name: "Bosch GBM 350 Rotary Drill", unit: "Pieces", images: [] },
    quantity: 5,
    unit: "Pieces",
    price: 3200,
    totalAmount: 16000,
    vendor: { name: "Sri Balaji Hardware", mobile: "9876543210", email: "balaji@hardware.com" },
    user: { name: "Rajesh Kumar", mobile: "9988776655", email: "rajesh@build.com" },
    status: "confirmed",
    paymentStatus: "partial",
    notes: "Deliver before 10 AM at gate 2",
  },
  {
    _id: "demo2",
    bookingId: "OTG-2026-0002",
    site: "Brigade Gateway, Rajajinagar",
    createdAt: "2026-04-09T11:15:00Z",
    updatedAt: "2026-04-10T16:45:00Z",
    material: { name: "UltraTech OPC 53 Grade Cement", unit: "Bags", images: [] },
    quantity: 200,
    unit: "Bags",
    price: 380,
    totalAmount: 76000,
    vendor: { name: "Ambika Cement Depot", mobile: "9123456780", email: "ambika@cement.com" },
    user: { name: "Suresh Patel", mobile: "9871234560", email: "suresh@construct.in" },
    status: "in_transit",
    paymentStatus: "pending",
    notes: "Requires crane for unloading",
  },
  {
    _id: "demo3",
    bookingId: "OTG-2026-0003",
    site: "Sobha Dream Acres, Panathur",
    createdAt: "2026-04-08T08:00:00Z",
    updatedAt: "2026-04-09T12:30:00Z",
    material: { name: "Tata Tiscon 12mm TMT Bar", unit: "Tonnes", images: [] },
    quantity: 3,
    unit: "Tonnes",
    price: 52000,
    totalAmount: 156000,
    vendor: { name: "National Steel Traders", mobile: "9001234567", email: "national@steel.in" },
    user: { name: "Anita Sharma", mobile: "9345678901", email: "anita@infra.com" },
    status: "delivered",
    paymentStatus: "completed",
    notes: "",
  },
  {
    _id: "demo4",
    bookingId: "OTG-2026-0004",
    site: "Godrej Splendour, Bellandur",
    createdAt: "2026-04-07T14:20:00Z",
    updatedAt: "2026-04-07T14:20:00Z",
    material: { name: "Asian Paints Primer 20L", unit: "Buckets", images: [] },
    quantity: 30,
    unit: "Buckets",
    price: 1100,
    totalAmount: 33000,
    vendor: { name: "Gupta Paint House", mobile: "9567890123", email: "gupta@paints.com" },
    user: { name: "Mohammed Irfan", mobile: "9654321098", email: "irfan@homes.in" },
    status: "pending",
    paymentStatus: "pending",
    notes: "White primer only, no tinting",
  },
  {
    _id: "demo5",
    bookingId: "OTG-2026-0005",
    site: "Mantri Serenity, Kanakapura Road",
    createdAt: "2026-04-06T07:45:00Z",
    updatedAt: "2026-04-08T09:15:00Z",
    material: { name: "Bosch GWS 600 Angle Grinder", unit: "Pieces", images: [] },
    quantity: 2,
    unit: "Pieces",
    price: 5600,
    totalAmount: 11200,
    vendor: { name: "Sri Balaji Hardware", mobile: "9876543210", email: "balaji@hardware.com" },
    user: { name: "Priya Nair", mobile: "9012345678", email: "priya@buildcon.in" },
    status: "cancelled",
    paymentStatus: "pending",
    notes: "Customer cancelled due to project delay",
  },
  {
    _id: "demo6",
    bookingId: "OTG-2026-0006",
    site: "Puravankara Purva Zenium, Hosur Road",
    createdAt: "2026-04-05T10:00:00Z",
    updatedAt: "2026-04-06T11:30:00Z",
    material: { name: "MS Binding Wire 18 Gauge", unit: "Kg", images: [] },
    quantity: 500,
    unit: "Kg",
    price: 72,
    totalAmount: 36000,
    vendor: { name: "KR Wire & Metal", mobile: "9234567890", email: "kr@wire.in" },
    user: { name: "Vikram Singh", mobile: "9876012345", email: "vikram@develope.com" },
    status: "delivered",
    paymentStatus: "completed",
    notes: "",
  },
  {
    _id: "demo7",
    bookingId: "OTG-2026-0007",
    site: "Embassy Springs, Devanahalli",
    createdAt: "2026-04-11T13:00:00Z",
    updatedAt: "2026-04-11T13:00:00Z",
    material: { name: "Bosch GDC 141 Tile Cutter", unit: "Pieces", images: [] },
    quantity: 4,
    unit: "Pieces",
    price: 8400,
    totalAmount: 33600,
    vendor: { name: "Tool Masters", mobile: "9345670000", email: "tool@masters.com" },
    user: { name: "Deepak Joshi", mobile: "9111222333", email: "deepak@homez.in" },
    status: "confirmed",
    paymentStatus: "partial",
    notes: "Include extra blades in delivery",
  },
  {
    _id: "demo8",
    bookingId: "OTG-2026-0008",
    site: "Salarpuria Sattva, Electronic City",
    createdAt: "2026-04-04T16:30:00Z",
    updatedAt: "2026-04-07T10:00:00Z",
    material: { name: "River Sand (M-Sand)", unit: "CFT", images: [] },
    quantity: 1000,
    unit: "CFT",
    price: 45,
    totalAmount: 45000,
    vendor: { name: "Kaveri Sand Suppliers", mobile: "9400011122", email: "kaveri@sand.com" },
    user: { name: "Lakshmi Devi", mobile: "9888990011", email: "lakshmi@construct.in" },
    status: "in_transit",
    paymentStatus: "partial",
    notes: "Deliver in 2 trips — 500 CFT each",
  },
  {
    _id: "demo9",
    bookingId: "OTG-2026-0009",
    site: "Total Environment, Jakkur",
    createdAt: "2026-04-03T09:45:00Z",
    updatedAt: "2026-04-05T18:00:00Z",
    material: { name: "Stanley Demolition Hammer", unit: "Pieces", images: [] },
    quantity: 1,
    unit: "Pieces",
    price: 24500,
    totalAmount: 24500,
    vendor: { name: "Tool Masters", mobile: "9345670000", email: "tool@masters.com" },
    user: { name: "Arjun Reddy", mobile: "9222333444", email: "arjun@builders.in" },
    status: "delivered",
    paymentStatus: "completed",
    notes: "",
  },
  {
    _id: "demo10",
    bookingId: "OTG-2026-0010",
    site: "Prestige Falcon City, Kanakapura",
    createdAt: "2026-04-12T06:00:00Z",
    updatedAt: "2026-04-12T06:00:00Z",
    material: { name: "ACC PPC Cement", unit: "Bags", images: [] },
    quantity: 500,
    unit: "Bags",
    price: 360,
    totalAmount: 180000,
    vendor: { name: "Ambika Cement Depot", mobile: "9123456780", email: "ambika@cement.com" },
    user: { name: "Ravi Shankar", mobile: "9666777888", email: "ravi@infrabuild.in" },
    status: "pending",
    paymentStatus: "pending",
    notes: "Delivery at basement level — need advance notice",
  },
];

export default function Bookings() {
  const dispatch = useDispatch();
  const { bookings: apiBookings, loading, error, message, pagination } = useSelector(
    (state) => state.bookings,
  );
  const { vendors } = useSelector((state) => state.vendors);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [vendorPick, setVendorPick] = useState("");
  const [allocating, setAllocating] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    paymentStatus: "",
    fromDate: "",
    toDate: "",
  });

  // Load vendors once for the allocation picker
  useEffect(() => {
    dispatch(getVendors({ page: 1, limit: 200 }));
  }, [dispatch]);

  // Sync local vendor pick with whichever booking is open
  useEffect(() => {
    setVendorPick(selectedBooking?.vendor?._id || "");
  }, [selectedBooking?._id]);

  const handleAllocateVendor = async () => {
    if (!selectedBooking?._id) {
      toast.error("Open a saved booking to allocate a vendor.");
      return;
    }
    try {
      setAllocating(true);
      const res = await dispatch(
        allocateVendor({
          id: selectedBooking._id,
          vendorId: vendorPick || null,
        }),
      ).unwrap();
      if (res?.data) setSelectedBooking(res.data);
    } catch {
      // toast handled via redux error
    } finally {
      setAllocating(false);
    }
  };

  // Use demo data when no real bookings exist
  const isDemo = !loading && apiBookings.length === 0;
  const allBookings = isDemo ? DEMO_BOOKINGS : apiBookings;

  // Client-side filtering (works for both demo and real data)
  const bookings = allBookings.filter((b) => {
    if (filters.status && b.status !== filters.status) return false;
    if (filters.paymentStatus && b.paymentStatus !== filters.paymentStatus) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const match =
        (b.bookingId || "").toLowerCase().includes(q) ||
        (b.material?.name || "").toLowerCase().includes(q) ||
        (b.vendor?.name || "").toLowerCase().includes(q) ||
        (b.user?.name || "").toLowerCase().includes(q) ||
        (b.site || "").toLowerCase().includes(q);
      if (!match) return false;
    }
    if (filters.fromDate) {
      const from = new Date(filters.fromDate);
      if (new Date(b.createdAt) < from) return false;
    }
    if (filters.toDate) {
      const to = new Date(filters.toDate);
      to.setHours(23, 59, 59, 999);
      if (new Date(b.createdAt) > to) return false;
    }
    return true;
  });

  // Fetch bookings with filters
  useEffect(() => {
    const params = { page: 1, limit: 50 };
    if (filters.status) params.status = filters.status;
    if (filters.paymentStatus) params.paymentStatus = filters.paymentStatus;
    if (filters.fromDate) params.fromDate = filters.fromDate;
    if (filters.toDate) params.toDate = filters.toDate;
    dispatch(getBookings(params));
  }, [dispatch, filters]);

  // Handle toast messages
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

  const handleStatusChange = async (bookingId, newStatus) => {
    await dispatch(updateBookingStatus({ id: bookingId, status: newStatus }));
  };

  const handlePaymentStatusChange = async (bookingId, newPaymentStatus) => {
    await dispatch(
      updateBookingStatus({ id: bookingId, paymentStatus: newPaymentStatus }),
    );
  };

  const clearFilters = () => {
    setFilters({ search: "", status: "", paymentStatus: "", fromDate: "", toDate: "" });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return "₹0";
    return `₹${Number(amount).toLocaleString("en-IN")}`;
  };

  return (
    <div className="space-y-6">
      {/* DEMO BANNER */}
      {isDemo && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
          <span className="font-semibold">Demo Mode:</span> Showing sample bookings for preview. Real data will appear once bookings are placed.
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-sm text-gray-500">
            Manage orders and track deliveries
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Total:{" "}
          <span className="font-semibold text-gray-900">
            {bookings.length}
          </span>{" "}
          bookings
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {STATUS_OPTIONS.map((s) => {
          const count = allBookings.filter((b) => b.status === s.value).length;
          return (
            <button
              key={s.value}
              onClick={() =>
                setFilters((f) => ({
                  ...f,
                  status: f.status === s.value ? "" : s.value,
                }))
              }
              className={`bg-white border rounded-xl p-4 text-left transition hover:shadow-md ${
                filters.status === s.value
                  ? "ring-2 ring-orange-400"
                  : ""
              }`}
            >
              <p className="text-2xl font-bold text-gray-900">{count}</p>
              <p className={`text-xs font-medium mt-1 inline-block px-2 py-0.5 rounded-full ${s.color}`}>
                {s.label}
              </p>
            </button>
          );
        })}
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
            <div className="relative lg:col-span-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search bookings..."
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
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>

            {/* Payment Status Filter */}
            <select
              value={filters.paymentStatus}
              onChange={(e) =>
                setFilters({ ...filters, paymentStatus: e.target.value })
              }
              className="input-field"
            >
              <option value="">All Payment Status</option>
              {PAYMENT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>

            {/* From Date */}
            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) =>
                setFilters({ ...filters, fromDate: e.target.value })
              }
              className="input-field"
            />

            {/* To Date */}
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) =>
                setFilters({ ...filters, toDate: e.target.value })
              }
              className="input-field"
            />
          </div>
        )}

        {isFilterOpen && (
          <div className="mt-3 flex justify-end">
            <button onClick={clearFilters} className="btn-secondary text-sm">
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* LOADING STATE */}
      {loading && bookings.length === 0 && (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white border rounded-xl overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 font-medium text-gray-600">
                Booking
              </th>
              <th className="text-left p-4 font-medium text-gray-600">
                Material
              </th>
              <th className="text-left p-4 font-medium text-gray-600">
                Vendor
              </th>
              <th className="text-left p-4 font-medium text-gray-600">User</th>
              <th className="text-right p-4 font-medium text-gray-600">
                Amount
              </th>
              <th className="text-center p-4 font-medium text-gray-600">
                Status
              </th>
              <th className="text-center p-4 font-medium text-gray-600">
                Payment
              </th>
              <th className="text-center p-4 font-medium text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => {
              const statusCfg = getStatusConfig(booking.status);
              const paymentCfg = getPaymentConfig(booking.paymentStatus);

              return (
                <tr
                  key={booking._id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  {/* Booking ID + Site */}
                  <td className="p-4">
                    <p className="font-medium text-gray-900">
                      {booking.bookingId}
                    </p>
                    {booking.site && (
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin size={12} /> {booking.site}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDate(booking.createdAt)}
                    </p>
                  </td>

                  {/* Material */}
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {(booking.material?.images?.[0] || booking.material?.image) ? (
                        <img
                          src={booking.material.images?.[0] || booking.material.image}
                          alt=""
                          className="w-8 h-8 rounded object-cover"
                        />
                      ) : (
                        <Package size={18} className="text-gray-400" />
                      )}
                      <div>
                        <p className="text-sm font-medium">
                          {booking.material?.name || "-"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {booking.quantity}{" "}
                          {booking.unit || booking.material?.unit}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Vendor */}
                  <td className="p-4">
                    <p className="text-sm">{booking.vendor?.name || "-"}</p>
                    {booking.vendor?.mobile && (
                      <p className="text-xs text-gray-500">
                        {booking.vendor.mobile}
                      </p>
                    )}
                  </td>

                  {/* User */}
                  <td className="p-4">
                    <p className="text-sm">{booking.user?.name || "-"}</p>
                    {booking.user?.mobile && (
                      <p className="text-xs text-gray-500">
                        {booking.user.mobile}
                      </p>
                    )}
                  </td>

                  {/* Amount */}
                  <td className="p-4 text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(booking.totalAmount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      @ {formatCurrency(booking.price)}/
                      {booking.unit || booking.material?.unit}
                    </p>
                  </td>

                  {/* Order Status Dropdown */}
                  <td className="p-4 text-center">
                    <select
                      value={booking.status}
                      onChange={(e) =>
                        handleStatusChange(booking._id, e.target.value)
                      }
                      className={`text-xs px-2 py-1 rounded-full border-0 cursor-pointer font-medium ${statusCfg.color}`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Payment Status Dropdown */}
                  <td className="p-4 text-center">
                    <select
                      value={booking.paymentStatus}
                      onChange={(e) =>
                        handlePaymentStatusChange(booking._id, e.target.value)
                      }
                      className={`text-xs px-2 py-1 rounded-full border-0 cursor-pointer font-medium ${paymentCfg.color}`}
                    >
                      {PAYMENT_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-center">
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}

            {!loading && bookings.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center text-gray-500 py-20">
                  No bookings found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* BOOKING DETAIL MODAL */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                Booking: {selectedBooking.bookingId}
              </h2>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Status Row */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Order Status
                  </label>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusConfig(selectedBooking.status).color}`}
                  >
                    {getStatusConfig(selectedBooking.status).label}
                  </span>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Payment Status
                  </label>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPaymentConfig(selectedBooking.paymentStatus).color}`}
                  >
                    {getPaymentConfig(selectedBooking.paymentStatus).label}
                  </span>
                </div>
              </div>

              {/* Material Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Package size={16} /> Material Details
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Material:</span>{" "}
                    <span className="font-medium">
                      {selectedBooking.material?.name || "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Quantity:</span>{" "}
                    <span className="font-medium">
                      {selectedBooking.quantity}{" "}
                      {selectedBooking.unit || selectedBooking.material?.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Unit Price:</span>{" "}
                    <span className="font-medium">
                      {formatCurrency(selectedBooking.price)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Total Amount:</span>{" "}
                    <span className="font-bold text-green-700">
                      {formatCurrency(selectedBooking.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Vendor & User */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Store size={16} /> Vendor
                  </h3>
                  <p className="text-sm font-medium">
                    {selectedBooking.vendor?.name || "Not allocated"}
                  </p>
                  {selectedBooking.vendor?.mobile && (
                    <p className="text-xs text-gray-500 mt-1">
                      📞 {selectedBooking.vendor.mobile}
                    </p>
                  )}
                  {selectedBooking.vendor?.email && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      ✉️ {selectedBooking.vendor.email}
                    </p>
                  )}

                  {/* Allocate / change vendor — only on real bookings */}
                  {selectedBooking._id && !isDemo && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <label className="block text-xs text-gray-500 mb-1">
                        {selectedBooking.vendor ? "Change vendor" : "Allocate vendor"}
                      </label>
                      <div className="flex gap-2">
                        <select
                          className="input-field flex-1 text-sm"
                          value={vendorPick}
                          onChange={(e) => setVendorPick(e.target.value)}
                        >
                          <option value="">-- Unassigned --</option>
                          {vendors.map((v) => (
                            <option key={v._id} value={v._id}>
                              {v.name}
                              {v.business?.city ? ` · ${v.business.city}` : ""}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={handleAllocateVendor}
                          disabled={
                            allocating ||
                            vendorPick === (selectedBooking.vendor?._id || "")
                          }
                          className="btn-primary text-sm"
                        >
                          {allocating ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <User size={16} /> Customer
                  </h3>
                  <p className="text-sm font-medium">
                    {selectedBooking.user?.name || "-"}
                  </p>
                  {selectedBooking.user?.mobile && (
                    <p className="text-xs text-gray-500 mt-1">
                      📞 {selectedBooking.user.mobile}
                    </p>
                  )}
                  {selectedBooking.user?.email && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      ✉️ {selectedBooking.user.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Extra Info */}
              {(selectedBooking.site || selectedBooking.notes) && (
                <div className="bg-gray-50 rounded-lg p-4">
                  {selectedBooking.site && (
                    <div className="mb-2">
                      <span className="text-sm text-gray-500">Site: </span>
                      <span className="text-sm font-medium">
                        {selectedBooking.site}
                      </span>
                    </div>
                  )}
                  {selectedBooking.notes && (
                    <div>
                      <span className="text-sm text-gray-500">Notes: </span>
                      <span className="text-sm">{selectedBooking.notes}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Dates */}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar size={14} />
                <span>Created: {formatDate(selectedBooking.createdAt)}</span>
                {selectedBooking.updatedAt &&
                  selectedBooking.updatedAt !== selectedBooking.createdAt && (
                    <span>
                      | Updated: {formatDate(selectedBooking.updatedAt)}
                    </span>
                  )}
              </div>
            </div>

            <div className="flex justify-end pt-4 mt-4 border-t">
              <button
                onClick={() => setSelectedBooking(null)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
