import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

// ─── TYPES ──────────────────────────────────────────────────
interface PaginatedResponse<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

interface ServiceFilters {
  category?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
  featured?: boolean;
  trending?: boolean;
  bestseller?: boolean;
  newArrival?: boolean;
}

// ─── CATEGORIES ─────────────────────────────────────────────
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get<{ data: any[] }>("/categories"),
    staleTime: 5 * 60 * 1000, // 5 mins
  });
}

export function useCategoryBySlug(slug: string) {
  return useQuery({
    queryKey: ["category", slug],
    queryFn: () => api.get<{ data: any }>(`/categories/${slug}`),
    enabled: !!slug,
  });
}

// ─── SERVICES ───────────────────────────────────────────────
export function useServices(filters: ServiceFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== "") {
      params.append(key, String(val));
    }
  });

  return useQuery({
    queryKey: ["services", filters],
    queryFn: () => api.get<PaginatedResponse<any>>(`/services?${params.toString()}`),
  });
}

export function useServiceBySlug(slug: string) {
  return useQuery({
    queryKey: ["service", slug],
    queryFn: () => api.get<{ data: any }>(`/services/${slug}`),
    enabled: !!slug,
  });
}

// ─── AUTH & USER ────────────────────────────────────────────
export function useCurrentUser() {
  return useQuery({
    queryKey: ["user", "me"],
    queryFn: () => api.get<{ data: any }>("/auth/me"),
    retry: false,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.put("/auth/profile", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user", "me"] }),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      api.put("/auth/change-password", data),
  });
}

// ─── BOOKINGS ───────────────────────────────────────────────
export function useMyBookings(status?: string) {
  const params = status && status !== "ALL" ? `?status=${status}` : "";
  return useQuery({
    queryKey: ["bookings", "mine", status],
    queryFn: () => api.get<{ data: any[] }>(`/bookings/my${params}`),
  });
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post("/bookings", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookings"] }),
  });
}

// ─── WISHLIST ───────────────────────────────────────────────
export function useWishlist() {
  return useQuery({
    queryKey: ["wishlist"],
    queryFn: () => api.get<{ data: any[] }>("/wishlist"),
  });
}

export function useToggleWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (serviceId: number) => api.post(`/wishlist/toggle`, { serviceId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wishlist"] }),
  });
}

// ─── REVIEWS ────────────────────────────────────────────────
export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { serviceId: number; rating: number; title?: string; comment: string }) =>
      api.post("/reviews", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["service"] }),
  });
}

// ─── VENDOR ─────────────────────────────────────────────────
export function useVendorServices() {
  return useQuery({
    queryKey: ["vendor", "services"],
    queryFn: () => api.get<{ data: any[] }>("/services/vendor/my-services"),
  });
}

export function useVendorBookings(status?: string) {
  const params = status && status !== "ALL" ? `?status=${status}` : "";
  return useQuery({
    queryKey: ["vendor", "bookings", status],
    queryFn: () => api.get<{ data: any[] }>(`/vendor/bookings${params}`),
  });
}

export function useVendorDashboard() {
  return useQuery({
    queryKey: ["vendor", "dashboard"],
    queryFn: () => api.get<{ data: any }>("/vendor/dashboard"),
  });
}

export function useVendorEarnings() {
  return useQuery({
    queryKey: ["vendor", "earnings"],
    queryFn: () => api.get<{ data: any }>("/vendor/earnings"),
  });
}

export function useCreateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post("/services", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vendor", "services"] }),
  });
}

export function useUpdateBookingStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.patch(`/bookings/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vendor", "bookings"] }),
  });
}

// ─── ADMIN ──────────────────────────────────────────────────
export function useAdminDashboard() {
  return useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: () => api.get<{ data: any }>("/admin/dashboard"),
  });
}

export function useAdminVendors(status?: string) {
  const params = status && status !== "ALL" ? `?status=${status}` : "";
  return useQuery({
    queryKey: ["admin", "vendors", status],
    queryFn: () => api.get<{ data: any[] }>(`/admin/vendors${params}`),
  });
}

export function useAdminServices(status?: string) {
  const params = status && status !== "ALL" ? `?status=${status}` : "";
  return useQuery({
    queryKey: ["admin", "services", status],
    queryFn: () => api.get<{ data: any[] }>(`/admin/services${params}`),
  });
}

export function useAdminBookings(status?: string) {
  const params = status && status !== "ALL" ? `?status=${status}` : "";
  return useQuery({
    queryKey: ["admin", "bookings", status],
    queryFn: () => api.get<{ data: any[] }>(`/admin/bookings${params}`),
  });
}

export function useAdminUsers(role?: string) {
  const params = role && role !== "All" ? `?role=${role}` : "";
  return useQuery({
    queryKey: ["admin", "users", role],
    queryFn: () => api.get<{ data: any[] }>(`/admin/users${params}`),
  });
}

export function useAdminReviews() {
  return useQuery({
    queryKey: ["admin", "reviews"],
    queryFn: () => api.get<{ data: any[] }>("/admin/reviews"),
  });
}

export function useUpdateVendorStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.patch(`/admin/vendors/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "vendors"] }),
  });
}

export function useUpdateServiceStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.patch(`/admin/services/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "services"] }),
  });
}

export function useUpdateReviewStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isApproved }: { id: number; isApproved: boolean }) =>
      api.patch(`/admin/reviews/${id}`, { isApproved }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "reviews"] }),
  });
}

// ─── COUPONS ────────────────────────────────────────────────
export function useCoupons() {
  return useQuery({
    queryKey: ["coupons"],
    queryFn: () => api.get<{ data: any[] }>("/coupons"),
  });
}

export function useApplyCoupon() {
  return useMutation({
    mutationFn: (data: { code: string; amount: number }) =>
      api.post("/coupons/apply", data),
  });
}

// ─── HOMEPAGE ───────────────────────────────────────────────
export function useHomepageSections() {
  return useQuery({
    queryKey: ["homepage"],
    queryFn: () => api.get<{ data: any }>("/homepage"),
    staleTime: 5 * 60 * 1000,
  });
}

// ─── CITIES ─────────────────────────────────────────────────
export function useCities() {
  return useQuery({
    queryKey: ["cities"],
    queryFn: () => api.get<{ data: string[] }>("/cities"),
    staleTime: 30 * 60 * 1000, // 30 mins
  });
}
