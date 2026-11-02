"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  theme: string;
  accent: string;
  organizationId?: string | null;
  organizationName?: string | null;
  doctor?: { id: string; specialization?: string | null } | null;
  patient?: { id: string } | null;
}

export interface LoginResult {
  success: boolean;
  error?: string;
  user?: AuthUser;
  requireVerification?: boolean;
  email?: string;
  requires2FA?: boolean;
  tempToken?: string;
  maskedEmail?: string;
  message?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  verify2FALogin: (tempToken: string, code: string) => Promise<{ success: boolean; error?: string; user?: AuthUser }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<AuthUser | null>;
  updatePreferences: (prefs: { theme?: string; accent?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function normalizeUser(raw: unknown): AuthUser | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;

  const roleVal = obj.role;
  let roleName = "PATIENT";
  if (typeof roleVal === "string") {
    roleName = roleVal;
  } else if (roleVal && typeof roleVal === "object" && "name" in roleVal) {
    roleName = String((roleVal as { name: unknown }).name);
  }

  const doctorVal = obj.doctor as Record<string, unknown> | null | undefined;
  const patientVal = obj.patient as Record<string, unknown> | null | undefined;
  const orgVal = obj.organization as Record<string, unknown> | null | undefined;

  const organizationName = obj.organizationName
    ? String(obj.organizationName)
    : orgVal?.name
    ? String(orgVal.name)
    : null;
  const organizationId = obj.organizationId
    ? String(obj.organizationId)
    : orgVal?.id
    ? String(orgVal.id)
    : null;

  return {
    id: String(obj.id || ""),
    name: String(obj.name || ""),
    email: String(obj.email || ""),
    phone: obj.phone ? String(obj.phone) : null,
    role: roleName,
    theme: obj.theme ? String(obj.theme) : "system",
    accent: obj.accent ? String(obj.accent) : "teal",
    organizationId,
    organizationName,
    doctor: doctorVal
      ? {
          id: String(doctorVal.id),
          specialization: doctorVal.specialization
            ? String(doctorVal.specialization)
            : null,
        }
      : null,
    patient: patientVal ? { id: String(patientVal.id) } : null,
  };
}

const AUTH_CHANNEL_NAME = "ppms_auth_sync";

function applyUserThemeLocally(theme?: string, accent?: string) {
  if (typeof window === "undefined") return;

  if (accent) {
    localStorage.setItem("ppms-accent", accent);
    document.cookie = `ppms_accent=${accent}; path=/; max-age=31536000; SameSite=Lax`;
    if (accent === "teal") {
      document.documentElement.removeAttribute("data-accent");
    } else {
      document.documentElement.setAttribute("data-accent", accent);
    }
  }

  if (theme) {
    localStorage.setItem("theme", theme);
    document.cookie = `ppms_theme=${theme}; path=/; max-age=31536000; SameSite=Lax`;
    const isDark =
      theme === "dark" ||
      (theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }

  window.dispatchEvent(
    new CustomEvent("ppms_theme_changed", {
      detail: { theme, accent },
    })
  );
}

export function AuthProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser?: AuthUser | null;
}) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(
    initialUser !== undefined ? normalizeUser(initialUser) : null
  );
  const [loading, setLoading] = useState<boolean>(initialUser === undefined);
  const [prevInitialUser, setPrevInitialUser] = useState(initialUser);

  // Sync state if initialUser prop changes across page navigations
  if (initialUser !== prevInitialUser) {
    setPrevInitialUser(initialUser);
    setUser(initialUser !== undefined ? normalizeUser(initialUser) : null);
    if (initialUser !== undefined) {
      setLoading(false);
    }
  }

