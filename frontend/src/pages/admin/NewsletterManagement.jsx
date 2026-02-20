import { useState, useEffect } from "react";
import { apiService } from "../../services/api";
import { IconMail } from "../../components/admin/AdminIcons";

export default function NewsletterManagement() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiService.newsletter.listSubscribers();
      if (res?.subscribers) setSubscribers(res.subscribers);
    } catch (e) {
      setError(e?.message || "Failed to load newsletter subscribers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Newsletter / Email List</h1>
        <p className="text-slate-600 mt-1">
          Emails collected from the Resources page newsletter signup. Subscribers are stored in the backend.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <IconMail className="w-5 h-5 text-slate-500" />
            <span className="font-medium text-slate-700">Total subscribers</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-slate-900">{loading ? "…" : subscribers.length}</span>
            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 disabled:opacity-50"
            >
              Refresh
            </button>
          </div>
        </div>
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">Loading subscribers…</p>
          </div>
        ) : subscribers.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No subscribers yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Source</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Subscribed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {subscribers.map((s) => (
                  <tr key={s._id || s.email} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{s.email}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{s.source || "resources"}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
