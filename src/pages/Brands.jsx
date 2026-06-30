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
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getBrands,
  getDeletedBrands,
  createBrand,
  updateBrand,
  deleteBrand,
  restoreBrand,
  permanentDeleteBrand,
  toggleBrandStatus,
  clearMessage,
  clearError,
} from "../store/slices/brandSlice";

export default function Brands() {
  const dispatch = useDispatch();
  const { brands, deletedBrands, loading, error, message } = useSelector(
    (state) => state.brands,
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeletedModalOpen, setIsDeletedModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: "", status: "active" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Fetch brands on mount. Use a high limit so ALL brands show (the API
  // defaults to only 10 per page, which hid newly added / older brands).
  useEffect(() => {
    dispatch(getBrands({ limit: 1000 }));
  }, [dispatch]);

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

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("status", formData.status);

    if (imageFile) {
      formDataToSend.append("image", imageFile);
    } else if (!editingId) {
      toast.error("Please select an image for the brand.");
      return;
    }

    try {
      if (editingId) {
        await dispatch(
          updateBrand({ id: editingId, formData: formDataToSend }),
        ).unwrap();
      } else {
        await dispatch(createBrand(formDataToSend)).unwrap();
      }
      closeModal();
    } catch (err) {
      // Error handled by redux
    }
  };

  const openModal = (brand = null) => {
    if (brand) {
      setEditingId(brand._id);
      setFormData({
        name: brand.name,
        status: brand.status,
      });
      setImagePreview(brand.image);
    } else {
      setEditingId(null);
      setFormData({ name: "", status: "active" });
      setImagePreview(null);
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: "", status: "active" });
    setImageFile(null);
    setImagePreview(null);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this brand?")) {
      await dispatch(deleteBrand(id));
    }
  };

  const handleToggleStatus = async (id) => {
    await dispatch(toggleBrandStatus(id));
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

  // Deleted brands modal handlers
  const openDeletedModal = () => {
    dispatch(getDeletedBrands());
    setIsDeletedModalOpen(true);
  };

  const handleRestore = async (id) => {
    await dispatch(restoreBrand(id));
  };

  const handlePermanentDelete = async (id) => {
    if (
      confirm(
        "Are you sure you want to permanently delete this brand? This action cannot be undone.",
      )
    ) {
      await dispatch(permanentDeleteBrand(id));
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Brands</h1>
          <p className="text-sm text-gray-500">Manage product brands</p>
        </div>

        <div className="flex gap-3">
          <button onClick={openDeletedModal} className="btn-secondary">
            <Trash size={18} /> Deleted
          </button>
          <button onClick={() => openModal()} className="btn-primary">
            <Plus size={18} /> Add Brand
          </button>
        </div>
      </div>

      {/* LOADING STATE */}
      {loading && brands.length === 0 && (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      )}

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {brands.map((brand) => (
          <div
            key={brand._id}
            className="group bg-white border rounded-xl p-6 hover:shadow-md transition relative"
          >
            {/* STATUS TOGGLE */}
            <button
              onClick={() => handleToggleStatus(brand._id)}
              className={`absolute top-4 right-4 text-xs px-3 py-1 rounded-full cursor-pointer transition ${
                brand.status === "active"
                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                  : "bg-red-100 text-red-700 hover:bg-red-200"
              }`}
            >
              {brand.status === "active" ? "Active" : "Inactive"}
            </button>

            {/* IMAGE */}
            <div className="w-full h-32 rounded-xl bg-gray-100 flex items-center justify-center mb-4 overflow-hidden">
              {brand.image ? (
                <img
                  src={brand.image}
                  alt={brand.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package size={40} className="text-gray-400" />
              )}
            </div>

            {/* NAME */}
            <h3 className="font-semibold text-gray-900 text-lg">
              {brand.name}
            </h3>
            <p className="text-sm text-gray-500 mt-1">Product brand</p>

            {/* ACTIONS */}
            <div className="absolute inset-x-0 bottom-4 px-6 flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition">
              <button
                onClick={() => openModal(brand)}
                className="text-blue-600 hover:text-blue-800"
                title="Edit"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={() => handleDelete(brand._id)}
                className="text-red-600 hover:text-red-800"
                title="Delete"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}

        {!loading && brands.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-20">
            No brands added yet
          </div>
        )}
      </div>

      {/* ADD/EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingId ? "Edit Brand" : "Add Brand"}
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
                  Brand Image{" "}
                  {!editingId && <span className="text-red-500">*</span>}
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

              {/* Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Name <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  className="input-field"
                  placeholder="Enter brand name"
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

      {/* DELETED BRANDS MODAL */}
      {isDeletedModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Deleted Brands</h2>
              <button
                onClick={() => setIsDeletedModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            {loading && deletedBrands.length === 0 ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              </div>
            ) : deletedBrands.length === 0 ? (
              <div className="text-center text-gray-500 py-10">
                No deleted brands
              </div>
            ) : (
              <div className="space-y-4">
                {deletedBrands.map((brand) => (
                  <div
                    key={brand._id}
                    className="flex items-center justify-between p-4 border rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200">
                        {brand.image ? (
                          <img
                            src={brand.image}
                            alt={brand.name}
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
                          {brand.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Deleted on:{" "}
                          {new Date(brand.deletedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRestore(brand._id)}
                        className="flex items-center gap-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
                        title="Restore"
                      >
                        <RotateCcw size={16} />
                        Restore
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(brand._id)}
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