  const refreshUser = useCallback(async (): Promise<AuthUser | null> => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (!res.ok) {
        setUser(null);
        return null;
      }
      const json = await res.json();
      if (json.success && json.data) {
        const normalized = normalizeUser(json.data);
        setUser(normalized);
        if (normalized?.theme || normalized?.accent) {
          applyUserThemeLocally(normalized.theme, normalized.accent);
        }
        return normalized;
      } else {
        setUser(null);
        return null;
      }
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    if (initialUser === undefined) {
      fetch("/api/auth/me", { cache: "no-store" })
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (!ignore) {
            if (json?.success && json?.data) {
              const normalized = normalizeUser(json.data);
              setUser(normalized);
              if (normalized) {
                applyUserThemeLocally(normalized.theme, normalized.accent);
              }
            } else {
              setUser(null);
            }
            setLoading(false);
          }
        })
        .catch(() => {
          if (!ignore) {
            setUser(null);
            setLoading(false);
          }
        });
    }

    return () => {
      ignore = true;
    };
  }, [initialUser]);

  // Sync auth & theme events across browser tabs
  useEffect(() => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) {
      return;
    }

    const channel = new BroadcastChannel(AUTH_CHANNEL_NAME);
    channel.onmessage = (event) => {
      if (event.data?.type === "LOGIN") {
        void refreshUser();
      } else if (event.data?.type === "LOGOUT") {
        setUser(null);
        setLoading(false);
      } else if (event.data?.type === "PREFERENCES_UPDATED") {
        const { theme, accent } = event.data;
        setUser((prev) =>
          prev
            ? {
                ...prev,
                theme: theme ?? prev.theme,
                accent: accent ?? prev.accent,
              }
            : null
        );
        applyUserThemeLocally(theme, accent);
      }
    };

    return () => {
      channel.close();
    };
  }, [refreshUser]);

  const updatePreferences = useCallback(
    async (prefs: { theme?: string; accent?: string }) => {
      // 1. Instantly apply locally
      applyUserThemeLocally(prefs.theme, prefs.accent);

      // 2. Optimistically update local user state
      setUser((prev) =>
        prev
          ? {
              ...prev,
              theme: prefs.theme ?? prev.theme,
              accent: prefs.accent ?? prev.accent,
            }
          : null
      );

      // 3. Persist to backend database if logged in
      try {
        const res = await fetch("/api/users/preferences", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(prefs),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setUser((prev) =>
              prev
                ? {
                    ...prev,
                    theme: json.data.theme ?? prev.theme,
                    accent: json.data.accent ?? prev.accent,
                  }
                : null
            );
          }
        }
      } catch {
        // Backend failure handled gracefully
      }

      // 4. Notify other open tabs
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        try {
          const channel = new BroadcastChannel(AUTH_CHANNEL_NAME);
          channel.postMessage({
            type: "PREFERENCES_UPDATED",
            theme: prefs.theme,
            accent: prefs.accent,
          });
          channel.close();
        } catch {
          // ignore
        }
      }
    },
    []
  );

  const login = useCallback(
    async (
      email: string,
      password: string
    ): Promise<LoginResult> => {
      setLoading(true);
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();

        // Check if 2FA verification challenge is required
        if (data?.requires2FA) {
          setLoading(false);
          return {
            success: false,
            requires2FA: true,
            tempToken: data.tempToken,
            maskedEmail: data.maskedEmail,
            message: data.message,
          };
        }

        if (!res.ok || !data.success) {
          setLoading(false);
          return {
            success: false,
            error: data.message || "Login failed",
            requireVerification: Boolean(data.requireVerification),
            email: data.email || email,
          };
        }

        // Fetch complete profile details (doctor/patient record linkage)
        const currentUser = await refreshUser();
        const finalUser = currentUser || normalizeUser(data.data);
        setUser(finalUser);
        setLoading(false);

        // Apply this user's personal theme & accent
        if (finalUser) {
          applyUserThemeLocally(finalUser.theme, finalUser.accent);
        }

        // Notify other open tabs
        if (typeof window !== "undefined" && "BroadcastChannel" in window) {
          try {
            const channel = new BroadcastChannel(AUTH_CHANNEL_NAME);
            channel.postMessage({ type: "LOGIN" });
            channel.close();
          } catch {
            // Ignore channel errors
          }
        }

        return { success: true, user: finalUser ?? undefined };
      } catch {
        setLoading(false);
        return {
          success: false,
          error: "An unexpected error occurred. Please try again.",
        };
      }
    },
    [refreshUser]
  );

  const verify2FALogin = useCallback(
    async (tempToken: string, code: string): Promise<{ success: boolean; error?: string; user?: AuthUser }> => {
      setLoading(true);
      try {
        const res = await fetch("/api/auth/login/2fa", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tempToken, code }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          setLoading(false);
          return {
            success: false,
            error: data.message || "Invalid verification code",
          };
        }

        const currentUser = await refreshUser();
        const finalUser = currentUser || normalizeUser(data.data);
        setUser(finalUser);
        setLoading(false);

        if (finalUser) {
          applyUserThemeLocally(finalUser.theme, finalUser.accent);
        }

        if (typeof window !== "undefined" && "BroadcastChannel" in window) {
          try {
            const channel = new BroadcastChannel(AUTH_CHANNEL_NAME);
            channel.postMessage({ type: "LOGIN" });
            channel.close();
          } catch {
            // ignore
          }
        }

        return { success: true, user: finalUser ?? undefined };
      } catch {
        setLoading(false);
        return { success: false, error: "Network error during two-factor verification" };
      }
    },
    [refreshUser]
  );

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Continue cleanup on client
    } finally {
      setUser(null);
      setLoading(false);

      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        try {
          const channel = new BroadcastChannel(AUTH_CHANNEL_NAME);
          channel.postMessage({ type: "LOGOUT" });
          channel.close();
        } catch {
          // Ignore channel errors
        }
      }

      router.push("/auth/login");
      router.refresh();
    }
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        verify2FALogin,
        logout,
        refreshUser,
        updatePreferences,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
