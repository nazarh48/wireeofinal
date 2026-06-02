import { useEffect, useMemo, useState, Profiler } from "react";
import { Link } from "react-router-dom";
import { useAdminStore } from "../../store/adminStore";
import { apiService } from "../../services/api";
import {
  IconCategories,
  IconChart,
  IconLibrary,
  IconMail,
  IconPdf,
  IconProducts,
  IconProjects,
  IconRanges,
  IconSolutions,
  IconUsers,
} from "../../components/admin/AdminIcons";
import DashboardHeader from "../../components/admin/DashboardHeader";

const numberFormat = new Intl.NumberFormat("en-US");

function formatNumber(value) {
  return numberFormat.format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "No date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No date";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function percent(value, total) {
  if (!total) return "0%";
  return `${Math.round((value / total) * 100)}%`;
}

function KpiCard({ icon: Icon, title, value, detail, to, tone = "green", delay = 0 }) {
  const content = (
    <div className="admin-kpi-card" style={{ animationDelay: `${delay}s` }}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-4 flex items-center gap-2">
            <span className={`admin-kpi-icon ${tone}`}>
              <Icon className="h-3.5 w-3.5" />
            </span>
            <p className="text-xs font-bold text-slate-700">{title}</p>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <p className="text-3xl font-black tracking-tight text-slate-950">{formatNumber(value)}</p>
            {detail && <span className={`admin-kpi-badge ${tone}`}>{detail}</span>}
          </div>
        </div>
        <span className="admin-more-button">...</span>
      </div>
    </div>
  );

  return to ? <Link to={to}>{content}</Link> : content;
}

function buildLinePoints(data, key, width = 620, height = 210) {
  const values = data.map((item) => Number(item[key] || 0));
  const max = Math.max(...values, 1);
  const step = data.length > 1 ? width / (data.length - 1) : width;

  return data
    .map((item, index) => {
      const value = Number(item[key] || 0);
      const x = 15 + index * step;
      const y = 20 + (height - (value / max) * (height - 35));
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function ProductsPerRangeChart({ productsPerRange }) {
  const hasData = productsPerRange.some((item) => item.count > 0);
  const data = productsPerRange.length ? productsPerRange.slice(0, 8) : [];
  const productPoints = buildLinePoints(data, "count");
  const average = data.length
    ? Math.round(data.reduce((sum, item) => sum + item.count, 0) / data.length)
    : 0;
  const averageData = data.map((item) => ({ ...item, average }));
  const averagePoints = buildLinePoints(averageData, "average");

  return (
    <section className="admin-panel admin-orders-panel">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-slate-950">Products Per Range</h2>
        <div className="flex items-center gap-5 text-xs font-semibold text-slate-600">
          <span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-emerald-500" /> Products</span>
          <span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-orange-400" /> Average</span>
        </div>
      </div>

      {hasData ? (
        <div className="admin-line-chart">
          <svg viewBox="0 0 660 250" role="img" aria-label="Products per range chart">
            {[35, 75, 115, 155, 195].map((y) => (
              <line key={y} x1="0" x2="660" y1={y} y2={y} className="chart-grid" />
            ))}
            {data.map((item, index) => (
              <line key={item.id || item.name} x1={30 + index * 84} x2={30 + index * 84} y1="18" y2="218" className="chart-grid vertical" />
            ))}
            <path d={`M${productPoints}`} className="chart-line green" />
            <path d={`M${averagePoints}`} className="chart-line orange" />
            {data.map((item, index) => (
              <text key={item.id || item.name} x={28 + index * 84} y="242" className="chart-month">
                {(item.name || "Range").slice(0, 8)}
              </text>
            ))}
          </svg>
        </div>
      ) : (
        <div className="flex min-h-[17rem] items-center justify-center rounded-2xl bg-slate-50 text-sm font-semibold text-slate-500">
          No product range data yet.
        </div>
      )}
    </section>
  );
}

function WebsiteVisitorsPanel({ websiteVisitors, recentItems }) {
  return (
    <section className="admin-panel admin-visitors-panel">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-950">Website Visitors</h2>
          <p className="mt-1 text-xs font-semibold text-slate-400">Registered website users</p>
        </div>
        <span className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-white">Live</span>
      </div>

      <div className="admin-visitor-ring">
        <span>{formatNumber(websiteVisitors)}</span>
      </div>

      <div className="mt-8">
        <h3 className="text-base font-black text-slate-900">Recent Admin Data</h3>
        <p className="mt-2 text-sm font-bold text-emerald-500">{formatNumber(recentItems.length)} <span className="font-medium text-slate-400">latest records</span></p>
        <div className="mt-6 space-y-5">
          {recentItems.length ? recentItems.slice(0, 5).map((item) => (
            <div key={`${item.type}-${item.id}`} className="flex gap-3">
              <span className={`admin-sale-icon ${item.tone}`}>{item.short}</span>
              <div>
                <p className="text-sm font-black text-slate-900">{item.name}</p>
                <p className="mt-1 text-xs font-semibold text-slate-400">{item.type} - {formatDate(item.date)}</p>
              </div>
            </div>
          )) : (
            <p className="text-sm font-semibold text-slate-500">No recent records yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}

function ActiveDataPanel({ totalUsers, totalNewsletterSubscribers, totalPdfExports }) {
  const items = [
    ["Users", totalUsers, "orange"],
    ["Newsletter", totalNewsletterSubscribers, "green"],
    ["PDF Exports", totalPdfExports, "orange"],
  ];
  const max = Math.max(...items.map(([, value]) => value), 1);

  return (
    <section className="admin-panel">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-950">Active Records</h2>
          <p className="mt-2 text-sm font-semibold text-slate-400">Live counts from admin collections</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {items.map(([label, value, tone]) => (
          <div key={label} className="admin-active-user">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-400">
              <span className={`admin-mini-icon ${tone}`}>{label.charAt(0)}</span>
              {label}
            </p>
            <p className="text-lg font-black text-slate-950">{formatNumber(value)}</p>
            <span className={`admin-user-meter ${tone}`} style={{ background: `linear-gradient(90deg, currentColor ${(value / max) * 100}%, #dbe5f2 ${(value / max) * 100}%)` }} />
          </div>
        ))}
      </div>
    </section>
  );
}

function ProductMixPanel({ configurableCount, standardCount, totalProducts }) {
  return (
    <section className="admin-panel">
      <h2 className="text-lg font-bold text-slate-950">Product Analytics</h2>
      <div className="mt-7 grid grid-cols-[1fr_1.2fr] gap-4">
        <div>
          <p className="text-3xl font-black text-slate-950">{formatNumber(configurableCount)}</p>
          <p className="mt-2 text-xl font-black text-emerald-500">{percent(configurableCount, totalProducts)} configurable</p>
          <p className="mt-8 text-3xl font-black text-slate-950">{formatNumber(standardCount)}</p>
          <p className="mt-2 text-xl font-black text-orange-400">{percent(standardCount, totalProducts)} standard</p>
        </div>
        <div className="admin-product-mix-ring" style={{ "--config-ratio": `${totalProducts ? (configurableCount / totalProducts) * 100 : 0}%` }}>
          <span>{formatNumber(totalProducts)}</span>
          <small>Total</small>
        </div>
      </div>
    </section>
  );
}

function ManagementTotalsPanel({ stats }) {
  const items = [
    ["Categories", stats.totalCategories, IconCategories, "/admin/categories"],
    ["Solutions", stats.totalSolutions, IconSolutions, "/admin/solutions"],
    ["Ranges", stats.totalRanges, IconRanges, "/admin/ranges"],
    ["Icons", stats.totalIcons, IconLibrary, "/admin/icon-library"],
    ["Resources", stats.totalResources, IconPdf, "/admin/resources"],
    ["Canvas Edits", stats.totalCanvasEdits, IconChart, "/admin/projects"],
  ];

  return (
    <section className="admin-panel">
      <h2 className="text-lg font-bold text-slate-950">Management Totals</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(([label, value, Icon, to]) => (
          <Link key={label} to={to} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700">
            <span className="admin-nav-icon">
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1 truncate">{label}</span>
            <span>{formatNumber(value)}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

const mapProduct = (p) => ({
  id: p?._id || p?.id,
  name: p?.name || "Unnamed product",
  date: p?.createdAt,
  type: "Product",
  short: "P",
  tone: "orange",
});

const mapRange = (r) => ({
  id: r?._id || r?.id,
  name: r?.name || "Unnamed range",
  date: r?.createdAt,
  type: "Range",
  short: "R",
  tone: "green",
});

const mapProject = (p) => ({
  id: p?._id || p?.id,
  name: p?.name || p?.projectName || "Untitled project",
  date: p?.updatedAt || p?.createdAt,
  type: "Configurator",
  short: "C",
  tone: "green",
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

  const dashboardStats = {
    totalRanges: stats?.totalRanges ?? 0,
    totalProducts: stats?.totalProducts ?? 0,
    configurableCount: stats?.configurableCount ?? 0,
    standardCount: stats?.standardCount ?? stats?.normalCount ?? 0,
    totalUsers: stats?.totalUsers ?? 0,
    totalProjects: stats?.totalProjects ?? 0,
    totalCategories: stats?.totalCategories ?? 0,
    totalSolutions: stats?.totalSolutions ?? 0,
    totalResources: stats?.totalResources ?? 0,
    totalIcons: stats?.totalIcons ?? 0,
    totalNewsletterSubscribers: stats?.totalNewsletterSubscribers ?? 0,
    totalPdfExports: stats?.totalPdfExports ?? 0,
    totalCanvasEdits: stats?.totalCanvasEdits ?? 0,
    websiteVisitors: stats?.websiteVisitors ?? stats?.totalUsers ?? 0,
  };

  const productsPerRange = useMemo(
    () => (stats?.productsPerRange || []).map((r) => ({ id: r.id, name: r.name, count: r.count || 0 })),
    [stats?.productsPerRange]
  );

  const recentItems = useMemo(() => {
    const merged = [
      ...(stats?.recentProducts || []).map(mapProduct),
      ...(stats?.recentRanges || []).map(mapRange),
      ...(stats?.recentProjects || []).map(mapProject),
    ];
    return merged
      .filter((item) => item.id)
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [stats?.recentProducts, stats?.recentProjects, stats?.recentRanges]);

  if (loading && !stats) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-8">
        <div className="text-center">
          <div className="mx-auto mb-3 h-12 w-12 animate-spin rounded-full border-b-2 border-emerald-500" />
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="p-6 md:p-8">
        <div className="admin-panel p-8 text-center">
          <p className="mb-2 font-bold text-red-600">Failed to load dashboard</p>
          <p className="mb-4 text-sm text-red-500">{error}</p>
          <button onClick={() => window.location.reload()} className="rounded-xl bg-red-600 px-4 py-2 text-white">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50 p-6 md:p-8">
      <DashboardHeader title="Welcome To Admin Analytics Dashboard" />

      <section className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={IconProducts} title="Products Management" value={dashboardStats.totalProducts} detail={`${formatNumber(dashboardStats.configurableCount)} configurable`} to="/admin/products" tone="green" delay={0} />
        <KpiCard icon={IconProjects} title="Graphic Configurator" value={dashboardStats.totalProjects} detail={`${formatNumber(dashboardStats.totalCanvasEdits)} canvas edits`} to="/admin/projects" tone="orange" delay={0.04} />
        <KpiCard icon={IconPdf} title="Resources / Docs" value={dashboardStats.totalResources} detail={`${formatNumber(dashboardStats.totalPdfExports)} PDF exports`} to="/admin/resources" tone="orange" delay={0.08} />
        <KpiCard icon={IconUsers} title="Website Visitors" value={dashboardStats.websiteVisitors} detail="registered users" to="/admin/users" tone="green" delay={0.12} />
      </section>

      <section className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_310px]">
        <div className="space-y-8">
          <ProductsPerRangeChart productsPerRange={productsPerRange} />

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.35fr_0.85fr]">
            <ActiveDataPanel
              totalUsers={dashboardStats.totalUsers}
              totalNewsletterSubscribers={dashboardStats.totalNewsletterSubscribers}
              totalPdfExports={dashboardStats.totalPdfExports}
            />
            <ProductMixPanel
              configurableCount={dashboardStats.configurableCount}
              standardCount={dashboardStats.standardCount}
              totalProducts={dashboardStats.totalProducts}
            />
          </div>

          <ManagementTotalsPanel stats={dashboardStats} />

          {activityLog.length > 0 && (
            <section className="admin-panel">
              <h2 className="text-lg font-bold text-slate-950">Local Activity Log</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {activityLog.slice(0, 8).map((activity) => (
                  <div key={activity.id} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700">
                    {activity.label}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <WebsiteVisitorsPanel
          websiteVisitors={dashboardStats.websiteVisitors}
          recentItems={recentItems}
        />
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
