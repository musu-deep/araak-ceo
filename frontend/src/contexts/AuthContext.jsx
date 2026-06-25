import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/api";

const AuthContext = createContext(null);

const normalizeUser = (rawUser) => {
  if (!rawUser) return false;

  return {
    ...rawUser,
    id: rawUser.id || rawUser.username || rawUser.email,
    username: rawUser.username || rawUser.email || rawUser.id,
    name: rawUser.name || rawUser.full_name || rawUser.username || "User",
    role: rawUser.role || "user",
    enabled: rawUser.enabled !== false,
    permissions: rawUser.permissions || [],
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // null = loading, false = no user, object = user
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    api
      .get("/auth/me")
      .then((res) => {
        if (cancelled) return;

        const normalized = normalizeUser(res.data?.user || res.data);

        if (normalized) {
          localStorage.setItem("araak_user", JSON.stringify(normalized));
          setUser(normalized);
        } else {
          localStorage.removeItem("araak_user");
          setUser(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          localStorage.removeItem("araak_user");
          setUser(false);
        }
      })
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });

    if (res.data?.access_token) {
      localStorage.setItem("arak_token", res.data.access_token);
    }

    const normalized = normalizeUser(res.data?.user);

    if (normalized) {
      localStorage.setItem("araak_user", JSON.stringify(normalized));
      setUser(normalized);
    } else {
      localStorage.removeItem("araak_user");
      setUser(false);
    }

    return normalized;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}

    localStorage.removeItem("arak_token");
    localStorage.removeItem("araak_token");
    localStorage.removeItem("araak_user");

    setUser(false);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);