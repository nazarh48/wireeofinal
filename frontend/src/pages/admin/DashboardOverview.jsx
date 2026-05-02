import { useMemo, useEffect, useState, Profiler } from "react";
import { Link } from "react-router-dom";
import { useAdminStore } from "../../store/adminStore";
import { apiService } from "../../services/api";
import { IconChart, IconRanges, IconProducts, IconUsers } from "../../components/admin/AdminIcons";
import MetricCard from "../../components/admin/MetricCard";
import AnalyticsCard from "../../components/admin/AnalyticsCard";
import RecentItemsCard from "../../components/admin/RecentItemsCard";
import ActivityTimeline from "../../components/admin/ActivityTimeline";
import DashboardHeader from "../../components/admin/DashboardHeader";

const GRADIENT_MAP = {
  emerald: "from-emerald-500 to-emerald-600",
  blue: "from-blue-500 to-blue-600",
  violet: "from-violet-500 to-violet-600",
  amber: "from-amber-500 to-amber-600",
};

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

function DashboardOverviewInner() {
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
  const standardCount = stats?.standardCount ?? stats?.normalCount ?? 0;
  const totalUsers = stats?.totalUsers ?? 0;

  const productsPerRange = useMemo(
    () => (stats?.productsPerRange || []).map((r) => ({ name: r.name, count: r.count || 0 })),
    [stats?.productsPerRange]
  );
  const typeChartData = useMemo(
    () => [
      { label: "Configurable", value: configurableCount },
      { label: "Standard", value: standardCount },
    ],
    [configurableCount, standardCount]
  );
  const maxType = Math.max(configurableCount + standardCount, 1);
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
    <div className="p-6 md:p-8 min-h-full bg-slate-50">
      <DashboardHeader 
        title="Dashboard" 
        subtitle="Overview of your catalog and activity"
        showHomeButton={true}
      />

      <section className="mb-10">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-800 mb-1">Key metrics</h2>
          <p className="text-sm text-slate-500">Catalog and user counts at a glance</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          <MetricCard icon={IconRanges} label="Total Ranges" value={totalRanges} to="/admin/ranges" gradient={GRADIENT_MAP.emerald} delay={0} />
          <MetricCard icon={IconProducts} label="Total Products" value={totalProducts} to="/admin/products" gradient={GRADIENT_MAP.blue} delay={0.05} />
          <MetricCard icon={IconChart} label="Configurable" value={configurableCount} gradient={GRADIENT_MAP.violet} delay={0.1} />
          <MetricCard icon={IconChart} label="Standard" value={standardCount} gradient={GRADIENT_MAP.amber} delay={0.15} />
          <MetricCard icon={IconUsers} label="Total Users" value={totalUsers} to="/admin/users" gradient={GRADIENT_MAP.blue} delay={0.2} />
        </div>
      </section>

      <section className="mb-10">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-800 mb-1">Analytics</h2>
          <p className="text-sm text-slate-500">Product and range distribution</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnalyticsCard 
            icon={IconRanges} 
            title="Products per range" 
            subtitle="Distribution across ranges"
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            delay={0.25}
          >
            {productsPerRange.length ? (
              <BarChart data={productsPerRange} max={maxPerRange} labelKey="name" valueKey="count" color="emerald" showPercent />
            ) : (
              <p className="text-slate-500 text-sm py-4 text-center">No ranges yet</p>
            )}
          </AnalyticsCard>
          
          <AnalyticsCard 
            icon={IconChart} 
            title="Product types" 
            subtitle="Configurable and standard"
            iconBg="bg-violet-50"
            iconColor="text-violet-600"
            delay={0.3}
          >
            {typeChartData.some((d) => d.value > 0) ? (
              <DonutChart data={typeChartData} labelKey="label" valueKey="value" colors={["#8b5cf6", "#f59e0b"]} size={180} />
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-slate-500 text-sm">
                <IconChart className="w-12 h-12 text-slate-300 mb-2" />
                No product types yet
              </div>
            )}
          </AnalyticsCard>
        </div>
      </section>

      <section>
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-800 mb-1">Recent activity & items</h2>
          <p className="text-sm text-slate-500">Latest updates and quick links</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <RecentItemsCard
            icon={IconProducts}
            title="Recently added products"
            subtitle="Last 5 products"
            items={recentProducts.map(p => ({ id: p.id, name: p.name, subtitle: p.range?.name }))}
            linkTo="/admin/products"
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            accentColor="bg-emerald-400"
            delay={0.35}
            emptyMessage="No products yet"
          />
          
          <RecentItemsCard
            icon={IconRanges}
            title="Recently added ranges"
            subtitle="Last 5 ranges"
            items={recentRanges.map(r => ({ id: r.id, name: r.name }))}
            linkTo="/admin/ranges"
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            accentColor="bg-blue-400"
            delay={0.4}
            emptyMessage="No ranges yet"
          />
          
          <AnalyticsCard
            icon={IconChart}
            title="Activity log"
            subtitle="Latest 8 events"
            iconBg="bg-violet-50"
            iconColor="text-violet-600"
            delay={0.45}
          >
            <ActivityTimeline activities={recentActivity} emptyMessage="No recent activity" />
          </AnalyticsCard>
        </div>
      </section>
    </div>
  );
}

function onDashboardRender(id, phase, actualDuration) {
  if (actualDuration < 8) return;
  // eslint-disable-next-line no-console
  console.info("[PERF][render]", {
    id,
    phase,
    actualDurationMs: Number(actualDuration.toFixed(1)),
  });
}

export default function DashboardOverview() {
  return (
    <Profiler id="AdminDashboard" onRender={onDashboardRender}>
      <DashboardOverviewInner />
    </Profiler>
  );
}
