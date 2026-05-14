import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  ShieldCheck,
  Info,
  HelpCircle,
  Hammer,
  Plus,
  Trash2,
  Edit2,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getCmsPages,
  deleteCmsPage,
  clearError,
  clearMessage,
} from "../store/slices/cmsPageSlice";

// Suggested default pages that map directly to drawer entries in the customer app
const DEFAULT_PAGES = [
  {
    slug: "about-us",
    title: "About Us",
    description: "Tell customers who you are and what you do.",
    icon: Info,
  },
  {
    slug: "terms-conditions",
    title: "Terms & Conditions",
    description: "Legal terms for using the app and services.",
    icon: FileText,
  },
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    description: "How customer data is collected, used and stored.",
    icon: ShieldCheck,
  },
  {
    slug: "faq",
    title: "FAQ",
    description: "Frequently asked questions.",
    icon: HelpCircle,
  },
  {
    slug: "vendor-guidelines",
    title: "Vendor Guidelines",
    description: "Onboarding, quality standards and rules for vendors.",
    icon: Hammer,
  },
];

export default function CMS() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pages, loading, error, message } = useSelector((s) => s.cmsPages);

  const [showNewModal, setShowNewModal] = useState(false);
  const [newSlug, setNewSlug] = useState("");
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    dispatch(getCmsPages());
  }, [dispatch]);

  useEffect(() => {
    if (message) {
      toast.success(message);
      dispatch(clearMessage());
      dispatch(getCmsPages());
    }
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [message, error, dispatch]);

  const existingSlugs = new Set(pages.map((p) => p.slug));

  // Combine defaults that aren't yet created + actual pages
  const defaultsToShow = DEFAULT_PAGES.filter((d) => !existingSlugs.has(d.slug));

  const handleEdit = (slug) => navigate(`/cms/edit/${slug}`);

  const handleDelete = async (id) => {
    if (!confirm("Delete this page? This cannot be undone.")) return;
    await dispatch(deleteCmsPage(id));
  };

  const submitNew = () => {
    if (!newTitle.trim()) {
      toast.error("Title is required");
      return;
    }
    const slug =
      (newSlug || newTitle)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-") || "untitled";
    setShowNewModal(false);
    setNewSlug("");
    setNewTitle("");
    navigate(`/cms/edit/${slug}?title=${encodeURIComponent(newTitle)}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CMS Pages</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage content for About Us, T&amp;C, Privacy Policy and more.
            Changes are reflected in the customer app instantly.
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} /> New Page
        </button>
      </div>

      {loading && pages.length === 0 ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      ) : (
        <>
          {pages.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
                Published Pages
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pages.map((p) => (
                  <div
                    key={p._id}
                    className="bg-white border rounded-xl p-5 hover:shadow-md transition group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 rounded-lg bg-orange-50">
                        <FileText className="w-5 h-5 text-orange-600" />
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          p.status === "published"
                            ? "bg-green-50 text-green-600"
                            : "bg-yellow-50 text-yellow-700"
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-gray-900">
                      {p.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">/{p.slug}</p>
                    {p.description && (
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                        {p.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-3">
                      Updated {new Date(p.updatedAt).toLocaleDateString()}
                    </p>
                    <div className="flex items-center justify-between pt-3 mt-3 border-t">
                      <button
                        onClick={() => handleEdit(p.slug)}
                        className="flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700"
                      >
                        <Edit2 size={14} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {defaultsToShow.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
                Suggested Pages
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {defaultsToShow.map((d) => {
                  const Icon = d.icon;
                  return (
                    <div
                      key={d.slug}
                      onClick={() =>
                        navigate(
                          `/cms/edit/${d.slug}?title=${encodeURIComponent(d.title)}`,
                        )
                      }
                      className="bg-white border border-dashed rounded-xl p-5 cursor-pointer hover:shadow-md hover:border-orange-300 transition group"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-2 rounded-lg bg-gray-50 group-hover:bg-orange-50">
                          <Icon className="w-5 h-5 text-gray-500 group-hover:text-orange-600" />
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500">
                          Not created
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-gray-900 group-hover:text-orange-600">
                        {d.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">/{d.slug}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        {d.description}
                      </p>
                      <div className="flex items-center justify-between pt-3 mt-3 border-t">
                        <span className="text-xs text-gray-400">
                          Click to create
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* NEW PAGE MODAL */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-4">Create new page</h2>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              className="input-field mb-3"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="About Us"
            />
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug <span className="text-gray-400">(optional, auto-generated)</span>
            </label>
            <input
              className="input-field"
              value={newSlug}
              onChange={(e) =>
                setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))
              }
              placeholder="about-us"
            />
            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setShowNewModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button onClick={submitNew} className="btn-primary">
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
