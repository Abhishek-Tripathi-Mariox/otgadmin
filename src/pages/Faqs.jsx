import { useEffect, useState, useCallback } from "react";
import { HelpCircle, Plus, Pencil, Trash2, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";

const emptyForm = { question: "", answer: "", order: 0, status: "active" };

export default function Faqs() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchFaqs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/faqs");
      setFaqs(res.data?.data || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load FAQs");
      setFaqs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (faq) => {
    setEditing(faq);
    setForm({
      question: faq.question || "",
      answer: faq.answer || "",
      order: faq.order || 0,
      status: faq.status || "active",
    });
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.question.trim() || !form.answer.trim()) {
      toast.error("Question and answer are required");
      return;
    }
    try {
      setSaving(true);
      if (editing) {
        await api.put(`/faqs/${editing._id}`, form);
        toast.success("FAQ updated");
      } else {
        await api.post("/faqs", form);
        toast.success("FAQ created");
      }
      setModalOpen(false);
      fetchFaqs();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save FAQ");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this FAQ permanently?")) return;
    try {
      await api.delete(`/faqs/${id}`);
      toast.success("FAQ deleted");
      setFaqs((prev) => prev.filter((f) => f._id !== id));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete FAQ");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <HelpCircle size={22} className="text-orange-600" />
            FAQs
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Questions shown to customers on product pages.
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add FAQ
        </button>
      </div>

      {loading && faqs.length === 0 ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      ) : (
        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-medium text-gray-600 w-16">
                  Order
                </th>
                <th className="text-left p-4 font-medium text-gray-600">
                  Question
                </th>
                <th className="text-left p-4 font-medium text-gray-600">
                  Answer
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
              {faqs.map((f) => (
                <tr key={f._id} className="border-b hover:bg-gray-50">
                  <td className="p-4 text-sm text-gray-600">{f.order}</td>
                  <td className="p-4 max-w-[260px]">
                    <p className="text-sm font-medium text-gray-900 line-clamp-2">
                      {f.question}
                    </p>
                  </td>
                  <td className="p-4 max-w-[320px]">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {f.answer}
                    </p>
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-xs px-3 py-1 rounded-full ${
                        f.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {f.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2 items-center">
                      <button
                        onClick={() => openEdit(f)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Edit"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => remove(f._id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && faqs.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center text-gray-500 py-20">
                    No FAQs yet. Click "Add FAQ" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-5 border-b">
              <h2 className="text-lg font-bold">
                {editing ? "Edit FAQ" : "Add FAQ"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={22} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={form.question}
                  onChange={(e) =>
                    setForm({ ...form, question: e.target.value })
                  }
                  placeholder="e.g. How long does delivery take?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Answer
                </label>
                <textarea
                  rows={4}
                  className="input-field"
                  value={form.answer}
                  onChange={(e) => setForm({ ...form, answer: e.target.value })}
                  placeholder="Write the answer customers will see…"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    value={form.order}
                    onChange={(e) =>
                      setForm({ ...form, order: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    className="input-field"
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="border-t p-4 flex justify-end gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="btn-primary flex items-center gap-2"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                {editing ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
