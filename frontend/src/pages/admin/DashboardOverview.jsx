import { useMemo, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCatalogStore } from "../../store/catalogStore";
import { useAdminStore } from "../../store/adminStore";
import { apiService } from "../../services/api";
import { IconChart, IconRanges, IconProducts, IconUsers } from "../../components/admin/AdminIcons";

function StatCard({ icon: Icon, label, value, to, color = "emerald" }) {
  const bg = color === "emerald" ? "bg-emerald-500" : color === "blue" ? "bg-blue-500" : color === "violet" ? "bg-violet-500" : "bg-amber-500";
  const content = (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${bg} text-white`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
  if (to) return <Link to={to}>{content}</Link>;
  return content;
}

function BarChart({ data, max, labelKey, valueKey, color = "bg-emerald-500" }) {
  const cap = Math.max(max, 1);
  return (
    <div className="space-y-2">
      {data.map((d) => (
        <div key={d[labelKey]} className="flex items-center gap-3">
          <span className="w-28 text-sm text-slate-600 truncate">{d[labelKey]}</span>
          <div className="flex-1 h-6 bg-slate-100 rounded overflow-hidden">
            <div
              className={`h-full ${color} rounded transition-all duration-500`}
              style={{ width: `${(d[valueKey] / cap) * 100}%` }}
            />
          </div>
          <span className="text-sm font-medium text-slate-700 w-8">{d[valueKey]}</span>
        </div>
      ))}
    </div>
  );
}

const mapProduct = (p) => {
  const range = p?.range;
  return {
    id: p?._id || p?.id,
    name: p?.name || "",
    rangeId: range?._id || range?.id || p?.range,
    range: range ? { id: range._id || range.id, name: range.name } : null,
    configurable: p?.productType === "configurable" || p?.isConfigurable === true,
    createdAt: p?.createdAt,
  };
};
const mapRange = (r) => ({
  id: r?._id || r?.id,
  name: r?.name || "",
  createdAt: r?.createdAt,
});

export default function DashboardOverview() {
  const activityLog = useAdminStore((s) => s.activityLog);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await apiService.adminDashboard.stats();
        if (!cancelled && res?.stats) setStats(res.stats);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Failed to load dashboard stats");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const totalRanges = stats?.totalRanges ?? 0;
  const totalProducts = stats?.totalProducts ?? 0;
  const configurableCount = stats?.configurableCount ?? 0;
  const normalCount = stats?.normalCount ?? 0;
  const totalUsers = stats?.totalUsers ?? 0;

  const productsPerRange = useMemo(
    () => (stats?.productsPerRange || []).map((r) => ({ name: r.name, count: r.count || 0 })),
    [stats?.productsPerRange]
  );
  const typeChartData = useMemo(
    () => [
      { label: "Configurable", value: configurableCount },
      { label: "Normal", value: normalCount },
    ],
    [configurableCount, normalCount]
  );
  const maxType = Math.max(configurableCount + normalCount, 1);
  const recentProducts = useMemo(
    () => (stats?.recentProducts || []).map(mapProduct).slice(0, 5),
    [stats?.recentProducts]
  );
  const recentRanges = useMemo(
    () => (stats?.recentRanges || []).map(mapRange).slice(0, 5),
    [stats?.recentRanges]
  );
  const recentActivity = useMemo(() => activityLog.slice(0, 8), [activityLog]);
  const maxPerRange = Math.max(...productsPerRange.map((d) => d.count), 1);

  if (loading && !stats) {
    return (
      <div className="p-6 md:p-8 flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-3" />
          <p className="text-slate-600">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="p-6 md:p-8">
        <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center">
          <p className="text-red-700 font-medium mb-2">Failed to load dashboard</p>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">Overview of your catalog and activity</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={IconRanges} label="Total Ranges" value={totalRanges} to="/admin/ranges" color="emerald" />
        <StatCard icon={IconProducts} label="Total Products" value={totalProducts} to="/admin/products" color="blue" />
        <StatCard icon={IconChart} label="Configurable" value={configurableCount} color="violet" />
        <StatCard icon={IconChart} label="Normal" value={normalCount} color="amber" />
        <StatCard icon={IconUsers} label="Total Users" value={totalUsers} to="/admin/users" color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Products per range</h2>
          {productsPerRange.length ? (
            <BarChart data={productsPerRange} max={maxPerRange} labelKey="name" valueKey="count" />
          ) : (
            <p className="text-slate-500 text-sm">No ranges yet</p>
          )}
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Configurable vs normal</h2>
          <BarChart
            data={typeChartData}
            max={maxType}
            labelKey="label"
            valueKey="value"
            color="bg-violet-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Recently added products</h2>
          {recentProducts.length ? (
            <ul className="space-y-3">
              {recentProducts.map((p) => (
                <li key={p.id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700 truncate flex-1">{p.name}</span>
                  <span className="text-slate-400 ml-2">{p.range?.name ?? "—"}</span>
                  <Link
                    to="/admin/products"
                    className="ml-2 text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Edit
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 text-sm">No products yet</p>
          )}
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Recently added ranges</h2>
          {recentRanges.length ? (
            <ul className="space-y-3">
              {recentRanges.map((r) => (
                <li key={r.id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700 truncate flex-1">{r.name}</span>
                  <Link
                    to="/admin/ranges"
                    className="text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Edit
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 text-sm">No ranges yet</p>
          )}
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Activity log</h2>
          {recentActivity.length ? (
            <ul className="space-y-3">
              {recentActivity.map((a) => (
                <li key={a.id} className="text-sm">
                  <span className="text-slate-700">{a.label}</span>
                  <span className="text-slate-400 ml-2">
                    {new Date(a.timestamp).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 text-sm">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
}
