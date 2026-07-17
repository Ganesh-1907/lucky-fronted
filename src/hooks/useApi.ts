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

// ─── CATEGORIES & MENU ──────────────────────────────────────
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get<{ data: any[] }>("/categories"),
    staleTime: 5 * 60 * 1000, // 5 mins
  });
}

export function useMenu() {
  return useQuery({
    queryKey: ["menu"],
    queryFn: () => api.get<{ data: any[] }>("/menu"),
    staleTime: 5 * 60 * 1000,
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

export function useServiceById(id: number) {
  return useQuery({
    queryKey: ["serviceById", id],
    queryFn: () => api.get<{ data: any }>(`/services/by-id/${id}`),
    enabled: !!id,
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
export function useMyBookings(status?: string, page: number = 1, limit: number = 10) {
  const queryParams = new URLSearchParams();
  if (status && status.toUpperCase() !== "ALL") queryParams.append("status", status);
  queryParams.append("page", page.toString());
  queryParams.append("limit", limit.toString());
  return useQuery({
    queryKey: ["bookings", "mine", status, page, limit],
    queryFn: () => api.get<{ data: any[], pagination: any }>(`/bookings?${queryParams.toString()}`),
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
    mutationFn: (serviceId: number) => api.post(`/wishlist/${serviceId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wishlist"] }),
  });
}

// ─── REVIEWS ────────────────────────────────────────────────
export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { bookingId: number; rating: number; title?: string; comment: string }) =>
      api.post("/reviews", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookings", "mine"] });
      qc.invalidateQueries({ queryKey: ["service"] });
    },
  });
}

// ─── VENDOR ─────────────────────────────────────────────────
export function useVendorServices() {
  return useQuery({
    queryKey: ["vendor", "services"],
    queryFn: () => api.get<{ data: any[] }>("/services/vendor/my-services"),
    staleTime: 60000,
  });
}

export function useVendorBookings(status?: string) {
  const params = status && status.toUpperCase() !== "ALL" ? `?status=${status}` : "";
  return useQuery({
    queryKey: ["vendor", "bookings", status],
    queryFn: () => api.get<{ data: any[] }>(`/vendor/bookings${params}`),
    staleTime: 60000,
  });
}

export function useVendorDashboard() {
  return useQuery({
    queryKey: ["vendor", "dashboard"],
    queryFn: () => api.get<{ data: any }>("/vendor/dashboard"),
    staleTime: 60000,
  });
}

export function useVendorEarnings() {
  return useQuery({
    queryKey: ["vendor", "earnings"],
    queryFn: () => api.get<{ data: any }>("/vendor/earnings"),
    staleTime: 60000,
  });
}

export function useCreateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post("/services", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vendor", "services"] }),
  });
}

export function useUpdateVendorService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.put(`/services/${id}`, data),
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
  const params = status && status.toUpperCase() !== "ALL" ? `?status=${status}` : "";
  return useQuery({
    queryKey: ["admin", "vendors", status],
    queryFn: () => api.get<{ data: any[] }>(`/admin/vendors${params}`),
  });
}

export function useAdminServices(status?: string) {
  const params = status && status.toUpperCase() !== "ALL" ? `?status=${status}` : "";
  return useQuery({
    queryKey: ["admin", "services", status],
    queryFn: () => api.get<{ data: any[] }>(`/admin/services${params}`),
  });
}

export function useAdminBookings(status?: string) {
  const params = status && status.toUpperCase() !== "ALL" ? `?status=${status}` : "";
  return useQuery({
    queryKey: ["admin", "bookings", status],
    queryFn: () => api.get<{ data: any[] }>(`/admin/bookings${params}`),
  });
}

export function useAdminUsers(role?: string) {
  const params = role && role.toUpperCase() !== "ALL" ? `?role=${role}` : "";
  return useQuery({
    queryKey: ["admin", "users", role],
    queryFn: () => api.get<{ data: any[] }>(`/admin/users${params}`),
  });
}

export function useAdminPayments(status?: string, search?: string) {
  const queryParams = new URLSearchParams();
  if (status && status.toUpperCase() !== "ALL") queryParams.append("status", status);
  if (search) queryParams.append("search", search);
  return useQuery({
    queryKey: ["admin", "payments", status, search],
    queryFn: () => api.get<{ data: any[] }>(`/admin/payments?${queryParams.toString()}`),
  });
}

export function useToggleUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.put(`/admin/users/${id}/toggle`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

export function useCreateAdminUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; email: string; role: string; phone?: string; city?: string }) =>
      api.post("/admin/users", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

export function useUpdateAdminUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.put(`/admin/users/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

// Get admin reviews (list all)
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
      api.put(`/admin/vendors/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "vendors"] }),
  });
}

export function useDeleteVendor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/admin/vendors/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "vendors"] }),
  });
}

export function useUpdateServiceStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, isFeatured, isTrending, isBestSeller, isNewArrival }: any) =>
      api.put(`/admin/services/${id}/status`, { status, isFeatured, isTrending, isBestSeller, isNewArrival }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "services"] }),
  });
}

export function useDeleteService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/admin/services/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "services"] }),
  });
}

export function useUpdateReviewStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isApproved }: { id: number; isApproved: boolean }) =>
      api.put(`/admin/reviews/${id}/status`, { isApproved }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "reviews"] }),
  });
}

export function useDeleteBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/admin/bookings/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "bookings"] }),
  });
}

// ─── CATEGORY ADMIN ─────────────────────────────────────────
export function useAdminCategoriesAll() {
  return useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => api.get<{ data: any[] }>("/categories/all"),
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post("/categories", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "categories"] });
      qc.invalidateQueries({ queryKey: ["categories"] });
    }
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.put(`/categories/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "categories"] });
      qc.invalidateQueries({ queryKey: ["categories"] });
    }
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/categories/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "categories"] });
      qc.invalidateQueries({ queryKey: ["categories"] });
    }
  });
}

