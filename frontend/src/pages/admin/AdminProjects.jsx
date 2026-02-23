import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useStore from "../../store/useStore";
import { IconProjects } from "../../components/admin/AdminIcons";

export default function AdminProjects() {
  const projects = useStore((s) => s.projects);
  const projectsLoading = useStore((s) => s.projectsLoading);
  const fetchProjects = useStore((s) => s.fetchProjects);
  const withProducts = projects.filter((p) => p.products && p.products.length > 0);

  const [searchTerm, setSearchTerm] = useState("");

  const filteredProjects = withProducts.filter((p) => {
    const matchName = p.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchConfig = p.configurationNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchName || matchConfig;
  });

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <p className="text-slate-600 mt-1">Projects created from the configurator (user-facing).</p>
        </div>
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700"
        >
          <IconProjects className="w-5 h-5" />
          Open Projects page
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="font-medium text-slate-700">Total projects</span>
            <span className="text-2xl font-bold text-slate-900">{projectsLoading ? "…" : withProducts.length}</span>
          </div>
          <input
            type="text"
            placeholder="Search name or config #..."
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {projectsLoading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-2" />
            <p className="text-sm">Loading…</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p className="mb-4">No projects found.</p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Clear search
              </button>
            )}
            {!searchTerm && (
              <Link to="/projects" className="text-emerald-600 hover:text-emerald-700 font-medium">
                Go to Projects
              </Link>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {filteredProjects.map((p) => (
              <li key={p.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-slate-900">{p.name}</p>
                    {p.configurationNumber && (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full border border-slate-200">
                        {p.configurationNumber}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{p.products?.length ?? 0} product(s)</p>
                </div>
                <Link
                  to="/projects"
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  View
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
