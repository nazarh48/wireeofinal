import { useState, useEffect, useCallback } from "react";
import { apiService } from "../../services/api";
import { IconUsers } from "../../components/admin/AdminIcons";

/* ─── tiny helpers ─── */
const EMPTY_FORM = {
  name: "",
  email: "",
  password: "",
  role: "user",
  status: "active",
  emailVerified: false,
  twoFactorEnabled: false,
};

function Badge({ children, variant = "default" }) {
  const cls = {
    admin: "bg-violet-100 text-violet-800",
    user: "bg-slate-100 text-slate-600",
    active: "bg-emerald-100 text-emerald-800",
    inactive: "bg-red-100 text-red-600",
    verified: "bg-blue-100 text-blue-700",
    unverified: "bg-amber-100 text-amber-700",
    default: "bg-slate-100 text-slate-600",
  }[variant] ?? "bg-slate-100 text-slate-600";

  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cls}`}>
      {children}
    </span>
  );
}

/* ─── Modal ─── */
function UserModal({ open, user, onClose, onSaved }) {
  const isEdit = Boolean(user);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setError("");
      if (user) {
        setForm({
          name: user.name || "",
          email: user.email || "",
          password: "",
          role: user.role || "user",
          status: user.status || "active",
          emailVerified: user.emailVerified ?? false,
          twoFactorEnabled: user.twoFactorEnabled ?? false,
        });
      } else {
        setForm(EMPTY_FORM);
      }
    }
  }, [open, user]);

  if (!open) return null;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) return setError("Name is required.");
    if (!form.email.trim()) return setError("Email is required.");
    if (!isEdit && !form.password.trim()) return setError("Password is required for new users.");
    if (form.password && form.password.length < 6) return setError("Password must be at least 6 characters.");

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
        status: form.status,
        emailVerified: form.emailVerified,
        twoFactorEnabled: form.twoFactorEnabled,
      };
      if (form.password.trim()) payload.password = form.password.trim();

      let res;
      if (isEdit) {
        res = await apiService.users.update(user._id || user.id, payload);
      } else {
        res = await apiService.users.create(payload);
      }

      if (res?.success) {
        onSaved(res.user, isEdit);
        onClose();
      } else {
        setError(res?.message || "Something went wrong.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Request failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(2px)" }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">
            {isEdit ? "Edit User" : "Add New User"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="John Doe"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="john@example.com"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password{" "}
              {isEdit ? (
                <span className="text-slate-400 font-normal">(leave blank to keep current)</span>
              ) : (
                <span className="text-red-500">*</span>
              )}
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              placeholder={isEdit ? "Leave blank to keep unchanged" : "Min 6 characters"}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition"
            />
          </div>

          {/* Role + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
              <select
                value={form.role}
                onChange={(e) => set("role", e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition bg-white"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition bg-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="flex flex-col gap-3 pt-1">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={form.emailVerified}
                  onChange={(e) => set("emailVerified", e.target.checked)}
                  className="sr-only peer"
                  id="emailVerified"
                />
                <div className="w-10 h-5 bg-slate-200 peer-checked:bg-violet-500 rounded-full transition-colors" />
                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
              </div>
              <div>
                <span className="text-sm font-medium text-slate-700">Email Confirmed</span>
                <p className="text-xs text-slate-400">User can log in without email verification step</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={form.twoFactorEnabled}
                  onChange={(e) => set("twoFactorEnabled", e.target.checked)}
                  className="sr-only peer"
                  id="twoFactorEnabled"
                />
                <div className="w-10 h-5 bg-slate-200 peer-checked:bg-violet-500 rounded-full transition-colors" />
                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
              </div>
              <div>
                <span className="text-sm font-medium text-slate-700">Two-Factor Authentication</span>
                <p className="text-xs text-slate-400">Require 2FA code on each login</p>
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-60 rounded-lg transition-colors"
            >
              {saving ? (isEdit ? "Saving…" : "Creating…") : isEdit ? "Save Changes" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Delete Confirm Modal ─── */
function DeleteConfirmModal({ open, user, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) setError("");
  }, [open]);

  if (!open || !user) return null;

  async function handleDelete() {
    setDeleting(true);
    setError("");
    try {
      const res = await apiService.users.remove(user._id || user.id);
      if (res?.success) {
        onDeleted(user._id || user.id);
        onClose();
      } else {
        setError(res?.message || "Failed to delete user.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Request failed.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(2px)" }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="px-6 pt-6 pb-4 text-center">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Delete User</h3>
          <p className="text-sm text-slate-500">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-slate-700">{user.name}</span>? This action
            cannot be undone.
          </p>
          {error && (
            <p className="mt-3 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 rounded-lg transition-colors"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiService.users.list();
      if (res?.users) setUsers(res.users);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  function openAdd() {
    setEditingUser(null);
    setModalOpen(true);
  }

  function openEdit(user) {
    setEditingUser(user);
    setModalOpen(true);
  }

  function openDelete(user) {
    setDeletingUser(user);
    setDeleteModalOpen(true);
  }

  function handleSaved(savedUser, isEdit) {
    if (isEdit) {
      setUsers((prev) => prev.map((u) => (u._id === savedUser._id ? savedUser : u)));
    } else {
      setUsers((prev) => [savedUser, ...prev]);
    }
  }

  function handleDeleted(id) {
    setUsers((prev) => prev.filter((u) => (u._id || u.id) !== id));
  }

  const filtered = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <UserModal
        open={modalOpen}
        user={editingUser}
        onClose={() => setModalOpen(false)}
        onSaved={handleSaved}
      />
      <DeleteConfirmModal
        open={deleteModalOpen}
        user={deletingUser}
        onClose={() => setDeleteModalOpen(false)}
        onDeleted={handleDeleted}
      />

      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Users Management</h1>
            <p className="text-slate-500 mt-1 text-sm">Create, edit, and manage all user accounts.</p>
          </div>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl shadow-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add User
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Top bar */}
          <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <IconUsers className="w-5 h-5 text-slate-400" />
              <span className="font-semibold text-slate-700">
                {loading ? "Loading…" : `${users.length} user${users.length !== 1 ? "s" : ""}`}
              </span>
            </div>
            {/* Search */}
            <div className="relative max-w-xs w-full">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search users…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-2 w-full text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="p-16 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Loading users…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center text-slate-400 text-sm">
              {search ? "No users match your search." : "No users found."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50">
                  <tr>
                    {["Name", "Email", "Role", "Status", "Email Verified", "2FA", "Joined", "Actions"].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((u) => (
                    <tr key={u._id || u.id} className="hover:bg-slate-50 transition-colors">
                      {/* Name */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {(u.name || "?")[0].toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-slate-900 whitespace-nowrap">
                            {u.name}
                          </span>
                        </div>
                      </td>
                      {/* Email */}
                      <td className="px-5 py-3.5 text-sm text-slate-600 whitespace-nowrap">{u.email}</td>
                      {/* Role */}
                      <td className="px-5 py-3.5">
                        <Badge variant={u.role === "admin" ? "admin" : "user"}>
                          {u.role || "user"}
                        </Badge>
                      </td>
                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <Badge variant={u.status === "inactive" ? "inactive" : "active"}>
                          {u.status || "active"}
                        </Badge>
                      </td>
                      {/* Email Verified */}
                      <td className="px-5 py-3.5">
                        <Badge variant={u.emailVerified ? "verified" : "unverified"}>
                          {u.emailVerified ? "✓ Verified" : "✗ Unverified"}
                        </Badge>
                      </td>
                      {/* 2FA */}
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-medium ${u.twoFactorEnabled ? "text-emerald-600" : "text-slate-400"}`}>
                          {u.twoFactorEnabled ? "Enabled" : "Disabled"}
                        </span>
                      </td>
                      {/* Joined */}
                      <td className="px-5 py-3.5 text-xs text-slate-400 whitespace-nowrap">
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString("en-GB", {
                            day: "2-digit", month: "short", year: "numeric",
                          })
                          : "—"}
                      </td>
                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(u)}
                            title="Edit user"
                            className="p-1.5 text-slate-500 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => openDelete(u)}
                            title="Delete user"
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
