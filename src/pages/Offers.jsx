import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Search,
  Tag,
  Percent,
  IndianRupee,
  Truck,
  Gift,
  Power,
  Calendar,
  Users,
  Layers,
  Box,
  CheckCircle2,
  XCircle,
  Ticket,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getOffers,
  createOffer,
  updateOffer,
  toggleOfferStatus,
  deleteOffer,
  clearError,
  clearMessage,
} from "../store/slices/offerSlice";
import { getCategories } from "../store/slices/categorySlice";
import { getSubCategories } from "../store/slices/subCategorySlice";
import { getMaterials } from "../store/slices/materialSlice";
import { getUsers } from "../store/slices/userSlice";

const SCOPE_OPTIONS = [
  { value: "all", label: "All orders", icon: Tag },
  { value: "category", label: "Specific categories", icon: Layers },
  { value: "subCategory", label: "Specific sub-categories", icon: Layers },
  { value: "material", label: "Specific materials", icon: Box },
  { value: "user", label: "Specific users", icon: Users },
];

const DISCOUNT_OPTIONS = [
  { value: "percentage", label: "Percentage off", icon: Percent },
  { value: "flat", label: "Flat amount off", icon: IndianRupee },
  { value: "free_delivery", label: "Free delivery", icon: Truck },
  { value: "bogo", label: "BOGO (Buy X get Y)", icon: Gift },
];

const emptyForm = {
  code: "",
  title: "",
  description: "",
  scope: "all",
  categories: [],
  subCategories: [],
  materials: [],
  users: [],
  discountType: "percentage",
  discountValue: 10,
  maxDiscount: "",
  buyX: 1,
  getY: 1,
  startsAt: "",
  endsAt: "",
  minOrderAmount: "",
  maxUsesPerUser: "",
  globalUsageLimit: "",
  autoApply: false,
  stackable: false,
  status: "active",
};

const fmt = (n) =>
  n === null || n === undefined || isNaN(Number(n))
    ? "—"
    : `₹${Number(n).toLocaleString("en-IN")}`;

const toDateInput = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
};

