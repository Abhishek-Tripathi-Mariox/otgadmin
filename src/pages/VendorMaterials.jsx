import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  Plus,
  Edit2,
  Trash2,
  ArrowLeft,
  Search,
  Package,
  X,
  Store,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getVendorMaterials,
  addVendorMaterial,
  updateVendorMaterial,
  removeVendorMaterial,
  toggleVendorMaterialAvailability,
  getVendor,
  clearMessage,
  clearError,
  clearVendorMaterials,
} from "../store/slices/vendorSlice";
import { getMaterials } from "../store/slices/materialSlice";
import { getCategories } from "../store/slices/categorySlice";
import { getSubCategories } from "../store/slices/subCategorySlice";

export default function VendorMaterials() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { vendorId } = useParams();

  const { vendor, vendorMaterials, loading, error, message } = useSelector(
    (state) => state.vendors,
  );
  const { materials } = useSelector((state) => state.materials);
  const { categories } = useSelector((state) => state.categories);
  const { subCategories } = useSelector((state) => state.subCategories);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    materialId: "",
    price: "",
    minOrderQty: "1",
    maxOrderQty: "",
    isAvailable: true,
    specs: "",
  });

  // Filter states for material selection
  const [materialFilter, setMaterialFilter] = useState({
    category: "",
    subCategory: "",
    search: "",
  });

  // Fetch initial data
  useEffect(() => {
    if (vendorId) {
      dispatch(getVendor(vendorId));
      dispatch(getVendorMaterials({ vendorId }));
      dispatch(getMaterials({ limit: 100 }));
      dispatch(getCategories());
      dispatch(getSubCategories());
    }

    return () => {
      dispatch(clearVendorMaterials());
    };
  }, [dispatch, vendorId]);

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

    if (!formData.price) {
      toast.error("Price is required");
      return;
    }

    const payload = {
      price: parseFloat(formData.price),
      minOrderQty: parseInt(formData.minOrderQty) || 1,
      maxOrderQty: formData.maxOrderQty
        ? parseInt(formData.maxOrderQty)
        : undefined,
      isAvailable: formData.isAvailable,
      specs: formData.specs || undefined,
    };

    try {
      if (editingMaterial) {
        await dispatch(
          updateVendorMaterial({
            vendorId,
            materialId: editingMaterial.material._id,
            data: payload,
          }),
        ).unwrap();
      } else {
        if (!formData.materialId) {
          toast.error("Please select a material");
          return;
        }
        await dispatch(
          addVendorMaterial({
            vendorId,
            data: { materialId: formData.materialId, ...payload },
          }),
        ).unwrap();
      }
      closeModal();
    } catch (err) {
      // Error handled by redux
    }
  };

  const openModal = (vendorMaterial = null) => {
    if (vendorMaterial) {
      setEditingMaterial(vendorMaterial);
      setFormData({
        materialId: vendorMaterial.material._id,
        price: vendorMaterial.price?.toString() || "",
        minOrderQty: vendorMaterial.minOrderQty?.toString() || "1",
        maxOrderQty: vendorMaterial.maxOrderQty?.toString() || "",
        isAvailable: vendorMaterial.isAvailable !== false,
        specs: vendorMaterial.specs || "",
      });
    } else {
      setEditingMaterial(null);
      setFormData({
        materialId: "",
        price: "",
        minOrderQty: "1",
        maxOrderQty: "",
        isAvailable: true,
        specs: "",
      });
      setMaterialFilter({ category: "", subCategory: "", search: "" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMaterial(null);
  };

  const handleRemove = async (materialId) => {
    if (confirm("Are you sure you want to remove this material from vendor?")) {
      await dispatch(removeVendorMaterial({ vendorId, materialId }));
    }
  };

  const handleToggleAvailability = async (materialId) => {
    await dispatch(toggleVendorMaterialAvailability({ vendorId, materialId }));
  };

  // Filter materials for selection (exclude already added)
  const getAvailableMaterials = () => {
    const addedMaterialIds = vendorMaterials.map((vm) => vm.material?._id);
    let filtered = materials.filter(
      (m) => !addedMaterialIds.includes(m._id) && m.status === "active",
    );

    if (materialFilter.category) {
      filtered = filtered.filter(
        (m) => (m.category?._id || m.category) === materialFilter.category,
      );
    }

    if (materialFilter.subCategory) {
      filtered = filtered.filter(
        (m) =>
          (m.subCategory?._id || m.subCategory) === materialFilter.subCategory,
      );
    }

    if (materialFilter.search) {
      const searchLower = materialFilter.search.toLowerCase();
      filtered = filtered.filter((m) =>
        m.name.toLowerCase().includes(searchLower),
      );
    }

    return filtered;
  };

  // Get filtered sub-categories based on selected category
  const getFilteredSubCategories = () => {
    if (!materialFilter.category) return [];
    return subCategories.filter(
      (sub) =>
        (sub.category?._id || sub.category) === materialFilter.category &&
        sub.status === "active",
    );
  };

  // Filter vendor materials by search
  const filteredVendorMaterials = searchTerm
    ? vendorMaterials.filter((vm) =>
        vm.material?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : vendorMaterials;

  const getCategoryName = (material) => {
    return material?.category?.name || "-";
  };

  const getSubCategoryName = (material) => {
    return material?.subCategory?.name || "-";
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => navigate("/vendors")}
            className="flex items-center gap-1 mb-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft size={18} />
            Back to Vendors
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Vendor Materials</h1>
          {vendor && (
            <div className="flex items-center gap-2 mt-1">
              <Store size={16} className="text-orange-500" />
              <span className="text-sm text-gray-600">
                {vendor.name} - {vendor.business?.name}
              </span>
            </div>
          )}
        </div>

        <button onClick={() => openModal()} className="btn-primary">
          <Plus size={18} /> Add Material
        </button>
      </div>

      {/* SEARCH */}
      <div className="relative max-w-md">
        <Search
          size={18}
          className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2"
        />
        <input
          type="text"
          placeholder="Search materials..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 input-field"
        />
      </div>

      {/* LOADING STATE */}
      {loading && vendorMaterials.length === 0 && (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-b-2 border-orange-600 rounded-full animate-spin"></div>
        </div>
      )}

      {/* TABLE */}
      <div className="overflow-hidden bg-white border rounded-xl">
        <table className="w-full">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="p-4 font-medium text-left text-gray-600">
                Material
              </th>
              <th className="p-4 font-medium text-left text-gray-600">
                Category
              </th>
              <th className="p-4 font-medium text-left text-gray-600">Price</th>
              <th className="p-4 font-medium text-left text-gray-600">
                Order Qty
              </th>
              <th className="p-4 font-medium text-left text-gray-600">
                Available
              </th>
              <th className="p-4 font-medium text-right text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredVendorMaterials.map((vm) => (
              <tr key={vm._id} className="transition border-b hover:bg-gray-50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 overflow-hidden bg-gray-100 rounded-lg">
                      {(vm.material?.images?.[0] || vm.material?.image) ? (
                        <img
                          src={vm.material.images?.[0] || vm.material.image}
                          alt={vm.material.name}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full">
                          <Package size={18} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 font-medium text-gray-900">
                        {vm.material?.name}
                        {vm.addedByVendor && (
                          <span
                            className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full ${
                              vm.verificationStatus === "approved"
                                ? "bg-green-100 text-green-700"
                                : vm.verificationStatus === "rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                            title={`Added by vendor • ${vm.verificationStatus || "pending"}`}
                          >
                            Vendor • {vm.verificationStatus || "pending"}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {vm.material?.unit}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-sm text-gray-600">
                    {getCategoryName(vm.material)}
                  </div>
                  {vm.material?.subCategory && (
                    <div className="text-xs text-gray-500">
                      {getSubCategoryName(vm.material)}
                    </div>
                  )}
                </td>
                <td className="p-4">
                  <div className="font-semibold text-gray-900">
                    ₹{vm.price?.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    per {vm.material?.unit}
                  </div>
                </td>
                <td className="p-4 text-sm text-gray-600">
                  <div>Min: {vm.minOrderQty || 1}</div>
                  {vm.maxOrderQty && <div>Max: {vm.maxOrderQty}</div>}
                </td>
                <td className="p-4">
                  <button
                    onClick={() => handleToggleAvailability(vm.material?._id)}
                    className={`text-xs px-3 py-1 rounded-full cursor-pointer transition ${
                      vm.isAvailable
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-red-100 text-red-700 hover:bg-red-200"
                    }`}
                  >
                    {vm.isAvailable ? "Available" : "Unavailable"}
                  </button>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => openModal(vm)}
                      className="p-1 text-blue-600 hover:text-blue-800"
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleRemove(vm.material?._id)}
                      className="p-1 text-red-600 hover:text-red-800"
                      title="Remove"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {!loading && filteredVendorMaterials.length === 0 && (
              <tr>
                <td colSpan="6" className="py-20 text-center text-gray-500">
                  No materials added to this vendor yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ADD/EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">
                {editingMaterial ? "Edit Material Pricing" : "Add Material"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Material Selection (only for adding) */}
              {!editingMaterial && (
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-gray-700">
                    Select Material
                  </h3>

                  {/* Filters */}
                  <div className="grid grid-cols-1 gap-3 mb-3 md:grid-cols-3">
                    <select
                      className="input-field"
                      value={materialFilter.category}
                      onChange={(e) =>
                        setMaterialFilter({
                          ...materialFilter,
                          category: e.target.value,
                          subCategory: "",
                        })
                      }
                    >
                      <option value="">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>

                    <select
                      className="input-field"
                      value={materialFilter.subCategory}
                      onChange={(e) =>
                        setMaterialFilter({
                          ...materialFilter,
                          subCategory: e.target.value,
                        })
                      }
                      disabled={!materialFilter.category}
                    >
                      <option value="">All Sub-Categories</option>
                      {getFilteredSubCategories().map((sub) => (
                        <option key={sub._id} value={sub._id}>
                          {sub.name}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      className="input-field"
                      placeholder="Search materials..."
                      value={materialFilter.search}
                      onChange={(e) =>
                        setMaterialFilter({
                          ...materialFilter,
                          search: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Material List */}
                  <div className="overflow-y-auto border rounded-lg max-h-48">
                    {getAvailableMaterials().length === 0 ? (
                      <div className="py-8 text-center text-gray-500">
                        No materials available
                      </div>
                    ) : (
                      getAvailableMaterials().map((material) => (
                        <div
                          key={material._id}
                          className={`flex items-center gap-3 p-3 cursor-pointer transition ${
                            formData.materialId === material._id
                              ? "bg-orange-50 border-l-4 border-orange-500"
                              : "hover:bg-gray-50 border-l-4 border-transparent"
                          }`}
                          onClick={() =>
                            setFormData({
                              ...formData,
                              materialId: material._id,
                            })
                          }
                        >
                          <div className="w-8 h-8 overflow-hidden bg-gray-100 rounded">
                            {(material.images?.[0] || material.image) ? (
                              <img
                                src={material.images?.[0] || material.image}
                                alt={material.name}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="flex items-center justify-center w-full h-full">
                                <Package size={14} className="text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium">
                              {material.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {material.category?.name} • {material.unit}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Selected Material Info (for editing) */}
              {editingMaterial && (
                <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50">
                  <div className="w-12 h-12 overflow-hidden bg-gray-200 rounded-lg">
                    {editingMaterial.material?.image ? (
                      <img
                        src={editingMaterial.material.image}
                        alt={editingMaterial.material.name}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full">
                        <Package size={20} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold">
                      {editingMaterial.material?.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {editingMaterial.material?.category?.name} •{" "}
                      {editingMaterial.material?.unit}
                    </div>
                  </div>
                </div>
              )}

              {/* Pricing & Availability */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-700">
                  Pricing & Availability
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Price (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      className="input-field"
                      placeholder="Enter price"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Availability
                    </label>
                    <select
                      className="input-field"
                      value={formData.isAvailable.toString()}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isAvailable: e.target.value === "true",
                        })
                      }
                    >
                      <option value="true">Available</option>
                      <option value="false">Unavailable</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Min Order Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="input-field"
                      placeholder="1"
                      value={formData.minOrderQty}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          minOrderQty: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Max Order Quantity{" "}
                      <span className="text-gray-400">(Optional)</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="input-field"
                      placeholder="No limit"
                      value={formData.maxOrderQty}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxOrderQty: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Material Specs{" "}
                      <span className="text-gray-400">(Optional)</span>
                    </label>
                    <textarea
                      className="input-field"
                      rows="2"
                      placeholder="Enter material specifications..."
                      value={formData.specs}
                      onChange={(e) =>
                        setFormData({ ...formData, specs: e.target.value })
                      }
                    ></textarea>
                  </div>
                </div>
              </div>

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
                  {loading
                    ? "Saving..."
                    : editingMaterial
                      ? "Update"
                      : "Add Material"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
