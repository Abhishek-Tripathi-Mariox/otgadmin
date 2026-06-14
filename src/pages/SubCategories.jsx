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
  getSubCategories,
  getDeletedSubCategories,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
  restoreSubCategory,
  permanentDeleteSubCategory,
  toggleSubCategoryStatus,
  clearMessage,
  clearError,
} from "../store/slices/subCategorySlice";
import { getCategories } from "../store/slices/categorySlice";

export default function SubCategories() {
  const dispatch = useDispatch();
  const {
    subCategories,
    deletedSubCategories,
    loading,
    error,
    message,
    pagination,
  } = useSelector((state) => state.subCategories);
  const { categories } = useSelector((state) => state.categories);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeletedModalOpen, setIsDeletedModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    status: "active",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Filter states
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    status: "",
    fromDate: "",
    toDate: "",
  });

  // Fetch categories on mount
  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  // Fetch sub-categories with filters
  useEffect(() => {
    const params = { page: 1, limit: 20 };
    if (filters.search) params.search = filters.search;
    if (filters.category) params.category = filters.category;
    if (filters.status) params.status = filters.status;
    if (filters.fromDate) params.fromDate = filters.fromDate;
    if (filters.toDate) params.toDate = filters.toDate;
    dispatch(getSubCategories(params));
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.category) {
      toast.error("Please select a category.");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("category", formData.category);
    formDataToSend.append("status", formData.status);

    if (imageFile) {
      formDataToSend.append("image", imageFile);
    } else if (!editingId) {
      toast.error("Please select an image for the sub-category.");
      return;
    }

    try {
      if (editingId) {
        await dispatch(
          updateSubCategory({ id: editingId, formData: formDataToSend }),
        ).unwrap();
      } else {
        await dispatch(createSubCategory(formDataToSend)).unwrap();
      }
      closeModal();
    } catch (err) {
      // Error handled by redux
    }
  };

  const openModal = (subCategory = null) => {
    if (subCategory) {
      setEditingId(subCategory._id);
      setFormData({
        name: subCategory.name,
        category: subCategory.category?._id || subCategory.category,
        status: subCategory.status,
      });
      setImagePreview(subCategory.image);
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        category: categories[0]?._id || "",
        status: "active",
      });
      setImagePreview(null);
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: "", category: "", status: "active" });
    setImageFile(null);
    setImagePreview(null);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this sub-category?")) {
      await dispatch(deleteSubCategory(id));
    }
  };

  const handleToggleStatus = async (id) => {
    await dispatch(toggleSubCategoryStatus(id));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Deleted sub-categories modal handlers
  const openDeletedModal = () => {
    dispatch(getDeletedSubCategories());
    setIsDeletedModalOpen(true);
  };

  const handleRestore = async (id) => {
    await dispatch(restoreSubCategory(id));
  };

  const handlePermanentDelete = async (id) => {
    if (
      confirm(
        "Are you sure you want to permanently delete this sub-category? This action cannot be undone.",
      )
    ) {
      await dispatch(permanentDeleteSubCategory(id));
    }
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      category: "",
      status: "",
      fromDate: "",
      toDate: "",
    });
  };

  const getCategoryName = (subCategory) => {
    if (subCategory.category?.name) {
      return subCategory.category.name;
    }
    const cat = categories.find((c) => c._id === subCategory.category);
    return cat?.name || "Unknown";
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sub Categories</h1>
          <p className="text-sm text-gray-500">
            Manage material sub-categories
          </p>
        </div>

        <div className="flex gap-3">
          <button onClick={openDeletedModal} className="btn-secondary">
            <Trash size={18} /> Deleted
          </button>
          <button onClick={() => openModal()} className="btn-primary">
            <Plus size={18} /> Add Sub Category
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
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search by name..."
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
                setFilters({ ...filters, category: e.target.value })
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

            {/* To Date */}
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
        )}

        {isFilterOpen && (
          <div className="mt-4 flex justify-end">
            <button onClick={clearFilters} className="btn-secondary text-sm">
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* LOADING STATE */}
      {loading && subCategories.length === 0 && (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 font-medium text-gray-600">Image</th>
              <th className="text-left p-4 font-medium text-gray-600">Name</th>
              <th className="text-left p-4 font-medium text-gray-600">
                Category
              </th>
              <th className="text-left p-4 font-medium text-gray-600">
                Status
              </th>
              <th className="text-left p-4 font-medium text-gray-600">
                Created
              </th>
              <th className="text-right p-4 font-medium text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {subCategories.map((subCategory) => (
              <tr
                key={subCategory._id}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="p-4">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                    {subCategory.image ? (
                      <img
                        src={subCategory.image}
                        alt={subCategory.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={20} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-4 font-medium text-gray-900">
                  {subCategory.name}
                </td>
                <td className="p-4 text-gray-600">
                  {getCategoryName(subCategory)}
                </td>
                <td className="p-4">
                  <button
                    onClick={() => handleToggleStatus(subCategory._id)}
                    className={`text-xs px-3 py-1 rounded-full cursor-pointer transition ${
                      subCategory.status === "active"
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-red-100 text-red-700 hover:bg-red-200"
                    }`}
                  >
                    {subCategory.status === "active" ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="p-4 text-gray-500 text-sm">
                  {new Date(subCategory.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => openModal(subCategory)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(subCategory._id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {!loading && subCategories.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center text-gray-500 py-20">
                  No sub-categories found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ADD/EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingId ? "Edit Sub Category" : "Add Sub Category"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image {!editingId && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                  {imagePreview ? (
                    <div className="relative w-full h-40 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 transition"
                    >
                      <Image size={40} className="text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">
                        Click to upload image
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Max 5MB (JPEG, PNG, GIF, WebP)
                      </p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              </div>

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
                    setFormData({ ...formData, category: e.target.value })
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

              {/* Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  className="input-field"
                  placeholder="Enter sub-category name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
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

      {/* DELETED SUB-CATEGORIES MODAL */}
      {isDeletedModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Deleted Sub Categories</h2>
              <button
                onClick={() => setIsDeletedModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            {loading && deletedSubCategories.length === 0 ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              </div>
            ) : deletedSubCategories.length === 0 ? (
              <div className="text-center text-gray-500 py-10">
                No deleted sub-categories
              </div>
            ) : (
              <div className="space-y-4">
                {deletedSubCategories.map((subCategory) => (
                  <div
                    key={subCategory._id}
                    className="flex items-center justify-between p-4 border rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200">
                        {subCategory.image ? (
                          <img
                            src={subCategory.image}
                            alt={subCategory.name}
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
                          {subCategory.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Category: {getCategoryName(subCategory)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Deleted on:{" "}
                          {new Date(subCategory.deletedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRestore(subCategory._id)}
                        className="flex items-center gap-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
                        title="Restore"
                      >
                        <RotateCcw size={16} />
                        Restore
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(subCategory._id)}
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
