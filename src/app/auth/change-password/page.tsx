"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle, Shield } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import api from "@/lib/api";
import toast from "react-hot-toast";

function ChangePasswordContent() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const isForced = searchParams.get("force") === "true";
  const { user, fetchUser } = useAuthStore();

  useEffect(() => {
    if (isForced && user && !user.mustChangePassword) {
      // Already changed password, redirect to dashboard
      redirectToDashboard(user.role);
    }
    
    // Social login users cannot change their password
    if (user?.authProvider && user.authProvider !== 'LOCAL') {
      redirectToDashboard(user.role);
    }
  }, [isForced, user]);

  const redirectToDashboard = (role: string) => {
    if (role === "ADMIN") router.push("/admin");
    else if (role === "EMPLOYEE") router.push("/employee");
    else if (role === "INVESTOR") router.push("/investor");
    else if (role === "VENDOR") router.push("/vendor");
    else router.push("/");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const body: any = { newPassword };
      if (!isForced) {
        // In non-forced mode, we'd need currentPassword — use a prompt or field
        // But for this implementation, forced mode is the primary use case
      }

      await api.put("/auth/change-password", body);

      // Refresh user to get updated mustChangePassword flag
      await fetchUser();

      toast.success("Password changed successfully!");
      redirectToDashboard(user?.role || "CLIENT");
    } catch (error: any) {
      setError(error.response?.data?.message || error.message || "Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-200">
            <Shield className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>
            {isForced ? "Set Your Password" : "Change Password"}
          </h1>
          {isForced && (
            <p className="text-sm text-amber-600 mt-2 font-medium">
              This is a temporary password. Please set a new password to continue.
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  required
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 flex items-center gap-1.5">
                <AlertCircle size={14} /> {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl gradient-primary text-white font-semibold text-sm hover:opacity-90 disabled:opacity-60 transition-all"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>Set Password <ArrowRight size={16} /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ChangePasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-violet-600" /></div>}>
      <ChangePasswordContent />
    </Suspense>
  );
}
