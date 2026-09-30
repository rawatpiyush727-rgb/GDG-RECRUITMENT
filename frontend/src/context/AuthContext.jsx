import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "@/lib/api";

export const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSession = useCallback(async () => {
    try {
      const data = await api.get("/api/auth/me");
      if (data && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      if (err.status !== 401) {
        console.warn("Session check returned non-401 error:", err.message);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    api.get("/api/auth/me")
      .then((data) => {
        if (mounted) {
          setUser(data?.user || null);
        }
      })
      .catch((err) => {
        if (err.status !== 401) {
          console.warn("Session check returned non-401 error:", err.message);
        }
        if (mounted) {
          setUser(null);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const login = async ({ email, password }) => {
    const data = await api.post("/api/auth/login", { email, password });
    if (data?.user) {
      setUser(data.user);
    }
    return data?.user;
  };

  const loginWithGoogle = async (credential) => {
    const data = await api.post("/api/auth/google", { credential });
    if (data?.user) {
      setUser(data.user);
    }
    return data?.user;
  };

  const register = async ({ name, email, password }) => {
    const data = await api.post("/api/auth/register", { name, email, password });
    if (data?.user) {
      setUser(data.user);
    }
    return data?.user;
  };

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      await api.post("/api/auth/logout");
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      setUser(null);
      setTimeout(() => setIsLoggingOut(false), 500);
    }
  };

  const refresh = async () => {
    await fetchSession();
  };

  const value = {
    user,
    loading,
    isLoggingOut,
    login,
    loginWithGoogle,
    register,
    logout,
    refresh,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
