import { useMemo, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAdminStore } from "../../store/adminStore";
import { apiService } from "../../services/api";
import { IconChart, IconRanges, IconProducts, IconUsers, IconHome } from "../../components/admin/AdminIcons";

const COLOR_MAP = {
  emerald: { bg: "bg-emerald-500", gradient: "from-emerald-400 to-emerald-600", ring: "text-emerald-500", light: "bg-emerald-50 text-emerald-700" },
  blue: { bg: "bg-blue-500", gradient: "from-blue-400 to-blue-600", ring: "text-blue-500", light: "bg-blue-50 text-blue-700" },
  violet: { bg: "bg-violet-500", gradient: "from-violet-400 to-violet-600", ring: "text-violet-500", light: "bg-violet-50 text-violet-700" },
  amber: { bg: "bg-amber-500", gradient: "from-amber-400 to-amber-600", ring: "text-amber-500", light: "bg-amber-50 text-amber-700" },
};

function StatCard({ icon: Icon, label, value, to, color = "emerald", index = 0 }) {
  const c = COLOR_MAP[color] || COLOR_MAP.emerald;
  const content = (
    <div
      className="relative bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 hover:shadow-xl hover:border-slate-300 hover:-translate-y-1 transition-all duration-300 animate-fade-in overflow-hidden group"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
          <p className="text-3xl font-bold text-slate-900 mt-1 tabular-nums">{value}</p>
        </div>
        <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${c.gradient} text-white shadow-lg shadow-slate-200/50 transition-transform duration-300 group-hover:scale-110`}>
          <Icon className="w-7 h-7" />
        </div>
      </div>
    </div>
  );
  if (to) return <Link to={to} className="block">{content}</Link>;
  return content;
}

function DonutChart({ data, labelKey, valueKey, colors = ["#10b981", "#8b5cf6"], size = 160 }) {
  const total = data.reduce((s, d) => s + (d[valueKey] || 0), 0) || 1;
  const strokeWidth = size * 0.22;
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  const segments = data.map((d, i) => {
    const value = d[valueKey] || 0;
    const ratio = value / total;
    const dash = ratio * circumference;
    const seg = { ...d, dash, offset, ratio: (ratio * 100).toFixed(1), color: colors[i % colors.length] };
    offset += dash;
    return seg;
  });
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {segments.map((seg, i) => (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${seg.dash} ${circumference}`}
              strokeDashoffset={-seg.offset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-slate-800">{total}</span>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
        {data.map((d, i) => (
          <div key={d[labelKey]} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: colors[i % colors.length] }} />
            <span className="text-sm text-slate-600">{d[labelKey]}</span>
            <span className="text-sm font-semibold text-slate-800">({d[valueKey]})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarChart({ data, max, labelKey, valueKey, color = "emerald", showPercent = false }) {
  const cap = Math.max(max, 1);
  const colors = color === "emerald" ? ["#34d399", "#059669"] : color === "violet" ? ["#a78bfa", "#7c3aed"] : ["#60a5fa", "#2563eb"];
  return (
    <div className="space-y-4">
      {data.map((d, i) => {
        const pct = (d[valueKey] / cap) * 100;
        return (
          <div key={d[labelKey]} className="group">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-slate-700 truncate max-w-[40%]">{d[labelKey]}</span>
              <span className="text-sm font-semibold text-slate-800 tabular-nums flex items-center gap-1">
                {d[valueKey]}
                {showPercent && <span className="text-slate-400 font-normal">({pct.toFixed(0)}%)</span>}
              </span>
            </div>
            <div className="h-8 bg-slate-100 rounded-xl overflow-hidden">
              <div
                className="h-full rounded-xl transition-all duration-700 ease-out flex items-center justify-end pr-2"
                style={{
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, ${colors[0]}, ${colors[1]})`,
                  minWidth: d[valueKey] > 0 ? "24px" : 0,
                }}
              />
            </div>
          </div>
        );
      })}
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
    <div className="p-6 md:p-8 min-h-full">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 animate-fade-in-down">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1">Overview of your catalog and activity</p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-white font-medium hover:bg-slate-700 hover:shadow-lg active:scale-[0.98] transition-all duration-200 shadow-sm"
        >
          <IconHome className="w-5 h-5" />
          Go to home page
        </Link>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-1">Key metrics</h2>
        <p className="text-sm text-slate-500 mb-4">Catalog and user counts at a glance</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={IconRanges} label="Total Ranges" value={totalRanges} to="/admin/ranges" color="emerald" index={0} />
        <StatCard icon={IconProducts} label="Total Products" value={totalProducts} to="/admin/products" color="blue" index={1} />
        <StatCard icon={IconChart} label="Configurable" value={configurableCount} color="violet" index={2} />
        <StatCard icon={IconChart} label="Normal" value={normalCount} color="amber" index={3} />
        <StatCard icon={IconUsers} label="Total Users" value={totalUsers} to="/admin/users" color="blue" index={4} />
      </div>

      {/* Charts section */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-slate-800 mb-1">Analytics</h2>
        <p className="text-sm text-slate-500 mb-6">Product and range distribution</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 hover:shadow-lg hover:border-slate-300/80 transition-all duration-300 animate-fade-in" style={{ animationDelay: "200ms" }}>
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 rounded-xl bg-emerald-50">
                <IconRanges className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">Products per range</h3>
                <p className="text-xs text-slate-500">Distribution across ranges</p>
              </div>
            </div>
            {productsPerRange.length ? (
              <BarChart data={productsPerRange} max={maxPerRange} labelKey="name" valueKey="count" color="emerald" showPercent />
            ) : (
              <p className="text-slate-500 text-sm py-4">No ranges yet</p>
            )}
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 hover:shadow-lg hover:border-slate-300/80 transition-all duration-300 animate-fade-in" style={{ animationDelay: "280ms" }}>
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 rounded-xl bg-violet-50">
                <IconChart className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">Product types</h3>
                <p className="text-xs text-slate-500">Configurable vs standard</p>
              </div>
            </div>
            {typeChartData.some((d) => d.value > 0) ? (
              <DonutChart data={typeChartData} labelKey="label" valueKey="value" colors={["#8b5cf6", "#f59e0b"]} size={180} />
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-slate-500 text-sm">
                <IconChart className="w-12 h-12 text-slate-300 mb-2" />
                No product types yet
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Recent items & activity */}
      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-1">Recent activity & items</h2>
        <p className="text-sm text-slate-500 mb-6">Latest updates and quick links</p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 hover:shadow-lg hover:border-slate-300/80 transition-all duration-300 animate-fade-in" style={{ animationDelay: "360ms" }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-blue-50">
                <IconProducts className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">Recently added products</h3>
                <p className="text-xs text-slate-500">Last 5 products</p>
              </div>
            </div>
            {recentProducts.length ? (
              <ul className="space-y-2">
                {recentProducts.map((p) => (
                  <li key={p.id} className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-slate-50 transition-colors group/item">
                    <span className="w-1.5 h-8 rounded-full bg-emerald-400 shrink-0" />
                    <span className="text-sm text-slate-700 truncate flex-1 min-w-0">{p.name}</span>
                    <span className="text-xs text-slate-400 shrink-0">{p.range?.name ?? "—"}</span>
                    <Link to="/admin/products" className="text-emerald-600 hover:text-emerald-700 font-medium text-sm shrink-0">
                      Edit
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 text-sm py-4">No products yet</p>
            )}
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 hover:shadow-lg hover:border-slate-300/80 transition-all duration-300 animate-fade-in" style={{ animationDelay: "440ms" }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-emerald-50">
                <IconRanges className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">Recently added ranges</h3>
                <p className="text-xs text-slate-500">Last 5 ranges</p>
              </div>
            </div>
            {recentRanges.length ? (
              <ul className="space-y-2">
                {recentRanges.map((r) => (
                  <li key={r.id} className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-slate-50 transition-colors group/item">
                    <span className="w-1.5 h-8 rounded-full bg-blue-400 shrink-0" />
                    <span className="text-sm text-slate-700 truncate flex-1">{r.name}</span>
                    <Link to="/admin/ranges" className="text-emerald-600 hover:text-emerald-700 font-medium text-sm shrink-0">
                      Edit
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 text-sm py-4">No ranges yet</p>
            )}
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 hover:shadow-lg hover:border-slate-300/80 transition-all duration-300 animate-fade-in" style={{ animationDelay: "520ms" }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-violet-50">
                <IconChart className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">Activity log</h3>
                <p className="text-xs text-slate-500">Latest 8 events</p>
              </div>
            </div>
            {recentActivity.length ? (
              <ul className="relative space-y-0">
                <span className="absolute left-[7px] top-2 bottom-2 w-px bg-slate-200" aria-hidden />
                {recentActivity.map((a, i) => (
                  <li key={a.id} className="relative flex gap-3 py-3 pl-6">
                    <span className="absolute left-0 w-3.5 h-3.5 rounded-full bg-violet-400 border-2 border-white shadow-sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-700">{a.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{new Date(a.timestamp).toLocaleString()}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 text-sm py-4">No recent activity</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
