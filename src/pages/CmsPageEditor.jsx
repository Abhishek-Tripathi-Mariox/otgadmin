import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, Eye, Save } from "lucide-react";
import toast from "react-hot-toast";
import RichTextEditor from "../components/RichTextEditor";
import {
  getCmsPage,
  saveCmsPage,
  clearError,
  clearMessage,
  clearPage,
} from "../store/slices/cmsPageSlice";

export default function CmsPageEditor() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const titleFromQuery = searchParams.get("title") || "";

  const { page, loading, saving, message, error } = useSelector(
    (s) => s.cmsPages,
  );

  const [title, setTitle] = useState(titleFromQuery);
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("published");
  const [body, setBody] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    dispatch(clearPage());
    if (slug) dispatch(getCmsPage(slug));
    return () => {
      dispatch(clearPage());
    };
  }, [dispatch, slug]);

  useEffect(() => {
    if (page) {
      setTitle(page.title || titleFromQuery || "");
      setDescription(page.description || "");
      setBody(page.body || "");
      setStatus(page.status || "published");
    } else if (titleFromQuery) {
      setTitle(titleFromQuery);
    }
  }, [page, titleFromQuery]);

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

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!slug?.trim()) {
      toast.error("Slug is required");
      return;
    }
    await dispatch(
      saveCmsPage({
        slug,
        title: title.trim(),
        description: description.trim() || undefined,
        body,
        status,
      }),
    );
  };

  const bodySizeKb = useMemo(
    () => Math.round((new Blob([body]).size / 1024) * 10) / 10,
    [body],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/cms")}
            className="p-2 rounded-lg hover:bg-gray-100"
            title="Back"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {title || "Untitled Page"}
            </h1>
            <p className="text-xs text-gray-500">
              /{slug} · {bodySizeKb} KB
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPreview((v) => !v)}
            className="btn-secondary flex items-center gap-2"
          >
            <Eye size={16} /> {showPreview ? "Hide" : "Preview"}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center gap-2"
          >
            <Save size={16} /> {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      ) : (
        <>
          <div className="bg-white border rounded-xl p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  className="input-field"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  className="input-field"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Short description (optional)
                </label>
                <input
                  className="input-field"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
          </div>

          <RichTextEditor value={body} onChange={setBody} />

          <p className="text-xs text-gray-500">
            Tip: drag &amp; drop images directly into the editor — they will be
            inserted at the cursor. Use the toolbar for headings, lists, links
            and formatting.
          </p>

          {showPreview && (
            <div className="bg-white border rounded-xl p-6">
              <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
                Preview
              </h2>
              <h1 className="text-2xl font-bold mb-2">{title}</h1>
              {description && (
                <p className="text-sm text-gray-600 mb-4">{description}</p>
              )}
              <div
                className="cms-preview prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: body }}
              />
              <style>{`
                .cms-preview h1 { font-size: 1.6rem; font-weight: 700; margin: 0.6rem 0; }
                .cms-preview h2 { font-size: 1.3rem; font-weight: 700; margin: 0.6rem 0; }
                .cms-preview h3 { font-size: 1.1rem; font-weight: 600; margin: 0.5rem 0; }
                .cms-preview p  { margin: 0.4rem 0; line-height: 1.6; }
                .cms-preview ul { list-style: disc; padding-left: 1.5rem; margin: 0.4rem 0; }
                .cms-preview ol { list-style: decimal; padding-left: 1.5rem; margin: 0.4rem 0; }
                .cms-preview blockquote { border-left: 3px solid #f59e0b; padding-left: 0.75rem; color: #555; margin: 0.5rem 0; }
                .cms-preview img { max-width: 100%; height: auto; border-radius: 8px; }
                .cms-preview a  { color: #ea580c; text-decoration: underline; }
              `}</style>
            </div>
          )}
        </>
      )}
    </div>
  );
}
