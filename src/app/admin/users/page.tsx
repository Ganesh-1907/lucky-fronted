"use client";

import { useState, useMemo } from "react";
import { Search, Shield, Ban, Eye, Mail, Loader, UserX, ChevronLeft, ChevronRight, X, Phone, Calendar, UserPlus, Copy, Check, Edit } from "lucide-react";
import ActionMenu from "@/components/ActionMenu";
import { cn } from "@/lib/utils";
import { useAdminUsers, useToggleUserStatus, useCreateAdminUser, useUpdateAdminUser } from "@/hooks/useApi";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const roleFilters = ["All", "CLIENT", "VENDOR", "ADMIN", "EMPLOYEE", "INVESTOR"];
const roleColors: Record<string, string> = {
  CLIENT: "bg-blue-100 text-blue-700",
  VENDOR: "bg-emerald-100 text-emerald-700",
  ADMIN: "bg-violet-100 text-violet-700",
};

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [sortKey, setSortKey] = useState("newest");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewUser, setViewUser] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const { data, isLoading, error } = useAdminUsers(roleFilter !== "All" ? roleFilter : undefined);
  const users = Array.isArray(data) ? data : (data?.data || []);
  const toggleUser = useToggleUserStatus();
  const createUser = useCreateAdminUser();
  const updateUser = useUpdateAdminUser();

  const filteredAndSorted = useMemo(() => {
    let result = users.filter((u: any) => {
      const matchSearch = search ? (
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.phone?.includes(search)
      ) : true;
      return matchSearch;
    });

    if (sortKey === "oldest") result.sort((a: any, b: any) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
    else result.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()); // newest
    
    return result;
  }, [users, search, sortKey]);

  const totalPages = Math.ceil(filteredAndSorted.length / pageSize) || 1;
  const paginated = filteredAndSorted.slice((page - 1) * pageSize, page * pageSize);

  const handleToggleStatus = async (userId: number, currentStatus: string) => {
    try {
      await toggleUser.mutateAsync(userId);
      toast.success(`User ${currentStatus === "ACTIVE" ? "suspended" : "activated"} successfully`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update user status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>User Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all registered accounts across the platform</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-white font-semibold text-sm hover:opacity-90 transition-all shadow-lg shadow-violet-200"
        >
          <UserPlus size={16} /> Create User
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search by name, email, or phone..." value={search} onChange={e => {setSearch(e.target.value); setPage(1);}}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            {roleFilters.map(r => (
              <button key={r} onClick={() => {setRoleFilter(r); setPage(1);}}
                className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                  roleFilter === r ? "bg-violet-100 text-violet-700" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                )}>
                {r === "All" ? "All Roles" : r === "CLIENT" ? "Customer" : r.charAt(0) + r.slice(1).toLowerCase()}
              </button>
            ))}
            <select value={sortKey} onChange={e => {setSortKey(e.target.value); setPage(1);}} className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-700 focus:outline-none">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 flex items-center justify-center shadow-sm">
          <div className="text-center">
            <Loader size={32} className="mx-auto mb-3 text-violet-500 animate-spin" />
            <p className="text-gray-500">Loading users...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="text-red-700">Failed to load users. Please try again.</p>
        </div>
      )}

      {!isLoading && users.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-gray-50/90 backdrop-blur z-10">
                <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  <th className="text-left p-4 font-medium">User</th>
                  <th className="text-left p-4 font-medium hidden md:table-cell">Contact</th>
                  <th className="text-left p-4 font-medium">Role</th>
                  <th className="text-left p-4 font-medium hidden lg:table-cell">Joined</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium sticky right-0 bg-gray-50/90 z-20 shadow-[-4px_0_10px_rgba(0,0,0,0.05)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length > 0 ? paginated.map((user: any) => {
                  const role = user.role || "CLIENT";
                  let status = user.isActive ? "ACTIVE" : "SUSPENDED";
                  
                  if (role === "VENDOR" && user.vendorStatus) {
                    status = user.vendorStatus;
                  }
                  
                  return (
                    <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shrink-0 shadow-sm">
                            <span className="text-white text-sm font-bold">{user.name?.[0]?.toUpperCase() || "U"}</span>
                          </div>
                          <div onClick={() => setViewUser(user)} className="cursor-pointer hover:underline decoration-violet-500">
                            <p className="text-sm font-semibold text-gray-900">{user.name || "Unknown User"}</p>
                            <p className="text-xs text-gray-500">{user.email || "No Email"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell text-sm text-gray-600">
                        {user.phone || "—"}
                      </td>
                      <td className="p-4">
                        <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-full uppercase", roleColors[role] || "bg-gray-100 text-gray-700")}>
                          {role === "CLIENT" ? "CUSTOMER" : role}
                        </span>
                      </td>
                      <td className="p-4 hidden lg:table-cell text-sm text-gray-600">
                        {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-full uppercase",
                          (status === "ACTIVE" || status === "APPROVED") ? "bg-green-100 text-green-700" : 
                          status === "PENDING" ? "bg-amber-100 text-amber-700" : 
                          status === "SUSPENDED" ? "bg-gray-100 text-gray-700" :
                          "bg-red-100 text-red-700"
                        )}>{status}</span>
                      </td>
                      <td className="p-4 sticky right-0 z-10 bg-white group-hover:bg-gray-50/90 shadow-[-4px_0_10px_rgba(0,0,0,0.05)] transition-colors">
                        <ActionMenu>
                            <button onClick={() => { setViewUser(user); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                              <Eye size={14} className="text-gray-400" /> View
                            </button>
                            <a href={`mailto:${user.email}`} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                              <Mail size={14} className="text-gray-400" /> Email
                            </a>
                            {(role === "EMPLOYEE" || role === "INVESTOR") && (
                              <button 
                                onClick={() => { setEditingUser(user); setShowEditModal(true); }} 
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Edit size={14} className="text-gray-400" /> Edit
                              </button>
                            )}
                            {role !== "ADMIN" && (
                              <button 
                                onClick={() => { handleToggleStatus(user.id, status); }} 
                                className={cn("w-full text-left px-4 py-2 text-sm flex items-center gap-2", status === "ACTIVE" ? "text-red-600 hover:bg-red-50" : "text-green-600 hover:bg-green-50")}
                                disabled={toggleUser.isPending}
                              >
                                <Ban size={14} /> {status === "ACTIVE" ? "Suspend" : "Activate"}
                              </button>
                            )}
                        </ActionMenu>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-gray-500">
                      No users match your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {filteredAndSorted.length > 0 && (
            <div className="flex items-center justify-between p-4 bg-gray-50/50 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Rows per page:</span>
                <select value={pageSize} onChange={e => {setPageSize(Number(e.target.value)); setPage(1);}} className="text-sm border border-gray-200 rounded-md p-1 bg-white outline-none">
                  {[10, 25, 50, 100].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">
                  {((page - 1) * pageSize) + 1}-{Math.min(page * pageSize, filteredAndSorted.length)} of {filteredAndSorted.length}
                </span>
                <div className="flex gap-1">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-50">
                    <ChevronLeft size={16} />
                  </button>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-50">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {!isLoading && users.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <UserX size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 text-lg font-medium">No users found</p>
          <p className="text-sm text-gray-400 mt-1">There are no users registered on the platform right now.</p>
        </div>
      )}

      {/* Create User Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateUserModal
            onClose={() => setShowCreateModal(false)}
            onSubmit={async (data) => {
              try {
                const res = await createUser.mutateAsync(data);
                toast.success("User created! Password shown below.");
                return res;
              } catch (err: any) {
                toast.error(err.response?.data?.message || err.message || "Failed to create user");
                throw err;
              }
            }}
            isLoading={createUser.isPending}
          />
        )}
      </AnimatePresence>


      <AnimatePresence>
        {showEditModal && editingUser && (
          <EditUserModal
            user={editingUser}
            onClose={() => { setShowEditModal(false); setEditingUser(null); }}
            onSubmit={async (data) => {
              try {
                await updateUser.mutateAsync({ id: editingUser.id, data });
                toast.success("User updated successfully!");
              } catch (err) {
                toast.error(err.response?.data?.message || err.message || "Failed to update user");
                throw err;
              }
            }}
            isLoading={updateUser.isPending}
          />
        )}
      </AnimatePresence>

      {/* View Drawer */}
      <AnimatePresence>
        {viewUser && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewUser(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h2 className="font-bold text-lg text-gray-900">User Profile</h2>
                <button onClick={() => setViewUser(null)} className="p-2 rounded-full hover:bg-gray-200 text-gray-500">
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center shrink-0 shadow-inner">
                    <span className="text-white text-3xl font-bold">{viewUser.name?.[0]?.toUpperCase() || "U"}</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{viewUser.name || "Unknown User"}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-full uppercase", roleColors[viewUser.role || "CLIENT"] || "bg-gray-100 text-gray-700")}>
                        {(viewUser.role || "CLIENT") === "CLIENT" ? "CUSTOMER" : (viewUser.role || "CLIENT")}
                      </span>
                      {(() => {
                        let badgeStatus = viewUser.isActive ? "ACTIVE" : "SUSPENDED";
                        if (viewUser.role === "VENDOR" && viewUser.vendorStatus) {
                          badgeStatus = viewUser.vendorStatus;
                        }
                        return (
                          <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-full uppercase",
                            (badgeStatus === "ACTIVE" || badgeStatus === "APPROVED") ? "bg-green-100 text-green-700" : 
                            badgeStatus === "PENDING" ? "bg-amber-100 text-amber-700" : 
                            badgeStatus === "SUSPENDED" ? "bg-gray-100 text-gray-700" :
                            "bg-red-100 text-red-700"
                          )}>
                            {badgeStatus}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Contact Information</h4>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-4 text-sm">
                    <div className="flex items-center gap-3 text-gray-700">
                      <Mail size={16} className="text-gray-400" />
                      <span className="font-medium">{viewUser.email || "No email provided"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <Phone size={16} className="text-gray-400" />
                      <span className="font-medium">{viewUser.phone || "No phone provided"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <Calendar size={16} className="text-gray-400" />
                      <span className="font-medium">Joined {new Date(viewUser.createdAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                {viewUser.role === "ADMIN" && (
                  <div className="bg-violet-50 rounded-xl p-4 border border-violet-100 flex items-start gap-3">
                    <Shield size={20} className="text-violet-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-violet-900 text-sm">Administrator Account</h4>
                      <p className="text-xs text-violet-700 mt-1">This user has full access to the admin dashboard and platform settings.</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-gray-100 flex gap-3 bg-white">
                <button onClick={() => setViewUser(null)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Create User Modal ──────────────────────────────────
function CreateUserModal({
  onClose,
  onSubmit,
  isLoading,
}: {
  onClose: () => void;
  onSubmit: (data: { name: string; email: string; role: string; phone?: string; city?: string }) => Promise<any>;
  isLoading: boolean;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [role, setRole] = useState("EMPLOYEE");
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await onSubmit({ name, email, role, phone: phone || undefined, city: city || undefined });
      const data = res?.data || res;
      setResult(data);
    } catch {
      // error handled by parent
    }
  };

  const copyPassword = async () => {
    if (result?.tempPassword) {
      await navigator.clipboard.writeText(result.tempPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
            <UserPlus size={18} className="text-violet-600" />
            {result ? "User Created Successfully" : "Create New User"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 text-gray-500">
            <X size={20} />
          </button>
        </div>

        {result ? (
          <div className="p-6 space-y-6">
            <div className="bg-green-50 rounded-xl p-4 border border-green-100">
              <p className="text-green-800 font-semibold text-sm">User created successfully!</p>
              <p className="text-green-700 text-xs mt-1">The user will receive their credentials via email.</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Name</p>
                <p className="text-sm font-medium text-gray-900">{result.user?.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Email</p>
                <p className="text-sm font-medium text-gray-900">{result.user?.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Role</p>
                <p className="text-sm font-medium text-gray-900">{result.user?.role}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Temporary Password</p>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-sm bg-white px-3 py-1.5 rounded-lg border border-gray-200 font-mono text-gray-900 flex-1">
                    {result.tempPassword}
                  </code>
                  <button
                    onClick={copyPassword}
                    className="p-2 rounded-lg hover:bg-white border border-gray-200 text-gray-500 hover:text-violet-600 transition-colors"
                  >
                    {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                  </button>
                </div>
                <p className="text-xs text-amber-600 mt-2">Save this password — it won't be shown again after closing.</p>
              </div>
            </div>

            <button onClick={onClose} className="w-full py-2.5 rounded-xl gradient-primary text-white font-semibold text-sm hover:opacity-90 transition-all">
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Enter full name"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="user@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 9876543210"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
              <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Mumbai"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Role *</label>
              <div className="flex gap-2">
                {["EMPLOYEE", "INVESTOR"].map(r => (
                  <button key={r} type="button" onClick={() => setRole(r)}
                    className={cn("flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border",
                      role === r
                        ? "bg-violet-100 text-violet-700 border-violet-200"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                    )}>
                    {r === "EMPLOYEE" ? "👨‍💼 Employee" : "📈 Investor"}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
              <p className="text-xs text-amber-700">
                <strong>Note:</strong> A random password will be generated automatically. The user will receive their credentials via email and will be required to set a new password on first login.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={isLoading}
                className="flex-1 py-2.5 rounded-xl gradient-primary text-white font-semibold text-sm hover:opacity-90 disabled:opacity-60 transition-all">
                {isLoading ? "Creating..." : "Create User"}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}


// ─── Edit User Modal ────────────────────────────────────
function EditUserModal({
  user,
  onClose,
  onSubmit,
  isLoading,
}: {
  user: any;
  onClose: () => void;
  onSubmit: (data: { name: string; email: string; role: string; phone?: string; city?: string }) => Promise<void>;
  isLoading: boolean;
}) {
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [city, setCity] = useState(user?.city || "");
  const [role, setRole] = useState(user?.role || "EMPLOYEE");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit({ name, email, role, phone: phone || undefined, city: city || undefined });
      onClose();
    } catch {
      // error handled by parent
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
            <Edit size={18} className="text-violet-600" />
            Edit User
          </h2>
          <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 text-gray-500">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Enter full name"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="user@example.com"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Role *</label>
            <select value={role} onChange={e => setRole(e.target.value)} required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 bg-white">
              <option value="EMPLOYEE">Employee</option>
              <option value="INVESTOR">Investor</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
            <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="e.g., Mumbai"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
          </div>

          <div className="pt-2 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="flex-1 py-2.5 rounded-xl gradient-primary text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {isLoading ? <Loader size={16} className="animate-spin" /> : "Save Changes"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
