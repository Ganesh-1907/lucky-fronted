"use client";

import { useState, useMemo } from "react";
import { Search, Shield, Ban, Eye, Mail, Loader, UserX, ChevronLeft, ChevronRight, X, Phone, Calendar } from "lucide-react";
import ActionMenu from "@/components/ActionMenu";
import { cn } from "@/lib/utils";
import { useAdminUsers, useToggleUserStatus } from "@/hooks/useApi";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const roleFilters = ["All", "CLIENT", "VENDOR", "ADMIN"];
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

  const { data, isLoading, error } = useAdminUsers(roleFilter !== "All" ? roleFilter : undefined);
  const users = Array.isArray(data) ? data : (data?.data || []);
  const toggleUser = useToggleUserStatus();

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>User Management</h1>
        <p className="text-sm text-gray-500 mt-1">Manage all registered accounts across the platform</p>
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
                  const status = user.isActive ? "ACTIVE" : "SUSPENDED";
                  
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
                          status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        )}>{status}</span>
                      </td>
                      <td className="p-4 sticky right-0 z-10 bg-white group-hover:bg-gray-50/90 shadow-[-4px_0_10px_rgba(0,0,0,0.05)] transition-colors">
                        <ActionMenu>
                          <button onClick={() => setViewUser(user)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                            <Eye size={14} className="text-gray-400" /> View
                          </button>
                          <a href={`mailto:${user.email}`} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                            <Mail size={14} className="text-gray-400" /> Email
                          </a>
                          {role !== "ADMIN" && (
                            <button 
                              onClick={() => handleToggleStatus(user.id, status)} 
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
                      <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-full uppercase",
                          viewUser.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        )}>
                        {viewUser.isActive ? "ACTIVE" : "SUSPENDED"}
                      </span>
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