export default function Offers() {
  const dispatch = useDispatch();
  const { offers, stats, loading, error, message } = useSelector(
    (s) => s.offers,
  );
  const categories = useSelector((s) => s.categories.categories) || [];
  const subCategories =
    useSelector((s) => s.subCategories.subCategories) || [];
  const materials = useSelector((s) => s.materials.materials) || [];
  const users = useSelector((s) => s.users.users) || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [isDeleteConfirm, setIsDeleteConfirm] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    dispatch(getOffers({}));
    // Preload reference data so the scope pickers have options
    dispatch(getCategories({}));
    dispatch(getSubCategories({}));
    dispatch(getMaterials({}));
    dispatch(getUsers({}));
  }, [dispatch]);

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

  const openAdd = () => {
    setEditingOffer(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  };

  const openEdit = (offer) => {
    setEditingOffer(offer);
    setFormData({
      code: offer.code,
      title: offer.title,
      description: offer.description || "",
      scope: offer.scope,
      categories: (offer.categories || []).map((c) => c._id || c),
      subCategories: (offer.subCategories || []).map((c) => c._id || c),
      materials: (offer.materials || []).map((c) => c._id || c),
      users: (offer.users || []).map((c) => c._id || c),
      discountType: offer.discountType,
      discountValue: offer.discountValue ?? 0,
      maxDiscount: offer.maxDiscount ?? "",
      buyX: offer.buyX ?? 1,
      getY: offer.getY ?? 1,
      startsAt: toDateInput(offer.startsAt),
      endsAt: toDateInput(offer.endsAt),
      minOrderAmount: offer.minOrderAmount ?? "",
      maxUsesPerUser: offer.maxUsesPerUser ?? "",
      globalUsageLimit: offer.globalUsageLimit ?? "",
      autoApply: !!offer.autoApply,
      stackable: !!offer.stackable,
      status: offer.status,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingOffer(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      toast.error("Coupon code is required");
      return;
    }
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }
    const action = editingOffer
      ? updateOffer({ id: editingOffer._id, data: formData })
      : createOffer(formData);
    const result = await dispatch(action);
    if (result.meta.requestStatus === "fulfilled") closeModal();
  };

  const filtered = useMemo(() => {
    let list = offers;
    if (statusFilter) list = list.filter((o) => o.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) =>
          o.code.toLowerCase().includes(q) ||
          o.title.toLowerCase().includes(q) ||
          (o.description || "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [offers, statusFilter, search]);

  const togglePicker = (field, id) => {
    setFormData((prev) => {
      const current = prev[field] || [];
      return {
        ...prev,
        [field]: current.includes(id)
          ? current.filter((x) => x !== id)
          : [...current, id],
      };
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Offers & Coupons</h1>
          <p className="text-sm text-gray-500">
            Create discount codes, auto-apply campaigns, and BOGO deals
          </p>
        </div>
        <button
          onClick={openAdd}
          className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Create Offer
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Offers"
          value={stats?.total || 0}
          icon={<Ticket size={20} />}
          color="blue"
        />
        <StatCard
          label="Active"
          value={stats?.active || 0}
          icon={<CheckCircle2 size={20} />}
          color="green"
        />
        <StatCard
          label="Inactive"
          value={stats?.inactive || 0}
          icon={<XCircle size={20} />}
          color="yellow"
        />
        <StatCard
          label="Total Redemptions"
          value={stats?.totalRedemptions || 0}
          icon={<Gift size={20} />}
          color="red"
        />
      </div>

      {/* Search + filter */}
      <div className="bg-white border rounded-xl p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search code, title, description…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field md:w-48">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* List */}
      {loading && offers.length === 0 ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border rounded-xl p-12 text-center text-gray-500">
          No offers found. Click "Create Offer" to add one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((offer) => (
            <OfferCard
              key={offer._id}
              offer={offer}
              onEdit={() => openEdit(offer)}
              onToggle={() => dispatch(toggleOfferStatus(offer._id))}
              onDelete={() => setIsDeleteConfirm(offer._id)}
            />
          ))}
        </div>
      )}

      {/* Add/Edit modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[92vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold">
                {editingOffer ? "Edit Offer" : "Create Offer"}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic info */}
              <section>
                <h3 className="font-semibold text-gray-900 mb-3">Basics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Coupon Code *">
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          code: e.target.value.toUpperCase(),
                        })
                      }
                      className="input-field uppercase"
                      placeholder="SAVE20"
                      required
                    />
                  </Field>
                  <Field label="Status">
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="input-field">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </Field>
                  <Field label="Title *" wide>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="input-field"
                      placeholder="20% off on cement"
                      required
                    />
                  </Field>
                  <Field label="Description" wide>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={2}
                      className="input-field"
                      placeholder="Shown to customers when they view the offer"
                    />
                  </Field>
                </div>
              </section>

              {/* Scope */}
              <section>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Applies To
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {SCOPE_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const selected = formData.scope === opt.value;
                    return (
                      <button
                        type="button"
                        key={opt.value}
                        onClick={() =>
                          setFormData({ ...formData, scope: opt.value })
                        }
                        className={`p-3 rounded-lg border flex flex-col items-center gap-1 text-xs font-medium transition ${
                          selected
                            ? "border-orange-500 bg-orange-50 text-orange-700"
                            : "border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}>
                        <Icon size={18} />
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                {formData.scope === "category" && (
                  <ChipPicker
                    label="Categories"
                    items={categories.map((c) => ({
                      id: c._id,
                      name: c.name,
                    }))}
                    selected={formData.categories}
                    onToggle={(id) => togglePicker("categories", id)}
                  />
                )}
                {formData.scope === "subCategory" && (
                  <ChipPicker
                    label="Sub-categories"
                    items={subCategories.map((c) => ({
                      id: c._id,
                      name: c.name,
                    }))}
                    selected={formData.subCategories}
                    onToggle={(id) => togglePicker("subCategories", id)}
                  />
                )}
                {formData.scope === "material" && (
                  <ChipPicker
                    label="Materials"
                    items={materials.map((m) => ({
                      id: m._id,
                      name: m.name,
                    }))}
                    selected={formData.materials}
                    onToggle={(id) => togglePicker("materials", id)}
                  />
                )}
                {formData.scope === "user" && (
                  <ChipPicker
                    label="Users"
                    items={users.map((u) => ({
                      id: u._id,
                      name: `${u.name || "(unnamed)"} · ${u.mobile || ""}`,
                    }))}
                    selected={formData.users}
                    onToggle={(id) => togglePicker("users", id)}
                  />
                )}
              </section>

              {/* Discount */}
              <section>
                <h3 className="font-semibold text-gray-900 mb-3">Discount</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                  {DISCOUNT_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const selected = formData.discountType === opt.value;
                    return (
                      <button
                        type="button"
                        key={opt.value}
                        onClick={() =>
                          setFormData({ ...formData, discountType: opt.value })
                        }
                        className={`p-3 rounded-lg border flex flex-col items-center gap-1 text-xs font-medium transition ${
                          selected
                            ? "border-orange-500 bg-orange-50 text-orange-700"
                            : "border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}>
                        <Icon size={18} />
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.discountType === "percentage" && (
                    <>
                      <Field label="Percentage (%) *">
                        <input
                          type="number"
                          value={formData.discountValue}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              discountValue: e.target.value,
                            })
                          }
                          min={1}
                          max={100}
                          className="input-field"
                          required
                        />
                      </Field>
                      <Field label="Max Discount (₹)">
                        <input
                          type="number"
                          value={formData.maxDiscount}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              maxDiscount: e.target.value,
                            })
                          }
                          min={0}
                          className="input-field"
                          placeholder="e.g. 500"
                        />
                      </Field>
                    </>
                  )}
                  {formData.discountType === "flat" && (
                    <Field label="Discount Amount (₹) *" wide>
                      <input
                        type="number"
                        value={formData.discountValue}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            discountValue: e.target.value,
                          })
                        }
                        min={1}
                        className="input-field"
                        required
                      />
                    </Field>
                  )}
                  {formData.discountType === "bogo" && (
                    <>
                      <Field label="Buy quantity (X) *">
                        <input
                          type="number"
                          value={formData.buyX}
                          onChange={(e) =>
                            setFormData({ ...formData, buyX: e.target.value })
                          }
                          min={1}
                          className="input-field"
                          required
                        />
                      </Field>
                      <Field label="Free quantity (Y) *">
                        <input
                          type="number"
                          value={formData.getY}
                          onChange={(e) =>
                            setFormData({ ...formData, getY: e.target.value })
                          }
                          min={1}
                          className="input-field"
                          required
                        />
                      </Field>
                    </>
                  )}
                  {formData.discountType === "free_delivery" && (
                    <p className="md:col-span-2 text-sm text-gray-500">
                      Delivery charges will be waived when this offer applies.
                    </p>
                  )}
                </div>
              </section>

              {/* Validity & constraints */}
              <section>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Validity & Constraints
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Starts At">
                    <input
                      type="date"
                      value={formData.startsAt}
                      onChange={(e) =>
                        setFormData({ ...formData, startsAt: e.target.value })
                      }
                      className="input-field"
                    />
                  </Field>
                  <Field label="Ends At">
                    <input
                      type="date"
                      value={formData.endsAt}
                      onChange={(e) =>
                        setFormData({ ...formData, endsAt: e.target.value })
                      }
                      className="input-field"
                    />
                  </Field>
                  <Field label="Min Order Amount (₹)">
                    <input
                      type="number"
                      value={formData.minOrderAmount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          minOrderAmount: e.target.value,
                        })
                      }
                      min={0}
                      className="input-field"
                      placeholder="No minimum"
                    />
                  </Field>
                  <Field label="Max Uses per User">
                    <input
                      type="number"
                      value={formData.maxUsesPerUser}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxUsesPerUser: e.target.value,
                        })
                      }
                      min={1}
                      className="input-field"
                      placeholder="Unlimited"
                    />
                  </Field>
                  <Field label="Global Usage Limit" wide>
                    <input
                      type="number"
                      value={formData.globalUsageLimit}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          globalUsageLimit: e.target.value,
                        })
                      }
                      min={1}
                      className="input-field"
                      placeholder="Total redemptions across all users (blank = unlimited)"
                    />
                  </Field>
                </div>
              </section>

              {/* Redemption mode */}
              <section>
                <h3 className="font-semibold text-gray-900 mb-3">Behaviour</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Toggle
                    label="Auto-apply to eligible carts"
                    hint="Customer doesn't need to enter the code"
                    checked={formData.autoApply}
                    onChange={(v) =>
                      setFormData({ ...formData, autoApply: v })
                    }
                  />
                  <Toggle
                    label="Stackable with other offers"
                    hint="Can be combined with other coupons"
                    checked={formData.stackable}
                    onChange={(v) =>
                      setFormData({ ...formData, stackable: v })
                    }
                  />
                </div>
              </section>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn-secondary flex-1">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1">
                  {loading
                    ? "Saving…"
                    : editingOffer
                    ? "Update Offer"
                    : "Create Offer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {isDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Delete Offer?
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              The coupon code will stop working immediately for everyone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteConfirm(null)}
                className="btn-secondary flex-1">
                Cancel
              </button>
              <button
                onClick={async () => {
                  await dispatch(deleteOffer(isDeleteConfirm));
                  setIsDeleteConfirm(null);
                }}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OfferCard({ offer, onEdit, onToggle, onDelete }) {
  const isActive = offer.status === "active";
  const discountText =
    offer.discountType === "percentage"
      ? `${offer.discountValue}% off`
      : offer.discountType === "flat"
      ? `${fmt(offer.discountValue)} off`
      : offer.discountType === "free_delivery"
      ? "Free delivery"
      : `Buy ${offer.buyX} get ${offer.getY}`;

  const scopeText =
    offer.scope === "all"
      ? "All orders"
      : offer.scope === "category"
      ? `${(offer.categories || []).length} categories`
      : offer.scope === "subCategory"
      ? `${(offer.subCategories || []).length} sub-categories`
      : offer.scope === "material"
      ? `${(offer.materials || []).length} materials`
      : `${(offer.users || []).length} users`;

  return (
    <div className="bg-white border rounded-xl p-5 hover:shadow-md transition relative">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
            <Ticket size={20} />
          </div>
          <div>
            <code className="font-mono font-bold text-sm bg-gray-100 text-gray-900 px-2 py-0.5 rounded">
              {offer.code}
            </code>
            <p className="text-xs text-gray-500 mt-1 line-clamp-1">
              {offer.title}
            </p>
          </div>
        </div>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
            isActive
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-500"
          }`}>
          {offer.status}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <Tag2 color="orange">{discountText}</Tag2>
        <Tag2 color="blue">{scopeText}</Tag2>
        {offer.autoApply && <Tag2 color="purple">Auto-apply</Tag2>}
        {offer.minOrderAmount && (
          <Tag2 color="gray">Min {fmt(offer.minOrderAmount)}</Tag2>
        )}
      </div>

      <div className="text-xs text-gray-500 space-y-1 mb-4">
        {offer.endsAt && (
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            Ends {new Date(offer.endsAt).toLocaleDateString("en-IN")}
          </div>
        )}
        <div>
          Redeemed {offer.usageCount || 0}
          {offer.globalUsageLimit ? ` / ${offer.globalUsageLimit}` : ""} times
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onEdit}
          className="flex-1 btn-secondary text-xs py-2 flex items-center justify-center gap-1">
          <Edit2 size={14} /> Edit
        </button>
        <button
          onClick={onToggle}
          title={isActive ? "Deactivate" : "Activate"}
          className={`px-3 py-2 rounded-lg text-xs font-medium ${
            isActive
              ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
              : "bg-green-50 text-green-700 hover:bg-green-100"
          }`}>
          <Power size={14} />
        </button>
        <button
          onClick={onDelete}
          title="Delete"
          className="px-3 py-2 rounded-lg text-xs text-red-500 hover:bg-red-50">
          <Trash2 size={14} />
        </button>
      </div>
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

function Field({ label, children, wide }) {
  return (
    <div className={wide ? "md:col-span-2" : ""}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

function Toggle({ label, hint, checked, onChange }) {
  return (
    <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 w-4 h-4 accent-orange-500"
      />
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {hint && <p className="text-xs text-gray-500 mt-0.5">{hint}</p>}
      </div>
    </label>
  );
}

function Tag2({ color, children }) {
  const map = {
    orange: "bg-orange-50 text-orange-700 border-orange-100",
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    purple: "bg-purple-50 text-purple-700 border-purple-100",
    gray: "bg-gray-50 text-gray-600 border-gray-200",
  };
  return (
    <span
      className={`inline-flex px-2 py-0.5 border rounded-full text-[10px] font-medium ${map[color]}`}>
      {children}
    </span>
  );
}

function ChipPicker({ label, items, selected, onToggle }) {
  const [q, setQ] = useState("");
  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} ({selected.length} selected)
      </label>
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={`Search ${label.toLowerCase()}…`}
        className="input-field mb-2"
      />
      <div className="border rounded-lg p-2 max-h-56 overflow-y-auto flex flex-wrap gap-1.5">
        {filtered.length === 0 ? (
          <p className="text-xs text-gray-400 px-2 py-1">Nothing to show.</p>
        ) : (
          filtered.map((it) => {
            const on = selected.includes(it.id);
            return (
              <button
                type="button"
                key={it.id}
                onClick={() => onToggle(it.id)}
                className={`px-2.5 py-1 rounded-full text-xs border transition ${
                  on
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}>
                {it.name}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
