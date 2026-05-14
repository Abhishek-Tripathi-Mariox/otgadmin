import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  RotateCcw,
  X,
  Trash,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getBanners,
  getDeletedBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  restoreBanner,
  permanentDeleteBanner,
  toggleBannerStatus,
  reorderBanners,
  clearMessage,
  clearError,
} from "../store/slices/bannerSlice";

const emptyForm = {
  title: "",
  content: "",
  status: "active",
  enableBulkQuote: true,
};

export default function HomeBanners() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { banners, deletedBanners, loading, error, message } = useSelector(
    (state) => state.banners,
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeletedModalOpen, setIsDeletedModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    dispatch(getBanners());
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

  const openModal = (banner = null) => {
    if (banner) {
      setEditingId(banner._id);
      setFormData({
        title: banner.title || "",
        content: banner.content || "",
        status: banner.status || "active",
        enableBulkQuote: !!banner.enableBulkQuote,
      });
      setImagePreview(banner.image);
    } else {
      setEditingId(null);
      setFormData(emptyForm);
      setImagePreview(null);
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(emptyForm);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editingId && !imageFile) {
      toast.error("Please select a banner image.");
      return;
    }

    const fd = new FormData();
    fd.append("title", formData.title);
    fd.append("content", formData.content);
    fd.append("status", formData.status);
    fd.append("enableBulkQuote", formData.enableBulkQuote ? "true" : "false");
    if (imageFile) fd.append("image", imageFile);

    try {
      if (editingId) {
        await dispatch(
          updateBanner({ id: editingId, formData: fd }),
        ).unwrap();
      } else {
        await dispatch(createBanner(fd)).unwrap();
      }
      closeModal();
    } catch {
      // handled via redux/error toast
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this banner?")) {
      await dispatch(deleteBanner(id));
    }
  };

  const handleToggleStatus = async (id) => {
    await dispatch(toggleBannerStatus(id));
  };

  const openDeletedModal = () => {
    dispatch(getDeletedBanners());
    setIsDeletedModalOpen(true);
  };

  const handleRestore = async (id) => {
    await dispatch(restoreBanner(id));
    dispatch(getBanners());
  };

  const handlePermanentDelete = async (id) => {
    if (
      confirm(
        "Are you sure you want to permanently delete this banner? This action cannot be undone.",
      )
    ) {
      await dispatch(permanentDeleteBanner(id));
    }
  };

  const moveBanner = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= banners.length) return;
    const next = [...banners];
    [next[index], next[target]] = [next[target], next[index]];
    dispatch(reorderBanners(next.map((b) => b._id)));
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/cms")}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            title="Back to CMS"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Homepage Banners
            </h1>
            <p className="text-sm text-gray-500">
              Manage promotional banners shown on the customer home screen
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={openDeletedModal} className="btn-secondary">
            <Trash size={18} /> Deleted
          </button>
          <button onClick={() => openModal()} className="btn-primary">
            <Plus size={18} /> Add Banner
          </button>
        </div>
      </div>

      {/* LOADING STATE */}
      {loading && banners.length === 0 && (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      )}

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {banners.map((banner, index) => (
          <div
            key={banner._id}
            className="group bg-white border rounded-xl overflow-hidden hover:shadow-md transition flex flex-col"
          >
            {/* IMAGE */}
            <div className="relative w-full aspect-video bg-gray-100">
              {banner.image ? (
                <img
                  src={banner.image}
                  alt={banner.title || "Banner"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon size={40} className="text-gray-400" />
                </div>
              )}

              {/* STATUS TOGGLE */}
              <button
                onClick={() => handleToggleStatus(banner._id)}
                className={`absolute top-3 right-3 text-xs px-3 py-1 rounded-full cursor-pointer transition ${
                  banner.status === "active"
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-red-100 text-red-700 hover:bg-red-200"
                }`}
              >
                {banner.status === "active" ? "Active" : "Inactive"}
              </button>

              {/* ORDER BADGE */}
              <span className="absolute top-3 left-3 text-xs px-2 py-1 rounded-md bg-black/60 text-white">
                #{index + 1}
              </span>
            </div>

            {/* BODY */}
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="font-semibold text-gray-900 text-base line-clamp-1">
                {banner.title || "(No title)"}
              </h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2 min-h-[2.5rem]">
                {banner.content || "—"}
              </p>

              <div className="flex items-center gap-2 mt-3 flex-wrap">
                {banner.enableBulkQuote && (
                  <span className="text-xs px-2 py-1 rounded-full bg-orange-50 text-orange-700">
                    Bulk Quote CTA
                  </span>
                )}
              </div>

              {/* ACTIONS */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t">
                <div className="flex gap-1">
                  <button
                    onClick={() => moveBanner(index, -1)}
                    disabled={index === 0}
                    className="p-2 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    onClick={() => moveBanner(index, 1)}
                    disabled={index === banners.length - 1}
                    className="p-2 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    <ArrowDown size={16} />
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(banner)}
                    className="text-blue-600 hover:text-blue-800 p-2"
                    title="Edit"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(banner._id)}
                    className="text-red-600 hover:text-red-800 p-2"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {!loading && banners.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-20 border-2 border-dashed border-gray-200 rounded-xl">
            No banners added yet. Click "Add Banner" to create one.
          </div>
        )}
      </div>

      {/* ADD/EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingId ? "Edit Banner" : "Add Banner"}
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
                  Banner Image / GIF{" "}
                  {!editingId && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                  {imagePreview ? (
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
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
                      className="w-full aspect-video border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 transition"
                    >
                      <ImageIcon size={40} className="text-gray-400 mb-2" />
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

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  className="input-field"
                  placeholder="Enter banner title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              {/* Content / Offer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Offer / Subtext
                </label>
                <textarea
                  rows={3}
                  className="input-field resize-none"
                  placeholder="e.g. Flat 10% off on bulk orders"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                />
              </div>

              {/* Enable Bulk Quote */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-orange-600 rounded"
                  checked={formData.enableBulkQuote}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      enableBulkQuote: e.target.checked,
                    })
                  }
                />
                <span className="text-sm text-gray-700">
                  Show "Get Bulk Quote" call-to-action on this banner
                </span>
              </label>

              {/* Status */}
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

      {/* DELETED BANNERS MODAL */}
      {isDeletedModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Deleted Banners</h2>
              <button
                onClick={() => setIsDeletedModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            {loading && deletedBanners.length === 0 ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              </div>
            ) : deletedBanners.length === 0 ? (
              <div className="text-center text-gray-500 py-10">
                No deleted banners
              </div>
            ) : (
              <div className="space-y-4">
                {deletedBanners.map((banner) => (
                  <div
                    key={banner._id}
                    className="flex items-center justify-between p-4 border rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                        {banner.image ? (
                          <img
                            src={banner.image}
                            alt={banner.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon size={24} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {banner.title || "(No title)"}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-1">
                          {banner.content || "—"}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Updated:{" "}
                          {banner.updatedAt
                            ? new Date(banner.updatedAt).toLocaleDateString()
                            : "—"}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleRestore(banner._id)}
                        className="flex items-center gap-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
                        title="Restore"
                      >
                        <RotateCcw size={16} />
                        Restore
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(banner._id)}
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
