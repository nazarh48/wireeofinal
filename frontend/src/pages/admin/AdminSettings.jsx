import { IconSettings } from "../../components/admin/AdminIcons";

export default function AdminSettings() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-1">Admin and application settings. Extensible for future options.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
        <div className="inline-flex p-4 rounded-full bg-slate-100 text-slate-400 mb-4">
          <IconSettings className="w-8 h-8" />
        </div>
        <p className="text-slate-500">Settings panel coming soon.</p>
      </div>
    </div>
  );
}
