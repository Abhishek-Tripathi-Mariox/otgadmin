import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus,
  Edit2,
  Trash2,
  Package,
  RotateCcw,
  Image,
  X,
  Trash,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getMaterials,
  getDeletedMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  restoreMaterial,
  permanentDeleteMaterial,
  toggleMaterialStatus,
  getUnits,
  clearMessage,
  clearError,
} from "../store/slices/materialSlice";
import { getCategories } from "../store/slices/categorySlice";
import { getSubCategories } from "../store/slices/subCategorySlice";

export default function Materials() {
  const dispatch = useDispatch();
  const {
    materials,
    deletedMaterials,
    units,
    loading,
    error,
    message,
    pagination,
  } = useSelector((state) => state.materials);
  const { categories } = useSelector((state) => state.categories);
  const { subCategories } = useSelector((state) => state.subCategories);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeletedModalOpen, setIsDeletedModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    specs: "",
    brand: "",
    category: "",
    subCategory: "",
    unit: "",
    minOrderQty: "1",
    diameter: "",
    basicPrice: "",
    mrp: "",
    sellingPrice: "",
    gst: "",
    requestQuote: false,
    transportation: {
      type: "free",
      charge: "",
    },
    status: "active",
  });

  // TMT bar diameter options
  const tmtDiameters = ["6mm", "8mm", "10mm", "12mm", "16mm", "20mm", "25mm", "32mm", "36mm", "40mm"];
  const isTMTMaterial = formData.name.toLowerCase().includes("tmt");
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const fileInputRef = useRef(null);

  // Filter states
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    subCategory: "",
    status: "",
    fromDate: "",
    toDate: "",
  });

  // Fetch initial data
  useEffect(() => {
    dispatch(getCategories());
    dispatch(getSubCategories());
    dispatch(getUnits());
  }, [dispatch]);

  // Fetch materials with filters
  useEffect(() => {
    const params = { page: 1, limit: 20 };
    if (filters.search) params.search = filters.search;
    if (filters.category) params.category = filters.category;
    if (filters.subCategory) params.subCategory = filters.subCategory;
    if (filters.status) params.status = filters.status;
    if (filters.fromDate) params.fromDate = filters.fromDate;
    if (filters.toDate) params.toDate = filters.toDate;
    dispatch(getMaterials(params));
  }, [dispatch, filters]);

  // Filter sub-categories when category changes in form
  useEffect(() => {
    if (formData.category) {
      const filtered = subCategories.filter(
        (sub) =>
          (sub.category?._id || sub.category) === formData.category &&
          sub.status === "active",
      );
      setFilteredSubCategories(filtered);
    } else {
      setFilteredSubCategories([]);
    }
  }, [formData.category, subCategories]);

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

    if (!formData.category) {
      toast.error("Please select a category.");
      return;
    }

    if (!formData.unit) {
      toast.error("Please select a unit.");
      return;
    }

    if (!formData.requestQuote && !formData.basicPrice) {
      toast.error("Please enter the basic price.");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("category", formData.category);
    formDataToSend.append("unit", formData.unit);
    formDataToSend.append("status", formData.status);
    formDataToSend.append("requestQuote", formData.requestQuote ? "true" : "false");

    // Always send these fields so backend persists them correctly
    formDataToSend.append("description", formData.description || "");
    formDataToSend.append("specs", formData.specs || "");
    formDataToSend.append("brand", formData.brand || "");
    // MRP is auto-calculated: Basic Price + GST
    const basicPrice = parseFloat(formData.basicPrice) || 0;
    const gstPercent = parseFloat(formData.gst) || 0;
    const calculatedMrp = basicPrice + (basicPrice * gstPercent) / 100;
    formDataToSend.append("basicPrice", formData.basicPrice || "0");
    formDataToSend.append("mrp", calculatedMrp.toString());
    formDataToSend.append("sellingPrice", formData.sellingPrice || "0");
    const sellingPrice = parseFloat(formData.sellingPrice) || 0;
    const finalSellingPrice = sellingPrice + (sellingPrice * gstPercent) / 100;
    formDataToSend.append("finalSellingPrice", finalSellingPrice.toString());
    formDataToSend.append("gst", formData.gst || "0");
    formDataToSend.append("minOrderQty", formData.minOrderQty || "1");
    formDataToSend.append("diameter", formData.diameter || "");

    formDataToSend.append(
      "transportation[type]",
      formData.transportation.type || "free",
    );
    if (
      formData.transportation.type !== "free" &&
      formData.transportation.charge
    ) {
      formDataToSend.append(
        "transportation[charge]",
        formData.transportation.charge,
      );
    }

    if (formData.subCategory) {
      formDataToSend.append("subCategory", formData.subCategory);
    }

    if (imageFiles.length > 0) {
      imageFiles.forEach((file) => {
        formDataToSend.append("images", file);
      });
    }

    // Send existing images that should be kept (for edit mode)
    if (editingId) {
      const existingImages = imagePreviews.filter(
        (p) => typeof p === "string" && p.startsWith("http")
      );
      formDataToSend.append("existingImages", JSON.stringify(existingImages));
    }

    if (!editingId && imageFiles.length === 0) {
      toast.error("Please select at least one image for the material.");
      return;
    }

    if (editingId) {
      const existingCount = imagePreviews.filter(
        (p) => typeof p === "string" && p.startsWith("http")
      ).length;
      if (existingCount + imageFiles.length === 0) {
        toast.error("Please keep or upload at least one image.");
        return;
      }
    }

    try {
      if (editingId) {
        await dispatch(
          updateMaterial({ id: editingId, formData: formDataToSend }),
        ).unwrap();
      } else {
        await dispatch(createMaterial(formDataToSend)).unwrap();
      }
      closeModal();
    } catch (err) {
      // Error handled by redux
    }
  };

  const openModal = (material = null) => {
    if (material) {
      setEditingId(material._id);
      setFormData({
        name: material.name,
        description: material.description || "",
        specs: material.specs || "",
        brand: material.brand || "",
        category: material.category?._id || material.category,
        subCategory: material.subCategory?._id || material.subCategory || "",
        unit: material.unit,
        minOrderQty: material.minOrderQty?.toString() || "1",
        diameter: material.diameter || "",
        basicPrice: material.basicPrice ? material.basicPrice.toString() : "",
        mrp: material.mrp ? material.mrp.toString() : "",
        sellingPrice: material.sellingPrice ? material.sellingPrice.toString() : "",
        gst: material.gst ? material.gst.toString() : "",
        requestQuote: material.requestQuote || false,
        transportation: {
          type: material.transportation?.type || "free",
          charge: material.transportation?.charge ? material.transportation.charge.toString() : "",
        },
        status: material.status,
      });
      setImagePreviews(material.images && material.images.length > 0 ? [...material.images] : material.image ? [material.image] : []);
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        description: "",
        specs: "",
        brand: "",
        category: "",
        subCategory: "",
        unit: "",
        minOrderQty: "1",
        diameter: "",
        basicPrice: "",
        mrp: "",
        sellingPrice: "",
        gst: "",
        requestQuote: false,
        transportation: {
          type: "free",
          charge: "",
        },
        status: "active",
      });
      setImagePreviews([]);
    }
    setImageFiles([]);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      name: "",
      description: "",
      specs: "",
      brand: "",
      category: "",
      subCategory: "",
      unit: "",
      minOrderQty: "1",
      diameter: "",
      basicPrice: "",
      mrp: "",
      sellingPrice: "",
      gst: "",
      requestQuote: false,
      transportation: {
        type: "free",
        charge: "",
      },
      status: "active",
    });
    setImageFiles([]);
    setImagePreviews([]);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this material?")) {
      await dispatch(deleteMaterial(id));
    }
  };

  const handleToggleStatus = async (id) => {
    await dispatch(toggleMaterialStatus(id));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = imagePreviews.length + files.length;
    if (totalImages > 5) {
      toast.error("You can upload a maximum of 5 images.");
      return;
    }
    const validFiles = [];
    const newPreviews = [];
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB limit.`);
        continue;
      }
      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }
    setImageFiles((prev) => [...prev, ...validFiles]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index) => {
    const preview = imagePreviews[index];
    // Check if it's a blob URL (newly added file) or an existing S3 URL
    const isNewFile = preview && preview.startsWith("blob:");
    if (isNewFile) {
      // Find which new file index this corresponds to
      const existingCount = imagePreviews
        .slice(0, index)
        .filter((p) => !p.startsWith("blob:")).length;
      const newFileIndex = index - existingCount;
      setImageFiles((prev) => prev.filter((_, i) => i !== newFileIndex));
    }
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Deleted materials modal handlers
  const openDeletedModal = () => {
    dispatch(getDeletedMaterials());
    setIsDeletedModalOpen(true);
  };

  const handleRestore = async (id) => {
    await dispatch(restoreMaterial(id));
  };

  const handlePermanentDelete = async (id) => {
    if (
      confirm(
        "Are you sure you want to permanently delete this material? This action cannot be undone.",
      )
    ) {
      await dispatch(permanentDeleteMaterial(id));
    }
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      category: "",
      subCategory: "",
      status: "",
      fromDate: "",
      toDate: "",
    });
  };

  const getCategoryName = (material) => {
    if (material.category?.name) {
      return material.category.name;
    }
    const cat = categories.find((c) => c._id === material.category);
    return cat?.name || "-";
  };

  const getSubCategoryName = (material) => {
    if (!material.subCategory) return "-";
    if (material.subCategory?.name) {
      return material.subCategory.name;
    }
    const sub = subCategories.find((s) => s._id === material.subCategory);
    return sub?.name || "-";
  };

  // Get filtered sub-categories for filter dropdown
  const filterSubCategories = filters.category
    ? subCategories.filter(
        (sub) => (sub.category?._id || sub.category) === filters.category,
      )
    : subCategories;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Materials</h1>
          <p className="text-sm text-gray-500">Manage construction materials</p>
        </div>

        <div className="flex gap-3 flex-shrink-0">
          <button onClick={openDeletedModal} className="btn-secondary">
            <Trash size={18} /> Deleted
          </button>
          <button onClick={() => openModal()} className="btn-primary">
            <Plus size={18} /> Add Material
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
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search by name or description..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="input-field pl-10"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filters.category}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  category: e.target.value,
                  subCategory: "",
                })
              }
              className="input-field"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Sub-Category Filter */}
            <select
              value={filters.subCategory}
              onChange={(e) =>
                setFilters({ ...filters, subCategory: e.target.value })
              }
              className="input-field"
              disabled={!filters.category}
            >
              <option value="">All Sub-Categories</option>
              {filterSubCategories.map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {sub.name}
                </option>
              ))}
            </select>

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
      {loading && materials.length === 0 && (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white border rounded-xl overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 font-medium text-gray-600">Image</th>
              <th className="text-left p-4 font-medium text-gray-600">
                Material
              </th>
              <th className="text-left p-4 font-medium text-gray-600">
                Category
              </th>
              <th className="text-left p-4 font-medium text-gray-600">Brand</th>
              <th className="text-left p-4 font-medium text-gray-600">Unit</th>
              <th className="text-left p-4 font-medium text-gray-600">
                MRP / Price
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
            {materials.map((material) => (
              <tr
                key={material._id}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="p-4">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                    {(material.images?.[0] || material.image) ? (
                      <img
                        src={material.images?.[0] || material.image}
                        alt={material.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={20} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <div className="font-medium text-gray-900">
                    {material.name}
                  </div>
                  {material.specs && (
                    <div className="text-xs text-gray-500 truncate max-w-[200px]">
                      {material.specs}
                    </div>
                  )}
                </td>
                <td className="p-4 text-gray-600">
                  {getCategoryName(material)}
                </td>
                <td className="p-4 text-gray-600">{material.brand || "-"}</td>
                <td className="p-4 text-gray-600">{material.unit}</td>
                <td className="p-4">
                  {material.requestQuote ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium whitespace-nowrap">
                      Quote
                    </span>
                  ) : material.mrp ? (
                    <div>
                      <div className="text-xs text-gray-400 line-through">
                        ₹{Math.round(material.mrp)}
                      </div>
                      <div className="text-sm font-medium text-green-700">
                        ₹{Math.round(material.finalSellingPrice || material.sellingPrice || material.mrp)}
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="p-4">
                  <button
                    onClick={() => handleToggleStatus(material._id)}
                    className={`text-xs px-3 py-1 rounded-full cursor-pointer transition ${
                      material.status === "active"
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-red-100 text-red-700 hover:bg-red-200"
                    }`}
                  >
                    {material.status === "active" ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => openModal(material)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(material._id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {!loading && materials.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center text-gray-500 py-20">
                  No materials found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ADD/EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingId ? "Edit Material" : "Add Material"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Upload - Multiple */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Images <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-400 ml-1">(Min 1, Max 5 — at least 1 required)</span>
                </label>
                <div className="space-y-3">
                  {/* Image Previews Grid */}
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                      {imagePreviews.map((preview, index) => (
                        <div
                          key={index}
                          className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-100 border"
                        >
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded-full hover:bg-red-600"
                          >
                            <X size={14} />
                          </button>
                          {index === 0 && (
                            <span className="absolute bottom-1 left-1 bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded">
                              Primary
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload Button */}
                  {imagePreviews.length < 5 && (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 transition"
                    >
                      <Image size={32} className="text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">
                        Click to upload images ({imagePreviews.length}/5)
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Max 5MB each (JPEG, PNG, GIF, WebP)
                      </p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleImageChange}
                    multiple
                    className="hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category Select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    className="input-field"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value,
                        subCategory: "",
                      })
                    }
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sub-Category Select (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sub Category{" "}
                    <span className="text-gray-400">(Optional)</span>
                  </label>
                  <select
                    className="input-field"
                    value={formData.subCategory}
                    onChange={(e) =>
                      setFormData({ ...formData, subCategory: e.target.value })
                    }
                    disabled={!formData.category}
                  >
                    <option value="">None</option>
                    {filteredSubCategories.map((sub) => (
                      <option key={sub._id} value={sub._id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Name Input */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Material Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    className="input-field"
                    placeholder="Enter material name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                {/* Unit Select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    className="input-field"
                    value={formData.unit}
                    onChange={(e) =>
                      setFormData({ ...formData, unit: e.target.value })
                    }
                  >
                    <option value="">Select Unit</option>
                    {units.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specs <span className="text-gray-400">(Optional)</span>
                  </label>
                  <textarea
                    className="input-field"
                    rows="3"
                    placeholder="Enter material specifications"
                    value={formData.specs}
                    onChange={(e) =>
                      setFormData({ ...formData, specs: e.target.value })
                    }
                  ></textarea>
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand <span className="text-gray-400">(Optional)</span>
                  </label>
                  <input
                    className="input-field"
                    placeholder="Enter brand name"
                    value={formData.brand}
                    onChange={(e) =>
                      setFormData({ ...formData, brand: e.target.value })
                    }
                  />
                </div>

                {/* Min Order Qty */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Order Qty
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="input-field"
                    placeholder="e.g., 1"
                    value={formData.minOrderQty}
                    onChange={(e) =>
                      setFormData({ ...formData, minOrderQty: e.target.value })
                    }
                  />
                </div>

                {/* TMT Bar Diameter - shown only when name contains TMT */}
                {isTMTMaterial && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Diameter (TMT Bar)
                    </label>
                    <select
                      className="input-field"
                      value={formData.diameter}
                      onChange={(e) =>
                        setFormData({ ...formData, diameter: e.target.value })
                      }
                    >
                      <option value="">Select Diameter</option>
                      {tmtDiameters.map((dia) => (
                        <option key={dia} value={dia}>
                          {dia}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Request a Quote Toggle */}
                <div className="md:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={formData.requestQuote}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            requestQuote: e.target.checked,
                            ...(e.target.checked ? { basicPrice: "", mrp: "", sellingPrice: "", gst: "" } : {}),
                          })
                        }
                      />
                      <div className="w-10 h-5 bg-gray-300 rounded-full peer-checked:bg-orange-500 transition"></div>
                      <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-5"></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      Request a Quote
                    </span>
                    <span className="text-xs text-gray-400">(Enable if pricing is not fixed — MRP will not be required)</span>
                  </label>
                </div>

                {/* Basic Price */}
                {!formData.requestQuote && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Basic Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    className="input-field"
                    placeholder="Enter basic price"
                    value={formData.basicPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, basicPrice: e.target.value })
                    }
                  />
                </div>
                )}

                {/* GST */}
                {!formData.requestQuote && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GST % <span className="text-gray-400">(Optional)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    className="input-field"
                    placeholder="e.g., 18"
                    value={formData.gst}
                    onChange={(e) =>
                      setFormData({ ...formData, gst: e.target.value })
                    }
                  />
                </div>
                )}

                {/* MRP (Auto-calculated) */}
                {!formData.requestQuote && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    MRP (₹) <span className="text-gray-400">(Auto-calculated)</span>
                  </label>
                  <input
                    type="text"
                    readOnly
                    className="input-field bg-gray-100 cursor-not-allowed"
                    value={
                      formData.basicPrice
                        ? `₹${(
                            parseFloat(formData.basicPrice) +
                            (parseFloat(formData.basicPrice) * parseFloat(formData.gst || "0")) / 100
                          ).toFixed(2)}`
                        : ""
                    }
                  />
                </div>
                )}

                {/* Selling Price */}
                {!formData.requestQuote && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selling Price (Basic) (₹) <span className="text-gray-400">(Optional)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="input-field"
                    placeholder="Enter selling price"
                    value={formData.sellingPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, sellingPrice: e.target.value })
                    }
                  />
                </div>
                )}

                {/* Final Selling Price (Auto-calculated) */}
                {!formData.requestQuote && formData.sellingPrice && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Selling Price(₹) <span className="text-gray-400">(Auto-calculated)</span>
                    </label>
                    <input
                      type="text"
                      readOnly
                      className="input-field bg-gray-100 cursor-not-allowed font-semibold text-green-700"
                      value={`₹${(
                        parseFloat(formData.sellingPrice) +
                        (parseFloat(formData.sellingPrice) * parseFloat(formData.gst || "0")) / 100
                      ).toFixed(2)}`}
                    />
                  </div>
                )}

                {/* Transportation Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transportation
                  </label>
                  <select
                    className="input-field"
                    value={formData.transportation.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        transportation: {
                          ...formData.transportation,
                          type: e.target.value,
                          charge:
                            e.target.value === "free"
                              ? ""
                              : formData.transportation.charge,
                        },
                      })
                    }
                  >
                    <option value="free">Free</option>
                    <option value="per_km">Per KM</option>
                    <option value="per_unit">Per Unit</option>
                    <option value="fixed">Fixed</option>
                  </select>
                </div>

                {/* Transportation Charge */}
                {formData.transportation.type !== "free" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transport Charge (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="input-field"
                      placeholder={
                        formData.transportation.type === "per_km"
                          ? "₹ per km"
                          : formData.transportation.type === "per_unit"
                            ? "₹ per unit"
                            : "Fixed amount"
                      }
                      value={formData.transportation.charge}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          transportation: {
                            ...formData.transportation,
                            charge: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                )}
              </div>

              {/* Price Summary - shown when basic price is entered and not request a quote */}
              {!formData.requestQuote && formData.basicPrice && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    Price Summary
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Basic Price:</span>
                      <span className="font-medium">₹{parseFloat(formData.basicPrice).toFixed(2)}</span>
                    </div>
                    {formData.gst && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">GST ({formData.gst}%):</span>
                        <span className="font-medium text-orange-600">
                          + ₹{(parseFloat(formData.basicPrice) * parseFloat(formData.gst) / 100).toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-orange-200 pt-2">
                      <span className="text-gray-700 font-semibold">MRP (incl. GST):</span>
                      <span className="font-bold text-green-700 text-base">
                        ₹{(
                          parseFloat(formData.basicPrice) +
                          (parseFloat(formData.basicPrice) * parseFloat(formData.gst || "0") / 100)
                        ).toFixed(2)}
                      </span>
                    </div>
                    {formData.sellingPrice && (
                      <>
                        <div className="flex justify-between border-t border-orange-200 pt-2">
                          <span className="text-gray-600">Selling Price:</span>
                          <span className="font-medium">₹{parseFloat(formData.sellingPrice).toFixed(2)}</span>
                        </div>
                        {formData.gst && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">GST on Selling Price ({formData.gst}%):</span>
                            <span className="font-medium text-orange-600">
                              + ₹{(parseFloat(formData.sellingPrice) * parseFloat(formData.gst) / 100).toFixed(2)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between border-t border-orange-200 pt-2">
                          <span className="text-gray-700 font-semibold">Selling Price (SP):</span>
                          <span className="font-bold text-green-700 text-base">
                            ₹{(
                              parseFloat(formData.sellingPrice) +
                              (parseFloat(formData.sellingPrice) * parseFloat(formData.gst || "0") / 100)
                            ).toFixed(2)}
                          </span>
                        </div>
                      </>
                    )}
                    {formData.transportation.type === "fixed" && formData.transportation.charge && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Transportation (Fixed):</span>
                          <span className="font-medium">₹{parseFloat(formData.transportation.charge).toFixed(2)}</span>
                        </div>
                        {formData.gst && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">GST on Transport ({formData.gst}%):</span>
                            <span className="font-medium text-orange-600">
                              + ₹{(parseFloat(formData.transportation.charge) * parseFloat(formData.gst) / 100).toFixed(2)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-semibold">Transport (incl. GST):</span>
                          <span className="font-semibold text-orange-600">
                            ₹{(parseFloat(formData.transportation.charge) + (parseFloat(formData.transportation.charge) * parseFloat(formData.gst || "0") / 100)).toFixed(2)}
                          </span>
                        </div>
                      </>
                    )}
                    {formData.transportation.type === "per_km" && formData.transportation.charge && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Transportation (Per KM):</span>
                          <span className="font-medium">₹{parseFloat(formData.transportation.charge).toFixed(2)}/km</span>
                        </div>
                        {formData.gst && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">GST on Transport ({formData.gst}%):</span>
                            <span className="font-medium text-orange-600">
                              + ₹{(parseFloat(formData.transportation.charge) * parseFloat(formData.gst) / 100).toFixed(2)}/km
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-semibold">Transport (incl. GST):</span>
                          <span className="font-semibold text-orange-600">
                            ₹{(parseFloat(formData.transportation.charge) + (parseFloat(formData.transportation.charge) * parseFloat(formData.gst || "0") / 100)).toFixed(2)}/km
                          </span>
                        </div>
                      </>
                    )}
                    {formData.transportation.type === "per_unit" && formData.transportation.charge && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Transportation (Per Unit):</span>
                          <span className="font-medium">₹{parseFloat(formData.transportation.charge).toFixed(2)}/unit</span>
                        </div>
                        {formData.gst && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">GST on Transport ({formData.gst}%):</span>
                            <span className="font-medium text-orange-600">
                              + ₹{(parseFloat(formData.transportation.charge) * parseFloat(formData.gst) / 100).toFixed(2)}/unit
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-semibold">Transport (incl. GST):</span>
                          <span className="font-semibold text-orange-600">
                            ₹{(parseFloat(formData.transportation.charge) + (parseFloat(formData.transportation.charge) * parseFloat(formData.gst || "0") / 100)).toFixed(2)}/unit
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button className="btn-primary" disabled={loading}>
                  {loading ? "Saving..." : editingId ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETED MATERIALS MODAL */}
      {isDeletedModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Deleted Materials</h2>
              <button
                onClick={() => setIsDeletedModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            {loading && deletedMaterials.length === 0 ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              </div>
            ) : deletedMaterials.length === 0 ? (
              <div className="text-center text-gray-500 py-10">
                No deleted materials
              </div>
            ) : (
              <div className="space-y-4">
                {deletedMaterials.map((material) => (
                  <div
                    key={material._id}
                    className="flex items-center justify-between p-4 border rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200">
                        {(material.images?.[0] || material.image) ? (
                          <img
                            src={material.images?.[0] || material.image}
                            alt={material.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={24} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {material.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Category: {getCategoryName(material)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Deleted on:{" "}
                          {new Date(material.deletedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRestore(material._id)}
                        className="flex items-center gap-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
                        title="Restore"
                      >
                        <RotateCcw size={16} />
                        Restore
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(material._id)}
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
    </div>
  );
}
