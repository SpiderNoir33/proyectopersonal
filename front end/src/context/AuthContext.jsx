import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios.js";
import * as authApi from "../api/auth.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    authApi
      .me()
      .then((res) => alive && setUser(res.data.user))
      .catch(() => alive && setUser(null))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const id = api.interceptors.response.use(
      (res) => res,
      (error) => {
        const status = error?.response?.status;
        const url = error?.config?.url || "";
        if (status === 401 && !url.includes("/auth/login") && !url.includes("/auth/register")) {
          setUser(null);
        }
        return Promise.reject(error);
      }
    );
    return () => api.interceptors.response.eject(id);
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login(email, password);
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (data) => {
    const res = await authApi.register(data);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  };

  
  const updateUser = (nextUser) => setUser(nextUser);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
