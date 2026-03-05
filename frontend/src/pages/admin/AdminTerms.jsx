import { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { ADMIN_TOKEN_KEY, API_BASE_URL, apiService } from "../../services/api";

const PAGE_SLUG = "terms";

export default function AdminTerms() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [updatedBy, setUpdatedBy] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      ["link"],
      [{ align: [] }],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "indent",
    "link",
    "align",
  ];

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true);
        const data = await apiService.legal.getPage(PAGE_SLUG);
        const payload = data?.data || data;
        setContent(payload?.content || "");
        setLastUpdated(payload?.lastUpdated || null);
        setUpdatedBy(payload?.updatedBy || null);
      } catch (error) {
        console.error("Error fetching terms of service:", error);
        setMessage({
          type: "error",
          text: "Failed to load terms of service. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage({ type: "", text: "" });

      const token = localStorage.getItem(ADMIN_TOKEN_KEY);

      const res = await apiService.legal.updatePage(PAGE_SLUG, { content }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const payload = res?.data || res;

      setLastUpdated(payload?.lastUpdated || null);
      setUpdatedBy(payload?.updatedBy || null);
      setMessage({
        type: "success",
        text: "Terms of service updated successfully!",
      });
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    } catch (error) {
      console.error("Error updating terms of service:", error);
      setMessage({
        type: "error",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to update terms of service. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading terms of service...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Terms of Service Management
        </h1>
        <p className="text-slate-600">
          Edit your website&apos;s terms of service using the WYSIWYG editor
          below.
        </p>
        {lastUpdated && (
          <p className="text-sm text-slate-500 mt-2">
            Last updated: {new Date(lastUpdated).toLocaleString()}{" "}
            {updatedBy ? `by ${updatedBy}` : ""}
          </p>
        )}
      </div>

      {message.text && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
        <label className="block text-sm font-semibold text-slate-700 mb-3">
          Terms of Service Content
        </label>
        <div className="border border-slate-300 rounded-lg overflow-hidden">
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            modules={modules}
            formats={formats}
            className="bg-white"
            style={{ minHeight: "400px" }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-6 py-3 rounded-lg font-semibold text-white transition-all ${
            saving
              ? "bg-slate-400 cursor-not-allowed"
              : "bg-emerald-600 hover:bg-emerald-700 active:scale-95"
          }`}
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Saving...
            </span>
          ) : (
            "Save Changes"
          )}
        </button>

        <a
          href="/legal/terms"
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
          Preview Public Page
        </a>
      </div>
    </div>
  );
}

