"use client";

import { useState } from "react";
import { Search, Shield, Ban, Eye, Mail, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const users = [
  { id: 1, name: "Priya Sharma", email: "priya@email.com", phone: "+91 98765 43210", role: "CLIENT", status: "ACTIVE", bookings: 12, joinedAt: "2024-01-15" },
  { id: 2, name: "Rahul Verma", email: "rahul@email.com", phone: "+91 98765 43211", role: "CLIENT", status: "ACTIVE", bookings: 5, joinedAt: "2024-02-10" },
  { id: 3, name: "Rajesh Kumar", email: "rajesh@dream.com", phone: "+91 98765 43212", role: "VENDOR", status: "ACTIVE", bookings: 890, joinedAt: "2024-01-05" },
  { id: 4, name: "Suresh Patel", email: "suresh@party.com", phone: "+91 98765 43213", role: "VENDOR", status: "ACTIVE", bookings: 456, joinedAt: "2024-02-01" },
  { id: 5, name: "Admin User", email: "admin@luckymarketplace.com", phone: "+91 98765 43200", role: "ADMIN", status: "ACTIVE", bookings: 0, joinedAt: "2024-01-01" },
  { id: 6, name: "Vikram Singh", email: "vikram@email.com", phone: "+91 98765 43214", role: "CLIENT", status: "SUSPENDED", bookings: 2, joinedAt: "2024-03-01" },
  { id: 7, name: "Anita Patel", email: "anita@email.com", phone: "+91 98765 43215", role: "CLIENT", status: "ACTIVE", bookings: 8, joinedAt: "2024-01-20" },
  { id: 8, name: "Neha Sharma", email: "neha@glow.com", phone: "+91 98765 43216", role: "VENDOR", status: "ACTIVE", bookings: 0, joinedAt: "2024-03-14" },
];

const roleFilters = ["All", "CLIENT", "VENDOR", "ADMIN"];
const roleColors: Record<string, string> = {
  CLIENT: "bg-blue-100 text-blue-700",
  VENDOR: "bg-emerald-100 text-emerald-700",
  ADMIN: "bg-violet-100 text-violet-700",
};

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const filtered = users.filter(u => {
    if (roleFilter !== "All" && u.role !== roleFilter) return false;
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>Users</h1>
        <p className="text-sm text-gray-500 mt-1">{users.length} total users</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
          </div>
          <div className="flex gap-2">
            {roleFilters.map(r => (
              <button key={r} onClick={() => setRoleFilter(r)}
                className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  roleFilter === r ? "bg-violet-100 text-violet-700" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                )}>
                {r === "All" ? "All" : r.charAt(0) + r.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100 bg-gray-50/50">
                <th className="text-left p-4 font-medium">User</th>
                <th className="text-left p-4 font-medium hidden md:table-cell">Phone</th>
                <th className="text-left p-4 font-medium">Role</th>
                <th className="text-left p-4 font-medium hidden md:table-cell">Bookings</th>
                <th className="text-left p-4 font-medium hidden lg:table-cell">Joined</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                        <span className="text-white text-xs font-bold">{user.name[0]}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell text-sm text-gray-600">{user.phone}</td>
                  <td className="p-4">
                    <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-full", roleColors[user.role])}>{user.role}</span>
                  </td>
                  <td className="p-4 hidden md:table-cell text-sm font-medium text-gray-900">{user.bookings}</td>
                  <td className="p-4 hidden lg:table-cell text-sm text-gray-600">{user.joinedAt}</td>
                  <td className="p-4">
                    <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-full",
                      user.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    )}>{user.status}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500" title="View"><Eye size={14} /></button>
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500" title="Email"><Mail size={14} /></button>
                      {user.role !== "ADMIN" && (
                        <button className="p-1.5 rounded-lg hover:bg-red-50 text-red-500" title="Suspend"><Ban size={14} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
