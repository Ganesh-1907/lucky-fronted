import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/lib/api";

interface User {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  role: string;
  avatar: string | null;
  city: string | null;
  isActive: boolean;
  vendor?: {
    id: number;
    businessName: string;
    status: string;
    commissionRate: number;
  };
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  setTokens: (accessToken: string, refreshToken: string) => void;
  initAuth: () => Promise<void>;
}

// Cross-tab sync: detect logout from another tab via storage events
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    // When auth-storage is removed or cleared in another tab
    if (event.key === "auth-storage") {
      if (!event.newValue) {
        // auth-storage was removed — user logged out in another tab
        useAuthStore.setState({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
        // Also clean up the individual token keys
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/";
      } else {
        // auth-storage was updated (e.g. login in another tab) — rehydrate
        try {
          const parsed = JSON.parse(event.newValue);
          const state = parsed?.state;
          if (state) {
            useAuthStore.setState({
              user: state.user || null,
              accessToken: state.accessToken || null,
              refreshToken: state.refreshToken || null,
              isAuthenticated: state.isAuthenticated || false,
            });
          }
        } catch {
          // ignore parse errors
        }
      }
    }
    // Also detect when accessToken is directly removed
    if (event.key === "accessToken" && !event.newValue) {
      useAuthStore.setState({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
      });
      window.location.href = "/";
    }
  });
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      isAuthenticated: false,
      _hasHydrated: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const res: any = await api.post("/auth/login", { email, password });
          const { user, accessToken, refreshToken } = res.data;

          if (typeof window !== "undefined") {
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);
          }

          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data: any) => {
        set({ isLoading: true });
        try {
          const res: any = await api.post("/auth/register", data);
          const { user, accessToken, refreshToken } = res.data;

          if (typeof window !== "undefined") {
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);
          }

          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("auth-storage");
          window.location.href = "/";
        }
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      fetchUser: async () => {
        try {
          const res: any = await api.get("/auth/me");
          set({ user: res.data, isAuthenticated: true });
        } catch {
          get().logout();
        }
      },

      setTokens: (accessToken: string, refreshToken: string) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", refreshToken);
        }
        set({ accessToken, refreshToken });
      },

      // Called on app init to validate persisted session
      initAuth: async () => {
        const { accessToken, user } = get();
        // If we have a token but no user data, fetch the user
        if (accessToken && !user) {
          try {
            const res: any = await api.get("/auth/me");
            set({ user: res.data, isAuthenticated: true, _hasHydrated: true });
          } catch {
            // Token is invalid/expired — clear everything silently (no redirect)
            if (typeof window !== "undefined") {
              localStorage.removeItem("accessToken");
              localStorage.removeItem("refreshToken");
              localStorage.removeItem("auth-storage");
            }
            set({
              user: null,
              accessToken: null,
              refreshToken: null,
              isAuthenticated: false,
              _hasHydrated: true,
            });
          }
        } else {
          set({ _hasHydrated: true });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // After Zustand rehydrates from localStorage, validate the session
        state?.initAuth();
      },
    }
  )
);