// ─── MENU ADMIN ─────────────────────────────────────────────
export function useAdminMenu() {
  return useQuery({
    queryKey: ["admin", "menu"],
    queryFn: () => api.get<{ data: any[] }>("/menu/all"),
  });
}

export function useCreateMenuItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post("/menu", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "menu"] });
      qc.invalidateQueries({ queryKey: ["menu"] });
    }
  });
}

export function useUpdateMenuItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.put(`/menu/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "menu"] });
      qc.invalidateQueries({ queryKey: ["menu"] });
    }
  });
}

export function useDeleteMenuItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/menu/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "menu"] });
      qc.invalidateQueries({ queryKey: ["menu"] });
    }
  });
}

// ─── COUPONS ────────────────────────────────────────────────
export function useAdminCoupons() {
  return useQuery({
    queryKey: ["admin", "coupons"],
    queryFn: () => api.get<{ data: any[] }>("/admin/coupons"),
  });
}

export function useCreateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post("/admin/coupons", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "coupons"] });
    }
  });
}

export function useUpdateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.put(`/admin/coupons/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "coupons"] });
    }
  });
}

export function useDeleteCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/admin/coupons/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "coupons"] });
    }
  });
}

export function useApplyCoupon() {
  return useMutation({
    mutationFn: (data: { code: string; orderAmount: number }) =>
      api.post("/coupons/validate", data),
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

// ─── BANNERS ──────────────────────────────────────────────────
export function useBanners(position: string) {
  return useQuery({
    queryKey: ["banners", position],
    queryFn: () => api.get<{ data: any[] }>(`/banners?position=${position}&status=ACTIVE&sort=order`),
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

// ─── HOMEPAGE ───────────────────────────────────────────────
export function useUpdateHomepageSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      api.put(`/homepage/sections/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "homepageSections"] }),
  });
}

export function useAddHomepageSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      api.post(`/homepage/sections`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "homepageSections"] }),
  });
}

export function useDeleteHomepageSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.delete(`/homepage/sections/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "homepageSections"] }),
  });
}

export function useReorderHomepageSections() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (items: { id: number; sortOrder: number }[]) =>
      api.put("/homepage/sections/reorder/batch", { items }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "homepageSections"] }),
  });
}

export function useAdminHomepageSections() {
  return useQuery({
    queryKey: ["admin", "homepageSections"],
    queryFn: () => api.get<{ data: any[] }>("/homepage/sections"),
  });
}

// ─── SETTINGS ───────────────────────────────────────────────
export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: () => api.get<{ data: any }>("/settings"),
    staleTime: 5 * 60 * 1000, // 5 mins cache
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.put("/settings", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}


